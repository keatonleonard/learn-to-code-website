# CodeLab — learn to code in your browser

A static, no-build website with an IDE-style interface for learning 13 languages:
JavaScript, Python, HTML & CSS, SQL, Lua, Ruby, PHP, C, C++, Rust, Go, Java and C#.

## Run it

Serve the folder with any static web server, then open http://localhost:8000:

```bash
python -m http.server 8000
```

An internet connection is needed: editor libraries and language runtimes load from CDNs,
and compiled languages are run by the free [Wandbox](https://wandbox.org) service.

## Features

- **Editor** (CodeMirror 5): syntax highlighting, auto-complete, bracket matching, comment toggling, adjustable font size, autosave per language.
- **Terminal**: real stdout/stderr, a stdin box for `input()`/`scanf`/`Scanner`, error lines highlighted in the editor, and a plain-English "what this means" explanation for common errors. Can be hidden (`Ctrl+\``).
- **Visualizer** (toggle with the 👁 button or `Alt+V`):
  - *Live trace* for JavaScript, Python and Lua — every executed line is recorded with variables (arrays/lists drawn as cells, objects/dicts as tables), the call stack, return values and output so far. Changed variables are flagged with their previous value.
  - *Table view* for SQL — each statement's result plus every table's contents afterwards.
  - *DOM tree* for HTML & CSS — elements and CSS rules in order.
  - *Explain mode* for compiled languages — a line-by-line description in reading order.
- **Syntax guide** per language (beginner → advanced sections, "going deeper" notes for experienced devs, search, level filter, progress tracking, load/run any example, full-page mode).
- **Best practices** and common beginner mistakes per language.
- **Challenges** that check your output automatically.
- Share links (code encoded in the URL), download, light/dark theme, resizable panels, keyboard shortcuts (`?` button).

## Where things live

| Path | Purpose |
| --- | --- |
| `index.html` | Page shell and CDN script tags |
| `css/style.css` | All styling (theme tokens at the top) |
| `js/app.js` | Routing, editor, terminal, guide, challenges |
| `js/engines.js` | Runners: JS (web worker), Python (Pyodide worker), Lua (Fengari worker), SQL (sql.js), HTML (sandboxed iframe), compiled languages (Wandbox API) |
| `js/trace.js` | JavaScript instrumenter, line explainer, HTML scanner |
| `js/viz.js` | Visualizer panel |
| `js/errors.js` | Friendly error explanations |
| `js/challenges.js` | Self-checking challenges |
| `js/langs/*.js` | Language definitions: starter code, syntax guide sections, tips |

To add a language, push a new object onto `window.LANGS` in a `js/langs/` file (see existing entries for the fields) and add its `<script>` tag to `index.html`.
