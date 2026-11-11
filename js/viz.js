// ================================================================
//  viz.js: the Visualizer panel (right side of the coding screen)
// ================================================================
//  The visualizer replays a recording of your program one STEP at a
//  time, like a video you can pause and scrub. A step is one line about
//  to run, plus a snapshot of everything at that moment. It has four
//  MODES, depending on the language:
//   * trace   (JavaScript, Python, Lua): variables, the call stack and
//             the output so far, after every line.
//   * sql     : each statement's result and every table afterwards.
//   * dom     : the web page's elements and CSS rules, as a tree.
//   * explain (compiled languages): a plain English description of each
//             line, read top to bottom.
//
//  KEY WORDS used in this file:
//  * Call stack: the list of functions currently running. When function
//    A calls function B, B goes on top of A; when B finishes, it is
//    removed. Each entry is a "frame" with its own variables.
//  * Variable: a named value in your program (see app.js for basics).
//  * this: inside an object's function (a "method"), "this" means the
//    object itself, here the visualizer object V.
//  * innerHTML: setting it replaces an element's contents with HTML
//    written as text. Every piece of user data is passed through esc()
//    first so it can only ever show as text, never become real HTML.
// ================================================================
/* Visualizer panel: plays back recorded steps (trace / sql / dom / explain). */
// IIFE wrapper: keeps every name in this file private (see app.js).
(function () {
  'use strict';
  // Helpers: $ finds an element by id, esc() makes text safe to show as
  // HTML, and num() (below) turns a value into a safe number (0 if it isn't).
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // Steps are recorded inside workers running user code, so numbers in them are coerced before use.
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

  // V is the visualizer object. Its data:
  //   steps = the recording, i = which step is showing, mode = which of the
  //   four modes, lines = your code split into lines, output = everything
  //   the program printed, timer = the autoplay timer, frameSel = which call
  //   stack frame you clicked, stale = whether the code changed since the
  //   recording, cb = "callbacks" from app.js (functions to highlight a
  //   line in the editor and to start a run).
  const V = {
    steps: [], i: 0, mode: null, lang: null, code: '', lines: [], output: '', timer: null, frameSel: null, stale: false, cb: {},

    // init() runs once at start up: connects the playback buttons, the
    // slider and the arrow / space keys, and handles clicks inside the panel
    // (choosing a call stack frame, or the "Run & visualize" button).
    init(cb) {
      this.cb = cb;
      $('vFirst').onclick = () => this.go(0);
      $('vPrev').onclick = () => this.go(this.i - 1);
      $('vNext').onclick = () => this.go(this.i + 1);
      $('vLast').onclick = () => this.go(this.steps.length - 1);
      $('vPlay').onclick = () => this.toggle();
      $('vSlider').oninput = (e) => { this.pause(); this.go(+e.target.value); };
      $('vizBody').addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); this.go(this.i + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(this.i - 1); }
        else if (e.key === ' ') { e.preventDefault(); this.toggle(); }
      });
      $('vizBody').addEventListener('click', (e) => {
        const f = e.target.closest('[data-frame]');
        if (f) { this.frameSel = +f.dataset.frame; this.render(); }
        const b = e.target.closest('[data-act]');
        if (b && b.dataset.act === 'run') this.cb.run();
      });
    },

    // setLang() is called when you switch language: it shows the mode label
    // and the explanation note for that language, then clears the panel.
    setLang(lang) {
      this.lang = lang;
      const modes = { trace: 'Live trace', sql: 'Table view', dom: 'DOM tree', explain: 'Explain mode' };
      const m = lang.trace;
      $('vizMode').textContent = modes[m] || '';
      const notes = {
        trace: 'Run your code with the visualizer open to record every line. Step through to watch variables, the call stack and output change. <b>Highlighted line</b> = the line about to run.',
        sql: 'Each step is one SQL statement. See its result and the state of every table afterwards.',
        dom: 'Steps through your HTML elements and CSS rules in order, building the page\'s tree structure.',
        explain: lang.name + ' is compiled on a remote server, so it can\'t be paused line-by-line here. Explain mode walks through your code in reading order and describes what each line does.'
      };
      $('vizNote').innerHTML = notes[m] || '';
      this.clear();
    },

    // clear() empties the panel and shows a message with a button to start.
    clear(msg) {
      this.pause();
      this.steps = []; this.i = 0; this.stale = false;
      this.cb.line(null);
      $('vSlider').max = 0; $('vSlider').value = 0; $('vCount').textContent = '0 / 0';
      const label = this.lang && this.lang.trace === 'explain' ? 'Explain my code' : 'Run & visualize';
      $('vizBody').innerHTML = '<div class="viz-empty">' + (msg || 'Nothing to show yet.') + '<br><button class="btn primary" data-act="run">▶ ' + label + '</button></div>';
    },

    // load() receives a new recording from app.js and shows its first step.
    // "info" holds extras: an error message, or whether recording was cut
    // short because the program ran too many steps.
    load(steps, mode, code, output, info) {
      this.pause();
      this.steps = steps || []; this.mode = mode; this.code = code; this.lines = code.split('\n'); this.output = output || ''; this.stale = false; this.frameSel = null; this.info = info || {};
      $('vSlider').max = Math.max(0, this.steps.length - 1);
      if (!this.steps.length) { this.clear(this.info.empty || 'No steps were recorded.'); return; }
      this.go(0);
    },

    // markStale() is called when you edit the code after a recording: it
    // adds a "Code changed, Re-run" notice, since the steps no longer match.
    markStale() {
      if (!this.steps.length || this.stale) return;
      this.stale = true;
      this.pause();
      const b = $('vizBody');
      const n = document.createElement('div');
      n.className = 'v-cap'; n.style.borderLeftColor = 'var(--warn)';
      n.innerHTML = '<b>Code changed.</b> This trace is from the previous version. <button class="btn sm" data-act="run">↻ Re-run</button>';
      b.insertBefore(n, b.firstChild);
      this.cb.line(null);
    },

    // PLAYBACK CONTROLS
    // go(i) jumps to step i (kept within the first and last step), moves the
    // slider, updates the "3 / 25" counter and draws that step.
    go(i) {
      if (!this.steps.length) return;
      this.i = Math.max(0, Math.min(this.steps.length - 1, i));
      this.frameSel = null;
      $('vSlider').value = this.i;
      $('vCount').textContent = (this.i + 1) + ' / ' + this.steps.length;
      if (this.i >= this.steps.length - 1) this.pause();
      this.render();
    },
    // toggle() / play() / pause(): autoplay. play() uses setTimeout to move
    // forward one step after a delay (the Slow / Normal / Fast menu), again
    // and again, until the last step or until paused.
    toggle() { if (this.timer) this.pause(); else this.play(); },
    play() {
      if (!this.steps.length) return;
      if (this.i >= this.steps.length - 1) this.go(0);
      $('vPlay').textContent = '⏸';
      const tick = () => { if (this.i >= this.steps.length - 1) { this.pause(); return; } this.go(this.i + 1); this.timer = setTimeout(tick, +$('vSpeed').value); };
      this.timer = setTimeout(tick, +$('vSpeed').value);
    },
    pause() { clearTimeout(this.timer); this.timer = null; const p = $('vPlay'); if (p) p.textContent = '▶'; },

    // render() draws the current step: it highlights the line in the editor
    // (unless the recording is out of date), then calls the drawing function
    // for the current mode and puts the result in the panel.
    render() {
      const s = this.steps[this.i];
      if (!s) return;
      if (!this.stale) this.cb.line(s.line || null);
      let html = '';
      if (this.mode === 'trace') html = this.renderTrace(s);
      else if (this.mode === 'sql') html = this.renderSQL(s);
      else if (this.mode === 'dom') html = this.renderDOM(s);
      else html = this.renderExplain(s);
      $('vizBody').innerHTML = html;
    },

    // caption() draws the card at the top: the line number, the line of code,
    // and the plain English explanation from trace.js. Line 0 means the
    // program has finished.
    caption(line, extra) {
      if (!line) return '<div class="v-cap"><div class="ln">Program finished</div><div class="why">' + (extra || 'This is the final state of your variables after the last line ran.') + '</div></div>';
      const src = this.lines[line - 1] || '';
      const ex = window.Trace.explainLine(this.lang.id, src);
      return '<div class="v-cap"><div class="ln">Line ' + num(line) + (extra ? ' · ' + extra : '') + '</div><div class="src">' + esc(src.trim()) + '</div>' + (ex ? '<div class="why">' + ex.text + '</div>' : '') + '</div>';
    },

    /* ---------- live trace ---------- */
    // renderTrace() draws a step in "trace" mode:
    //  * warnings if recording stopped early or an error is about to happen,
    //  * the caption, and the return value if a function is returning,
    //  * the CALL STACK (only shown when a function is running); click a
    //    frame to see its variables,
    //  * the VARIABLES of the chosen frame, compared with the previous step
    //    so changed or new variables can be highlighted,
    //  * the global variables, when looking inside a function,
    //  * the OUTPUT printed up to this step.
    renderTrace(s) {
      const prev = this.steps[this.i - 1];
      let h = '';
      if (this.info.limited && this.i === this.steps.length - 1) h += '<div class="v-cap" style="border-left-color:var(--warn)">Recording stopped after ' + this.steps.length + ' steps (possible infinite loop, or just a long program).</div>';
      if (this.info.error && this.i === this.steps.length - 1) h += '<div class="v-cap" style="border-left-color:var(--danger)"><b style="color:var(--danger)">Error on the next line to run:</b> ' + esc(this.info.error) + '</div>';
      h += this.caption(s.line, s.ret ? 'returning' : '');
      if (s.ret) h += '<div class="ret">↩ returns ' + this.val(s.ret) + '</div>';
      const frames = s.frames || [];
      const top = frames.length - 1;
      const sel = this.frameSel === null ? top : this.frameSel;
      if (frames.length > 1) {
        h += '<div class="v-h">Call stack</div><div class="stack">' + frames.map((f, k) => '<div class="frame' + (k === sel ? ' sel' : '') + (k === top && k > 0 ? ' top' : '') + '" data-frame="' + k + '">' + esc(f.name) + '</div>').join('') + '</div>';
      }
      const f = frames[sel];
      if (f) {
        h += '<div class="v-h">' + (frames.length > 1 ? 'Variables in ' + esc(f.name) : 'Variables') + '</div>';
        if (!f.vars) h += '<div class="viz-empty" style="padding:8px">Variables for this frame were not captured.</div>';
        else {
          const pf = prev && prev.frames && prev.frames[sel] && prev.frames[sel].name === f.name ? prev.frames[sel].vars : null;
          const names = Object.keys(f.vars);
          if (!names.length) h += '<div class="viz-empty" style="padding:8px">No variables yet.</div>';
          else h += '<div class="vars">' + names.map((n) => this.varCard(n, f.vars[n], pf ? pf[n] : undefined, !!pf)).join('') + '</div>';
        }
      }
      if (frames.length > 1 && sel !== 0 && frames[0].vars && Object.keys(frames[0].vars).length) {
        h += '<div class="v-h">' + esc(frames[0].name) + ' variables</div><div class="vars">' + Object.keys(frames[0].vars).map((n) => this.varCard(n, frames[0].vars[n])).join('') + '</div>';
      }
      const out = this.output.slice(0, s.out || 0);
      h += '<div class="v-h">Output so far</div><div class="outbox">' + (out ? esc(out) : '<span style="color:var(--muted)">(nothing printed yet)</span>') + '</div>';
      return h;
    },
    // varCard() draws one variable: its name, type, value, and, if it just
    // changed, its old value crossed out. JSON.stringify turns both values
    // into text so they are easy to compare.
    varCard(name, v, before, hadPrev) {
      const now = JSON.stringify(v);
      let cls = '', was = '';
      if (hadPrev) {
        if (before === undefined) cls = ' isnew';
        else if (JSON.stringify(before) !== now) { cls = ' changed'; was = '<span class="was" title="previous value">' + esc(this.plain(before)) + '</span>'; }
      }
      const type = v.k || ({ int: 'int', float: 'float', str: 'string', bool: 'bool', none: v.v, list: 'list', dict: 'dict', ref: 'ref' }[v.t] || v.t);
      return '<div class="var' + cls + '"><div class="vn">' + esc(name) + ' <span class="vt">' + esc(type) + (v.n !== undefined ? ' · ' + num(v.n) : '') + '</span>' + was + '</div>' + this.val(v) + '</div>';
    },
    // plain() writes a value as simple text, like [1, 2, 3] (used for old values).
    plain(v) {
      if (!v) return '';
      if (v.items) return v.t === 'list' ? '[' + v.items.map((x) => this.plain(x)).join(', ') + ']' : '{' + v.items.map(([a, b]) => this.plain(a) + ': ' + this.plain(b)).join(', ') + '}';
      return v.v;
    },
    // val() draws a value as HTML: lists become a row of numbered boxes
    // (Lua lists count from 1; sets have no positions, so they show a dot),
    // dictionaries / objects become a two column table, and single values
    // become a coloured label. It calls itself for values inside values;
    // a function that calls itself is called "recursive".
    val(v) {
      if (!v) return '';
      if (v.t === 'list') {
        if (!v.items.length) return '<span class="prim t-none">empty ' + esc(v.k || 'list') + '</span>';
        return '<div class="arr">' + v.items.map((x, i) => '<div class="cell"><span class="idx">' + (v.k === 'Set' || v.k === 'set' || v.k === 'frozenset' ? '·' : (v.k === 'table' ? i + 1 : i)) + '</span><span class="val">' + this.val(x) + '</span></div>').join('') + (v.n > v.items.length ? '<span class="more">+' + (v.n - v.items.length) + ' more</span>' : '') + '</div>';
      }
      if (v.t === 'dict') {
        if (!v.items.length) return '<span class="prim t-none">empty ' + esc(v.k || 'dict') + '</span>';
        return '<table class="kv">' + v.items.map(([a, b]) => '<tr><td class="k">' + (a.t === 'key' ? esc(a.v) : this.val(a)) + '</td><td>' + this.val(b) + '</td></tr>').join('') + (v.n > v.items.length ? '<tr><td colspan="2" class="tx">+' + (v.n - v.items.length) + ' more</td></tr>' : '') + '</table>';
      }
      return '<span class="prim t-' + esc(v.t) + '">' + esc(v.v) + '</span>';
    },

    /* ---------- SQL ---------- */
    // SQL MODE
    // table() draws an HTML table of rows and columns (at most 30 rows).
    table(cols, rows, max) {
      const r = rows.slice(0, max || 30);
      return '<table class="data"><tr>' + cols.map((c) => '<th>' + esc(c) + '</th>').join('') + '</tr>' +
        (r.length ? r.map((row) => '<tr>' + row.map((x) => '<td>' + (x === null ? '<i style="color:var(--muted)">NULL</i>' : esc(x)) + '</td>').join('') + '</tr>').join('') : '<tr><td colspan="' + cols.length + '" style="color:var(--muted)">(no rows)</td></tr>') +
        '</table>' + (rows.length > r.length ? '<div class="tx" style="font-size:12px;color:var(--muted)">… ' + (rows.length - r.length) + ' more rows</div>' : '');
    },
    // renderSQL() draws one SQL statement: the statement and its meaning,
    // its result (or "3 rows affected"), and every table in the database
    // afterwards, labelled "new" or "changed" compared with the previous step.
    renderSQL(s) {
      let h = '';
      if (this.info.error && this.i === this.steps.length - 1) h += '<div class="v-cap" style="border-left-color:var(--danger)"><b style="color:var(--danger)">The next statement failed:</b> ' + esc(this.info.error) + '</div>';
      const ex = window.Trace.explainLine('sql', s.sql);
      h += '<div class="v-cap"><div class="ln">Statement ' + (this.i + 1) + ' · line ' + num(s.line) + '</div><div class="src">' + esc(s.sql) + '</div>' + (ex ? '<div class="why">' + ex.text + '</div>' : '') + '</div>';
      if (s.result) h += '<div class="v-h">Result (' + s.result.rows.length + ' rows)</div><div class="dbtable">' + this.table(s.result.cols, s.result.rows) + '</div>';
      else if (s.msg) h += '<div class="ret">✓ ' + esc(s.msg) + '</div>';
      const prev = this.steps[this.i - 1];
      h += '<div class="v-h">Database after this statement</div>';
      if (!s.tables.length) h += '<div class="viz-empty" style="padding:8px">The database is empty — no tables yet.</div>';
      s.tables.forEach((t) => {
        const pt = prev && prev.tables.find((x) => x.name === t.name);
        const changed = !pt || JSON.stringify(pt) !== JSON.stringify(t);
        h += '<div class="dbtable"><span class="tn">' + esc(t.name) + '</span>' + (changed ? ' <span class="pill" style="color:var(--warn)">' + (pt ? 'changed' : 'new') + '</span>' : '') + this.table(t.cols, t.rows, 15) + '</div>';
      });
      return h;
    },

    /* ---------- DOM ---------- */
    // HTML (DOM) MODE
    // renderDOM() draws the current element or CSS rule with its
    // explanation, then the whole page tree: elements before the current one
    // are fully visible, the current one is highlighted and later ones are faded.
    // Indentation shows nesting (16 pixels per level).
    renderDOM(s) {
      let h = '<div class="v-cap"><div class="ln">Line ' + num(s.line) + ' · ' + (s.kind === 'css' ? 'CSS rule' : '&lt;' + esc(s.tag) + '&gt; element') + '</div><div class="src">' + esc(s.src.length > 120 ? s.src.slice(0, 117) + '…' : s.src) + '</div><div class="why">' + s.text + (s.kind === 'tag' && s.depth ? ' It is nested ' + s.depth + ' level' + (s.depth > 1 ? 's' : '') + ' deep.' : '') + '</div></div>';
      if (s.kind === 'css' && s.attrs) h += '<div class="v-h">Declarations</div><table class="kv">' + s.attrs.split(';').filter((x) => x.trim()).map((d) => { const [p, ...v] = d.split(':'); return '<tr><td class="k">' + esc(p.trim()) + '</td><td>' + esc(v.join(':').trim()) + '</td></tr>'; }).join('') + '</table>';
      h += '<div class="v-h">Page structure</div><div class="tree">';
      this.steps.forEach((t, k) => {
        const cls = k === this.i ? ' cur' : k < this.i ? ' seen' : '';
        const label = t.kind === 'css' ? '<span class="at">' + esc(t.tag) + '</span> <span class="tx">{ ' + esc(t.attrs.slice(0, 40)) + (t.attrs.length > 40 ? '…' : '') + ' }</span>' : '<span class="tg">&lt;' + esc(t.tag) + '&gt;</span>' + (t.attrs ? ' <span class="at">' + esc(t.attrs.slice(0, 40)) + (t.attrs.length > 40 ? '…' : '') + '</span>' : '');
        h += '<div class="node' + cls + '" style="padding-left:' + (6 + t.depth * 16) + 'px">' + label + '</div>';
      });
      return h + '</div>';
    },

    /* ---------- Explain ---------- */
    // EXPLAIN MODE (compiled languages)
    // renderExplain() shows the line, its explanation, the variables declared
    // so far (as written in the code, since the code isn't actually run here),
    // and the program's output from the last run.
    renderExplain(s) {
      let h = '';
      if (this.info.error && s.line === this.info.errorLine) h += '<div class="v-cap" style="border-left-color:var(--danger)"><b style="color:var(--danger)">The compiler/runtime reported an error on this line:</b> ' + esc(this.info.error) + '</div>';
      h += '<div class="v-cap"><div class="ln">Line ' + num(s.line) + '</div><div class="src">' + esc(s.src) + '</div><div class="why">' + s.text + '</div></div>';
      if (s.declared.length) {
        h += '<div class="v-h">Variables declared so far (as written)</div><table class="kv">' + s.declared.map((d) => '<tr><td class="k">' + esc(d.name) + '</td><td>' + (d.type ? '<span class="tx" style="color:var(--muted)">' + esc(d.type) + '</span> ' : '') + esc(d.init || '—') + '</td></tr>').join('') + '</table>';
      }
      h += '<div class="v-h">Program output</div><div class="outbox">' + (this.output ? esc(this.output) : '<span style="color:var(--muted)">(run the program to see output)</span>') + '</div>';
      h += '<p style="color:var(--muted);font-size:12px;margin-top:10px">Explain mode reads the code top-to-bottom; it does not follow loops or function calls. For a full live trace, try the same idea in JavaScript, Python or Lua.</p>';
      return h;
    }
  };
  // Share the visualizer with the other files as window.Viz.
  window.Viz = V;
})();
