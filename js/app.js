/* CodeLab application shell: routing, editor, terminal, guide, challenges. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const LANGS = window.LANGS;

  const store = {
    get(k, d) { try { const v = localStorage.getItem('codelab.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('codelab.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  const S = {
    lang: null, cm: null, running: false, out: '', stdout: '', marks: [], execH: null, guideTab: 'syntax', level: 'all', query: '', chalFilter: null,
    ui: Object.assign({ guide: true, term: true, viz: false, fs: 14, theme: 'dark', termH: 240, guideW: 400, vizW: 380 }, store.get('ui', {}))
  };
  const saveUI = () => store.set('ui', S.ui);

  /* ---------------------------------------------------------------- utils */
  let toastT;
  function toast(msg, ms) {
    const t = $('toast');
    t.innerHTML = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms || 2600);
  }
  function inline(s) {
    return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/(^|[\s(])\*([^*\s](?:[^*<]*?[^*\s])?)\*(?=[\s).,;:!?]|$)/g, '$1<i>$2</i>');
  }
  function md(t) {
    return String(t).trim().split(/\n\s*\n/).map((p) => {
      const ls = p.split('\n');
      if (ls.every((l) => /^\s*- /.test(l))) return '<ul>' + ls.map((l) => '<li>' + inline(l.replace(/^\s*- /, '')) + '</li>').join('') + '</ul>';
      return '<p>' + inline(p) + '</p>';
    }).join('');
  }
  function b64e(s) { const b = new TextEncoder().encode(s); let bin = ''; b.forEach((x) => { bin += String.fromCharCode(x); }); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function b64d(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const bin = atob(s); return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))); }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (er) { ok = false; }
      ta.remove(); return ok;
    }
  }
  const langById = (id) => LANGS.find((l) => l.id === id);
  function runnable(lang, sec) {
    if (sec.full || !lang.wrap) return sec.code;
    const body = sec.code.split('\n').map((l) => (l.trim() ? lang.wrapIndent + l : '')).join('\n');
    return lang.wrap.replace('{{CODE}}', body);
  }
  const progress = (id) => store.get('prog.' + id, []);
  const chalDone = (id) => store.get('chal.' + id, []);

  /* ---------------------------------------------------------------- theme & layout */
  function applyTheme() { document.documentElement.dataset.theme = S.ui.theme; }
  function applyLayout() {
    const ide = $('ide');
    $('guide').hidden = !S.ui.guide; document.querySelector('[data-split=guide]').hidden = !S.ui.guide;
    $('termPanel').hidden = !S.ui.term; document.querySelector('[data-split=term]').hidden = !S.ui.term;
    $('viz').hidden = !S.ui.viz; document.querySelector('[data-split=viz]').hidden = !S.ui.viz;
    if (!S.ui.guide) ide.classList.remove('guide-full');
    $('tgGuide').classList.toggle('on', S.ui.guide);
    $('tgTerm').classList.toggle('on', S.ui.term);
    $('tgViz').classList.toggle('on', S.ui.viz);
    if (S.ui.term) $('tgTerm').classList.remove('alert');
    $('guide').style.width = S.ui.guideW + 'px';
    $('viz').style.width = S.ui.vizW + 'px';
    $('termPanel').style.height = S.ui.termH + 'px';
    $('guideFull').textContent = ide.classList.contains('guide-full') ? '⤡ Back to editor' : '⤢ Full page';
    document.documentElement.style.setProperty('--fs', S.ui.fs + 'px');
    if (S.cm) setTimeout(() => S.cm.refresh(), 0);
    saveUI();
  }
  function initSplitters() {
    document.querySelectorAll('.splitter').forEach((sp) => {
      sp.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const kind = sp.dataset.split, x0 = e.clientX, y0 = e.clientY;
        const g0 = $('guide').offsetWidth, v0 = $('viz').offsetWidth, t0 = $('termPanel').offsetHeight;
        sp.classList.add('drag'); $('preview').style.pointerEvents = 'none';
        const move = (ev) => {
          if (kind === 'guide') { S.ui.guideW = clamp(g0 + ev.clientX - x0, 220, 900); $('guide').style.width = S.ui.guideW + 'px'; }
          else if (kind === 'viz') { S.ui.vizW = clamp(v0 - (ev.clientX - x0), 240, 900); $('viz').style.width = S.ui.vizW + 'px'; }
          else { S.ui.termH = clamp(t0 - (ev.clientY - y0), 90, window.innerHeight - 220); $('termPanel').style.height = S.ui.termH + 'px'; }
          S.cm.refresh();
        };
        const up = () => { sp.classList.remove('drag'); $('preview').style.pointerEvents = ''; document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); saveUI(); };
        document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
      });
    });
  }

  /* ---------------------------------------------------------------- home */
  let homeFilter = 'all';
  function renderHome() {
    const q = $('langSearch').value.trim().toLowerCase();
    $('langGrid').innerHTML = LANGS.filter((l) => (homeFilter === 'all' || l.kind === homeFilter) && (!q || (l.name + ' ' + l.blurb + ' ' + (l.aka || '')).toLowerCase().includes(q))).map((l) => {
      const done = progress(l.id).length, total = l.sections.length;
      return '<a class="card" href="#/' + l.id + '" style="--lc:' + l.color + '">' +
        '<div style="display:flex;gap:12px;align-items:center"><div class="badge-lg">' + esc(l.tag) + '</div><div><h3>' + esc(l.name) + '</h3><div class="meta">' + (l.kind === 'browser' ? '<span class="pill live">● Runs instantly</span>' : '<span class="pill cloud">☁ Cloud compiler</span>') + '<span class="pill">' + (l.trace === 'explain' ? 'Explain mode' : l.trace === 'sql' ? 'Table visualizer' : l.trace === 'dom' ? 'DOM visualizer' : 'Live trace') + '</span></div></div></div>' +
        '<p>' + esc(l.blurb) + '</p>' +
        '<div class="meta" style="justify-content:space-between"><span>' + total + ' guide sections</span><span>' + (done ? done + ' done' : '') + '</span></div>' +
        '<div class="bar"><i style="width:' + (total ? Math.round(100 * done / total) : 0) + '%"></i></div></a>';
    }).join('') || '<div class="empty">No languages match.</div>';
    const last = store.get('last', null);
    const ll = last && langById(last);
    $('resumeBtn').hidden = !ll;
    if (ll) { $('resumeBtn').href = '#/' + ll.id; $('resumeBtn').textContent = 'Resume ' + ll.name; }
  }

  /* ---------------------------------------------------------------- editor */
  function initEditor() {
    S.cm = CodeMirror($('editorWrap'), {
      lineNumbers: true, theme: 'learn', indentUnit: 4, tabSize: 4, matchBrackets: true, autoCloseBrackets: true, styleActiveLine: true,
      gutters: ['CodeMirror-linenumbers', 'exec', 'marks'], lineWrapping: false, autoCloseTags: true,
      extraKeys: {
        'Ctrl-Enter': () => run(), 'Cmd-Enter': () => run(),
        'Ctrl-/': 'toggleComment', 'Cmd-/': 'toggleComment',
        'Ctrl-Space': (cm) => cm.showHint({ hint: hintFn, completeSingle: false }),
        Tab: (cm) => { if (cm.somethingSelected()) cm.indentSelection('add'); else cm.replaceSelection(cm.getOption('indentWithTabs') ? '\t' : ' '.repeat(cm.getOption('indentUnit')), 'end'); },
        'Shift-Tab': (cm) => cm.indentSelection('subtract')
      }
    });
    let saveT;
    S.cm.on('change', (cm, ch) => {
      if (ch.origin === 'setValue') return;
      clearMarks();
      if (window.Viz) window.Viz.markStale();
      clearTimeout(saveT); saveT = setTimeout(() => { if (S.lang) store.set('code.' + S.lang.id, cm.getValue()); }, 400);
    });
    S.cm.on('inputRead', (cm, ch) => {
      if (!/^[A-Za-z_]$/.test(ch.text[0] || '')) return;
      const tok = cm.getTokenAt(cm.getCursor());
      if (tok.type && /string|comment/.test(tok.type)) return;
      if (tok.string.length >= 2) cm.showHint({ hint: hintFn, completeSingle: false });
    });
    S.cm.on('cursorActivity', (cm) => { const c = cm.getCursor(); $('sbPos').textContent = 'Ln ' + (c.line + 1) + ', Col ' + (c.ch + 1); });
    S.cm.on('gutterClick', (cm, line, gutter) => {
      const info = cm.lineInfo(line);
      if (info.gutterMarkers && info.gutterMarkers.marks && info.gutterMarkers.marks.title) toast(esc(info.gutterMarkers.marks.title), 5000);
    });
  }
  function hintFn(cm) {
    const cur = cm.getCursor(), tok = cm.getTokenAt(cur);
    const word = tok.string.slice(0, cur.ch - tok.start);
    if (!/^[\w$]+$/.test(word)) return null;
    const words = new Set(S.lang.keywords || []);
    const re = /[A-Za-z_$][\w$]{2,}/g; const text = cm.getValue(); let m;
    while ((m = re.exec(text))) words.add(m[0]);
    const list = Array.from(words).filter((w) => w.startsWith(word) && w !== word).sort((a, b) => a.length - b.length || a.localeCompare(b)).slice(0, 30);
    return list.length ? { list, from: CodeMirror.Pos(cur.line, tok.start), to: CodeMirror.Pos(cur.line, tok.end) } : null;
  }
  function setCode(code, undoable) {
    if (undoable) S.cm.replaceRange(code, CodeMirror.Pos(0, 0), CodeMirror.Pos(S.cm.lastLine()));
    else { S.cm.setValue(code); S.cm.clearHistory(); }
    store.set('code.' + S.lang.id, code);
    clearMarks();
  }

  /* error / exec markers */
  function clearMarks() {
    S.marks.forEach((m) => { if (m.kind === 'line') S.cm.removeLineClass(m.h, 'background', m.cls); else m.h.clear(); });
    S.marks = [];
    S.cm.clearGutter('marks');
  }
  function markLine(line, col, kind, msg) {
    if (!line || line < 1 || line > S.cm.lineCount()) return;
    const cls = kind === 'warn' ? 'cm-warn-line' : 'cm-err-line';
    const existing = S.cm.lineInfo(line - 1);
    if (existing.bgClass && existing.bgClass.indexOf('cm-err-line') >= 0) return;
    S.marks.push({ kind: 'line', h: S.cm.addLineClass(line - 1, 'background', cls), cls });
    const g = document.createElement('span');
    g.className = 'gmark ' + (kind === 'warn' ? 'warn' : 'err'); g.textContent = kind === 'warn' ? '!' : '×'; g.title = msg || '';
    S.cm.setGutterMarker(line - 1, 'marks', g);
    if (col && kind !== 'warn') {
      const w = S.cm.findWordAt(CodeMirror.Pos(line - 1, Math.max(0, col - 1)));
      if (w.head.ch > w.anchor.ch) S.marks.push({ kind: 'text', h: S.cm.markText(w.anchor, w.head, { className: 'cm-err-text' }) });
    }
  }
  function setExecLine(n) {
    if (S.execH) { S.cm.removeLineClass(S.execH, 'background', 'cm-exec-line'); S.execH = null; }
    S.cm.clearGutter('exec');
    if (!n || n > S.cm.lineCount()) return;
    S.execH = S.cm.addLineClass(n - 1, 'background', 'cm-exec-line');
    const g = document.createElement('span'); g.className = 'gmark exec'; g.textContent = '➜';
    S.cm.setGutterMarker(n - 1, 'exec', g);
    S.cm.scrollIntoView({ line: n - 1, ch: 0 }, 80);
  }
  function gotoLine(n) { S.cm.focus(); S.cm.setCursor(CodeMirror.Pos(n - 1, 0)); S.cm.scrollIntoView(null, 120); }

  /* ---------------------------------------------------------------- terminal */
  const term = () => $('termBody');
  function termClear() { term().innerHTML = ''; }
  function termWrite(kind, text) {
    if (!text) return;
    if (kind === 'out' || kind === 'err' || kind === 'warn') { S.out += text; if (kind === 'out') S.stdout += text; }
    const t = term();
    const last = t.lastChild;
    if (last && last.nodeType === 1 && last.tagName === 'SPAN' && last.className === kind) last.textContent += text;
    else { const s = document.createElement('span'); s.className = kind; s.textContent = text; t.appendChild(s); }
    t.scrollTop = t.scrollHeight;
    if (!S.ui.term && (kind === 'err')) $('tgTerm').classList.add('alert');
  }
  const termSys = (t) => termWrite('sys', t);
  function setStatus(cls, text) { const s = $('runStatus'); s.className = 'status ' + (cls || ''); s.textContent = text; }
  function showError(err) {
    const lang = S.lang;
    const text = err.text || (err.type + ': ' + err.message);
    const service = /^(RateLimited|RunnerBusy|NetworkError|LoadError|InternalError)$/.test(err.type);
    const hint = service ? null : window.Hints.explain(lang.id, text + '\n' + err.type + ': ' + err.message);
    const d = document.createElement('div');
    d.className = 'term-error';
    d.innerHTML = '<div class="te-head">✖ ' + esc(err.type || 'Error') + (err.line ? '<button class="te-line" data-line="' + err.line + '">Go to line ' + err.line + '</button>' : '') + '</div>' +
      '<pre>' + esc(text) + '</pre>' +
      (service ? '' : '<div class="te-hint">💡 <b>' + (hint ? 'What this means:' : 'Tip:') + '</b> ' + (hint || 'Read the first line of the message: it names the problem' + (err.line ? ', and the line is highlighted in red in your editor' : '') + '. Errors often come from the line just <i>above</i> the one reported.') + '</div>');
    term().appendChild(d);
    term().scrollTop = term().scrollHeight;
    if (err.line) markLine(err.line, err.col, 'err', err.type + ': ' + err.message);
    (err.marks || []).forEach((m) => markLine(m.line, m.col, m.kind, m.kind === 'warn' ? 'Compiler warning' : 'Error'));
    if (!S.ui.term) { $('tgTerm').classList.add('alert'); toast('✖ ' + esc(err.type || 'Error') + (err.line ? ' on line ' + err.line : '') + ' — open the terminal to see details'); }
  }
  function setOutTab(tab) {
    document.querySelectorAll('#outTabs .tab').forEach((b) => b.classList.toggle('on', b.dataset.out === tab));
    $('termBody').hidden = tab !== 'term';
    $('preview').hidden = tab !== 'preview';
    $('stdinBox').hidden = tab !== 'term' || !!(S.lang && S.lang.noStdin);
  }
  let consoleCount = 0;
  function setConsoleCount(n) { consoleCount = n; document.querySelector('#outTabs [data-out=term]').textContent = 'Terminal' + (n && S.lang.engine === 'html' ? ' (' + n + ')' : ''); }

  /* ---------------------------------------------------------------- running */
  function updateRunUI() {
    $('runBtn').disabled = S.running;
    $('stopBtn').hidden = !S.running;
    document.querySelectorAll('[data-c=check]').forEach((b) => { b.disabled = S.running; });
  }
  async function run(opts) {
    opts = opts || {};
    if (S.running || !S.lang) return;
    const lang = S.lang, code = S.cm.getValue();
    S.running = true; updateRunUI();
    clearMarks(); setExecLine(null);
    if ($('clearOnRun').checked) termClear();
    S.out = ''; S.stdout = ''; setConsoleCount(0);
    termSys('$ ' + lang.cmd + '\n');
    setStatus('running', 'Running…');
    if (lang.engine === 'html') { if (!S.ui.term) { S.ui.term = true; applyLayout(); } }
    const trace = S.ui.viz && lang.trace !== 'explain';
    const t0 = performance.now();
    const res = await window.Engines.run(lang, code, {
      stdin: lang.noStdin ? '' : $('stdin').value, trace,
      emit: termWrite, clear: termClear,
      status: (m) => { if (m) termSys(m + '\n'); },
      preview: (html) => { setOutTab('preview'); $('preview').srcdoc = html; }
    });
    const ms = Math.round(performance.now() - t0);
    S.running = false; updateRunUI();
    if (res.stopped) { termSys('\n[stopped by you]\n'); setStatus('fail', 'Stopped'); }
    else if (res.error) { showError(res.error); setStatus('fail', 'Error'); }
    else {
      (res.marks || []).forEach((m) => markLine(m.line, m.col, m.kind, 'Compiler warning'));
      if (lang.engine !== 'html') termSys((S.out && !S.out.endsWith('\n') ? '\n' : '') + '[finished in ' + (ms < 1000 ? ms + ' ms' : (ms / 1000).toFixed(2) + ' s') + ']\n');
      else termSys('Page rendered in the Preview tab. console.log output appears here.\n');
      setStatus('ok', lang.engine === 'html' ? 'Rendered' : 'Finished');
    }
    if (S.ui.viz && !res.stopped) loadViz(res, code);
    if (opts.check) checkChallenge(opts.check, res, code);
    return res;
  }
  function loadViz(res, code) {
    const lang = S.lang;
    if (lang.trace === 'explain') {
      window.Viz.load(window.Trace.explainAll(lang.id, code), 'explain', code, S.out, { error: res && res.error ? res.error.message : null, errorLine: res && res.error ? res.error.line : null, empty: 'There is no code to explain yet.' });
      return;
    }
    if (res.steps && res.steps.length) {
      window.Viz.load(res.steps, res.mode, code, S.out, { limited: res.traceStopped, error: res.error ? res.error.type + ': ' + res.error.message : null });
    } else if (res.error) window.Viz.clear('The program stopped before any line could be recorded. Fix the error shown in the terminal, then run again.');
    else window.Viz.clear('No steps were recorded — is the file empty?');
  }

  /* ---------------------------------------------------------------- guide */
  function renderGuide() {
    const lang = S.lang, body = $('guideBody');
    document.querySelectorAll('#guideTabs .tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === S.guideTab));
    if (S.guideTab === 'syntax') renderSyntax(lang, body);
    else if (S.guideTab === 'best') renderBest(lang, body);
    else renderChallenges(lang, body);
    body.scrollTop = 0;
  }
  function renderSyntax(lang, body) {
    const done = progress(lang.id);
    const q = S.query.toLowerCase();
    const secs = lang.sections.filter((s) => (S.level === 'all' || s.level === S.level) && (!q || (s.title + ' ' + s.body + ' ' + s.code).toLowerCase().includes(q)));
    let h = '<div class="guide-intro" style="border-left:4px solid ' + lang.color + '"><h2>' + esc(lang.name) + ' syntax guide</h2>' + md(lang.intro || lang.blurb) +
      '<div style="margin-top:8px;display:flex;gap:10px;align-items:center"><div class="bar" style="flex:1"><i style="width:' + Math.round(100 * done.length / lang.sections.length) + '%"></i></div><span style="font-size:12px;color:var(--muted)">' + done.length + ' / ' + lang.sections.length + ' understood</span></div></div>';
    h += '<div class="guide-tools"><input type="search" id="gSearch" placeholder="Search this guide…" value="' + esc(S.query) + '"><div class="row">' +
      ['all', 'beginner', 'intermediate', 'advanced'].map((l) => '<button class="chip' + (S.level === l ? ' on' : '') + '" data-level="' + l + '">' + (l === 'all' ? 'All levels' : l[0].toUpperCase() + l.slice(1)) + '</button>').join('') + '</div></div>';
    h += '<div class="row" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">' + secs.map((s) => '<a class="chip" href="javascript:void 0" data-jump="' + s.id + '" style="text-decoration:none">' + (done.includes(s.id) ? '✓ ' : '') + esc(s.title) + '</a>').join('') + '</div>';
    if (!secs.length) h += '<div class="empty">No sections match your search.</div>';
    secs.forEach((s) => {
      const isDone = done.includes(s.id);
      const snippet = lang.wrap && !s.full;
      h += '<div class="sec' + (isDone ? ' done' : '') + '" id="sec-' + s.id + '"><div class="sec-head"><h4>' + esc(s.title) + '</h4><span class="lvl ' + s.level + '">' + s.level + '</span></div><div class="sec-body">' + md(s.body) +
        '<div class="codeblock"><pre class="cm-s-learn" data-sec="' + s.id + '"></pre><div class="acts"><span class="grow">' + (snippet ? 'Snippet — wrapped in a full program when loaded' : '') + '</span><button class="btn sm" data-act="copy" data-sec="' + s.id + '">Copy</button><button class="btn sm" data-act="load" data-sec="' + s.id + '">Load in editor</button><button class="btn sm primary" data-act="run" data-sec="' + s.id + '">▶ Run</button></div></div>' +
        (s.deep ? '<details class="deep"><summary>Going deeper (for experienced devs)</summary>' + md(s.deep) + '</details>' : '') +
        '<label style="display:flex;gap:6px;align-items:center;font-size:12.5px;color:var(--muted);margin-top:6px;cursor:pointer"><input type="checkbox" data-act="done" data-sec="' + s.id + '"' + (isDone ? ' checked' : '') + '> I understand this section</label></div></div>';
    });
    body.innerHTML = h;
    body.querySelectorAll('pre[data-sec]').forEach((pre) => {
      const s = lang.sections.find((x) => x.id === pre.dataset.sec);
      if (CodeMirror.runMode) CodeMirror.runMode(s.code, lang.snippetMode || lang.mode, pre); else pre.textContent = s.code;
    });
    const gs = $('gSearch');
    gs.oninput = () => { S.query = gs.value; const pos = gs.selectionStart; renderSyntax(lang, body); const n = $('gSearch'); n.focus(); n.setSelectionRange(pos, pos); };
  }
  function renderBest(lang, body) {
    let h = '<div class="guide-intro"><h2>' + esc(lang.name) + ' best practices</h2><p>Habits that experienced ' + esc(lang.name) + ' developers follow. Beginners: skim these now and come back later. Experienced devs: these are the idioms that make code feel native.</p></div>';
    h += lang.tips.map((t) => '<div class="tip"><i>✔</i><div>' + inline(t) + '</div></div>').join('');
    if (lang.pitfalls) h += '<div class="v-h" style="margin-top:16px">Common beginner mistakes</div>' + lang.pitfalls.map((t) => '<div class="tip"><i>⚠</i><div>' + inline(t) + '</div></div>').join('');
    h += '<div class="v-h" style="margin-top:16px">How to learn effectively here</div>' + [
      'Type examples out yourself instead of only pressing Run — your fingers learn syntax faster than your eyes.',
      'Break things on purpose. Delete a bracket or misspell a name and read the error message: recognising errors is a superpower.',
      'Turn on the **Visualizer** and step through loops and function calls until you can predict the next step before clicking.',
      'After finishing a section, change the example: new values, an extra condition, another loop. Then try a **Challenge**.'
    ].map((t) => '<div class="tip"><i>★</i><div>' + inline(t) + '</div></div>').join('');
    if (lang.docs) h += '<p style="margin-top:14px">Official documentation: <a href="' + lang.docs + '" target="_blank" rel="noopener">' + esc(lang.docs) + '</a></p>';
    body.innerHTML = h;
  }
  function challengeList(lang) { return window.CHALLENGES[lang.chal || 'common']; }
  function renderChallenges(lang, body) {
    const list = challengeList(lang);
    const done = chalDone(lang.id);
    let h = '<div class="guide-intro"><h2>' + esc(lang.name) + ' challenges</h2><p>Press <b>Start</b> to load a blank template, write your solution, then <b>Check my answer</b>. Your code is run and the output compared automatically. ' + done.length + ' / ' + list.length + ' solved.</p></div>';
    h += list.map((c) => '<div class="chal' + (done.includes(c.id) ? ' done' : '') + '" data-chal="' + c.id + '"><h4>' + (done.includes(c.id) ? '<span style="color:var(--ok)">✓</span> ' : '') + esc(c.title) + ' <span class="lvl ' + c.level + '">' + c.level + '</span></h4><div style="font-size:13.5px">' + c.desc + '</div>' +
      (c.type === 'stdout' ? '<div style="font-size:12px;color:var(--muted);margin-top:6px">Expected output:</div><pre>' + esc(c.expected) + '</pre>' : c.type === 'sqlRows' ? '<div style="font-size:12px;color:var(--muted);margin-top:6px">Expected final result rows:</div><pre>' + esc(c.rows.map((r) => r.join(' | ')).join('\n')) + '</pre>' : '') +
      '<div class="acts"><button class="btn sm" data-c="start">Start</button><button class="btn sm primary" data-c="check">✓ Check my answer</button><button class="btn sm ghost" data-c="hint">Hint</button></div><div class="result"></div></div>').join('');
    body.innerHTML = h;
  }
  function startChallenge(c) {
    const lang = S.lang;
    let code;
    if (c.starter) code = c.starter;
    else {
      const cm = lang.comment;
      const lines = ['Challenge: ' + c.title, c.desc.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>')];
      const comment = lines.map((l) => (cm[1] ? cm[0] + ' ' + l + ' ' + cm[1] : cm[0] + ' ' + l)).join('\n');
      code = lang.scaffold.replace('{{COMMENT}}', comment);
    }
    const cur = S.cm.getValue();
    if (cur.trim() && cur !== lang.starter && !confirm('Replace the code in the editor with the challenge template? (You can press Ctrl+Z afterwards to get it back.)')) return;
    setCode(code, true);
    const ln = code.split('\n').findIndex((l) => /your code|TODO|Your query/i.test(l));
    S.cm.focus(); S.cm.setCursor(CodeMirror.Pos(ln >= 0 ? ln + 1 : S.cm.lastLine(), 0));
    toast('Challenge loaded — write your solution, then press “Check my answer”.');
  }
  const norm = (s) => String(s).replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').trim();
  function checkChallenge(id, res, code) {
    const c = challengeList(S.lang).find((x) => x.id === id);
    const box = document.querySelector('.chal[data-chal="' + id + '"] .result');
    let pass = false, why = '';
    if (res.stopped) why = 'The run was stopped.';
    else if (res.error) why = 'Your program reported an error — see the terminal.';
    else if (c.type === 'stdout') {
      const got = norm(S.stdout);
      pass = got === norm(c.expected);
      if (!pass) {
        const g = got.split('\n'), e = norm(c.expected).split('\n');
        const i = e.findIndex((l, k) => g[k] !== l);
        const k = i < 0 ? e.length : i;
        why = !got ? 'Your program printed nothing.' : 'Line ' + (k + 1) + ': expected <code>' + esc(e[k] === undefined ? '(nothing more)' : e[k]) + '</code> but got <code>' + esc(g[k] === undefined ? '(nothing)' : g[k]) + '</code>.';
      }
    } else if (c.type === 'sqlCell' || c.type === 'sqlRows') {
      const lr = res.extra && res.extra.lastResult;
      if (!lr) why = 'No SELECT result found. Finish with a SELECT query.';
      else if (c.type === 'sqlCell') { pass = lr.rows.length > 0 && String(lr.rows[0][0]) === String(c.value); if (!pass) why = 'The last query returned <code>' + esc(lr.rows.length ? lr.rows[0][0] : '(no rows)') + '</code>.'; }
      else { const got = JSON.stringify(lr.rows.map((r) => r.map(String))); pass = got === JSON.stringify(c.rows); if (!pass) why = 'The last query returned: <code>' + esc(lr.rows.map((r) => r.join(' | ')).join(' ; ') || '(no rows)') + '</code>'; }
    } else if (c.type === 'html') {
      const doc = new DOMParser().parseFromString(code, 'text/html');
      const r = c.check(doc, code);
      pass = r === true; if (!pass) why = esc(r);
    }
    if (pass) {
      const d = chalDone(S.lang.id); if (!d.includes(id)) { d.push(id); store.set('chal.' + S.lang.id, d); }
      toast('🎉 Challenge passed: ' + esc(c.title) + '!', 3500);
      if (S.guideTab === 'chal') { renderGuide(); const nb = document.querySelector('.chal[data-chal="' + id + '"] .result'); if (nb) nb.innerHTML = '<span class="ok">✓ Correct — nicely done!</span>'; }
    } else if (box) box.innerHTML = '<span class="bad">✗ Not quite.</span> ' + why;
  }

  /* ---------------------------------------------------------------- language open */
  function buildLangMenu() {
    $('langMenu').innerHTML = LANGS.map((l) => '<button data-lang="' + l.id + '"><span class="langdot" style="background:' + l.color + '"></span>' + esc(l.name) + '<small>' + (l.kind === 'browser' ? 'instant' : 'cloud') + '</small></button>').join('');
  }
  function openLang(lang, opts) {
    const changed = S.lang !== lang;
    S.lang = lang;
    store.set('last', lang.id);
    $('home').hidden = true; $('ide').hidden = false; $('ideTools').hidden = false;
    $('langDot').style.background = lang.color; $('fileDot').style.background = lang.color;
    $('langName').textContent = lang.name; $('fileName').textContent = lang.file;
    $('sbLang').textContent = lang.name;
    $('sbEngine').textContent = lang.kind === 'browser' ? '● runs in your browser' : '☁ compiled by wandbox.org';
    document.title = lang.name + ' — CodeLab';
    if (changed) {
      S.cm.setOption('mode', lang.mode);
      S.cm.setOption('indentUnit', lang.indent || 4);
      S.cm.setOption('tabSize', lang.indent || 4);
      S.cm.setOption('indentWithTabs', !!lang.tabs);
      S.cm.setOption('autoCloseTags', lang.engine === 'html');
      const saved = store.get('code.' + lang.id, null);
      S.cm.setValue(saved !== null ? saved : lang.starter); S.cm.clearHistory();
      clearMarks(); setExecLine(null); termClear(); setStatus('', 'Ready');
      termSys('Welcome to ' + lang.name + '! Press ▶ Run (Ctrl+Enter) to execute your code.\n' + (lang.kind === 'cloud' ? 'This language is compiled on the free Wandbox service, so it needs an internet connection and takes a moment.\n' : ''));
      S.query = ''; S.level = 'all'; S.guideTab = 'syntax';
      $('outTabs').querySelector('[data-out=preview]').hidden = lang.engine !== 'html';
      setOutTab('term');
      if (lang.engine === 'html' && S.ui.termH < 320) { S.ui.termH = Math.round(window.innerHeight * 0.42); }
      $('stdinBox').hidden = !!lang.noStdin;
      window.Viz.setLang(lang);
      renderGuide();
      window.Engines.warm(lang);
    }
    $('ide').classList.toggle('guide-full', !!(opts && opts.guide));
    if (opts && opts.guide) S.ui.guide = true;
    if (opts && opts.code !== undefined) { setCode(opts.code, false); toast('Loaded shared code.'); }
    applyLayout();
    if (lang.engine === 'html' && changed && S.cm.getValue().trim()) setTimeout(() => run(), 50);
  }

  /* ---------------------------------------------------------------- routing */
  function route() {
    const m = /^#\/([\w-]*)(?:\/(\w+))?(?:\?(.*))?$/.exec(location.hash || '');
    const lang = m && m[1] ? langById(m[1]) : null;
    if (!lang) {
      $('home').hidden = false; $('ide').hidden = true; $('ideTools').hidden = true;
      document.title = 'CodeLab — Learn to code in your browser';
      renderHome();
      return;
    }
    const opts = { guide: m[2] === 'guide' };
    if (m[3]) {
      const p = new URLSearchParams(m[3]);
      if (p.get('c')) { try { opts.code = b64d(p.get('c')); } catch (e) { toast('That share link looks broken.'); } }
      history.replaceState(null, '', '#/' + lang.id + (m[2] ? '/' + m[2] : ''));
    }
    openLang(lang, opts);
  }

  /* ---------------------------------------------------------------- events */
  function bind() {
    window.addEventListener('hashchange', route);
    $('themeBtn').onclick = () => { S.ui.theme = S.ui.theme === 'dark' ? 'light' : 'dark'; applyTheme(); saveUI(); };
    $('langSearch').oninput = renderHome;
    document.querySelectorAll('.filters .chip').forEach((b) => { b.onclick = () => { homeFilter = b.dataset.f; document.querySelectorAll('.filters .chip').forEach((x) => x.classList.toggle('on', x === b)); renderHome(); }; });

    $('langBtn').onclick = (e) => { e.stopPropagation(); $('langMenu').hidden = !$('langMenu').hidden; };
    $('langMenu').onclick = (e) => { const b = e.target.closest('[data-lang]'); if (b) { $('langMenu').hidden = true; location.hash = '#/' + b.dataset.lang; } };
    document.addEventListener('click', (e) => { if (!e.target.closest('.menu-wrap')) $('langMenu').hidden = true; });

    $('runBtn').onclick = () => run();
    $('stopBtn').onclick = () => window.Engines.stop();
    $('tgGuide').onclick = () => { S.ui.guide = !S.ui.guide; applyLayout(); };
    $('tgTerm').onclick = () => { S.ui.term = !S.ui.term; applyLayout(); };
    $('termHide').onclick = () => { S.ui.term = false; applyLayout(); };
    $('tgViz').onclick = toggleViz;
    $('vizClose').onclick = toggleViz;
    $('guideFull').onclick = () => { $('ide').classList.toggle('guide-full'); applyLayout(); };
    $('termClear').onclick = termClear;
    $('outTabs').onclick = (e) => { const b = e.target.closest('[data-out]'); if (b) setOutTab(b.dataset.out); };
    $('termBody').addEventListener('click', (e) => { const b = e.target.closest('[data-line]'); if (b) gotoLine(+b.dataset.line); });

    $('fsMinus').onclick = () => { S.ui.fs = clamp(S.ui.fs - 1, 10, 24); applyLayout(); };
    $('fsPlus').onclick = () => { S.ui.fs = clamp(S.ui.fs + 1, 10, 24); applyLayout(); };
    $('copyBtn').onclick = async () => toast((await copyText(S.cm.getValue())) ? 'Code copied to clipboard.' : 'Copy failed — select the code and press Ctrl+C.');
    $('shareBtn').onclick = async () => {
      const url = location.href.split('#')[0] + '#/' + S.lang.id + '?c=' + b64e(S.cm.getValue());
      toast((await copyText(url)) ? 'Share link copied! Anyone who opens it sees this code.' : 'Could not copy the link automatically.');
    };
    $('dlBtn').onclick = () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([S.cm.getValue()], { type: 'text/plain' }));
      a.download = S.lang.file; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    $('resetBtn').onclick = () => { if (confirm('Replace your code with the original ' + S.lang.name + ' starter example? (Ctrl+Z can undo it.)')) { setCode(S.lang.starter, true); toast('Starter example restored.'); } };

    $('guideTabs').onclick = (e) => { const b = e.target.closest('[data-tab]'); if (b) { S.guideTab = b.dataset.tab; renderGuide(); } };
    $('guideBody').addEventListener('click', (e) => {
      const lv = e.target.closest('[data-level]');
      if (lv) { S.level = lv.dataset.level; renderGuide(); return; }
      const j = e.target.closest('[data-jump]');
      if (j) { const el = $('sec-' + j.dataset.jump); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      const a = e.target.closest('[data-act]');
      if (a) {
        const sec = S.lang.sections.find((x) => x.id === a.dataset.sec);
        if (a.dataset.act === 'copy') copyText(sec.code).then((ok) => toast(ok ? 'Copied.' : 'Copy failed.'));
        else if (a.dataset.act === 'load' || a.dataset.act === 'run') {
          setCode(runnable(S.lang, sec), true);
          if ($('ide').classList.contains('guide-full')) { $('ide').classList.remove('guide-full'); applyLayout(); }
          if (a.dataset.act === 'run') { if (!S.ui.term) { S.ui.term = true; applyLayout(); } run(); }
          else toast('Example loaded into the editor (Ctrl+Z to undo).');
        } else if (a.dataset.act === 'done') {
          let d = progress(S.lang.id);
          d = a.checked ? d.concat([sec.id]) : d.filter((x) => x !== sec.id);
          store.set('prog.' + S.lang.id, Array.from(new Set(d)));
          const secEl = $('sec-' + sec.id); if (secEl) secEl.classList.toggle('done', a.checked);
          const doneN = progress(S.lang.id).length;
          const bar = document.querySelector('.guide-intro .bar i'); if (bar) bar.style.width = Math.round(100 * doneN / S.lang.sections.length) + '%';
          const lbl = document.querySelector('.guide-intro .bar + span'); if (lbl) lbl.textContent = doneN + ' / ' + S.lang.sections.length + ' understood';
          if (a.checked && doneN === S.lang.sections.length) toast('🎓 You\'ve worked through the whole ' + esc(S.lang.name) + ' guide!', 4000);
        }
        return;
      }
      const cb = e.target.closest('[data-c]');
      if (cb) {
        const id = cb.closest('[data-chal]').dataset.chal;
        const c = challengeList(S.lang).find((x) => x.id === id);
        if (cb.dataset.c === 'start') startChallenge(c);
        else if (cb.dataset.c === 'hint') { const r = cb.closest('.chal').querySelector('.result'); r.innerHTML = '💡 ' + c.hint; }
        else if (cb.dataset.c === 'check') { if (!S.ui.term) { S.ui.term = true; applyLayout(); } run({ check: id }); }
      }
    });

    window.addEventListener('message', (e) => {
      if (e.source !== $('preview').contentWindow || !e.data || !e.data.__lc) return;
      const d = e.data;
      setConsoleCount(consoleCount + 1);
      if (d.kind === 'jserror') showError({ type: 'JavaScript error', message: d.text, line: d.line, text: d.text + (d.line ? ' (line ' + d.line + ')' : '') });
      else termWrite(d.kind, d.text + '\n');
    });

    $('helpBtn').onclick = showShortcuts;
    document.addEventListener('keydown', (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'Enter' && S.lang && !$('ide').hidden) { e.preventDefault(); run(); }
      else if (mod && e.key === '`') { e.preventDefault(); S.ui.term = !S.ui.term; applyLayout(); }
      else if (mod && (e.key === 'b' || e.key === 'B') && !$('ide').hidden) { e.preventDefault(); S.ui.guide = !S.ui.guide; applyLayout(); }
      else if (e.altKey && (e.key === 'v' || e.key === 'V') && !$('ide').hidden) { e.preventDefault(); toggleViz(); }
      else if (e.altKey && e.key === 'ArrowRight' && S.ui.viz) { e.preventDefault(); window.Viz.go(window.Viz.i + 1); }
      else if (e.altKey && e.key === 'ArrowLeft' && S.ui.viz) { e.preventDefault(); window.Viz.go(window.Viz.i - 1); }
      else if (e.key === 'Escape') { if (S.running) window.Engines.stop(); const mb = document.querySelector('.modal-bg'); if (mb) mb.remove(); }
    });
  }
  function toggleViz() {
    S.ui.viz = !S.ui.viz;
    applyLayout();
    if (!S.ui.viz) { window.Viz.pause(); setExecLine(null); return; }
    if (S.lang.trace === 'explain') loadViz({}, S.cm.getValue());
    else if (!window.Viz.steps.length && S.cm.getValue().trim()) run();
  }
  function showShortcuts() {
    const rows = [['Ctrl + Enter', 'Run the program'], ['Esc', 'Stop a running program / close dialogs'], ['Ctrl + Space', 'Auto-complete suggestions'], ['Ctrl + /', 'Comment / uncomment line(s)'], ['Tab / Shift + Tab', 'Indent / outdent'], ['Ctrl + Z / Ctrl + Y', 'Undo / redo'], ['Ctrl + `', 'Show / hide terminal'], ['Ctrl + B', 'Show / hide guide'], ['Alt + V', 'Show / hide visualizer'], ['Alt + ← / →', 'Step the visualizer back / forward'], ['← / → / Space', 'Step / play when the visualizer panel is focused']];
    const bg = document.createElement('div'); bg.className = 'modal-bg';
    bg.innerHTML = '<div class="modal"><h3>Keyboard shortcuts</h3><table>' + rows.map((r) => '<tr><td><kbd>' + r[0].split(' + ').join('</kbd> + <kbd>') + '</kbd></td><td>' + r[1] + '</td></tr>').join('') + '</table><p style="color:var(--muted);font-size:12.5px">On a Mac, use ⌘ instead of Ctrl.</p><button class="btn" style="margin-top:6px">Close</button></div>';
    bg.onclick = (e) => { if (e.target === bg || e.target.tagName === 'BUTTON') bg.remove(); };
    document.body.appendChild(bg);
  }

  /* ---------------------------------------------------------------- boot */
  applyTheme();
  initEditor();
  window.Viz.init({ line: (n) => setExecLine(S.ui.viz ? n : null), run: () => (S.lang.trace === 'explain' ? loadViz({}, S.cm.getValue()) : run()) });
  buildLangMenu();
  initSplitters();
  bind();
  route();
})();
