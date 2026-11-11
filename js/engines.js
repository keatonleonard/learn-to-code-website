// ================================================================
//  engines.js: the part that actually RUNS your code
// ================================================================
//  Each language needs a different "engine" (a program that can run
//  that language). This file has one for each kind:
//    * JavaScript : run inside the browser itself
//    * Python     : Pyodide, real Python converted to run in browsers
//    * Lua        : Fengari, a Lua written in JavaScript
//    * SQL        : sql.js, the SQLite database converted for browsers
//    * HTML & CSS : drawn in a sandboxed frame (a page inside the page)
//    * C, C++, Java, Rust, Go, C#, Ruby, PHP : sent over the internet to
//      Wandbox, a free online compiler service, which runs them on its
//      own computers and sends back the output.
//
//  KEY WORDS used in this file:
//  * Web Worker: a separate background thread (a second line of work
//    running at the same time) for JavaScript. Running your code in a
//    worker means an endless loop can't freeze the page, and the worker
//    can simply be shut down ("terminated") when you press Stop.
//  * Message: workers can't touch the page; they talk to it by sending
//    messages (postMessage) and receiving them (onmessage).
//  * Promise: an object standing for a result that will arrive LATER.
//    "resolve" delivers that result. "await" waits for it.
//  * async function: a function that can use "await".
//  * CDN: a public server that hosts code libraries for any website.
//  * Trace: a step by step recording of a program for the visualizer.
//  * Compile: translate code into a form the computer can run. Languages
//    like C must be compiled first; that's done on Wandbox.
// ================================================================
/* Run engines. Each engine resolves to:
   { ok, stopped, error:{type,message,line,col,text}, steps, mode, extra }  */
// IIFE wrapper: keeps every name in this file private (see app.js).
(function () {
  'use strict';

  // SETTINGS
  // MAX_STEPS: stop recording a trace after this many lines (protects
  // against endless loops filling up memory).
  // TIMEOUT: stop any program that runs longer than 10,000 ms (10 seconds).
  // The web addresses point to the CDN copies of each language engine. The
  // version numbers are pinned (fixed) so an update can't break the site.
  const MAX_STEPS = 2500;
  const TIMEOUT = 10000;
  const ACORN = 'https://cdn.jsdelivr.net/npm/acorn@8.11.3/dist/acorn.js';
  const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  const SQLJS = 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/';

  // SRI fingerprints for scripts loaded later on demand (see the comment
  // right below).
  // Subresource Integrity: the browser refuses these files if the CDN ever serves different contents.
  const SRI = {
    [ACORN]: 'sha384-ZzOQATwraE9ywaYqMdoWStSsI1G6qRnAvJpKgcT3mrvl8PC5IlfxGzIu1WGBvydm',
    [SQLJS + 'sql-wasm.js']: 'sha384-8D3Rsfo535FqoC1pHCCQMrNf75UgzyoG/HQm9zOzITRrz3QKzecc2E7JXKGCXoWu'
  };
  // loadScript() adds a <script> tag to the page to download a library the
  // first time it is needed. "scripts" remembers each download's Promise so
  // the same file is never downloaded twice. If the download fails, the
  // remembered Promise is removed so the next Run can try again.
  const scripts = {};
  function loadScript(src) {
    if (!scripts[src]) {
      scripts[src] = new Promise((res, rej) => {
        const s = document.createElement('script');
        if (SRI[src]) { s.integrity = SRI[src]; s.crossOrigin = 'anonymous'; }
        s.src = src; s.onload = res;
        s.onerror = () => { delete scripts[src]; rej(new Error('Could not download ' + src.split('/').slice(-1)[0] + '. Check your internet connection.')); };
        document.head.appendChild(s);
      });
    }
    return scripts[src];
  }
  // workerFrom() creates a Web Worker from one of the functions below.
  // It turns the function into text (fn.toString()), wraps it so it runs
  // immediately, packs it into a Blob (in memory file data) and gives that
  // to the browser as the worker's code. This avoids needing extra files.
  function workerFrom(fn) {
    const url = URL.createObjectURL(new Blob(['(' + fn.toString() + ')()'], { type: 'text/javascript' }));
    return new Worker(url);
  }

  /* ======================================================= JavaScript worker */
  // JAVASCRIPT ENGINE: the code that runs INSIDE the worker.
  // Everything inside this function lives in the worker, not the page.
  // The variables keep track of: the input lines (for prompt()), the trace
  // steps recorded so far, how much has been printed, and the "call stack"
  // (which functions are currently running, for the visualizer).
  function jsWorkerMain() {
    let lines = [], li = 0, steps = [], limit = 0, outLen = 0, total = 0, halted = false, truncated = false;
    const stack = [];
    // post() sends a message to the page. emit() sends printed text, and
    // stops after 300,000 characters so a runaway program can't flood the page.
    // "self" is the worker's name for itself (like "window" on a page).
    const post = (m) => self.postMessage(m);
    const emit = (k, s) => {
      if (total > 300000) { if (!truncated) { truncated = true; post({ t: 'out', k: 'err', s: '\n[output truncated]\n' }); } return; }
      total += s.length; outLen += s.length; post({ t: 'out', k, s });
    };
    // A special error used to stop the program when the trace is too long.
    // "class ... extends Error" makes a new kind of error based on the
    // built in Error type.
    class TraceLimit extends Error { constructor() { super('Trace limit'); this.name = 'TraceLimit'; } }

    /* ---- console formatting (similar to Node's util.inspect) ---- */
    // Helpers that turn values into readable text for console.log, in the
    // same style Node.js (JavaScript outside the browser) uses:
    // q() puts quotes around a string, fit() puts short lists on one line and
    // long ones on several lines.
    const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
    function fit(o, c, items) {
      if (!items.length) return o + c;
      const one = o + ' ' + items.join(', ') + ' ' + c;
      if (one.length <= 72 && one.indexOf('\n') < 0) return one;
      return o + '\n' + items.map((i) => '  ' + i.replace(/\n/g, '\n  ')).join(',\n') + '\n' + c;
    }
    // inspect() turns ANY value into display text: numbers, strings, lists,
    // objects, Maps, Sets, dates and errors. "depth" stops it going too deep
    // into nested objects, and "seen" detects an object that contains itself
    // (which would otherwise loop forever), printing [Circular] instead.
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
    // format() joins console.log's arguments with spaces and supports
    // placeholders like %s (string) and %d (number), as real consoles do.
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
    // REPLACING THE CONSOLE. console.log normally writes to the browser's
    // hidden developer console. Here every console function is replaced with
    // our own version that sends the text to CodeLab's terminal instead.
    // console.group indents later lines; console.table draws a text table.
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
    // alert / confirm / prompt don't exist in workers, so simple versions are
    // provided. prompt() reads the next line from the "Program input" box.
    self.alert = (m) => emit('out', String(m) + '\n');
    self.confirm = () => true;
    self.prompt = (m) => {
      if (m) emit('out', String(m));
      const l = li < lines.length ? lines[li++] : null;
      if (l !== null) emit('out', l + '\n');
      return l;
    };

    /* ---- timers tracked so we know when the program has settled ---- */
    // TIMERS. setTimeout / setInterval schedule code for later. They are
    // wrapped so the worker can count how many are still waiting ("live"),
    // and so it knows the program has really finished only when none remain.
    // Errors inside timers are reported instead of being lost.
    const _st = self.setTimeout, _ct = self.clearTimeout, _si = self.setInterval, _ci = self.clearInterval;
    const live = new Set();
    const report = (e) => post({ t: 'error', name: (e && e.name) || 'Error', message: e && e.message !== undefined ? String(e.message) : String(e), stack: (e && e.stack) || '' });
    self.setTimeout = (fn, ms, ...a) => { const id = _st(() => { live.delete(id); try { if (typeof fn === 'function') fn(...a); } catch (e) { report(e); } }, ms); live.add(id); return id; };
    self.clearTimeout = (id) => { live.delete(id); _ct(id); };
    self.setInterval = (fn, ms, ...a) => { const id = _si(() => { try { if (typeof fn === 'function') fn(...a); } catch (e) { report(e); } }, ms); live.add(id); return id; };
    self.clearInterval = (id) => { live.delete(id); _ci(id); };
    self.addEventListener('unhandledrejection', (ev) => { ev.preventDefault(); report(ev.reason instanceof Error ? ev.reason : new Error('Unhandled promise rejection: ' + inspect(ev.reason, 1, []))); });

    /* ---- tracing support ---- */
    // TRACING SUPPORT
    // ser() ("serialise") turns a value into a small description the
    // visualizer can draw, like { t: 'int', v: '5' } or a list of items.
    // Big lists are cut to 20 items and nesting stops after 3 levels.
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
    // serMap() describes every variable in a group, skipping functions.
    function serMap(o) {
      const out = {};
      for (const k in o) { const v = o[k]; if (typeof v === 'function') continue; out[k] = ser(v, 0, []); }
      return out;
    }
    // These functions are called by YOUR code after trace.js has added calls
    // to them. __enter / __leave mark entering and leaving a function (for
    // the call stack). __t(line, getter) records one step: the line number
    // plus every variable's current value, read by the getter function.
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

    // WHEN THE PAGE SENDS CODE TO RUN:
    // 1. Store the input lines and step limit.
    // 2. Run the code with eval() (which runs text as JavaScript). Errors are
    //    caught and reported, except the deliberate trace limit stop.
    // 3. Wait (up to 8 seconds) for any timers still pending to finish.
    // 4. Send "done" with the recorded steps.
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

  // BACK ON THE PAGE: helpers for running JavaScript.
  // jsErrorPos() finds the line and column of an error. A "stack trace" is
  // the error's record of where it happened; the pattern finds the numbers.
  function jsErrorPos(stack) {
    if (!stack) return null;
    const m = /<anonymous>:(\d+):(\d+)/.exec(stack) || /> eval:(\d+):(\d+)/.exec(stack);
    return m ? { line: +m[1], col: +m[2] } : null;
  }

  // runJS() runs JavaScript:
  //  1. Load Acorn (a JavaScript "parser": it reads code and understands its
  //     structure) and use it to check for syntax errors (typing mistakes
  //     in the code's grammar) BEFORE running, giving a precise line number.
  //  2. If the visualizer is open, ask trace.js to add the recording calls.
  //  3. Start a fresh worker, send it the code, and listen for messages:
  //     output to print, errors, and "done".
  //  4. If it runs too long, stop it with a Timeout error. Pressing Stop
  //     also terminates the worker (o.setCurrent tells the Stop button how).
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
  // PYTHON ENGINE (Pyodide). This function runs inside its own worker.
  // importScripts() downloads Pyodide. On "init" it loads Python and the
  // helper program PY_HARNESS (below); on "run" it hands your code, input,
  // and settings to Python and sends back the result as JSON text.
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

  // PY_HARNESS is a small PYTHON program stored as text. (String.raw keeps
  // backslashes exactly as typed.) No JavaScript comments can go inside it,
  // because they would become part of the Python code. In short, it:
  //  * replaces print()'s output stream and input() so they talk to CodeLab,
  //  * compiles your code to catch syntax errors with their line numbers,
  //  * when tracing, uses Python's sys.settrace to record every line run
  //    with all variables (and return values of functions),
  //  * formats errors like real Python tracebacks ("Traceback ...").
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

  // The Python worker is kept alive between runs because loading Python
  // takes several seconds. pyInit() starts it once (showing a "Loading
  // Python..." message) and remembers the Promise; pyReset() throws it away
  // (after Stop or a timeout) so the next run starts a fresh one.
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

  // runPython(): make sure Python is loaded, then send the code to the
  // worker and turn its reply into CodeLab's standard result format.
  // Stopping or timing out kills the worker with pyReset().
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
  // LUA ENGINE (Fengari). This runs inside its own worker.
  // Fengari expects a "window", so the worker pretends to have one.
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
      // reg() makes a JavaScript function callable from Lua under a name.
      // Lua and JavaScript store text differently, so arguments are converted
      // (to_jsstring) on the way in and the result (to_luastring) on the way out.
      // Three are registered: __out (print text), __rec (record a trace step)
      // and __readline (read a line of input).
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
      // Load and run the Lua "prelude" (LUA_PRELUDE below), which runs your
      // code. Its three results are: did it succeed, an error message, and
      // whether the error was a syntax error or a runtime error.
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

  // LUA_PRELUDE is a small LUA program stored as text (no JavaScript
  // comments allowed inside it). It replaces print and io.write/io.read so
  // they talk to CodeLab, then loads your code as a chunk named "program".
  // When tracing it uses Lua's debug.sethook, which calls a function before
  // every line, to record local variables, upvalues (outer variables a
  // function uses) and globals as JSON text.
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

  // runLua(): start a fresh Lua worker, send the code, collect the output,
  // and turn messages like "program:3: attempt to..." into a line number
  // and a clean error message.
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
  // SQL ENGINE (sql.js, the SQLite database compiled to WebAssembly: a fast
  // low level code format browsers can run).
  let sqlPromise = null;
  // asciiTable() draws query results as a text table with box drawing
  // characters, sizing each column to its widest value.
  function asciiTable(cols, rows) {
    const cell = (v) => (v === null ? 'NULL' : String(v));
    const data = rows.map((r) => r.map(cell));
    const w = cols.map((c, i) => data.reduce((m, r) => Math.max(m, (r[i] || '').length), c.length));
    const line = (l, m, r) => l + w.map((n) => '─'.repeat(n + 2)).join(m) + r;
    const row = (r) => '│' + r.map((c, i) => ' ' + c.padEnd(w[i]) + ' ').join('│') + '│';
    return [line('┌', '┬', '┐'), row(cols), line('├', '┼', '┤')].concat(data.map(row), [line('└', '┴', '┘')]).join('\n');
  }
  // sqlSnapshot() reads every table's columns and first 50 rows so the
  // visualizer can show the whole database after each statement. Table
  // names are wrapped in double quotes (and inner quotes doubled) so
  // unusual names can't break the query.
  function sqlSnapshot(db) {
    const tables = [];
    const r = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    if (r[0]) r[0].values.forEach(([name]) => {
      const ident = '"' + String(name).replace(/"/g, '""') + '"';
      const cols = db.exec('PRAGMA table_info(' + ident + ')');
      const data = db.exec('SELECT * FROM ' + ident + ' LIMIT 50');
      tables.push({ name, cols: cols[0] ? cols[0].values.map((v) => v[1]) : [], rows: data[0] ? data[0].values : [] });
    });
    return tables;
  }
  // runSQL(): start a brand new, empty in memory database, then run your
  // SQL one statement at a time. For each statement it works out its line
  // number, prints either a result table or "OK, 3 rows affected", and
  // (when tracing) records a snapshot of all tables. If a statement fails,
  // it reports which line it was on.
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
  // HTML ENGINE
  // HTML_SNIPPET is a tiny script added to your page before it is shown. It
  // forwards your page's console.log messages and JavaScript errors to
  // CodeLab using postMessage, so they appear in the Terminal tab.
  const HTML_SNIPPET = '(function(){var p=function(k,a){try{parent.postMessage({__lc:1,kind:k,text:a.map(function(x){try{return typeof x==="string"?x:(x instanceof Error?x.stack||String(x):JSON.stringify(x))}catch(e){return String(x)}}).join(" ")},"*")}catch(e){}};' +
    '["log","info","debug"].forEach(function(k){console[k]=function(){p("out",[].slice.call(arguments))}});console.warn=function(){p("warn",[].slice.call(arguments))};console.error=function(){p("err",[].slice.call(arguments))};' +
    'window.addEventListener("error",function(e){parent.postMessage({__lc:1,kind:"jserror",text:e.message,line:e.lineno},"*")});' +
    'window.addEventListener("unhandledrejection",function(e){p("err",["Unhandled promise rejection:",String(e.reason)])});})();';
  // injectHtml() places that script just inside <head> (or <html>, or after
  // <!doctype>) on the SAME line, so your line numbers stay correct.
  function injectHtml(code) {
    const inj = '<script>' + HTML_SNIPPET + '<\/script>';
    const m = /<head[^>]*>/i.exec(code) || /<html[^>]*>/i.exec(code) || /<!doctype[^>]*>/i.exec(code);
    if (m) { const at = m.index + m[0].length; return code.slice(0, at) + inj + code.slice(at); }
    return inj + code;
  }
  // runHTML(): show the page in the Preview frame and, when tracing, scan
  // its tags for the visualizer's tree view.
  async function runHTML(lang, code, o) {
    o.preview(injectHtml(code));
    const steps = o.trace ? window.Trace.scanHtml(code) : null;
    return { ok: true, steps, mode: 'dom', extra: { html: code } };
  }

  /* ======================================================= Wandbox (compiled languages) */
  // COMPILED LANGUAGES (via the Wandbox online service)
  // wbList caches (keeps a copy of) Wandbox's list of available compilers.
  let wbList = null;
  // versionScore() turns a compiler's version into a number for sorting, so
  // the newest compiler is chosen. "head" means the latest development
  // version, so it scores highest.
  function versionScore(c) {
    if (/head/i.test(c.name) || /head/i.test(c.version || '')) return 1e9;
    const nums = String(c.version || c.name).match(/\d+/g) || [0];
    return nums.slice(0, 3).reduce((a, n, i) => a + (+n) / Math.pow(1000, i), 0);
  }
  // wbCompiler() picks which Wandbox compiler to use for a language,
  // preferring a family if the language asks (e.g. GCC for C), newest first.
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
  // wbParseLines() finds line numbers in compiler messages. Compilers
  // write locations in different styles (prog.c:4:5, prog.cs(4,17),
  // on line 3...), and this regular expression understands them all.
  function wbParseLines(text, kinds) {
    const marks = [];
    const re = /(?:prog|Main|main|input|Program|source_file|jdoodle)\.\w+[:(](\d+)(?:[:,](\d+))?\)?:?\s*(?:(?:fatal )?(error|warning)|\w*\s*(?:error|warning))?/g;
    let m;
    while ((m = re.exec(text))) marks.push({ line: +m[1], col: m[2] ? +m[2] : null, kind: /warning/.test(m[0]) ? 'warn' : 'err' });
    const php = /on line (\d+)/.exec(text);
    if (!marks.length && php) marks.push({ line: +php[1], kind: 'err' });
    return marks;
  }
  // runWandbox(): send code to Wandbox and interpret the reply.
  // AbortController lets the Stop button cancel the network request.
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
        // Some languages adjust the code first (Java: "public class Main" can't
        // compile in a file Wandbox names prog.java, so "public" is dropped
        // without changing line numbers).
        const src = lang.wb.transform ? lang.wb.transform(code) : code;
        const body = { code: src, compiler, stdin: o.stdin || '', save: false };
        if (lang.wb.flags) body['compiler-option-raw'] = lang.wb.flags.split(/\s+/).join('\n'); // one option per line
        // Send the code with fetch() (the browser's way to talk to other web
        // servers). Wandbox is a free shared service, so it is sometimes busy:
        //  * 429 means "too many requests", so ask the user to wait a minute;
        //  * 502 to 504 and some error texts mean the server is overloaded, so
        //    wait a little and retry (up to 3 times).
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
        // Work out what happened. A status other than 0 means failure. If
        // nothing ran and the compiler complained, it was a COMPILE error (the
        // code couldn't be translated); otherwise the program ran.
        const failed = String(j.status) !== '0' || !!j.signal;
        const ranProgram = !!(j.program_output || j.program_error || j.signal);
        const compiled = !(failed && !ranProgram && cerr);
        if (!compiled) {
          const text = cerr || cmsg || 'Compilation failed.';
          const marks = wbParseLines(text);
          // Prefer the first location that follows the first "error" (Rust prints locations on the line after the message).
          // GCC puts the location before "error" on the same line, so start at the beginning of that line.
          // Pick the line of the FIRST error. Starting at the beginning of the line
          // containing "error" works for both GCC (location before the word) and
          // Rust (location on the line after).
          const errAt = text.search(/\berror\b/i);
          const first = (errAt >= 0 && wbParseLines(text.slice(text.lastIndexOf('\n', errAt) + 1))[0]) || marks.find((m) => m.kind === 'err') || marks[0];
          const firstLine = text.split('\n').find((l) => /error/i.test(l)) || text.split('\n')[0];
          return finish({ ok: false, mode: 'explain', error: { type: 'CompileError', message: firstLine.replace(/^.*?(?:error[^:]*:|error\[[^\]]*\]:)\s*/i, '').trim() || firstLine, line: first && first.line, col: first && first.col, text, marks } });
        }
        // The program compiled. Show any compiler warnings, then the output. If
        // it exited with a failure status or a signal (a forced stop, like a
        // crash), report a runtime error using the most useful line of the message.
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

  /* ======================================================= result sanitising
     Traces and errors are produced inside workers that run the learner's (or a share link's) code,
     which can post arbitrary messages. Normalise them to the expected shapes and types. */
  // toLine() accepts only positive whole numbers as line numbers.
  const toLine = (v) => { const n = Number(v); return Number.isInteger(n) && n > 0 ? n : null; };
  // cleanVal() / cleanVars() rebuild a recorded value from scratch with only
  // the expected fields, converted to the expected types (text or number),
  // limited in size and depth. Anything unexpected becomes a harmless "…".
  function cleanVal(v, d) {
    if (!v || typeof v !== 'object' || d > 6) return { t: 'ref', v: '…' };
    const o = { t: String(v.t), v: v.v == null ? '' : String(v.v) };
    if (v.k != null) o.k = String(v.k);
    if (v.n != null) o.n = Number(v.n) || 0;
    if (o.t === 'list') o.items = Array.isArray(v.items) ? v.items.slice(0, 50).map((x) => cleanVal(x, d + 1)) : [];
    else if (o.t === 'dict') o.items = Array.isArray(v.items) ? v.items.slice(0, 50).map((p) => (Array.isArray(p) ? [cleanVal(p[0], d + 1), cleanVal(p[1], d + 1)] : [cleanVal(null), cleanVal(null)])) : [];
    return o;
  }
  function cleanVars(vars) {
    if (!vars || typeof vars !== 'object') return null;
    const out = {};
    Object.keys(vars).slice(0, 200).forEach((k) => { out[k] = cleanVal(vars[k], 0); });
    return out;
  }
  // cleanResult() checks every result before the rest of the site uses it.
  // This is a SECURITY measure: the code being run (possibly from a share
  // link) could send fake messages, so error details and trace steps are
  // rebuilt from scratch with only safe, expected values.
  function cleanResult(res) {
    if (!res || typeof res !== 'object') return { ok: false, error: { type: 'InternalError', message: 'The runner returned no result.' } };
    if (res.error) {
      const e = res.error;
      res.error = { type: String(e.type || 'Error'), message: String(e.message == null ? '' : e.message), line: toLine(e.line), col: toLine(e.col), text: e.text == null ? undefined : String(e.text), marks: Array.isArray(e.marks) ? e.marks : undefined };
    }
    if (res.steps && res.mode === 'trace') {
      res.steps = Array.isArray(res.steps) ? res.steps.slice(0, MAX_STEPS + 1).filter((s) => s && typeof s === 'object').map((s) => {
        const st = { line: toLine(s.line) || 0, out: Math.max(0, Number(s.out) || 0), frames: Array.isArray(s.frames) ? s.frames.slice(0, 200).filter((f) => f && typeof f === 'object').map((f) => ({ name: String(f.name == null ? '?' : f.name), vars: cleanVars(f.vars) })) : [] };
        if (s.ret) st.ret = cleanVal(s.ret, 0);
        return st;
      }) : null;
    }
    return res;
  }

  /* ======================================================= dispatcher */
  // THE PUBLIC INTERFACE: window.Engines, used by app.js.
  // "current" holds a way to stop whatever program is running right now.
  //  * run(): fill in default options, pick the right engine for the
  //    language, run it, and clean the result. Any unexpected crash becomes
  //    a friendly "InternalError" instead of breaking the page.
  //  * stop(): stop the running program.
  //  * warm(): start downloading/loading a language's engine early, while
  //    you read or type, so your first Run is faster.
  let current = null;
  const Engines = {
    MAX_STEPS,
    async run(lang, code, opts) {
      const o = Object.assign({ stdin: '', trace: false, emit() {}, clear() {}, status() {}, preview() {} }, opts);
      o.setCurrent = (c) => { current = c; };
      try {
        const run = { js: runJS, py: runPython, lua: runLua, sql: runSQL, html: runHTML }[lang.engine] || runWandbox;
        return cleanResult(await run(lang, code, o));
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
  // Share the Engines object with the other files.
  window.Engines = Engines;
})();
