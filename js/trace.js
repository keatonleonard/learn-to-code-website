// ================================================================
//  trace.js: understanding code line by line
// ================================================================
//  This file has three tools the visualizer uses:
//   1. instrumentJS(): adds hidden "record this step" calls to JavaScript
//      code, so running it produces a step by step recording (a "trace").
//   2. explainLine() / explainAll(): describe in plain English what a line
//      of code does (e.g. "Creates the variable total and stores 0 in it").
//   3. scanHtml(): lists a web page's elements and CSS rules in order, for
//      the visualizer's page structure tree.
//
//  KEY WORDS used in this file:
//  * Parse: read code and work out its structure, like diagramming a
//    sentence. A "parser" (here, the Acorn library) does this.
//  * AST (Abstract Syntax Tree): the parser's result, a tree of "nodes".
//    Each node is one piece of code (a statement, a function, a loop...)
//    with a "type" such as 'IfStatement', and child nodes inside it.
//  * Statement: one complete instruction, like "let x = 5;".
//  * Scope: the region of code where a variable exists. A variable made
//    inside a function can't be seen outside it.
//  * Instrument: to add measuring code to a program without changing what
//    it does, like fitting sensors to a machine.
//  * Regular expression (regex): a pattern for matching text, written
//    between slashes like /^if\b/. ^ means "start of the text".
// ================================================================
/* Tracing helpers: JS instrumenter, per-line explainer, HTML scanner. */
// IIFE wrapper: keeps every name in this file private (see app.js).
(function () {
  'use strict';

  /* ================================================ JavaScript instrumenter */
  // ================ PART 1: JAVASCRIPT INSTRUMENTER ================
  // instrumentJS(code) returns a copy of the code with extra calls added:
  //   __t(lineNumber, getter);   before every statement
  //   __enter('name') ... __leave()   around every function body
  // The getter is a tiny function that reads every variable in scope at
  // that moment. The worker in engines.js defines __t / __enter / __leave
  // and uses them to record each step. The line numbers never change,
  // because no new lines are added, only text within existing lines.
  // "edits" collects every insertion first; they are applied at the end.
  function instrumentJS(code, acorn) {
    const ast = acorn.parse(code, { ecmaVersion: 'latest', locations: true });
    const edits = [];
    let seq = 0;
    const add = (pos, text) => edits.push({ pos, text, seq: seq++ });
    const FN = { FunctionDeclaration: 1, FunctionExpression: 1, ArrowFunctionExpression: 1 };

    // patternNames() collects variable names from a declaration, including
    // "destructuring" forms like const { a, b } = obj or const [x, y] = list.
    function patternNames(p, out) {
      if (!p) return;
      switch (p.type) {
        case 'Identifier': out.push(p.name); break;
        case 'ObjectPattern': p.properties.forEach((pr) => patternNames(pr.type === 'RestElement' ? pr.argument : pr.value, out)); break;
        case 'ArrayPattern': p.elements.forEach((e) => patternNames(e, out)); break;
        case 'RestElement': patternNames(p.argument, out); break;
        case 'AssignmentPattern': patternNames(p.left, out); break;
      }
    }
    // eachChild() calls fn for every child node of a node (every property
    // that holds another node or a list of nodes).
    function eachChild(node, fn) {
      for (const k in node) {
        if (k === 'type' || k === 'start' || k === 'end' || k === 'loc') continue;
        const v = node[k];
        if (Array.isArray(v)) v.forEach((c) => { if (c && typeof c.type === 'string') fn(c); });
        else if (v && typeof v.type === 'string') fn(v);
      }
    }
    // collectVars() finds every "var" variable in a function (var variables
    // belong to the whole function), without looking inside nested functions.
    // lexNames() finds "let" and "const" variables declared directly in a block.
    function collectVars(node, out) {
      if (!node || typeof node.type !== 'string' || FN[node.type]) return;
      if (node.type === 'VariableDeclaration' && node.kind === 'var') node.declarations.forEach((d) => patternNames(d.id, out));
      eachChild(node, (c) => collectVars(c, out));
    }
    function lexNames(stmts) {
      const out = [];
      stmts.forEach((s) => { if (s.type === 'VariableDeclaration' && s.kind !== 'var') s.declarations.forEach((d) => patternNames(d.id, out)); });
      return out;
    }
    // getterFor() writes the text of the getter function for a statement.
    // "scopes" is the list of nested scopes the statement sits in. Variables
    // of the current function are "locals" (__l); the program's top level
    // variables are "globals" (__g). Each read is wrapped in try/catch because
    // a "let" variable read before its declaration line throws an error.
    // traceText() builds the full __t(...) call for a statement.
    function getterFor(scopes) {
      let fnIdx = -1;
      for (let i = scopes.length - 1; i > 0; i--) if (scopes[i].fn) { fnIdx = i; break; }
      const uniq = (a) => Array.from(new Set(a));
      const loc = uniq([].concat.apply([], scopes.slice(fnIdx < 0 ? 0 : 1).map((s) => s.names)));
      const glob = fnIdx < 0 ? [] : uniq(scopes[0].names);
      const part = (arr, o) => arr.map((n) => 'try{' + o + '[' + JSON.stringify(n) + ']=' + n + '}catch(__e){}').join('');
      return 'function(){var __l={},__g={};' + part(loc, '__l') + part(glob, '__g') + 'return [__l,__g]}';
    }
    const traceText = (s, scopes) => '__t(' + s.loc.start.line + ',' + getterFor(scopes) + ');';

    // visitStatements() adds a __t call before each statement in a list,
    // skipping function and class declarations (nothing "happens" there yet).
    function visitStatements(list, scopes) {
      list.forEach((s) => {
        if (!(s.type === 'FunctionDeclaration' || s.type === 'ClassDeclaration' || s.type === 'EmptyStatement' || s.directive)) add(s.start, traceText(s, scopes));
        visit(s, scopes);
      });
    }
    // wrapBody(): an if/loop body written without { } (e.g. "if (x) y();")
    // gets braces added so a __t call can go inside it.
    function wrapBody(s, scopes) {
      if (s.type === 'BlockStatement' || s.type === 'EmptyStatement') { visit(s, scopes); return; }
      add(s.start, '{' + traceText(s, scopes));
      visit(s, scopes);
      add(s.end, '}');
    }
    // visitFunction(): start a new scope with the function's parameters and
    // variables, and wrap its body with __enter / try / finally __leave, so
    // the call stack stays correct even if an error is thrown. ("finally"
    // runs whether or not an error happened.) async and generator functions
    // can pause midway, so they aren't tracked on the stack.
    function visitFunction(fn, scopes, hint) {
      const names = [];
      fn.params.forEach((p) => patternNames(p, names));
      if (fn.body.type === 'BlockStatement') {
        collectVars(fn.body, names);
        lexNames(fn.body.body).forEach((n) => names.push(n));
        const scopes2 = scopes.concat([{ names, fn: true }]);
        const track = !fn.async && !fn.generator;
        const nm = (fn.id && fn.id.name) || hint || 'anonymous';
        if (track) add(fn.body.start + 1, '__enter(' + JSON.stringify(nm) + ');try{');
        visitStatements(fn.body.body, scopes2);
        if (track) add(fn.body.end - 1, '}finally{__leave()}');
      } else {
        visit(fn.body, scopes.concat([{ names, fn: true }]));
      }
    }
    function keyName(n) { return n && (n.name || (n.value !== undefined ? String(n.value) : null)); }

    // visit() walks the whole tree. A "switch" picks what to do based on the
    // node's type: functions get visitFunction, blocks and loops start new
    // scopes, if/loop bodies get wrapBody, and everything else just has its
    // children visited. "hint" carries a name for unnamed functions, like
    // the variable or property they are assigned to.
    function visit(node, scopes, hint) {
      if (!node || typeof node.type !== 'string') return;
      switch (node.type) {
        case 'FunctionDeclaration': case 'FunctionExpression': case 'ArrowFunctionExpression':
          return visitFunction(node, scopes, hint);
        case 'BlockStatement': case 'StaticBlock':
          return visitStatements(node.body, scopes.concat([{ names: lexNames(node.body), fn: false }]));
        case 'SwitchStatement': {
          visit(node.discriminant, scopes);
          const names = [];
          node.cases.forEach((c) => lexNames(c.consequent).forEach((n) => names.push(n)));
          const sc = scopes.concat([{ names, fn: false }]);
          node.cases.forEach((c) => { visit(c.test, sc); visitStatements(c.consequent, sc); });
          return;
        }
        case 'IfStatement':
          visit(node.test, scopes);
          wrapBody(node.consequent, scopes);
          if (node.alternate) { if (node.alternate.type === 'IfStatement') visit(node.alternate, scopes); else wrapBody(node.alternate, scopes); }
          return;
        case 'ForStatement': case 'ForInStatement': case 'ForOfStatement': {
          const names = [];
          const decl = node.init || node.left;
          if (decl && decl.type === 'VariableDeclaration') decl.declarations.forEach((d) => patternNames(d.id, names));
          const sc = scopes.concat([{ names, fn: false }]);
          eachChild(node, (c) => { if (c !== node.body) visit(c, sc); });
          wrapBody(node.body, sc);
          return;
        }
        case 'WhileStatement': case 'DoWhileStatement':
          visit(node.test, scopes); wrapBody(node.body, scopes); return;
        case 'TryStatement':
          visit(node.block, scopes);
          if (node.handler) {
            const names = []; patternNames(node.handler.param, names);
            visit(node.handler.body, scopes.concat([{ names, fn: false }]));
          }
          if (node.finalizer) visit(node.finalizer, scopes);
          return;
        case 'VariableDeclarator':
          if (node.init) visit(node.init, scopes, node.id.type === 'Identifier' ? node.id.name : null);
          return;
        case 'AssignmentExpression':
          visit(node.right, scopes, node.left.type === 'Identifier' ? node.left.name : node.left.type === 'MemberExpression' ? keyName(node.left.property) : null);
          return;
        case 'Property': case 'MethodDefinition': case 'PropertyDefinition':
          if (node.computed) visit(node.key, scopes);
          visit(node.value, scopes, keyName(node.key));
          return;
        default:
          eachChild(node, (c) => visit(c, scopes));
      }
    }

    // Start at the top level, add one final __t(0, ...) at the very end so
    // the visualizer can show the final state, then apply all the edits.
    // Sorting them from the end of the code backwards means each insertion
    // doesn't shift the positions of the ones still to come.
    const top = { names: [], fn: false };
    collectVars(ast, top.names);
    lexNames(ast.body).forEach((n) => top.names.push(n));
    visitStatements(ast.body, [top]);
    add(code.length, '\n;__t(0,' + getterFor([top]) + ');');

    edits.sort((a, b) => b.pos - a.pos || b.seq - a.seq);
    let out = code;
    for (const e of edits) out = out.slice(0, e.pos) + e.text + out.slice(e.pos);
    return out;
  }

  /* ================================================ Line explainer */
  // ================ PART 2: LINE EXPLAINER ================
  // esc() makes text safe to show as HTML (see app.js); c() shows a piece of
  // code in code style. KW lists keywords that are never function names.
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const c = (s) => '<code>' + esc(s) + '</code>';
  const KW = /^(if|for|while|switch|return|else|catch|sizeof|foreach|elif|until|do|try|using|lock|when|match|loop)$/;

  // isComment() recognises comment lines in most languages (//, /*, #, --,
  // <!--) so they can be skipped. C's #include lines are not comments.
  function isComment(s) {
    return /^(\/\/|\/\*|\*\/|\*(\s|$)|#(?![a-z]+\s*[<"])|--|<!--|=begin|=end)/.test(s) && !/^#(include|define|if|endif|else|pragma|import)/.test(s);
  }

  /** Returns {text, decl:{name,init}} or null (null = blank/comment, skip). */
  // explainLine() describes one line of code in plain English. It cleans
  // the line, then tries a long series of patterns in order, from most
  // specific to most general. The first pattern that matches wins:
  //  * closing brackets and "end" (end of a block)
  //  * SQL keywords, #include / import lines, package declarations
  //  * function and class definitions in each language's style
  //  * if / else / loops / switch / try / return / break
  //  * printing (print, console.log, printf, cout...)
  //  * creating variables and assigning new values
  //  * calling a function
  // For declarations it also returns "decl" (the variable's name and
  // starting value) so explain mode can list variables declared so far.
  function explainLine(lang, raw) {
    let s = raw.trim();
    if (!s || isComment(s)) return null;
    s = s.replace(/\s+\/\/.*$/, '').replace(/\s+#\s.*$/, '').replace(/;$/, '').trim();
    let m;

    if (/^\}[})\];,]*$/.test(s) || /^end[;]?$/i.test(s) || s === 'fi' || s === 'done' || s === 'esac')
      return { text: 'End of a block. Execution continues after it — or jumps back to the top if this was the end of a loop body.' };
    if (/^[)\]][)\]};,]*$/.test(s)) return { text: 'Closes the brackets opened on an earlier line — the end of a multi-line expression.' };
    if (lang === 'html') return null;
    if (lang === 'sql') {
      const kw = s.split(/\s+/)[0].toUpperCase();
      const map = { SELECT: 'Asks the database for data and shows the result as a table.', INSERT: 'Adds new row(s) to a table.', UPDATE: 'Changes values in existing rows.', DELETE: 'Removes rows from a table.', CREATE: 'Creates a new table (or other database object).', DROP: 'Deletes a table (or other object) completely.', ALTER: 'Changes the structure of an existing table.', WITH: 'Defines a temporary named result (CTE) to use in the query below.', BEGIN: 'Starts a transaction.', COMMIT: 'Saves the transaction permanently.', ROLLBACK: 'Undoes the transaction.' };
      return { text: map[kw] || 'Part of an SQL statement.' };
    }

    if ((m = /^(#include|#import)\s*(.*)/.exec(s))) return { text: 'Pulls in ' + c(m[2]) + ' so its functions are available to use.' };
    if ((m = /^package\s+([\w.]+)$/.exec(s))) return { text: 'Declares that this file belongs to the package ' + c(m[1]) + (m[1] === 'main' ? ' — the package that builds into a runnable program.' : '.') };
    if (lang === 'go' && /^import\s*\($/.test(s)) return { text: 'Starts a list of packages to import, one per line.' };
    if (lang === 'go' && (m = /^(?:\w+\s+)?"([\w./-]+)"$/.exec(s))) return { text: 'Imports the package ' + c(m[1]) + ' so its functions can be used.' };
    if (lang === 'go' && (m = /^([A-Za-z_]\w*(?:\s*,\s*\w+)*)\s+(\*?[\w.\[\]]+(?:\{\})?)(\s+`[^`]*`)?$/.exec(s)) && !/^(return|package|import|var|const|type|go|defer|break|continue|fallthrough|goto)$/.test(m[1]))
      return { text: 'A field of the struct: ' + c(m[1]) + ' holds a value of type ' + c(m[2]) + '.' };
    if ((lang === 'rust' || lang === 'go') && (m = /^(?:pub(?:\([^)]*\))?\s+)?(\w+)\s*:\s*([^=]+?),?$/.exec(s)) && !/^(let|const|static)\b/.test(s))
      return { text: 'A field: ' + c(m[1]) + ' holds a value of type ' + c(m[2].trim()) + '.' };
    if ((m = /^#define\s+(\w+)\s*(.*)/.exec(s))) return { text: 'Defines the macro ' + c(m[1]) + ' — the preprocessor replaces it with ' + c(m[2] || '(nothing)') + ' before compiling.' };
    if ((m = /^(import|from|using|use|require|require_once|package|namespace)\b\s*(.*)/.exec(s)) && !/^use\s+strict/.test(s) && !/\{$/.test(s) || (m = /^(const|let|var)\s+.*=\s*require\(/.exec(s)))
      return { text: 'Imports/declares ' + c((m[2] || s).replace(/;$/, '')) + ' so this file can use code from elsewhere.' };

    // function definitions
    // Function definition patterns for Python, JavaScript, Lua, Rust, Go and
    // PHP. The C style pattern (type name(params)) comes right after.
    const fnPatterns = [
      /^(?:async\s+)?def\s+(\w+[?!]?)\s*\(?([^)]*)\)?/,
      /^(?:export\s+)?(?:async\s+)?function\s*\*?\s*(\w+)\s*\(([^)]*)\)/,
      /^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:function\s*\(([^)]*)\)|\(([^)]*)\)\s*=>|(\w+)\s*=>)/,
      /^(?:local\s+)?function\s+([\w.:]+)\s*\(([^)]*)\)/,
      /^(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?(?:unsafe\s+)?fn\s+(\w+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)/,
      /^func\s+(?:\([^)]*\)\s*)?(\w+)\s*\(([^)]*)\)/,
      /^(?:(?:public|private|protected|static|abstract|final)\s+)*function\s+(\w+)\s*\(([^)]*)\)/
    ];
    for (const re of fnPatterns) {
      if ((m = re.exec(s))) {
        const name = m[1], params = (m[2] || m[3] || m[4] || '').trim();
        if (name === 'main') return { text: 'Defines ' + c('main') + ' — the entry point. Execution of the program starts here.' };
        return { text: 'Defines a function named ' + c(name) + (params ? ' that takes ' + c(params) : ' with no parameters') + '. Nothing runs yet — the body only executes when the function is <b>called</b>.' };
      }
    }
    if (!/=/.test(s.replace(/==|<=|>=|!=/g, '')) || /\)\s*(const\s*)?\{?$/.test(s)) {
      m = /^(?:(?:public|private|protected|static|final|virtual|override|abstract|async|inline|extern|const|unsigned|signed|constexpr|synchronized|internal|sealed)\s+)*([\w:<>,\[\]*&.?]+(?:\s*[*&]+)?)\s+\**(\w+)\s*\(([^;]*)\)\s*(?:const\s*)?(?:throws\s+[\w, .]+)?\s*(\{|=>.*)?$/.exec(s);
      if (m && !KW.test(m[1]) && !KW.test(m[2]) && m[1] !== 'new' && m[1] !== 'return' && m[1] !== 'else' && m[1] !== 'delete') {
        if (m[2] === 'main') return { text: 'Defines ' + c('main') + ' — the entry point. Execution of the program starts here.' };
        return { text: 'Defines ' + (m[4] ? 'a method/function' : 'a function') + ' named ' + c(m[2]) + ' returning ' + c(m[1]) + (m[3].trim() ? ', taking ' + c(m[3].trim()) : ' with no parameters') + '. The body runs only when it is called.' };
      }
    }
    if ((m = /^(?:(?:public|private|protected|static|abstract|final|sealed|pub|export|partial|data|open)\s+)*(class|struct|enum|interface|trait|impl|type|record|module|object|union)\s+(\w+)?/.exec(s)) && !/=/.test(s))
      return { text: 'Declares ' + (m[1] === 'impl' ? 'an implementation block' : 'a ' + m[1]) + (m[2] ? ' called ' + c(m[2]) : '') + ' — a blueprint that groups data and behaviour together.' };

    // control flow
    if ((m = /^(else\s+if|elif|elsif|elseif)\b\s*\(?(.*?)\)?\s*(\{|:|then)?$/.exec(s))) return { text: 'Else-if: only checked when the earlier conditions were false. Condition: ' + c(m[2]) + '.' };
    if (/^\}?\s*else\b/.test(s)) return { text: 'Else: runs when none of the earlier conditions were true.' };
    if ((m = /^if\b\s*\(?(.*?)\)?\s*(\{|:|then)?$/.exec(s))) return { text: 'Checks the condition ' + c(m[1]) + '. If it is true the indented block runs, otherwise it is skipped.' };
    if ((m = /^unless\b\s*(.*)/.exec(s))) return { text: 'Runs the block only if ' + c(m[1]) + ' is <b>false</b>.' };
    if ((m = /^(for|foreach)\b\s*\(?(.*?)\)?\s*(\{|:|do)?$/.exec(s))) return { text: 'Loop: repeats the block. Loop header: ' + c(m[2]) + '. Each repetition is one <b>iteration</b>.' };
    if ((m = /^while\b\s*\(?(.*?)\)?\s*(\{|:|do)?$/.exec(s))) return { text: 'Loop: keeps repeating the block as long as ' + c(m[1]) + ' is true.' };
    if (/^loop\b/.test(s)) return { text: 'Starts an endless loop — it only ends at a <code>break</code> or <code>return</code>.' };
    if (/^do\b\s*\{?$/.test(s) || /^repeat$/.test(s)) return { text: 'Starts a loop that always runs its body at least once before checking the condition.' };
    if ((m = /^(switch|match|case)\b\s*\(?(.*?)\)?\s*(\{|:|of)?$/.exec(s)) || (m = /^(when)\b\s*(.*)/.exec(s))) return { text: 'Compares a value against several possibilities: ' + c(m[2]) + '.' };
    if (/^default\s*:/.test(s)) return { text: 'Fallback branch when no other case matched.' };
    if ((m = /^(try|begin)\b/.exec(s))) return { text: 'Starts a protected block: if an error happens inside, execution jumps to the matching handler instead of crashing.' };
    if ((m = /^(?:\}\s*)?(catch|except|rescue)\b\s*(.*)/.exec(s))) return { text: 'Error handler: runs only if the protected block raised an error' + (m[2] ? ' matching ' + c(m[2].replace(/[{:]$/, '')) : '') + '.' };
    if (/^(?:\}\s*)?(finally|ensure)\b/.test(s)) return { text: 'Cleanup block: always runs, whether or not an error occurred.' };
    if ((m = /^return\b\s*(.*)/.exec(s))) return { text: m[1] ? 'Hands ' + c(m[1]) + ' back to whoever called this function and leaves the function.' : 'Leaves the function immediately.' };
    if (/^break\b/.test(s)) return { text: 'Breaks out of the loop (or switch) immediately.' };
    if (/^(continue|next)\b/.test(s)) return { text: 'Skips the rest of this iteration and jumps to the next one.' };
    if ((m = /^(throw|raise|panic!?|die|error)\b\s*\(?(.*)/.exec(s)) && !/^error\s*=/.test(s)) return { text: 'Signals an error: ' + c(m[2].replace(/\)$/, '')) + '. The program stops here unless an error handler catches it.' };
    if ((m = /^yield\b\s*(.*)/.exec(s))) return { text: 'Produces the value ' + c(m[1]) + ' and pauses, to be resumed later.' };

    // printing
    if (/(^|[^\w.])(console\.(log|error|warn|info|table)|print|println|printf|puts|echo|cout|Console\.Write(Line)?|System\.out\.print(ln|f)?|fmt\.(Print|Println|Printf)|print!|println!|eprintln!|io\.write|document\.write|write|writeln|p|pp|NSLog|var_dump|print_r)\s*[(<!\s"']/.test(s) && !/^[\w\s,.$\[\]]+(:=|[+\-*\/]?=(?!=))/.test(s) && !(/(^|[^\w.])pp?\s/.test(s) && lang !== 'ruby'))
      return { text: 'Prints output to the terminal: ' + c(s) + '.' };

    // declarations / assignments
    // Variable declarations in their many forms: let / const / var, Go's :=,
    // typed C style "int x = 5", PHP's $x = 5 and Python's x = 5.
    let decl = null;
    if ((m = /^(?:export\s+)?(let\s+mut|let|const|var|val|local|auto|final|my|our|dim)\s+(\w+)\s*(?::\s*[^=]+)?(?:=\s*(.+))?$/.exec(s))) decl = { name: m[2], init: m[3] };
    else if ((m = /^(\w+(?:\s*,\s*\w+)*)\s*:=\s*(.+)$/.exec(s))) decl = { name: m[1].replace(/\s+/g, ''), init: m[2] };
    else if ((m = /^(?:static\s+|final\s+|const\s+|readonly\s+)*(?:unsigned\s+|signed\s+|long\s+)*([A-Za-z_][\w:<>,\[\]]*(?:\s*[*&]+)?)\s+\**(\w+)\s*(?:\[[^\]]*\])?\s*(?:=\s*(.+))?$/.exec(s)) && !KW.test(m[1]) && !/^(return|else|new|delete|throw|goto|case|using|namespace|import)$/.test(m[1]))
      decl = { name: m[2], init: m[3], type: m[1] };
    else if (lang === 'php' && (m = /^\$(\w+)\s*=\s*(.+)$/.exec(s))) decl = { name: m[1], init: m[2] };
    else if (lang === 'python' && (m = /^(\w+)\s*(?::\s*[\w\[\], ]+)?=\s*(.+)$/.exec(s)) && !/==/.test(s.split('=')[0])) return { text: 'Stores the result of ' + c(m[2]) + ' in the variable ' + c(m[1]) + ' (creating it if needed).', decl: { name: m[1], init: m[2] } };
    if (decl) {
      if (decl.init) return { text: 'Creates the variable ' + c(decl.name) + (decl.type ? ' of type ' + c(decl.type) : '') + ' and stores ' + c(decl.init) + ' in it.', decl };
      return { text: 'Declares the variable ' + c(decl.name) + (decl.type ? ' of type ' + c(decl.type) : '') + ' (no value yet).', decl };
    }
    if ((m = /^([\w$.\[\]\->@:]+)\s*(\+|-|\*|\/|%|\*\*|\|\||&&|\?\?|<<|>>|\||&|\^)?=\s*([^=].*)?$/.exec(s))) {
      if (m[2]) return { text: 'Updates ' + c(m[1]) + ' by applying ' + c(m[2]) + ' with ' + c(m[3]) + ' (shorthand for ' + c(m[1] + ' = ' + m[1] + ' ' + m[2] + ' ' + m[3]) + ').', decl: { name: m[1], init: m[1] + ' ' + m[2] + ' ' + m[3] } };
      return { text: 'Assigns ' + c(m[3]) + ' to ' + c(m[1]) + ', replacing its old value.', decl: { name: m[1], init: m[3] } };
    }
    if ((m = /^(?:\+\+|--)?([\w$.\[\]]+)(\+\+|--)$/.exec(s)) || (m = /^(\+\+|--)([\w$.]+)$/.exec(s))) return { text: 'Changes ' + c(m[1] === '++' || m[1] === '--' ? m[2] : m[1]) + ' by 1 (' + (s.indexOf('++') >= 0 ? 'increment' : 'decrement') + ').' };
    if (/,$/.test(raw.trim())) return { text: 'One item of a list (or of a function call\'s arguments) that is spread over several lines: ' + c(s.replace(/,$/, '')) + '.' };
    if ((m = /^([\w$.:>\-]+)\s*\(/.exec(s))) return { text: 'Calls ' + c(m[1] + '(…)') + ': jumps into that function, runs it, then comes back here.' };
    return { text: 'Runs ' + c(s.length > 60 ? s.slice(0, 57) + '…' : s) + '.' };
  }
  // Rust returns the last expression of a block automatically when it has
  // no semicolon. isRustTailExpr() spots such lines (a line without ;
  // followed by a closing brace) so they can be explained correctly.
  function isRustTailExpr(lines, i) {
    const t = lines[i].trim();
    if (!t || /[;{},]$/.test(t) || /^(\/\/|let |if |else|for |while |loop|match |fn |#\[|struct |enum |impl |use |pub |mod )/.test(t)) return false;
    for (let k = i + 1; k < lines.length; k++) { const n = lines[k].trim(); if (n) return /^\}/.test(n); }
    return false;
  }

  /** For languages we cannot execute step-by-step: walk the source top-to-bottom explaining each line. */
  // explainAll() is used by EXPLAIN MODE for compiled languages (which run
  // on a remote server, so they can't be recorded line by line). It walks
  // the code top to bottom, explains each line, and keeps a running list of
  // the variables declared so far. It does not follow loops or calls.
  function explainAll(lang, code) {
    const lines = code.split('\n');
    const steps = [];
    const declared = [];
    lines.forEach((ln, i) => {
      let ex = explainLine(lang, ln);
      if (!ex) return;
      if (lang === 'rust' && isRustTailExpr(lines, i)) ex = { text: 'No semicolon at the end of a block: the value of ' + c(ln.trim()) + ' becomes the block\'s result — here, the function\'s return value.' };
      if (ex.decl && !declared.some((d) => d.name === ex.decl.name)) declared.push({ name: ex.decl.name, init: ex.decl.init, type: ex.decl.type });
      else if (ex.decl) { const d = declared.find((x) => x.name === ex.decl.name); if (d && ex.decl.init) d.init = ex.decl.init; }
      steps.push({ line: i + 1, text: ex.text, src: ln.trim(), declared: declared.map((d) => Object.assign({}, d)) });
    });
    return steps;
  }

  /* ================================================ HTML scanner */
  // ================ PART 3: HTML SCANNER ================
  // VOID lists "void" elements: HTML elements that never have a closing
  // tag, like <br> and <img>. TAGINFO gives a short description of common
  // tags, shown by the visualizer.
  const VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, source: 1, track: 1, wbr: 1 };
  const TAGINFO = {
    html: 'The root of the whole page — everything lives inside it.', head: 'Information <i>about</i> the page (title, styles, scripts). Not shown directly.',
    title: 'The text shown in the browser tab.', meta: 'Metadata such as character encoding or viewport settings.', link: 'Links an external resource, usually a stylesheet.',
    style: 'Holds CSS rules that style the page.', script: 'Holds JavaScript that makes the page interactive.', body: 'Everything the visitor actually sees.',
    h1: 'The main heading (most important).', h2: 'A section heading.', h3: 'A sub-section heading.', h4: 'A smaller heading.', p: 'A paragraph of text.',
    a: 'A hyperlink — clicking it navigates somewhere.', img: 'An image. <code>alt</code> text describes it for screen readers.', ul: 'An unordered (bulleted) list.', ol: 'An ordered (numbered) list.',
    li: 'One item in a list.', div: 'A generic block-level container, used for layout and grouping.', span: 'A generic inline container for styling part of a line.',
    button: 'A clickable button.', input: 'A form field the user can type into.', form: 'Groups form fields so they can be submitted.', label: 'A caption linked to a form field.',
    table: 'A table of rows and columns.', tr: 'A table row.', td: 'A table cell.', th: 'A table header cell.', thead: 'Header rows of a table.', tbody: 'Body rows of a table.',
    header: 'Introductory content for a page or section.', footer: 'Footer content for a page or section.', nav: 'A group of navigation links.', main: 'The main content of the page.',
    section: 'A themed grouping of content.', article: 'A self-contained piece of content.', aside: 'Side content related to the main content.',
    strong: 'Important text (usually bold).', em: 'Emphasised text (usually italic).', br: 'A line break.', hr: 'A horizontal rule (divider).', canvas: 'A drawing surface controlled by JavaScript.',
    select: 'A drop-down list.', option: 'One choice inside a drop-down.', textarea: 'A multi-line text field.', code: 'A snippet of code.', pre: 'Preformatted text — whitespace is preserved.'
  };
  // scanHtml() reads HTML code and lists every opening tag in order with
  // its line number and nesting depth (how many elements it sits inside).
  //  * Comments are blanked out first (keeping line breaks so line numbers
  //    stay right).
  //  * A "stack" (a list where the last item added is the first removed)
  //    tracks which elements are open, to know the depth.
  //  * Inside <style>, each CSS rule is listed too.
  //  * The text inside <script> and <style> is skipped, so code there is
  //    never mistaken for tags.
  function scanHtml(code) {
    const steps = [];
    const blank = code.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
    const lineAt = (i) => blank.slice(0, i).split('\n').length;
    const re = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
    const stack = [];
    let m, rawUntil = null;
    while ((m = re.exec(blank))) {
      const closing = !!m[1], tag = m[2].toLowerCase();
      if (rawUntil) { if (closing && tag === rawUntil) rawUntil = null; else continue; }
      if (closing) {
        const idx = stack.lastIndexOf(tag);
        if (idx >= 0) stack.length = idx;
        continue;
      }
      const attrs = (m[3] || '').replace(/\/$/, '').trim();
      steps.push({ kind: 'tag', tag, attrs, depth: stack.length, line: lineAt(m.index), text: TAGINFO[tag] || 'An HTML element.', src: m[0] });
      if (tag === 'style') {
        const end = blank.toLowerCase().indexOf('</style', re.lastIndex);
        const css = blank.slice(re.lastIndex, end < 0 ? blank.length : end);
        const base = re.lastIndex;
        const rr = /([^{}]+)\{([^}]*)\}/g; let rm;
        while ((rm = rr.exec(css))) {
          const sel = rm[1].trim();
          if (!sel || sel[0] === '@') continue;
          const at = base + rm.index + rm[1].search(/\S|$/);
          steps.push({ kind: 'css', tag: sel, attrs: rm[2].trim().replace(/\s+/g, ' '), depth: stack.length + 1, line: lineAt(at), text: 'CSS rule: every element matching <code>' + esc(sel) + '</code> gets these style declarations.', src: sel + ' { … }' });
        }
      }
      if (tag === 'script' || tag === 'style') rawUntil = tag;
      if (!VOID[tag] && !/\/\s*$/.test(m[3] || '')) stack.push(tag);
    }
    return steps;
  }

  // Share these tools with the other files as window.Trace.
  window.Trace = { instrumentJS, explainLine, explainAll, scanHtml, esc };
})();
