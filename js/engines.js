/* Run engines. Each engine resolves to:
   { ok, stopped, error:{type,message,line,col,text}, steps, mode, extra }  */
(function () {
  'use strict';

  const MAX_STEPS = 2500;
  const TIMEOUT = 10000;
  const ACORN = 'https://cdn.jsdelivr.net/npm/acorn@8.11.3/dist/acorn.js';
  const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  const SQLJS = 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/';

  const scripts = {};
  function loadScript(src) {
    if (!scripts[src]) {
      scripts[src] = new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = src; s.onload = res;
        s.onerror = () => { delete scripts[src]; rej(new Error('Could not download ' + src.split('/').slice(-1)[0] + '. Check your internet connection.')); };
        document.head.appendChild(s);
      });
    }
    return scripts[src];
  }
  function workerFrom(fn) {
    const url = URL.createObjectURL(new Blob(['(' + fn.toString() + ')()'], { type: 'text/javascript' }));
    return new Worker(url);
  }

  /* ======================================================= JavaScript worker */
  function jsWorkerMain() {
    let lines = [], li = 0, steps = [], limit = 0, outLen = 0, total = 0, halted = false, truncated = false;
    const stack = [];
    const post = (m) => self.postMessage(m);
    const emit = (k, s) => {
      if (total > 300000) { if (!truncated) { truncated = true; post({ t: 'out', k: 'err', s: '\n[output truncated]\n' }); } return; }
      total += s.length; outLen += s.length; post({ t: 'out', k, s });
    };
    class TraceLimit extends Error { constructor() { super('Trace limit'); this.name = 'TraceLimit'; } }

    /* ---- console formatting (similar to Node's util.inspect) ---- */
    const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
    function fit(o, c, items) {
      if (!items.length) return o + c;
      const one = o + ' ' + items.join(', ') + ' ' + c;
      if (one.length <= 72 && one.indexOf('\n') < 0) return one;
      return o + '\n' + items.map((i) => '  ' + i.replace(/\n/g, '\n  ')).join(',\n') + '\n' + c;
    }
    function inspect(v, depth, seen) {
      const t = typeof v;
      if (t === 'string') return depth === 0 ? v : q(v);
      if (t === 'number' || t === 'boolean' || t === 'undefined') return Object.is(v, -0) ? '-0' : String(v);
      if (t === 'bigint') return v + 'n';
      if (v === null) return 'null';
      if (t === 'symbol') return v.toString();
      if (t === 'function') return v.name ? '[Function: ' + v.name + ']' : '[Function (anonymous)]';
      if (seen.indexOf(v) >= 0) return '[Circular]';
      if (v instanceof Error) return v.stack || String(v);
      if (depth > 2) return Array.isArray(v) ? '[Array]' : '[Object]';
      seen = seen.concat([v]);
      const d1 = depth === 0 ? 1 : depth + 1;
      if (Array.isArray(v)) {
        const items = v.slice(0, 100).map((x) => inspect(x, d1, seen));
        if (v.length > 100) items.push('... ' + (v.length - 100) + ' more items');
        return fit('[', ']', items);
      }
      if (v instanceof Map) return 'Map(' + v.size + ') ' + fit('{', '}', Array.from(v).map(([a, b]) => inspect(a, d1, seen) + ' => ' + inspect(b, d1, seen)));
      if (v instanceof Set) return 'Set(' + v.size + ') ' + fit('{', '}', Array.from(v).map((a) => inspect(a, d1, seen)));
      if (v instanceof Date) return v.toISOString();
      if (v instanceof RegExp) return String(v);
      if (v instanceof Promise) return 'Promise { <pending> }';
      const keys = Object.keys(v);
      const cn = v.constructor && v.constructor.name;
      const prefix = cn && cn !== 'Object' ? cn + ' ' : '';
      return prefix + fit('{', '}', keys.map((k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : q(k)) + ': ' + inspect(v[k], d1, seen)));
    }
    function format(args) {
      const first = args[0];
      const rest = args.slice(1);
      const str = (a) => (typeof a === 'string' ? a : inspect(a, 1, []));
      if (typeof first === 'string' && rest.length && /%[sdifoOjc%]/.test(first)) {
        const s = first.replace(/%([sdifoOjc%])/g, (m, c) => {
          if (c === '%') return '%';
          if (!rest.length) return m;
          const a = rest.shift();
          switch (c) {
            case 's': return str(a);
            case 'd': return String(Number(a));
            case 'i': return String(parseInt(a, 10));
            case 'f': return String(parseFloat(a));
            case 'c': return '';
            case 'j': try { return JSON.stringify(a); } catch (e) { return '[Circular]'; }
            default: return inspect(a, 1, []);
          }
        });
        return [s].concat(rest.map(str)).join(' ');
      }
      return args.map(str).join(' ');
    }
    let indent = '';
    const mk = (k) => (...a) => { emit(k, indent + format(a).split('\n').join('\n' + indent) + '\n'); };
    console.log = mk('out'); console.info = mk('out'); console.debug = mk('out');
    console.warn = mk('warn'); console.error = mk('err');
    console.group = (...a) => { if (a.length) console.log(...a); indent += '  '; };
    console.groupEnd = () => { indent = indent.slice(2); };
    console.clear = () => post({ t: 'clear' });
    console.dir = (o) => console.log(inspect(o, 1, []));
    console.assert = (c, ...a) => { if (!c) console.error('Assertion failed' + (a.length ? ': ' + format(a) : '')); };
    const timers = {};
    console.time = (l = 'default') => { timers[l] = performance.now(); };
    console.timeEnd = (l = 'default') => { if (timers[l] !== undefined) { console.log(l + ': ' + (performance.now() - timers[l]).toFixed(3) + 'ms'); delete timers[l]; } };
    console.table = (d) => {
      if (d === null || typeof d !== 'object') return console.log(d);
      const rows = Array.isArray(d) ? d.map((v, i) => [String(i), v]) : Object.keys(d).map((k) => [k, d[k]]);
      const cols = []; let hasVal = false;
      rows.forEach(([, v]) => { if (v && typeof v === 'object') Object.keys(v).forEach((k) => { if (cols.indexOf(k) < 0) cols.push(k); }); else hasVal = true; });
      const head = ['(index)'].concat(cols, hasVal ? ['Values'] : []);
      const body = rows.map(([i, v]) => {
        const r = [i];
        cols.forEach((c) => r.push(v && typeof v === 'object' && c in v ? inspect(v[c], 1, []) : ''));
        if (hasVal) r.push(v && typeof v === 'object' ? '' : inspect(v, 1, []));
        return r;
      });
      const w = head.map((h, i) => Math.max(h.length, ...body.map((r) => r[i].length)));
      const ln = (l, m, r) => l + w.map((n) => '─'.repeat(n + 2)).join(m) + r;
      const row = (r) => '│' + r.map((c, i) => ' ' + c.padEnd(w[i]) + ' ').join('│') + '│';
      console.log([ln('┌', '┬', '┐'), row(head), ln('├', '┼', '┤')].concat(body.map(row), [ln('└', '┴', '┘')]).join('\n'));
    };
    self.alert = (m) => emit('out', String(m) + '\n');
    self.confirm = () => true;
    self.prompt = (m) => {
      if (m) emit('out', String(m));
      const l = li < lines.length ? lines[li++] : null;
      if (l !== null) emit('out', l + '\n');
      return l;
    };

    /* ---- timers tracked so we know when the program has settled ---- */
    const _st = self.setTimeout, _ct = self.clearTimeout, _si = self.setInterval, _ci = self.clearInterval;
    const live = new Set();
    const report = (e) => post({ t: 'error', name: (e && e.name) || 'Error', message: e && e.message !== undefined ? String(e.message) : String(e), stack: (e && e.stack) || '' });
    self.setTimeout = (fn, ms, ...a) => { const id = _st(() => { live.delete(id); try { if (typeof fn === 'function') fn(...a); } catch (e) { report(e); } }, ms); live.add(id); return id; };
    self.clearTimeout = (id) => { live.delete(id); _ct(id); };
    self.setInterval = (fn, ms, ...a) => { const id = _si(() => { try { if (typeof fn === 'function') fn(...a); } catch (e) { report(e); } }, ms); live.add(id); return id; };
    self.clearInterval = (id) => { live.delete(id); _ci(id); };
    self.addEventListener('unhandledrejection', (ev) => { ev.preventDefault(); report(ev.reason instanceof Error ? ev.reason : new Error('Unhandled promise rejection: ' + inspect(ev.reason, 1, []))); });

    /* ---- tracing support ---- */
    function ser(v, d, seen) {
      const t = typeof v;
      if (v === null) return { t: 'none', v: 'null' };
      if (t === 'undefined') return { t: 'none', v: 'undefined' };
      if (t === 'boolean') return { t: 'bool', v: String(v) };
      if (t === 'number') return { t: Number.isInteger(v) ? 'int' : 'float', v: Object.is(v, -0) ? '-0' : String(v) };
      if (t === 'bigint') return { t: 'int', v: v + 'n' };
      if (t === 'string') return { t: 'str', v: JSON.stringify(v.length > 60 ? v.slice(0, 57) + '...' : v) };
      if (t === 'symbol') return { t: 'sym', v: v.toString() };
      if (t === 'function') return { t: 'function', v: 'ƒ' };
      if (seen.indexOf(v) >= 0) return { t: 'ref', v: '↻ circular' };
      if (d >= 3) return { t: 'ref', v: '…' };
      seen = seen.concat([v]);
      if (Array.isArray(v)) return { t: 'list', k: 'Array', n: v.length, items: v.slice(0, 20).map((x) => ser(x, d + 1, seen)) };
      if (v instanceof Set) return { t: 'list', k: 'Set', n: v.size, items: Array.from(v).slice(0, 20).map((x) => ser(x, d + 1, seen)) };
      if (v instanceof Map) return { t: 'dict', k: 'Map', n: v.size, items: Array.from(v).slice(0, 20).map(([a, b]) => [ser(a, d + 1, seen), ser(b, d + 1, seen)]) };
      if (v instanceof Date) return { t: 'str', v: v.toISOString() };
      if (v instanceof Error) return { t: 'str', v: v.name + ': ' + v.message };
      const keys = Object.keys(v);
      const cn = v.constructor && v.constructor.name;
      return { t: 'dict', k: cn && cn !== 'Object' ? cn : 'object', n: keys.length, items: keys.slice(0, 20).map((k) => [{ t: 'key', v: k }, ser(v[k], d + 1, seen)]) };
    }
    function serMap(o) {
      const out = {};
      for (const k in o) { const v = o[k]; if (typeof v === 'function') continue; out[k] = ser(v, 0, []); }
      return out;
    }
    self.__enter = (name) => { stack.push({ name, vars: null }); };
    self.__leave = () => { stack.pop(); };
    self.__t = (line, getter) => {
      if (halted) throw new TraceLimit();
      if (steps.length >= limit) { halted = true; throw new TraceLimit(); }
      const r = getter();
      const l = serMap(r[0]), g = serMap(r[1]);
      let frames;
      if (!stack.length) frames = [{ name: 'Global', vars: l }];
      else {
        stack[stack.length - 1].vars = l;
        frames = [{ name: 'Global', vars: g }].concat(stack.map((s) => ({ name: s.name + '()', vars: s.vars })));
      }
      steps.push({ line, frames, out: outLen });
    };

    const sleep = (ms) => new Promise((r) => _st(r, ms));
    self.onmessage = async (e) => {
      const d = e.data;
      lines = d.stdin ? d.stdin.split(/\r?\n/) : [];
      limit = d.limit;
      let traceStopped = false;
      try { (0, eval)(d.code); }
      catch (err) { if (err && err.name === 'TraceLimit') traceStopped = true; else report(err); }
      const t0 = Date.now();
      await sleep(15);
      while (live.size && Date.now() - t0 < 8000) await sleep(25);
      await sleep(15);
      post({ t: 'done', steps, traceStopped });
    };
  }

  function jsErrorPos(stack) {
    if (!stack) return null;
    const m = /<anonymous>:(\d+):(\d+)/.exec(stack) || /> eval:(\d+):(\d+)/.exec(stack);
    return m ? { line: +m[1], col: +m[2] } : null;
  }

  async function runJS(lang, code, o) {
    let acornOk = true;
    try { await loadScript(ACORN); } catch (e) { acornOk = false; }
    let source = code;
    if (acornOk) {
      try { window.acorn.parse(code, { ecmaVersion: 'latest', locations: true }); }
      catch (e) {
        return { ok: false, error: { type: 'SyntaxError', message: String(e.message).replace(/\s*\(\d+:\d+\)$/, ''), line: e.loc ? e.loc.line : null, col: e.loc ? e.loc.column + 1 : null } };
      }
      if (o.trace) {
        try { source = window.Trace.instrumentJS(code, window.acorn); } catch (e) { source = code; o.status('Could not instrument this code for tracing: ' + e.message); }
      }
    }
    return new Promise((resolve) => {
      const w = workerFrom(jsWorkerMain);
      let firstError = null, timer = null, finished = false;
      const finish = (r) => { if (finished) return; finished = true; clearTimeout(timer); w.terminate(); o.setCurrent(null); resolve(r); };
      o.setCurrent({ stop: () => finish({ stopped: true }) });
      timer = setTimeout(() => finish({ ok: false, error: { type: 'Timeout', message: 'Your program ran for more than ' + TIMEOUT / 1000 + ' seconds, so it was stopped. Is there an infinite loop?' } }), TIMEOUT);
      w.onmessage = (e) => {
        const d = e.data;
        if (d.t === 'out') o.emit(d.k, d.s);
        else if (d.t === 'clear') o.clear();
        else if (d.t === 'error') { if (!firstError) { const p = jsErrorPos(d.stack); firstError = { type: d.name, message: d.message, line: p && p.line, col: p && p.col, text: d.name + ': ' + d.message }; } }
        else if (d.t === 'done') {
          const res = { ok: !firstError, error: firstError, steps: o.trace ? d.steps : null, mode: 'trace', traceStopped: d.traceStopped };
          finish(res);
        }
      };
      w.onerror = (e) => finish({ ok: false, error: { type: 'Error', message: e.message || 'The program crashed.' } });
      w.postMessage({ code: source, stdin: o.stdin, limit: MAX_STEPS });
    });
  }

  /* ======================================================= Python (Pyodide worker) */
  function pyWorkerMain() {
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
    let pyodide = null;
    const post = (m) => self.postMessage(m);
    self.onmessage = async (e) => {
      const d = e.data;
      if (d.t === 'init') {
        try {
          pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
          pyodide.runPython(d.harness);
          post({ t: 'ready' });
        } catch (err) { post({ t: 'initfail', message: String(err) }); }
      } else if (d.t === 'run') {
        try {
          pyodide.globals.set('_emit', (k, s) => post({ t: 'out', k, s }));
          pyodide.globals.set('_code', d.code);
          pyodide.globals.set('_stdin', d.stdin);
          pyodide.globals.set('_trace', d.trace);
          pyodide.globals.set('_limit', d.limit);
          const r = pyodide.runPython('_run(_code, _stdin, _trace, _limit)');
          post({ t: 'done', result: JSON.parse(r) });
        } catch (err) { post({ t: 'crash', message: String(err) }); }
      }
    };
  }

  const PY_HARNESS = String.raw`
import sys, json, builtins, traceback

class _Limit(BaseException):
    pass

def _skip(v):
    return callable(v) or type(v).__name__ == 'module'

def _ser(v, d=0, seen=None):
    if seen is None:
        seen = []
    if v is None:
        return {"t": "none", "v": "None"}
    if isinstance(v, bool):
        return {"t": "bool", "v": str(v)}
    if isinstance(v, int):
        return {"t": "int", "v": str(v)}
    if isinstance(v, float):
        return {"t": "float", "v": repr(v)}
    if isinstance(v, str):
        return {"t": "str", "v": repr(v if len(v) <= 60 else v[:57] + "...")}
    if isinstance(v, (bytes, complex, range)):
        return {"t": type(v).__name__, "v": repr(v)[:80]}
    if id(v) in seen:
        return {"t": "ref", "v": "circular"}
    if d >= 3:
        return {"t": "ref", "v": "..."}
    seen = seen + [id(v)]
    tn = type(v).__name__
    if isinstance(v, (list, tuple, set, frozenset)):
        items = list(v)
        return {"t": "list", "k": tn, "n": len(items), "items": [_ser(x, d + 1, seen) for x in items[:20]]}
    if isinstance(v, dict):
        items = list(v.items())
        return {"t": "dict", "k": tn, "n": len(items), "items": [[_ser(a, d + 1, seen), _ser(b, d + 1, seen)] for a, b in items[:20]]}
    if callable(v):
        return {"t": "function", "v": tn}
    if hasattr(v, "__dict__") and not isinstance(v, type):
        items = [(k, x) for k, x in vars(v).items() if not k.startswith("__")]
        return {"t": "dict", "k": tn, "n": len(items), "items": [[{"t": "key", "v": k}, _ser(x, d + 1, seen)] for k, x in items[:20]]}
    return {"t": tn, "v": repr(v)[:80]}

def _vars(d):
    out = {}
    for k, v in list(d.items()):
        if k.startswith("__") or _skip(v):
            continue
        out[k] = _ser(v)
    return out

def _fmt_exc(e, src_lines):
    tb = e.__traceback__
    frames = []
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == "<program>":
            frames.append((tb.tb_lineno, tb.tb_frame.f_code.co_name))
        tb = tb.tb_next
    out = []
    if frames:
        out.append("Traceback (most recent call last):")
        for ln, nm in frames:
            out.append('  File "main.py", line %d, in %s' % (ln, nm))
            if 0 < ln <= len(src_lines):
                out.append("    " + src_lines[ln - 1].strip())
    out.append("".join(traceback.format_exception_only(type(e), e)).rstrip())
    return {"type": type(e).__name__, "message": str(e), "line": frames[-1][0] if frames else None, "text": "\n".join(out)}

def _run(code, stdin_text, trace, limit):
    lines = stdin_text.split("\n") if stdin_text else []
    src_lines = code.split("\n")
    state = {"out": 0}
    steps = []
    res = {"steps": steps, "error": None, "limited": False}

    class _W:
        def __init__(self, kind):
            self.kind = kind
            self.encoding = "utf-8"
        def write(self, s):
            if not isinstance(s, str):
                s = str(s)
            state["out"] += len(s)
            _emit(self.kind, s)
            return len(s)
        def flush(self):
            pass
        def isatty(self):
            return False

    class _R:
        def readline(self):
            if lines:
                return lines.pop(0) + "\n"
            return ""
        def read(self):
            r = "".join(l + "\n" for l in lines)
            del lines[:]
            return r
        def __iter__(self):
            return self
        def __next__(self):
            l = self.readline()
            if not l:
                raise StopIteration
            return l

    def _input(prompt=""):
        sys.stdout.write(str(prompt))
        if not lines:
            raise EOFError("EOF when reading a line (add some text in the Program input box)")
        s = lines.pop(0)
        sys.stdout.write(s + "\n")
        return s

    try:
        compiled = compile(code, "<program>", "exec")
    except SyntaxError as e:
        res["error"] = {"type": type(e).__name__, "message": e.msg, "line": e.lineno or 1, "col": e.offset,
                        "text": 'File "main.py", line %s\n    %s\n%s: %s' % (e.lineno, (e.text or "").rstrip("\n").strip(), type(e).__name__, e.msg)}
        return json.dumps(res)

    def snapshot(frame, event, arg):
        if len(steps) >= limit:
            raise _Limit()
        stack = []
        f = frame
        while f is not None:
            if f.f_code.co_filename == "<program>":
                stack.append(f)
            f = f.f_back
        stack.reverse()
        frames = []
        for f in stack:
            name = f.f_code.co_name
            if name == "<module>":
                frames.append({"name": "Global", "vars": _vars(f.f_globals)})
            else:
                frames.append({"name": name + "()", "vars": _vars(f.f_locals)})
        st = {"line": frame.f_lineno, "frames": frames, "out": state["out"]}
        if event == "return" and frame.f_code.co_name != "<module>":
            st["ret"] = _ser(arg)
        steps.append(st)

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != "<program>":
            return None
        if event == "line" or (event == "return" and frame.f_code.co_name != "<module>"):
            snapshot(frame, event, arg)
        return tracer

    old = (sys.stdout, sys.stderr, sys.stdin, builtins.input)
    sys.stdout = _W("out")
    sys.stderr = _W("err")
    sys.stdin = _R()
    builtins.input = _input
    g = {"__name__": "__main__", "__builtins__": builtins}
    try:
        if trace:
            sys.settrace(tracer)
        exec(compiled, g)
        sys.settrace(None)
        if trace:
            steps.append({"line": 0, "frames": [{"name": "Global", "vars": _vars(g)}], "out": state["out"]})
    except _Limit:
        res["limited"] = True
    except SystemExit:
        pass
    except BaseException as e:
        sys.settrace(None)
        res["error"] = _fmt_exc(e, src_lines)
    finally:
        sys.settrace(None)
        sys.stdout, sys.stderr, sys.stdin, builtins.input = old
    return json.dumps(res)
`;

  const py = { worker: null, ready: null };
  function pyReset() { if (py.worker) py.worker.terminate(); py.worker = null; py.ready = null; }
  function pyInit(o) {
    if (py.ready) return py.ready;
    o && o.status && o.status('Loading Python (first time only, ~10 MB)…');
    py.ready = new Promise((res, rej) => {
      const w = workerFrom(pyWorkerMain);
      py.worker = w;
      w.onmessage = (e) => { if (e.data.t === 'ready') res(); else if (e.data.t === 'initfail') rej(new Error(e.data.message)); };
      w.onerror = (e) => rej(new Error(e.message || 'Python worker failed to start'));
      w.postMessage({ t: 'init', harness: PY_HARNESS });
    });
    py.ready.catch(pyReset);
    return py.ready;
  }

  async function runPython(lang, code, o) {
    try { await pyInit(o); }
    catch (e) { return { ok: false, error: { type: 'LoadError', message: 'Could not load the Python runtime. ' + e.message + ' (It is downloaded from a CDN, so an internet connection is needed.)' } }; }
    o.status('');
    return new Promise((resolve) => {
      const w = py.worker;
      let timer, finished = false;
      const finish = (r, kill) => { if (finished) return; finished = true; clearTimeout(timer); if (kill) pyReset(); o.setCurrent(null); resolve(r); };
      o.setCurrent({ stop: () => finish({ stopped: true }, true) });
      timer = setTimeout(() => finish({ ok: false, error: { type: 'Timeout', message: 'Your program ran for more than ' + TIMEOUT / 1000 + ' seconds, so it was stopped. Is there an infinite loop?' } }, true), TIMEOUT);
      w.onmessage = (e) => {
        const d = e.data;
        if (d.t === 'out') o.emit(d.k, d.s);
        else if (d.t === 'done') {
          const r = d.result;
          finish({ ok: !r.error, error: r.error, steps: o.trace ? r.steps : null, mode: 'trace', traceStopped: r.limited });
        } else if (d.t === 'crash') finish({ ok: false, error: { type: 'InternalError', message: d.message } }, true);
      };
      w.postMessage({ t: 'run', code, stdin: o.stdin, trace: !!o.trace, limit: MAX_STEPS });
    });
  }

  /* ======================================================= Lua (Fengari worker) */
  function luaWorkerMain() {
    self.window = self; // fengari-web expects a window global
    importScripts('https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js');
    const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;
    const post = (m) => self.postMessage(m);
    self.onmessage = (e) => {
      const d = e.data;
      const lines = d.stdin ? d.stdin.split('\n') : [];
      let li = 0, outLen = 0, total = 0;
      const steps = [];
      const L = lauxlib.luaL_newstate();
      lualib.luaL_openlibs(L);
      function reg(name, fn) {
        lua.lua_pushcfunction(L, function (L) {
          const n = lua.lua_gettop(L);
          const args = [];
          for (let i = 1; i <= n; i++) {
            const t = lua.lua_type(L, i);
            args.push(t === lua.LUA_TSTRING || t === lua.LUA_TNUMBER ? to_jsstring(lua.lua_tolstring(L, i)) : null);
          }
          const r = fn.apply(null, args);
          if (typeof r === 'string') lua.lua_pushstring(L, to_luastring(r)); else lua.lua_pushnil(L);
          return 1;
        });
        lua.lua_setglobal(L, to_luastring(name));
      }
      reg('__out', (k, s) => { if (total > 300000) return null; total += s.length; outLen += s.length; post({ t: 'out', k, s }); return null; });
      reg('__rec', (json) => { const st = JSON.parse(json); st.out = outLen; steps.push(st); return null; });
      reg('__readline', () => (li < lines.length ? lines[li++] : null));
      lua.lua_pushstring(L, to_luastring(d.code)); lua.lua_setglobal(L, to_luastring('__code'));
      lua.lua_pushboolean(L, d.trace ? 1 : 0); lua.lua_setglobal(L, to_luastring('__trace'));
      lua.lua_pushinteger(L, d.limit); lua.lua_setglobal(L, to_luastring('__limit'));
      const p = to_luastring(d.prelude);
      let status = lauxlib.luaL_loadbuffer(L, p, p.length, to_luastring('=prelude'));
      if (status === 0) status = lua.lua_pcall(L, 0, 3, 0);
      if (status !== 0) { post({ t: 'done', internal: to_jsstring(lua.lua_tostring(L, -1) || to_luastring('internal error')) }); return; }
      const ok = lua.lua_toboolean(L, -3);
      const msg = to_jsstring(lua.lua_tostring(L, -2) || to_luastring(''));
      const kind = lua.lua_type(L, -1) === lua.LUA_TSTRING ? to_jsstring(lua.lua_tostring(L, -1)) : '';
      post({ t: 'done', ok: !!ok, msg, kind, steps });
    };
  }

  const LUA_PRELUDE = String.raw`
local out, rec, readline = __out, __rec, __readline
local code, trace, limit = __code, __trace, __limit
local tostring, select, type, pairs, tonumber = tostring, select, type, pairs, tonumber
local concat, insert = table.concat, table.insert
local sformat = string.format
io = io or {}

print = function(...)
  local n = select('#', ...)
  local t = {}
  for i = 1, n do t[i] = tostring((select(i, ...))) end
  out('out', concat(t, '\t') .. '\n')
end
io.write = function(...)
  for i = 1, select('#', ...) do out('out', tostring((select(i, ...)))) end
end
io.read = function(fmt)
  local l = readline()
  if l == nil then return nil end
  out('out', l .. '\n')
  if fmt == 'n' or fmt == '*n' then return tonumber(l) end
  return l
end
io.stdout = { write = function(self, ...) io.write(...) return self end, flush = function() end, close = function() end, setvbuf = function() end }
io.stderr = { write = function(self, ...) for i = 1, select('#', ...) do out('err', tostring((select(i, ...)))) end return self end, flush = function() end, close = function() end }

local function jstr(s)
  return '"' .. (tostring(s):gsub('[%c"\\]', function(c) return sformat('\\u%04x', c:byte()) end)) .. '"'
end
local ser
ser = function(v, d)
  local t = type(v)
  if t == 'nil' then return '{"t":"none","v":"nil"}'
  elseif t == 'boolean' then return '{"t":"bool","v":"' .. tostring(v) .. '"}'
  elseif t == 'number' then
    local isint = math.type and math.type(v) == 'integer'
    return '{"t":"' .. (isint and 'int' or 'float') .. '","v":' .. jstr(v) .. '}'
  elseif t == 'string' then
    local s = v
    if #s > 60 then s = s:sub(1, 57) .. '...' end
    return '{"t":"str","v":' .. jstr('"' .. s .. '"') .. '}'
  elseif t == 'function' then return '{"t":"function","v":"function"}'
  elseif t == 'table' then
    if d >= 3 then return '{"t":"ref","v":"..."}' end
    local n = #v
    local count = 0
    for _ in pairs(v) do count = count + 1 end
    local parts = {}
    if n > 0 and count == n then
      for i = 1, (n < 20 and n or 20) do parts[#parts + 1] = ser(v[i], d + 1) end
      return '{"t":"list","k":"table","n":' .. n .. ',"items":[' .. concat(parts, ',') .. ']}'
    end
    local c = 0
    for k, val in pairs(v) do
      c = c + 1
      if c > 20 then break end
      local ks = type(k) == 'string' and ('{"t":"key","v":' .. jstr(k) .. '}') or ser(k, d + 1)
      parts[#parts + 1] = '[' .. ks .. ',' .. ser(val, d + 1) .. ']'
    end
    return '{"t":"dict","k":"table","n":' .. count .. ',"items":[' .. concat(parts, ',') .. ']}'
  end
  return '{"t":"' .. t .. '","v":' .. jstr(tostring(v)) .. '}'
end

local base = {}
local steps = 0
local function hook(ev, line)
  local info = debug.getinfo(2, 'S')
  if not info or info.source ~= '=program' then return end
  steps = steps + 1
  if steps > limit then
    debug.sethook()
    error('__TRACELIMIT__', 0)
  end
  local frames = {}
  local level = 2
  while true do
    local inf = debug.getinfo(level, 'Sfn')
    if not inf then break end
    if inf.source == '=program' then
      local vars, seen = {}, {}
      local i = 1
      while true do
        local name, val = debug.getlocal(level, i)
        if not name then break end
        if name:sub(1, 1) ~= '(' and type(val) ~= 'function' then
          seen[name] = true
          vars[#vars + 1] = jstr(name) .. ':' .. ser(val, 0)
        end
        i = i + 1
      end
      if inf.func then
        local u = 1
        while true do
          local name, val = debug.getupvalue(inf.func, u)
          if not name then break end
          if name ~= '_ENV' and not seen[name] and type(val) ~= 'function' then
            seen[name] = true
            vars[#vars + 1] = jstr(name) .. ':' .. ser(val, 0)
          end
          u = u + 1
        end
      end
      local nm = inf.what == 'main' and 'main chunk' or ((inf.name or 'function') .. '()')
      insert(frames, 1, '{"name":' .. jstr(nm) .. ',"vars":{' .. concat(vars, ',') .. '}}')
    end
    level = level + 1
  end
  local gl = {}
  for k, v in pairs(_G) do
    if not base[k] and type(k) == 'string' and type(v) ~= 'function' then gl[#gl + 1] = jstr(k) .. ':' .. ser(v, 0) end
  end
  if #gl > 0 then insert(frames, 1, '{"name":"Globals","vars":{' .. concat(gl, ',') .. '}}') end
  rec('{"line":' .. line .. ',"frames":[' .. concat(frames, ',') .. ']}')
end

local f, err = load(code, '=program', 't')
if not f then return false, tostring(err), 'syntax' end
for k in pairs(_G) do base[k] = true end
if trace then debug.sethook(hook, 'l') end
local ok, e = xpcall(f, function(m) return tostring(m) end)
debug.sethook()
return ok, ok and '' or tostring(e), 'runtime'
`;

  async function runLua(lang, code, o) {
    return new Promise((resolve) => {
      const w = workerFrom(luaWorkerMain);
      let timer, finished = false;
      const finish = (r) => { if (finished) return; finished = true; clearTimeout(timer); w.terminate(); o.setCurrent(null); resolve(r); };
      o.setCurrent({ stop: () => finish({ stopped: true }) });
      timer = setTimeout(() => finish({ ok: false, error: { type: 'Timeout', message: 'Your program ran for more than ' + TIMEOUT / 1000 + ' seconds, so it was stopped. Is there an infinite loop?' } }), TIMEOUT);
      w.onmessage = (e) => {
        const d = e.data;
        if (d.t === 'out') o.emit(d.k, d.s);
        else if (d.t === 'done') {
          if (d.internal) return finish({ ok: false, error: { type: 'InternalError', message: d.internal } });
          if (d.ok) return finish({ ok: true, steps: o.trace ? d.steps : null, mode: 'trace' });
          if (d.msg === '__TRACELIMIT__') return finish({ ok: true, steps: d.steps, mode: 'trace', traceStopped: true });
          const m = /^program:(\d+):\s*(.*)$/s.exec(d.msg);
          const message = m ? m[2] : d.msg;
          finish({ ok: false, steps: o.trace ? d.steps : null, mode: 'trace', error: { type: d.kind === 'syntax' ? 'SyntaxError' : 'RuntimeError', message, line: m ? +m[1] : null, text: d.kind === 'syntax' ? 'Syntax error: ' + d.msg.replace(/^program:/, 'line ') : 'lua: ' + d.msg.replace(/^program:/, 'line ') } });
        }
      };
      w.onerror = (e) => finish({ ok: false, error: { type: 'Error', message: e.message || 'Lua failed to start (internet needed to download the Lua runtime).' } });
      w.postMessage({ code, stdin: o.stdin, trace: !!o.trace, limit: MAX_STEPS, prelude: LUA_PRELUDE });
    });
  }

  /* ======================================================= SQL (sql.js) */
  let sqlPromise = null;
  function asciiTable(cols, rows) {
    const cell = (v) => (v === null ? 'NULL' : String(v));
    const data = rows.map((r) => r.map(cell));
    const w = cols.map((c, i) => data.reduce((m, r) => Math.max(m, (r[i] || '').length), c.length));
    const line = (l, m, r) => l + w.map((n) => '─'.repeat(n + 2)).join(m) + r;
    const row = (r) => '│' + r.map((c, i) => ' ' + c.padEnd(w[i]) + ' ').join('│') + '│';
    return [line('┌', '┬', '┐'), row(cols), line('├', '┼', '┤')].concat(data.map(row), [line('└', '┴', '┘')]).join('\n');
  }
  function sqlSnapshot(db) {
    const tables = [];
    const r = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    if (r[0]) r[0].values.forEach(([name]) => {
      const cols = db.exec('PRAGMA table_info("' + name + '")');
      const data = db.exec('SELECT * FROM "' + name + '" LIMIT 50');
      tables.push({ name, cols: cols[0] ? cols[0].values.map((v) => v[1]) : [], rows: data[0] ? data[0].values : [] });
    });
    return tables;
  }
  async function runSQL(lang, code, o) {
    try {
      await loadScript(SQLJS + 'sql-wasm.js');
      if (!sqlPromise) sqlPromise = window.initSqlJs({ locateFile: (f) => SQLJS + f });
    } catch (e) { return { ok: false, error: { type: 'LoadError', message: e.message } }; }
    let SQL;
    try { SQL = await sqlPromise; } catch (e) { sqlPromise = null; return { ok: false, error: { type: 'LoadError', message: 'Could not start the SQL engine: ' + e.message } }; }
    const db = new SQL.Database();
    const steps = [];
    let pos = 0, curLine = 1, inStmt = false, lastResult = null;
    const lineAt = (i) => code.slice(0, i).split('\n').length;
    try {
      for (const stmt of db.iterateStatements(code)) {
        inStmt = true;
        const sql = stmt.getSQL().replace(/^(?:\s*(?:--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/))*\s*/, '').trim();
        const at = sql ? code.indexOf(sql, pos) : -1;
        if (at >= 0) { curLine = lineAt(at); pos = at + sql.length; }
        const cols = stmt.getColumnNames();
        const rows = [];
        while (stmt.step()) { rows.push(stmt.get()); if (rows.length >= 500) break; }
        let result = null, msg = '';
        if (cols.length) {
          result = { cols, rows };
          lastResult = result;
          o.emit('out', asciiTable(cols, rows) + '\n');
          o.emit('sys', '(' + rows.length + ' row' + (rows.length === 1 ? '' : 's') + ')\n\n');
        } else {
          const kw = sql.split(/\s+/)[0].toUpperCase();
          const n = db.getRowsModified();
          msg = /^(INSERT|UPDATE|DELETE)$/.test(kw) ? kw + ' OK — ' + n + ' row' + (n === 1 ? '' : 's') + ' affected' : kw + ' OK';
          o.emit('ok', '✓ ' + msg + '\n');
        }
        if (o.trace) steps.push({ line: curLine, sql, result, msg, tables: sqlSnapshot(db) });
        inStmt = false;
      }
    } catch (e) {
      let line = curLine;
      if (!inStmt) {
        const rest = code.slice(pos);
        const off = rest.search(/[^\s;]/);
        line = lineAt(pos + (off < 0 ? 0 : off));
      }
      const message = String(e.message || e).replace(/^Error:\s*/, '');
      db.close();
      return { ok: false, steps: o.trace ? steps : null, mode: 'sql', error: { type: 'SQLError', message, line, text: 'Error: ' + message }, extra: { lastResult } };
    }
    db.close();
    return { ok: true, steps: o.trace ? steps : null, mode: 'sql', extra: { lastResult } };
  }

  /* ======================================================= HTML */
  const HTML_SNIPPET = '(function(){var p=function(k,a){try{parent.postMessage({__lc:1,kind:k,text:a.map(function(x){try{return typeof x==="string"?x:(x instanceof Error?x.stack||String(x):JSON.stringify(x))}catch(e){return String(x)}}).join(" ")},"*")}catch(e){}};' +
    '["log","info","debug"].forEach(function(k){console[k]=function(){p("out",[].slice.call(arguments))}});console.warn=function(){p("warn",[].slice.call(arguments))};console.error=function(){p("err",[].slice.call(arguments))};' +
    'window.addEventListener("error",function(e){parent.postMessage({__lc:1,kind:"jserror",text:e.message,line:e.lineno},"*")});' +
    'window.addEventListener("unhandledrejection",function(e){p("err",["Unhandled promise rejection:",String(e.reason)])});})();';
  function injectHtml(code) {
    const inj = '<script>' + HTML_SNIPPET + '<\/script>';
    const m = /<head[^>]*>/i.exec(code) || /<html[^>]*>/i.exec(code) || /<!doctype[^>]*>/i.exec(code);
    if (m) { const at = m.index + m[0].length; return code.slice(0, at) + inj + code.slice(at); }
    return inj + code;
  }
  async function runHTML(lang, code, o) {
    o.preview(injectHtml(code));
    const steps = o.trace ? window.Trace.scanHtml(code) : null;
    return { ok: true, steps, mode: 'dom', extra: { html: code } };
  }

  /* ======================================================= Wandbox (compiled languages) */
  let wbList = null;
  function versionScore(c) {
    if (/head/i.test(c.name) || /head/i.test(c.version || '')) return 1e9;
    const nums = String(c.version || c.name).match(/\d+/g) || [0];
    return nums.slice(0, 3).reduce((a, n, i) => a + (+n) / Math.pow(1000, i), 0);
  }
  async function wbCompiler(lang) {
    if (!wbList) {
      const r = await fetch('https://wandbox.org/api/list.json');
      wbList = await r.json();
    }
    let cands = wbList.filter((c) => c.language === lang.wb.lang);
    if (lang.wb.prefer) { const pf = cands.filter((c) => lang.wb.prefer.test(c.name)); if (pf.length) cands = pf; }
    if (!cands.length) throw new Error('No ' + lang.name + ' compiler is available on the online runner right now.');
    cands.sort((a, b) => versionScore(b) - versionScore(a));
    return cands[0].name;
  }
  function wbParseLines(text, kinds) {
    const marks = [];
    const re = /(?:prog|Main|main|input|Program|source_file|jdoodle)\.\w+[:(](\d+)(?:[:,](\d+))?\)?:?\s*(?:(?:fatal )?(error|warning)|\w*\s*(?:error|warning))?/g;
    let m;
    while ((m = re.exec(text))) marks.push({ line: +m[1], col: m[2] ? +m[2] : null, kind: /warning/.test(m[0]) ? 'warn' : 'err' });
    const php = /on line (\d+)/.exec(text);
    if (!marks.length && php) marks.push({ line: +php[1], kind: 'err' });
    return marks;
  }
  async function runWandbox(lang, code, o) {
    const ctl = new AbortController();
    let finished = false, timer;
    return new Promise(async (resolve) => {
      const finish = (r) => { if (finished) return; finished = true; clearTimeout(timer); o.setCurrent(null); resolve(r); };
      o.setCurrent({ stop: () => { ctl.abort(); finish({ stopped: true }); } });
      timer = setTimeout(() => { ctl.abort(); finish({ ok: false, error: { type: 'Timeout', message: 'The online runner took too long to respond. Try again in a moment.' } }); }, 90000);
      try {
        o.status('Compiling on the online runner…' + (lang.wb.slow ? ' (' + lang.name + ' builds there can take 20–60 seconds)' : ''));
        const compiler = await wbCompiler(lang);
        const src = lang.wb.transform ? lang.wb.transform(code) : code;
        const body = { code: src, compiler, stdin: o.stdin || '', save: false };
        if (lang.wb.flags) body['compiler-option-raw'] = lang.wb.flags.split(/\s+/).join('\n'); // one option per line
        const infra = /OCI runtime error|Resource temporarily unavailable|File size limit exceeded/;
        let j;
        for (let attempt = 0; attempt < 4; attempt++) {
          if (attempt) { o.status('The online runner is busy — retrying (' + attempt + '/3)…'); await new Promise((r) => setTimeout(r, 1500 * attempt)); }
          if (finished) return;
          const r = await fetch('https://wandbox.org/api/compile.json', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal });
          if (r.status === 429) {
            return finish({ ok: false, error: { type: 'RateLimited', message: 'The free online compiler limits how often code can be run. Please wait about a minute, then press Run again.' } });
          }
          if (r.status >= 502 && r.status <= 504) {
            j = { status: '1', compiler_error: 'Resource temporarily unavailable (HTTP ' + r.status + ')' };
            continue;
          }
          if (!r.ok) throw new Error('HTTP ' + r.status);
          j = await r.json();
          if (!infra.test(j.compiler_error || '') && !infra.test(j.program_error || '')) break;
        }
        o.status('');
        const cerr = (j.compiler_error || '').trim();
        const cmsg = (j.compiler_message || '').trim();
        if (infra.test(cerr) || infra.test(j.program_error || '')) {
          return finish({ ok: false, error: { type: 'RunnerBusy', message: 'The online compiler is overloaded right now. Wait a few seconds and press Run again.', text: (cerr || j.program_error).trim() } });
        }
        const failed = String(j.status) !== '0' || !!j.signal;
        const ranProgram = !!(j.program_output || j.program_error || j.signal);
        const compiled = !(failed && !ranProgram && cerr);
        if (!compiled) {
          const text = cerr || cmsg || 'Compilation failed.';
          const marks = wbParseLines(text);
          // Prefer the first location that follows the first "error" (Rust prints locations on the line after the message).
          const errAt = text.search(/\berror\b/i);
          const first = (errAt >= 0 && wbParseLines(text.slice(errAt))[0]) || marks.find((m) => m.kind === 'err') || marks[0];
          const firstLine = text.split('\n').find((l) => /error/i.test(l)) || text.split('\n')[0];
          return finish({ ok: false, mode: 'explain', error: { type: 'CompileError', message: firstLine.replace(/^.*?(?:error[^:]*:|error\[[^\]]*\]:)\s*/i, '').trim() || firstLine, line: first && first.line, col: first && first.col, text, marks } });
        }
        const warnText = (cerr + '\n' + cmsg).trim();
        if (warnText) o.emit('warn', warnText + '\n\n');
        const marks = warnText ? wbParseLines(warnText) : [];
        if (j.program_output) o.emit('out', j.program_output);
        const code0 = String(j.status) === '0' && !j.signal;
        if (j.program_error) {
          if (code0) o.emit('warn', j.program_error);
        }
        if (!code0) {
          const text = (j.program_error || j.program_message || '').trim() || 'The program exited with status ' + j.status + (j.signal ? ' (' + j.signal + ')' : '');
          const pm = wbParseLines(text);
          const first = pm[0];
          const lines = text.split('\n');
          const head = lines.find((l) => /exception|error|panic|fatal|segmentation|abort|signal/i.test(l)) || lines[0];
          return finish({ ok: false, mode: 'explain', error: { type: j.signal ? 'Signal ' + j.signal : 'RuntimeError', message: head, line: first && first.line, col: first && first.col, text, marks: pm.concat(marks) } });
        }
        finish({ ok: true, mode: 'explain', marks });
      } catch (e) {
        if (e.name === 'AbortError') return finish({ stopped: true });
        finish({ ok: false, error: { type: 'NetworkError', message: 'Could not reach the online compiler (wandbox.org). Compiled languages need an internet connection. (' + e.message + ')' } });
      }
    });
  }

  /* ======================================================= dispatcher */
  let current = null;
  const Engines = {
    MAX_STEPS,
    async run(lang, code, opts) {
      const o = Object.assign({ stdin: '', trace: false, emit() {}, clear() {}, status() {}, preview() {} }, opts);
      o.setCurrent = (c) => { current = c; };
      try {
        switch (lang.engine) {
          case 'js': return await runJS(lang, code, o);
          case 'py': return await runPython(lang, code, o);
          case 'lua': return await runLua(lang, code, o);
          case 'sql': return await runSQL(lang, code, o);
          case 'html': return await runHTML(lang, code, o);
          default: return await runWandbox(lang, code, o);
        }
      } catch (e) {
        current = null;
        return { ok: false, error: { type: 'InternalError', message: (e && e.message) || String(e) } };
      }
    },
    stop() { if (current) current.stop(); },
    warm(lang) {
      if (lang.engine === 'py') pyInit({ status() {} }).catch(() => {});
      else if (lang.engine === 'js') loadScript(ACORN).catch(() => {});
      else if (lang.engine === 'sql') loadScript(SQLJS + 'sql-wasm.js').catch(() => {});
      else if (lang.engine === 'wandbox') { if (!wbList) fetch('https://wandbox.org/api/list.json').then((r) => r.json()).then((j) => { wbList = j; }).catch(() => {}); }
    }
  };
  window.Engines = Engines;
})();
