// ================================================================
//  js/langs/web.js: content for JavaScript, HTML & CSS and SQL
// ================================================================
//  This file holds DATA, not behaviour: each language's starter program,
//  syntax guide lessons, tips and settings. The other JavaScript files
//  (app.js, engines.js...) read this data to build the screens.
//
//  HOW EACH LANGUAGE IS DESCRIBED. Every language is one JavaScript
//  OBJECT (a group of named values inside { }) added to the LANGS list
//  with LANGS.push(...). Its fields (named values) are:
//    id        short name used in web addresses, e.g. #/python
//    name      the name people see, e.g. "Python"
//    tag       2 to 4 letters shown on the language's card badge
//    color     the language's colour (a hex code like #3776ab)
//    file      file name shown above the editor and used for downloads
//    cmd       the pretend command printed in the terminal on Run
//    kind      'browser' (runs instantly on your computer) or 'cloud'
//              (sent to the Wandbox online compiler)
//    engine    which engine in engines.js runs it: 'js', 'py', 'lua',
//              'sql', 'html' or 'wandbox'
//    trace     which visualizer mode it uses: 'trace', 'sql', 'dom' or
//              'explain'
//    mode      which CodeMirror colouring rules to use in the editor
//    snippetMode  (optional) different colouring rules for guide examples
//    indent    how many spaces one indent is; tabs: use tab characters
//    comment   this language's comment symbols, used when building
//              challenge templates
//    scaffold  the template a challenge starts from; {{COMMENT}} is
//              replaced by the challenge description
//    wrap      (optional) the code needed around short examples so they
//              can run, e.g. a main() function; {{CODE}} marks where the
//              example goes and wrapIndent is how much to indent it
//    wb        (cloud languages) Wandbox settings: which language to ask
//              for, preferred compiler, extra compiler options ("flags"),
//              "slow" builds, and an optional code "transform"
//    noStdin   true if the "Program input" box isn't used
//    chal      which challenge list to use (default: the common list)
//    blurb     one sentence for the home page card
//    intro     the paragraph at the top of the syntax guide
//    docs      a link to the official documentation
//    keywords  words suggested by auto complete
//    starter   the example program shown the first time you open it
//    sections  the syntax guide lessons. Each lesson has: id, title,
//              level (beginner / intermediate / advanced), body (the
//              explanation; `backticks` show code and **double stars**
//              make bold), code (the example), optional full: true (the
//              example is already a complete program and needs no wrap)
//              and optional deep (the "Going deeper" note).
//    tips      the "Best practices" list
//    pitfalls  the "Common beginner mistakes" list
/* JavaScript, HTML & CSS, SQL */
// window.LANGS is the shared list of languages that every language file
// adds to. "|| []" means: if no earlier file has created the list yet,
// start an empty one. (window is the browser's shared "global" object.)
window.LANGS = window.LANGS || [];
// IIFE wrapper: a function that runs immediately, keeping helper names
// like R private to this file (see app.js for more on this).
(function () {
  // R is a shortcut for String.raw. Code examples are written between
  // backticks ` ` (a "template literal", JavaScript text that can span
  // many lines). String.raw keeps every backslash exactly as typed, so
  // code like printf("\n") stays correct instead of \n turning into a
  // real line break. No // comments can go INSIDE these examples, because
  // they would become part of the example code itself.
  const R = String.raw;
  // J is like R but for JavaScript examples, which can themselves contain
  // backticks and ${...}. Inside these examples, the symbol pair §§ stands
  // for a backtick and §{ stands for ${ ; J swaps them back when the file
  // loads. Without this trick the example's backticks would end the outer
  // text early.
  // In JS samples, §§ stands for a backtick and §{ for "${" (so they survive this template literal).
  const J = (s) => String.raw(s).replace(/§§/g, '`').replace(/§\{/g, '${');

  /* ===================================================================== JavaScript */
  // JAVASCRIPT
  // Runs inside your browser in a Web Worker (a background helper) and
  // supports the live line by line trace in the visualizer.
  LANGS.push({
    id: 'javascript', name: 'JavaScript', tag: 'JS', color: '#e6b800', file: 'main.js', cmd: 'node main.js',
    kind: 'browser', engine: 'js', trace: 'trace', mode: 'javascript', indent: 2, comment: ['//'],
    scaffold: '{{COMMENT}}\n\n// Your code here\n',
    blurb: 'The language of the web. Runs in every browser and on servers with Node.js. Great first language.',
    intro: 'JavaScript runs in every web browser and, via Node.js, on servers. It is dynamically typed, multi-paradigm (functional + object-oriented) and event-driven. Code here runs in an isolated sandbox in your browser.',
    docs: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'class', 'extends', 'constructor', 'new', 'this', 'super', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof', 'console', 'log', 'length', 'push', 'pop', 'map', 'filter', 'reduce', 'forEach', 'includes', 'Math', 'JSON', 'Promise', 'Object', 'Array', 'String', 'Number', 'setTimeout', 'toUpperCase', 'toLowerCase', 'split', 'join', 'slice'],
    // The starter program shown the first time you open JavaScript.
    starter: J`// Welcome to JavaScript! Press ▶ Run (or Ctrl+Enter).
// Tip: open the 👁 Visualizer to watch every line execute.

function fibonacci(n) {
  const sequence = [0, 1];
  for (let i = 2; i < n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }
  return sequence;
}

const numbers = fibonacci(8);
let total = 0;
for (const value of numbers) {
  total += value;
}

const person = { name: "Ada", skills: ["math", "code"] };

console.log("Fibonacci:", numbers);
console.log(§§The sum is §{total}§§);
console.log(person);
`,
    // JavaScript syntax guide lessons, from beginner to advanced.
    sections: [
      { id: 'hello', title: 'Hello, World & the console', level: 'beginner',
        body: "`console.log()` prints values to the terminal. Statements usually end with a semicolon `;`. JavaScript is **case-sensitive**: `Console.log` would fail.\n\nComments start with `//` for one line, or sit between `/*` and `*/` for several lines. The computer ignores them — they are notes for humans.",
        code: J`// This is a comment — JavaScript ignores it
console.log("Hello, World!");
console.log("Numbers:", 42, 3.14);
console.log("Several", "values", "are", "joined", "by spaces");

/* A multi-line
   comment */
console.error("console.error output is shown in red");`,
        deep: "In browsers `console.log` writes to DevTools; in Node.js it writes to stdout and `console.error` to stderr. Keep diagnostics on stderr so stdout stays clean when your program's output is piped into another tool. `console.table()` and `console.group()` are handy for structured debugging." },
      { id: 'vars', title: 'Variables & data types', level: 'beginner',
        body: "A variable is a named box that stores a value. Use `const` for values that won't be reassigned and `let` for ones that will.\n\nThe basic (primitive) types are: `string` (text), `number`, `boolean` (`true`/`false`), `null` (deliberately empty), `undefined` (not set yet), plus `bigint` and `symbol`. `typeof` tells you a value's type.",
        code: J`const name = "Ada";        // string — can't be reassigned
let age = 36;              // number — can change
age = age + 1;

const isCoder = true;      // boolean
let nothing = null;        // intentionally empty
let notSet;                // undefined

console.log(name, age, isCoder, nothing, notSet);
console.log(typeof name, typeof age, typeof isCoder);
console.log(typeof nothing);   // "object" — a famous historical quirk!`,
        deep: "`const` makes the *binding* constant, not the value: `const arr = []; arr.push(1)` is fine. `var` is function-scoped and hoisted — avoid it. All numbers are IEEE-754 doubles, so `0.1 + 0.2 !== 0.3` and integers are only exact up to `Number.MAX_SAFE_INTEGER` (2^53 − 1); use `BigInt` (`10n`) beyond that." },
      { id: 'ops', title: 'Operators & strings', level: 'beginner',
        body: "Arithmetic: `+ - * /`, remainder `%` and power `**`. Compare with `===` and `!==` (strict: no type conversion). Avoid `==`, which silently converts types.\n\nStrings can use single quotes, double quotes, or backticks. Backtick **template literals** let you insert values with `${...}`.",
        code: J`const a = 7, b = 2;
console.log(a + b, a - b, a * b, a / b);   // 9 5 14 3.5
console.log(a % b, a ** b);                // remainder 1, power 49

console.log(5 === 5, 5 === "5", 5 == "5"); // true false true(!)

const first = "Grace", last = "Hopper";
const full = first + " " + last;           // concatenation
const msg = §§§{first} has §{last.length} letters in her surname§§;
console.log(full, "|", msg);

console.log(full.toUpperCase(), full.length, full.includes("Hop"));
console.log("  trim me  ".trim(), "a,b,c".split(","));
console.log(full.slice(0, 5), full.replace("Grace", "Admiral"));`,
        deep: "Strings are immutable UTF-16 sequences: methods return new strings. `str.length` counts UTF-16 code units, so emoji may count as 2 — use `[...str].length` for code points. `+` with a string converts the other side to a string: `1 + '2'` is `'12'`, while `'3' * 2` is `6`." },
      { id: 'cond', title: 'Conditionals', level: 'beginner',
        body: "`if` runs a block only when its condition is true; `else if` and `else` handle the other cases. Combine conditions with `&&` (and), `||` (or) and `!` (not).\n\nThe **ternary** operator `cond ? a : b` picks one of two values. `switch` compares one value against many cases.",
        code: J`const temperature = 23;

if (temperature > 30) {
  console.log("Hot!");
} else if (temperature > 15) {
  console.log("Pleasant");
} else {
  console.log("Cold");
}

const sunny = true;
if (sunny && temperature > 20) {
  console.log("Beach day");
}

const label = temperature >= 18 ? "warm" : "cool";
console.log(label);

const day = "sat";
switch (day) {
  case "sat":
  case "sun":
    console.log("Weekend");
    break;
  default:
    console.log("Weekday");
}`,
        deep: "Falsy values: `false, 0, -0, 0n, '', null, undefined, NaN`. Everything else (including `[]` and `{}`) is truthy. Use `??` (nullish coalescing) instead of `||` for defaults when `0` or `''` are valid values: `count ?? 10`." },
      { id: 'loops', title: 'Loops', level: 'beginner',
        body: "Loops repeat code. The classic `for` loop has three parts: start; condition; step. `for...of` walks through the **values** of an array or string. `while` repeats as long as a condition is true.\n\n`break` exits a loop early; `continue` skips to the next iteration.",
        code: J`for (let i = 1; i <= 3; i++) {
  console.log("for loop, i =", i);
}

const fruits = ["apple", "banana", "cherry"];
for (const fruit of fruits) {
  console.log("I like", fruit);
}

let n = 3;
while (n > 0) {
  console.log("countdown", n);
  n--;
}

for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) continue;   // skip even numbers
  if (i > 7) break;            // stop completely
  console.log("odd:", i);
}`,
        deep: "`for...in` iterates over *keys* (including inherited enumerable ones) — use it for plain objects, never arrays. For arrays prefer `for...of`, or `entries()` when you need the index: `for (const [i, v] of arr.entries())`." },
      { id: 'func', title: 'Functions', level: 'beginner',
        body: "A function is a reusable block of code. Define it once, **call** it many times. Parameters receive input; `return` sends a result back.\n\n**Arrow functions** `(x) => x * 2` are a shorter syntax. Functions are values: you can store them in variables and pass them to other functions.",
        code: J`function greet(name = "friend") {      // default parameter
  return "Hello, " + name + "!";
}

const square = (x) => x * x;           // arrow function
const add = (a, b) => {
  const sum = a + b;
  return sum;
};

console.log(greet("Lin"), greet());
console.log(square(9), add(2, 3));

function applyTwice(fn, value) {       // a function taking a function
  return fn(fn(value));
}
console.log(applyTwice(square, 3));    // 81

function makeCounter() {               // closure
  let count = 0;
  return () => ++count;
}
const next = makeCounter();
console.log(next(), next(), next());`,
        deep: "A **closure** is a function plus the variables in scope where it was created — `makeCounter`'s `count` lives on after it returns. Arrow functions don't have their own `this` or `arguments`, which makes them ideal for callbacks but unsuitable as object methods that need `this`. Use rest parameters `(...args)` for variable arity." },
      { id: 'arrays', title: 'Arrays & objects', level: 'intermediate',
        body: "An **array** is an ordered list: `[1, 2, 3]`, indexed from 0. An **object** groups named properties: `{ name: 'Sam' }`.\n\n`map` transforms every item, `filter` keeps matching items, `reduce` combines items into one value. **Destructuring** pulls values out; the **spread** `...` copies them.",
        code: J`const nums = [5, 3, 8, 1];
nums.push(10);
console.log(nums.length, nums[0], nums.at(-1));

const doubled = nums.map(n => n * 2);
const big = nums.filter(n => n > 4);
const total = nums.reduce((sum, n) => sum + n, 0);
console.log(doubled, big, total);
console.log([...nums].sort((a, b) => a - b));

const user = { name: "Sam", age: 28, langs: ["JS", "Go"] };
user.email = "sam@example.com";
console.log(user.name, user["age"], Object.keys(user));

const { name, langs } = user;          // destructuring
console.log(name, langs);

const older = { ...user, age: 29 };    // copy with a change
console.log(older.age, user.age);`,
        deep: "Arrays and objects are passed **by reference**: assigning one to a new variable doesn't copy it. Spread makes a *shallow* copy; use `structuredClone(obj)` for a deep copy. `sort()` mutates and compares as strings by default (`[10, 9].sort()` → `[10, 9]`); always pass a comparator for numbers, or use non-mutating `toSorted()`." },
      { id: 'collections', title: 'Map, Set, JSON & optional chaining', level: 'intermediate',
        body: "`Map` is a key→value collection where keys can be any type. `Set` stores unique values. `JSON.stringify` turns data into text and `JSON.parse` turns it back.\n\nOptional chaining `?.` safely reads nested properties that might be missing; `??` provides a fallback for `null`/`undefined`.",
        code: J`const scores = new Map();
scores.set("ana", 90).set("ben", 72);
console.log(scores.get("ana"), scores.has("zoe"), scores.size);

const unique = new Set([1, 2, 2, 3, 3, 3]);
console.log([...unique]);

const json = JSON.stringify({ id: 1, tags: ["a", "b"] });
console.log(json);
console.log(JSON.parse(json).tags[1]);

const config = { theme: null };
console.log(config.user?.name ?? "anonymous");
console.log(config.theme ?? "dark");`,
        deep: "Prefer `Map` over plain objects for dynamic keys: it preserves insertion order, has `size`, accepts non-string keys and has no prototype keys to collide with. `WeakMap`/`WeakSet` hold keys weakly, letting cached data be garbage-collected." },
      { id: 'classes', title: 'Classes & objects', level: 'intermediate',
        body: "A **class** is a blueprint for objects. The `constructor` runs when you call `new`. Methods are functions that belong to the object; inside them `this` refers to the object.\n\n`extends` creates a subclass that inherits (and can override) behaviour. Fields starting with `#` are private.",
        code: J`class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return §§§{this.name} makes a sound.§§;
  }
}

class Dog extends Animal {
  #tricks = [];                 // private field
  learn(trick) {
    this.#tricks.push(trick);
    return this;                // allows chaining
  }
  speak() {
    return §§§{this.name} barks and knows §{this.#tricks.length} tricks.§§;
  }
}

const rex = new Dog("Rex").learn("sit").learn("roll over");
console.log(new Animal("Generic").speak());
console.log(rex.speak());
console.log(rex instanceof Animal);`,
        deep: "Classes are syntax over prototypes: methods live on `Dog.prototype`, shared by all instances. Use `static` for members on the class itself, and `get`/`set` for computed properties. Favour composition over deep inheritance hierarchies." },
      { id: 'errors', title: 'Error handling', level: 'intermediate',
        body: "When something goes wrong, JavaScript **throws** an error. Wrap risky code in `try { } catch (err) { }` to handle it instead of crashing. `finally` always runs.\n\nYou can throw your own errors with `throw new Error('message')`.",
        code: J`function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}

try {
  console.log(divide(10, 2));
  console.log(divide(1, 0));
  console.log("never printed");
} catch (err) {
  console.log("Caught:", err.message);
} finally {
  console.log("finally always runs");
}

// Remove the // below to see an uncaught error in the terminal:
// undefinedFunction();`,
        deep: "Create custom error classes (`class ValidationError extends Error {}`) to distinguish failure types, and use `cause`: `throw new Error('Save failed', { cause: err })`. Never write an empty `catch {}` — at minimum log the error." },
      { id: 'async', title: 'Asynchronous code: promises & async/await', level: 'advanced',
        body: "Some work (timers, network requests, files) finishes later. A **Promise** represents a future value. An `async` function can `await` a promise, pausing that function — without freezing the rest of the program.\n\nNotice the output order: the line after calling `brewCoffee()` runs before the coffee is ready.",
        code: J`const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function brewCoffee() {
  console.log("Boiling water…");
  await wait(300);
  console.log("Brewing…");
  await wait(300);
  return "Coffee ready!";
}

console.log("1. Start");
brewCoffee().then(result => console.log(result));
console.log("2. This runs before the coffee is ready");

Promise.all([wait(100).then(() => "a"), wait(50).then(() => "b")])
  .then(values => console.log("All done:", values));`,
        deep: "JavaScript is single-threaded with an **event loop**: synchronous code runs to completion, then microtasks (promise callbacks) run, then macrotasks (timers, I/O). `Promise.all` fails fast on the first rejection; `Promise.allSettled` waits for all. Always handle rejections with `try/catch` around `await` or `.catch()`." }
    ],
    // JavaScript best practices (the "Best practices" tab).
    tips: [
      'Use `const` by default, `let` only when the variable must be reassigned, and never `var`.',
      'Always compare with `===` and `!==`; `==` performs surprising type conversions.',
      'Name variables and functions in `camelCase`, classes in `PascalCase`, and true constants in `UPPER_SNAKE_CASE`. Names should say *what* something is (`userCount`, not `x`).',
      'Prefer template literals (backtick strings containing `${name}`) over string concatenation.',
      'Use `map`/`filter`/`reduce` to transform data, and keep functions small, focused and free of hidden side-effects.',
      'Don\'t mutate data you received: copy with spread (`{...obj}`, `[...arr]`) and change the copy.',
      'Always handle promise rejections (`try/catch` around `await`, or `.catch()`). Never leave an empty `catch` block.',
      'Use a linter (ESLint) and formatter (Prettier) in real projects, and write modules with `import`/`export` instead of globals.'
    ],
    // Common JavaScript beginner mistakes.
    pitfalls: [
      'Using `=` (assignment) when you meant `===` (comparison) inside an `if`.',
      'Calling `sort()` on numbers without a comparator: `[10, 2, 1].sort()` gives `[1, 10, 2]`.',
      'Forgetting `return` in a multi-line arrow function `x => { x * 2 }` — it returns `undefined`.',
      'Expecting `0.1 + 0.2 === 0.3` to be true (floating-point rounding). Compare with a tolerance or work in whole cents.',
      'Reading a property of `undefined` — check that data exists first, or use `?.`.'
    ]
  });

  /* ===================================================================== HTML & CSS */
  // HTML & CSS
  // Shown in the Preview frame instead of printing text. The visualizer
  // shows the page's element tree. Uses its own challenge list ('html')
  // and has no Program input box.
  LANGS.push({
    id: 'html', name: 'HTML & CSS', aka: 'web page website css', tag: '</>', color: '#e34f26', file: 'index.html', cmd: 'open index.html',
    kind: 'browser', engine: 'html', trace: 'dom', mode: 'htmlmixed', indent: 2, comment: ['<!--', '-->'], noStdin: true, chal: 'html',
    scaffold: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Challenge</title>\n</head>\n<body>\n{{COMMENT}}\n\n  <!-- Your code here -->\n\n</body>\n</html>\n',
    blurb: 'Build web pages: HTML gives structure, CSS adds style, and a sprinkle of JavaScript adds interactivity. See results live.',
    intro: '**HTML** (HyperText Markup Language) describes the *structure and meaning* of a page with tags like `<h1>` and `<p>`. **CSS** (Cascading Style Sheets) controls how it *looks*. Press Run and your page appears in the **Preview** tab; `console.log` from scripts shows in the Terminal tab.',
    docs: 'https://developer.mozilla.org/en-US/docs/Learn',
    keywords: ['div', 'span', 'section', 'header', 'footer', 'main', 'article', 'button', 'input', 'label', 'form', 'class', 'style', 'script', 'href', 'src', 'alt', 'display', 'flex', 'grid', 'color', 'background', 'margin', 'padding', 'border', 'width', 'height', 'font-size', 'font-family', 'justify-content', 'align-items', 'gap'],
    // The starter program shown the first time you open HTML & CSS.
    starter: R`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My first page</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #f4f6fb;
      display: grid;
      place-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: white;
      padding: 24px 32px;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    h1 { color: #3b5bdb; }
    button {
      background: #3b5bdb;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, web!</h1>
    <p>Edit the HTML and CSS, then press <strong>Run</strong>.</p>
    <button id="btn">Clicked 0 times</button>
  </div>

  <script>
    let clicks = 0;
    const btn = document.getElementById("btn");
    btn.addEventListener("click", () => {
      clicks++;
      btn.textContent = "Clicked " + clicks + " times";
      console.log("Button clicked", clicks);
    });
  </script>
</body>
</html>
`,
    // HTML & CSS syntax guide lessons, from beginner to advanced.
    sections: [
      { id: 'structure', title: 'Page structure, tags & attributes', level: 'beginner',
        body: "HTML is made of **elements** written as tags: `<p>` opens a paragraph and `</p>` closes it. Elements nest inside each other like boxes.\n\nEvery page has the same skeleton: `<!DOCTYPE html>`, then `<html>` containing `<head>` (information about the page) and `<body>` (what visitors see). **Attributes** add extra information inside the opening tag: `<html lang=\"en\">`.",
        code: R`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page title (shown in the tab)</title>
</head>
<body>
  <!-- Comments look like this and are not displayed -->
  <h1>My page</h1>
  <p>This paragraph is <em>inside</em> the body.</p>
</body>
</html>`,
        deep: "`<!DOCTYPE html>` switches the browser into standards mode — omit it and you get legacy \"quirks mode\" layout. The viewport meta tag is essential for mobile. Void elements like `<meta>`, `<img>` and `<br>` have no closing tag." },
      { id: 'text', title: 'Headings, paragraphs & text', level: 'beginner',
        body: "Headings go from `<h1>` (most important, one per page) to `<h6>`. Paragraphs use `<p>`. Use `<strong>` for important text and `<em>` for emphasis.\n\nHTML collapses extra spaces and line breaks in your source, so use separate elements (or `<br>` sparingly) to control layout.",
        code: R`<h1>The Solar System</h1>
<h2>Inner planets</h2>
<p>Mercury is the <strong>closest</strong> planet to the Sun.</p>
<p>Venus is <em>hotter</em> than Mercury,
   even though       it is further away.</p>
<h2>Outer planets</h2>
<p>Jupiter is huge.<br>It has at least 95 moons.</p>
<blockquote>"Space is big. Really big." — Douglas Adams</blockquote>
<p>Use <code>&lt;code&gt;</code> for code and <mark>mark</mark> to highlight.</p>`,
        deep: "Choose tags for *meaning*, not appearance — screen readers announce headings and emphasis, and search engines use them. Never skip heading levels for size; style with CSS instead. `<b>`/`<i>` are purely presentational alternatives to `<strong>`/`<em>`." },
      { id: 'links', title: 'Links & images', level: 'beginner',
        body: "`<a href=\"...\">` creates a link. `<img src=\"...\" alt=\"...\">` shows an image; the `alt` text describes it for people who can't see it and appears if the image fails to load.",
        code: R`<p>Visit <a href="https://developer.mozilla.org" target="_blank">MDN Web Docs</a>
   to learn more.</p>

<img src="https://picsum.photos/id/1025/300/200"
     alt="A pug wrapped in a blanket" width="300">

<p><a href="#bottom">Jump to the bottom of this page</a></p>
<p id="bottom">You made it to the bottom!</p>`,
        deep: "Links opened with `target=\"_blank\"` should get `rel=\"noopener\"` (modern browsers imply it). Always set `width`/`height` on images to avoid layout shift, use `loading=\"lazy\"` for below-the-fold images, and write `alt=\"\"` for purely decorative ones." },
      { id: 'lists', title: 'Lists & tables', level: 'beginner',
        body: "`<ul>` makes a bulleted list, `<ol>` a numbered one; each item is an `<li>`. Tables use `<table>`, with rows `<tr>`, header cells `<th>` and data cells `<td>`.",
        code: R`<h3>Shopping list</h3>
<ul>
  <li>Bread</li>
  <li>Milk</li>
  <li>Eggs</li>
</ul>

<h3>Steps</h3>
<ol>
  <li>Crack the eggs</li>
  <li>Whisk</li>
  <li>Cook</li>
</ol>

<table border="1" cellpadding="6">
  <tr><th>Language</th><th>Year</th></tr>
  <tr><td>HTML</td><td>1993</td></tr>
  <tr><td>CSS</td><td>1996</td></tr>
</table>`,
        deep: "Use tables only for tabular data, never for page layout. For accessibility add `<caption>`, wrap header rows in `<thead>` and give header cells `scope=\"col\"` or `scope=\"row\"`." },
      { id: 'forms', title: 'Forms & inputs', level: 'intermediate',
        body: "Forms collect input. Each `<input>` should have a `<label>` (connected via `for` and `id`). The `type` attribute changes the control: `text`, `email`, `number`, `checkbox`, `range`, `date`, and more.",
        code: R`<form onsubmit="event.preventDefault(); console.log('Hello, ' + this.name.value);">
  <p>
    <label for="name">Name</label><br>
    <input id="name" name="name" type="text" placeholder="Ada" required>
  </p>
  <p>
    <label for="age">Age</label><br>
    <input id="age" type="number" min="0" max="120" value="18">
  </p>
  <p>
    <label><input type="checkbox" checked> Subscribe</label>
  </p>
  <p>
    <label for="color">Favourite colour</label>
    <select id="color"><option>Red</option><option>Blue</option></select>
  </p>
  <button type="submit">Send</button>
</form>`,
        deep: "Built-in validation (`required`, `min`, `pattern`, `type=email`) gives free, accessible error messages — but always validate again on the server. Labels enlarge the click target and are read by screen readers; placeholders are not a substitute." },
      { id: 'semantic', title: 'Semantic layout elements', level: 'intermediate',
        body: "Instead of only `<div>`s, HTML5 has elements that describe their role: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>` and `<footer>`. They look the same as `<div>` but help accessibility and search engines.",
        code: R`<header>
  <h1>My Blog</h1>
  <nav><a href="#">Home</a> | <a href="#">About</a></nav>
</header>

<main>
  <article>
    <h2>Learning HTML</h2>
    <p>Semantic tags make pages easier to understand.</p>
  </article>
  <aside>Related: Learning CSS</aside>
</main>

<footer>© 2026 Me</footer>`,
        deep: "Screen-reader users jump between landmarks (`<main>`, `<nav>`…) — pages built from anonymous divs are much harder to navigate. Use `<button>` for actions and `<a>` for navigation; a clickable `<div>` isn't keyboard-accessible." },
      { id: 'css', title: 'CSS basics: selectors, colours & units', level: 'beginner',
        body: "A CSS **rule** has a **selector** (which elements) and **declarations** (`property: value;`). Select by tag (`p`), class (`.note`), or id (`#title`).\n\nColours can be names (`tomato`), hex (`#3b5bdb`) or `rgb()`. Sizes use units like `px`, `rem` (relative to root font size) and `%`.",
        code: R`<style>
  p { color: #333; font-size: 18px; }
  .note { background: lightyellow; padding: 8px; border-left: 4px solid gold; }
  #title { color: tomato; font-family: Georgia, serif; }
  a:hover { color: rebeccapurple; }        /* pseudo-class */
  li:nth-child(odd) { background: #eef; }
</style>

<h1 id="title">Styled with CSS</h1>
<p>A plain paragraph.</p>
<p class="note">A paragraph with the class "note".</p>
<a href="#">Hover over me</a>
<ul><li>One</li><li>Two</li><li>Three</li></ul>`,
        deep: "When rules conflict, the browser uses the **cascade**: importance, then **specificity** (id > class > tag), then source order. Prefer classes over ids for styling, keep specificity low, and avoid `!important`. Use `rem` for font sizes so users' browser settings are respected." },
      { id: 'box', title: 'The box model', level: 'intermediate',
        body: "Every element is a box: **content**, then **padding** (space inside the border), the **border**, and **margin** (space outside). Set `box-sizing: border-box` so `width` includes padding and border — much easier to reason about.",
        code: R`<style>
  * { box-sizing: border-box; }
  .box {
    width: 220px;
    padding: 20px;
    border: 6px solid #3b5bdb;
    margin: 24px;
    background: #dbe4ff;
  }
  .inline { display: inline-block; width: 120px; }
</style>

<div class="box">width 220 = content + padding + border</div>
<div class="box inline">inline-block</div>
<div class="box inline">sits next to it</div>`,
        deep: "Vertical margins between block elements **collapse** (the larger wins). Inspect any element with your browser DevTools to see its box model. `display` controls flow: `block`, `inline`, `inline-block`, `flex`, `grid`, `none`." },
      { id: 'flex', title: 'Layout with Flexbox & Grid', level: 'intermediate',
        body: "**Flexbox** lays items out in one direction (a row or a column): `display: flex` on the parent, then `justify-content` (main axis) and `align-items` (cross axis). `gap` adds space between items.\n\n**Grid** lays items out in rows *and* columns.",
        code: R`<style>
  .row { display: flex; gap: 12px; justify-content: center; align-items: center; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 16px; }
  .item { background: #3b5bdb; color: white; padding: 16px; border-radius: 8px; text-align: center; }
  .tall { height: 90px; }
</style>

<div class="row">
  <div class="item">One</div>
  <div class="item tall">Two (tall)</div>
  <div class="item">Three</div>
</div>

<div class="grid">
  <div class="item">A</div><div class="item">B</div><div class="item">C</div>
  <div class="item" style="grid-column: span 2">D spans 2</div><div class="item">E</div>
</div>`,
        deep: "Use flexbox for components in one dimension (nav bars, toolbars, centring) and grid for two-dimensional page layouts. `flex: 1` makes items share free space; `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` creates a responsive card grid with no media queries." },
      { id: 'js', title: 'JavaScript in the page (DOM & events)', level: 'intermediate',
        body: "A `<script>` can find elements with `document.querySelector()` and change them. **Events** like `click` or `input` let your page react to the user. Put scripts at the end of `<body>` so the elements exist when the script runs.",
        code: R`<input id="name" placeholder="Type your name">
<p id="out">Hello, stranger!</p>
<button id="dark">Toggle dark mode</button>

<script>
  const input = document.querySelector("#name");
  const out = document.querySelector("#out");

  input.addEventListener("input", () => {
    out.textContent = "Hello, " + (input.value || "stranger") + "!";
  });

  document.querySelector("#dark").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    console.log("dark mode:", document.body.classList.contains("dark"));
  });
</script>
<style>
  .dark { background: #222; color: #eee; }
</style>`,
        deep: "Use `textContent` (not `innerHTML`) for user-provided text to avoid XSS injection. Toggle CSS classes rather than setting inline styles. For many similar elements, use **event delegation**: one listener on a parent checking `event.target.closest(...)`." },
      { id: 'responsive', title: 'Responsive design & CSS variables', level: 'advanced',
        body: "**Media queries** apply CSS only when a condition matches, such as a narrow screen. **Custom properties** (CSS variables) like `--brand` let you reuse values and theme a whole page from one place.",
        code: R`<style>
  :root { --brand: #0f9d6b; --space: 16px; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space); }
  .card { border: 2px solid var(--brand); border-radius: 10px; padding: var(--space); }
  h2 { color: var(--brand); }

  @media (max-width: 600px) {
    .cards { grid-template-columns: 1fr; }   /* stack on small screens */
    :root { --brand: #d6293e; }
  }
</style>

<h2>Resize the preview panel narrower than 600px</h2>
<div class="cards">
  <div class="card">One</div><div class="card">Two</div><div class="card">Three</div>
</div>`,
        deep: "Design mobile-first: write the small-screen styles as the default and add `min-width` media queries for larger screens. Prefer intrinsic layouts (`minmax`, `clamp()`, `flex-wrap`) that adapt without breakpoints. `prefers-color-scheme` and `prefers-reduced-motion` respect user settings." }
    ],
    // HTML & CSS best practices (the "Best practices" tab).
    tips: [
      'Use semantic elements (`header`, `nav`, `main`, `button`) — they give accessibility for free.',
      'Every `<img>` needs `alt` text; every form field needs a `<label>`.',
      'Keep structure (HTML), presentation (CSS) and behaviour (JS) separate. Avoid inline `style=` attributes in real projects.',
      'Style with classes, keep selector specificity low, and avoid `!important`.',
      'Set `* { box-sizing: border-box; }` and use flexbox/grid with `gap` for layout instead of floats or tables.',
      'Name classes by purpose (`.error-message`) rather than appearance (`.red-text`).',
      'Check colour contrast and test with the keyboard only (Tab / Enter) — can you use the page?',
      'Validate your HTML (validator.w3.org) and indent nested elements consistently.'
    ],
    // Common HTML & CSS beginner mistakes.
    pitfalls: [
      'Forgetting to close a tag, which makes the rest of the page nest inside it.',
      'Using an `id` more than once — ids must be unique on a page.',
      'Running a script in `<head>` before the elements it looks for exist (it gets `null`).',
      'Using headings for their size instead of their meaning.',
      'Forgetting the semicolon between CSS declarations, which silently breaks the next one.'
    ]
  });

  /* ===================================================================== SQL */
  // SQL
  // Runs on a real SQLite database inside your browser (sql.js). The
  // visualizer shows every table after each statement. Uses its own
  // challenge list ('sql').
  LANGS.push({
    id: 'sql', name: 'SQL', aka: 'sqlite database query', tag: 'SQL', color: '#336791', file: 'query.sql', cmd: 'sqlite3 < query.sql',
    kind: 'browser', engine: 'sql', trace: 'sql', mode: 'text/x-sqlite', indent: 2, comment: ['--'], noStdin: true, chal: 'sql',
    scaffold: '{{COMMENT}}\n\n',
    blurb: 'Ask questions of data. SQL is how almost every app stores and queries information. Uses a real SQLite database in your browser.',
    intro: 'SQL (Structured Query Language) is used to create, change and query relational databases: data stored in **tables** of rows and columns. This page runs a real **SQLite** database in your browser; it starts empty on every run, so each example creates its own tables. Turn on the Visualizer to see every table change statement by statement.',
    docs: 'https://www.sqlite.org/lang.html',
    keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'NOT', 'NULL', 'INTEGER', 'TEXT', 'REAL', 'ORDER', 'BY', 'GROUP', 'HAVING', 'JOIN', 'LEFT', 'INNER', 'ON', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'LIMIT', 'LIKE', 'BETWEEN', 'UNIQUE', 'DEFAULT', 'WITH'],
    // The starter program shown the first time you open SQL.
    starter: R`-- Welcome to SQL (SQLite)! Each statement ends with a semicolon.
-- Turn on the 👁 Visualizer to watch the tables change, statement by statement.

CREATE TABLE students (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,
  grade INTEGER
);

INSERT INTO students (name, grade) VALUES
  ('Ada', 92),
  ('Linus', 78),
  ('Grace', 88),
  ('Alan', 65);

SELECT name, grade
FROM students
WHERE grade >= 70
ORDER BY grade DESC;

UPDATE students SET grade = grade + 5 WHERE name = 'Alan';

SELECT COUNT(*) AS students, ROUND(AVG(grade), 1) AS average
FROM students;
`,
    // SQL syntax guide lessons, from beginner to advanced.
    sections: [
      { id: 'select', title: 'SELECT: reading data', level: 'beginner',
        body: "`SELECT` chooses columns, `FROM` names the table. `*` means \"all columns\". You can compute new columns and rename them with `AS`.\n\nSQL keywords are case-insensitive, but writing them in CAPITALS makes queries easier to read. Statements end with `;`.",
        code: R`CREATE TABLE pets (name TEXT, species TEXT, age INTEGER);
INSERT INTO pets VALUES ('Rex', 'dog', 3), ('Tom', 'cat', 5), ('Nemo', 'fish', 1);

SELECT * FROM pets;
SELECT name, age FROM pets;
SELECT name, age * 7 AS dog_years FROM pets;
SELECT DISTINCT species FROM pets;`,
        deep: "Avoid `SELECT *` in application code: name the columns you need so schema changes don't break you and less data is transferred. Column aliases (`AS`) can't be used in `WHERE` in standard SQL because `WHERE` is evaluated before `SELECT`." },
      { id: 'where', title: 'WHERE, ORDER BY & LIMIT', level: 'beginner',
        body: "`WHERE` keeps only rows matching a condition. Combine conditions with `AND`/`OR`. Useful operators: `=`, `<>` (not equal), `<`, `>=`, `BETWEEN`, `IN (...)`, `LIKE` (with `%` wildcard) and `IS NULL`.\n\n`ORDER BY` sorts (`ASC` or `DESC`); `LIMIT` caps the number of rows.",
        code: R`CREATE TABLE books (title TEXT, author TEXT, year INTEGER, rating REAL);
INSERT INTO books VALUES
  ('Dune', 'Herbert', 1965, 4.3), ('Neuromancer', 'Gibson', 1984, 3.9),
  ('Foundation', 'Asimov', 1951, 4.2), ('Hyperion', 'Simmons', 1989, 4.3),
  ('I, Robot', 'Asimov', 1950, 4.0);

SELECT title, year FROM books WHERE year < 1970 ORDER BY year;
SELECT title FROM books WHERE author = 'Asimov' AND rating >= 4.1;
SELECT title FROM books WHERE title LIKE '%o%' ORDER BY title;
SELECT title, rating FROM books ORDER BY rating DESC, title LIMIT 3;
SELECT title FROM books WHERE year BETWEEN 1980 AND 1990;`,
        deep: "`NULL` means *unknown*, so `col = NULL` is never true — use `IS NULL`. Text comparisons in SQLite are case-sensitive for `=` but `LIKE` is case-insensitive for ASCII. Without `ORDER BY`, row order is **not guaranteed**." },
      { id: 'create', title: 'CREATE TABLE & INSERT', level: 'beginner',
        body: "`CREATE TABLE` defines a table's columns and their types (`INTEGER`, `TEXT`, `REAL`, ...). **Constraints** protect your data: `PRIMARY KEY` (unique row id), `NOT NULL`, `UNIQUE`, `DEFAULT`, `CHECK`.\n\n`INSERT INTO ... VALUES` adds rows. Text values go in **single** quotes.",
        code: R`CREATE TABLE users (
  id       INTEGER PRIMARY KEY,          -- auto-numbered
  username TEXT NOT NULL UNIQUE,
  email    TEXT,
  age      INTEGER CHECK (age >= 0),
  active   INTEGER DEFAULT 1
);

INSERT INTO users (username, email, age) VALUES ('ada', 'ada@example.com', 36);
INSERT INTO users (username, age) VALUES ('linus', 54), ('grace', 85);

SELECT * FROM users;

-- This would fail: username must be unique
-- INSERT INTO users (username) VALUES ('ada');`,
        deep: "In SQLite an `INTEGER PRIMARY KEY` is an alias for the internal `rowid` and auto-increments. SQLite uses dynamic typing with *type affinity*; most other databases are strict. Add `STRICT` after the closing parenthesis in modern SQLite to enforce types." },
      { id: 'update', title: 'UPDATE & DELETE', level: 'beginner',
        body: "`UPDATE ... SET ... WHERE` changes existing rows; `DELETE FROM ... WHERE` removes them.\n\n**Always** include a `WHERE` clause unless you really mean every row — otherwise you'll change or delete the whole table!",
        code: R`CREATE TABLE stock (item TEXT, qty INTEGER, price REAL);
INSERT INTO stock VALUES ('apple', 50, 0.5), ('pear', 0, 0.8), ('plum', 12, 1.2);

UPDATE stock SET price = price * 1.1 WHERE item = 'plum';
UPDATE stock SET qty = qty - 5 WHERE item = 'apple';
DELETE FROM stock WHERE qty = 0;

SELECT item, qty, ROUND(price, 2) AS price FROM stock;`,
        deep: "Before running a destructive statement on real data, run the same `WHERE` as a `SELECT` to preview affected rows, and wrap the change in a transaction so you can `ROLLBACK`." },
      { id: 'agg', title: 'Aggregates, GROUP BY & HAVING', level: 'intermediate',
        body: "**Aggregate functions** summarise many rows into one value: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`. `GROUP BY` computes them per group. `HAVING` filters groups (whereas `WHERE` filters rows before grouping).",
        code: R`CREATE TABLE sales (region TEXT, rep TEXT, amount INTEGER);
INSERT INTO sales VALUES
  ('North', 'Ann', 300), ('North', 'Bob', 150), ('South', 'Cid', 500),
  ('South', 'Dee', 120), ('South', 'Cid', 80), ('East', 'Eve', 90);

SELECT COUNT(*) AS n, SUM(amount) AS total, MAX(amount) AS biggest FROM sales;

SELECT region, COUNT(*) AS deals, SUM(amount) AS total
FROM sales
GROUP BY region
ORDER BY total DESC;

SELECT rep, SUM(amount) AS total
FROM sales
GROUP BY rep
HAVING SUM(amount) > 200;`,
        deep: "Every selected column must be either inside an aggregate or listed in `GROUP BY` (SQLite is lenient here, but other databases will error). `COUNT(col)` skips NULLs, `COUNT(*)` counts rows. Logical order of evaluation: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT." },
      { id: 'join', title: 'JOINs: combining tables', level: 'intermediate',
        body: "Real databases split data across tables linked by **keys** (e.g. `orders.customer_id` → `customers.id`). A `JOIN` combines matching rows.\n\n`INNER JOIN` keeps only matches; `LEFT JOIN` keeps every row from the left table, filling `NULL` where there is no match.",
        code: R`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, total REAL,
                     FOREIGN KEY (customer_id) REFERENCES customers(id));
INSERT INTO customers VALUES (1, 'Ada'), (2, 'Linus'), (3, 'Grace');
INSERT INTO orders VALUES (10, 1, 25.0), (11, 1, 40.0), (12, 2, 15.5);

SELECT o.id, c.name, o.total
FROM orders AS o
INNER JOIN customers AS c ON c.id = o.customer_id;

SELECT c.name, COUNT(o.id) AS orders, COALESCE(SUM(o.total), 0) AS spent
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.id
ORDER BY spent DESC;`,
        deep: "Splitting data so each fact is stored once is called **normalisation**. Always index foreign-key columns used in joins. A missing `ON` condition produces a *Cartesian product* (every row × every row) — a classic performance disaster." },
      { id: 'sub', title: 'Subqueries & CTEs (WITH)', level: 'advanced',
        body: "A **subquery** is a query inside another query. A **CTE** (`WITH name AS (...)`) names a subquery so complex queries read top-to-bottom like steps.",
        code: R`CREATE TABLE emp (name TEXT, dept TEXT, salary INTEGER);
INSERT INTO emp VALUES ('A','eng',120), ('B','eng',100), ('C','ops',70),
                       ('D','ops',90), ('E','eng',95);

-- people earning more than the overall average
SELECT name, salary FROM emp
WHERE salary > (SELECT AVG(salary) FROM emp);

-- the same idea per department, using a CTE
WITH dept_avg AS (
  SELECT dept, AVG(salary) AS avg_salary FROM emp GROUP BY dept
)
SELECT e.name, e.dept, e.salary, ROUND(d.avg_salary, 1) AS dept_avg
FROM emp e JOIN dept_avg d ON d.dept = e.dept
WHERE e.salary > d.avg_salary;`,
        deep: "`WITH RECURSIVE` can walk hierarchies (org charts, category trees) or generate series. `EXISTS (subquery)` is often clearer and faster than `IN` for correlated checks." },
      { id: 'window', title: 'Window functions', level: 'advanced',
        body: "Window functions compute values across related rows **without** collapsing them like `GROUP BY` does: rankings, running totals, comparisons with the previous row. The `OVER (...)` clause defines the window.",
        code: R`CREATE TABLE scores (player TEXT, game INTEGER, points INTEGER);
INSERT INTO scores VALUES ('ann',1,10), ('ann',2,25), ('ann',3,5),
                          ('bob',1,30), ('bob',2,15), ('bob',3,20);

SELECT player, game, points,
       SUM(points) OVER (PARTITION BY player ORDER BY game) AS running_total,
       RANK() OVER (ORDER BY points DESC) AS overall_rank,
       points - LAG(points) OVER (PARTITION BY player ORDER BY game) AS change
FROM scores
ORDER BY player, game;`,
        deep: "Useful window functions: `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`/`LEAD`, `FIRST_VALUE`, `NTILE`. \"Top N per group\" is a classic pattern: `ROW_NUMBER() OVER (PARTITION BY g ORDER BY x DESC)` in a CTE, then filter `WHERE rn <= N`." },
      { id: 'tx', title: 'Transactions, indexes & views', level: 'advanced',
        body: "A **transaction** groups statements so they all succeed or all fail (`BEGIN` … `COMMIT`, or `ROLLBACK` to undo). An **index** speeds up lookups on a column. A **view** is a saved query you can select from like a table.",
        code: R`CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER);
INSERT INTO accounts VALUES ('alice', 100), ('bob', 50);

BEGIN;
UPDATE accounts SET balance = balance - 30 WHERE name = 'alice';
UPDATE accounts SET balance = balance + 30 WHERE name = 'bob';
COMMIT;

BEGIN;
DELETE FROM accounts;          -- oops!
ROLLBACK;                      -- undone

CREATE INDEX idx_balance ON accounts(balance);
CREATE VIEW rich AS SELECT name FROM accounts WHERE balance > 60;

SELECT * FROM accounts;
SELECT * FROM rich;`,
        deep: "Transactions provide ACID guarantees (Atomicity, Consistency, Isolation, Durability). Indexes speed up reads but slow down writes and use space — index columns used in `WHERE`, `JOIN` and `ORDER BY`. Use `EXPLAIN QUERY PLAN` to see whether an index is used. In application code always use **parameterised queries** to prevent SQL injection." }
    ],
    // SQL best practices (the "Best practices" tab).
    tips: [
      'Write SQL keywords in UPPERCASE and table/column names in lowercase `snake_case`; put each clause (SELECT, FROM, WHERE…) on its own line.',
      'Name the columns you need instead of `SELECT *` in real applications.',
      'Always run the `WHERE` clause as a `SELECT` before an `UPDATE` or `DELETE`, and use transactions for multi-step changes.',
      'Give every table a primary key and use constraints (`NOT NULL`, `UNIQUE`, `FOREIGN KEY`, `CHECK`) to keep bad data out.',
      'Use table aliases (`FROM orders AS o`) in joins and prefix columns with them for clarity.',
      'Never build SQL by concatenating user input — use parameterised queries / prepared statements to prevent SQL injection.',
      'Index columns used for joins and filters, and check with `EXPLAIN QUERY PLAN`.',
      'Store each fact once (normalise), and use `DATE`/ISO-8601 text for dates.'
    ],
    // Common SQL beginner mistakes.
    pitfalls: [
      'Using double quotes for text. In SQL, `\'text\'` is a string and `"name"` is an identifier.',
      'Comparing with `= NULL` instead of `IS NULL`.',
      'Forgetting `WHERE` on an `UPDATE`/`DELETE` and changing every row.',
      'Putting an aggregate condition in `WHERE` instead of `HAVING`.',
      'Leaving a trailing comma before `FROM` or the closing parenthesis.'
    ]
  });
})();
