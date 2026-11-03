/* Plain-English explanations for common error messages. */
(function () {
  'use strict';
  const H = {
    javascript: [
      [/(\w+) is not defined/, 'JavaScript doesn\'t know the name <code>$1</code>. Check the spelling (capital letters matter), or make sure you created it with <code>let</code> or <code>const</code> <i>before</i> using it.'],
      [/(.+) is not a function/, 'You tried to call <code>$1</code> like a function, but it isn\'t one. Check the name for typos and that you aren\'t calling a number, string or <code>undefined</code> by mistake.'],
      [/Cannot read propert(?:y|ies) of (undefined|null)(?: \(reading '(.+?)'\))?/, 'You asked for something inside a value that is <code>$1</code> (i.e. "nothing"). Whatever is to the left of the dot didn\'t exist. Print it with <code>console.log</code> to see what it really is, or use optional chaining: <code>obj?.$2</code>.'],
      [/Assignment to constant variable/, 'A variable made with <code>const</code> can\'t be given a new value. Use <code>let</code> if the value needs to change.'],
      [/Identifier '(\w+)' has already been declared/, 'You declared <code>$1</code> twice in the same place. Pick a different name, or remove the second <code>let</code>/<code>const</code>.'],
      [/Unexpected end of input|Unexpected token '?\}'?/, 'Brackets or braces don\'t match up — you probably have a <code>{</code>, <code>(</code> or <code>[</code> that is never closed (or one closed too many).'],
      [/Unexpected token|Unexpected identifier|Unexpected character/, 'The computer found something it didn\'t expect, usually a typo, a missing comma/operator, or a missing closing quote or bracket on this line or the one just above it.'],
      [/before initialization/, 'You used a <code>let</code>/<code>const</code> variable before the line that creates it. Move the declaration above where it is used.'],
      [/Maximum call stack|Too much recursion/, 'A function keeps calling itself without ever stopping. Make sure recursion has a <b>base case</b> that returns without another call.'],
      [/Invalid array length/, 'You tried to create an array with a negative or huge length.'],
      [/await/i, '<code>await</code> can only be used inside an <code>async</code> function. Wrap the code: <code>async function main() { … } main();</code>'],
      [/Timeout/, 'Your program ran too long and was stopped. Look for a loop whose condition never becomes false.']
    ],
    python: [
      [/NameError: name '(\w+)' is not defined/, 'Python doesn\'t know the name <code>$1</code>. Check spelling (case matters) and that you assigned it <i>before</i> using it. Strings need quotes: <code>"$1"</code>.'],
      [/IndentationError: expected an indented block/, 'After a line ending in <code>:</code> (like <code>if</code>, <code>for</code>, <code>def</code>) the next line must be indented (4 spaces).'],
      [/IndentationError|unindent does not match/, 'Python uses indentation to group code. Make sure lines in the same block start with exactly the same number of spaces.'],
      [/SyntaxError: (invalid syntax|expected ':')/, 'Python can\'t read this line. Common causes: a missing <code>:</code> at the end of <code>if/for/while/def</code>, a missing bracket/quote, or using <code>=</code> where <code>==</code> is meant.'],
      [/SyntaxError: unterminated string|EOL while scanning/, 'A string is missing its closing quote.'],
      [/SyntaxError: '\(' was never closed|was never closed|unmatched/, 'A bracket was opened but never closed (or closed without being opened). Count your <code>(</code> <code>[</code> <code>{</code>.'],
      [/TypeError: can only concatenate str/, 'You tried to add text and a number. Convert the number with <code>str(n)</code>, or use an f-string: <code>f"Total: {n}"</code>.'],
      [/TypeError: unsupported operand/, 'You mixed types that can\'t be combined with that operator (e.g. number + text). <code>input()</code> always returns text — wrap it in <code>int()</code> or <code>float()</code>.'],
      [/TypeError: '(\w+)' object is not (callable|subscriptable|iterable)/, 'You used a <code>$1</code> in a way it doesn\'t support (calling it with <code>()</code>, indexing it with <code>[]</code>, or looping over it). Print <code>type(value)</code> to check what it is.'],
      [/TypeError: (\w+)\(\) takes (\d+) positional argument/, 'The function <code>$1</code> was called with the wrong number of arguments. Check the definition.'],
      [/ZeroDivisionError/, 'You divided by zero, which is mathematically undefined. Check the divisor before dividing.'],
      [/IndexError/, 'You asked for a position in a list that doesn\'t exist. Lists start at <code>0</code>, so a list of 3 items has indexes 0, 1, 2.'],
      [/KeyError: (.+)/, 'The dictionary has no key <code>$1</code>. Use <code>d.get(key)</code> for a safe lookup, or check <code>key in d</code> first.'],
      [/ValueError: invalid literal for int/, 'You tried to turn text that isn\'t a whole number into an <code>int</code>.'],
      [/AttributeError: '(\w+)' object has no attribute '(\w+)'/, 'A <code>$1</code> has no attribute/method called <code>$2</code>. Check for typos, or whether the value is the type you think it is.'],
      [/ModuleNotFoundError|ImportError/, 'That module isn\'t available in this browser-based Python. Most of the standard library works (math, random, json, datetime, collections…), but not all third-party packages.'],
      [/RecursionError/, 'A function called itself too many times. Add or fix the base case.'],
      [/EOFError/, 'The program called <code>input()</code> but there was no input. Type some lines in the <b>Program input</b> box under the terminal (one per <code>input()</code> call).'],
      [/Timeout/, 'Your program ran too long and was stopped. Look for a <code>while</code> loop whose condition never becomes false.']
    ],
    lua: [
      [/attempt to call a nil value \((global|field|method|local) '?(\w+)'?\)/, 'You called <code>$2</code> as a function, but it is <code>nil</code> (doesn\'t exist). Check the spelling or define the function before calling it.'],
      [/attempt to index a nil value/, 'You used <code>.</code> or <code>[]</code> on something that is <code>nil</code>. The table/variable on the left doesn\'t exist — print it to check.'],
      [/attempt to perform arithmetic on a nil value/, 'You did maths with a variable that has no value (<code>nil</code>). It was probably misspelled or never assigned.'],
      [/attempt to concatenate a (nil|table|boolean) value/, 'The <code>..</code> operator joins strings/numbers. One side is <code>$1</code> — use <code>tostring()</code> first.'],
      [/attempt to compare/, 'You compared two different types (e.g. number and string). Convert one first with <code>tonumber()</code> or <code>tostring()</code>.'],
      [/'=' expected near|unexpected symbol near/, 'Lua can\'t understand this line. Typical causes: a typo, a missing <code>then</code>/<code>do</code>/<code>end</code>, or using <code>!=</code> (Lua uses <code>~=</code>).'],
      [/'end' expected|<eof> expected near/, 'Every <code>if</code>, <code>for</code>, <code>while</code> and <code>function</code> needs its own matching <code>end</code>.'],
      [/Timeout/, 'Your program ran too long and was stopped. Look for a loop that never ends.']
    ],
    sql: [
      [/no such table: (\w+)/, 'There is no table named <code>$1</code>. Create it first with <code>CREATE TABLE</code>, or check the spelling.'],
      [/no such column: ([\w.]+)/, 'The column <code>$1</code> doesn\'t exist in that table. Check the column names (and that you spelled string values with quotes).'],
      [/near "(.+?)": syntax error/, 'SQL can\'t understand the query near <code>$1</code>. Look for a missing comma, a missing keyword, an extra comma before <code>FROM</code>, or a misspelled keyword.'],
      [/UNIQUE constraint failed: (.+)/, 'You tried to insert a duplicate value into <code>$1</code>, which must be unique (e.g. a primary key).'],
      [/NOT NULL constraint failed: (.+)/, 'The column <code>$1</code> is required but you gave it no value.'],
      [/table (\w+) already exists/, 'Table <code>$1</code> already exists. Use <code>CREATE TABLE IF NOT EXISTS</code> or <code>DROP TABLE</code> first.'],
      [/has \d+ columns but \d+ values|values for \d+ columns/, 'The number of values in <code>INSERT</code> doesn\'t match the number of columns.'],
      [/ambiguous column name: (\w+)/, 'More than one table has a column <code>$1</code>. Prefix it with the table name, like <code>students.$1</code>.'],
      [/FOREIGN KEY constraint/, 'A foreign key points at a row that doesn\'t exist.']
    ],
    html: [
      [/Unexpected token|SyntaxError/, 'The JavaScript inside your page has a typo. Check quotes and brackets near the reported line.'],
      [/is not defined/, 'The script used a name that doesn\'t exist. Check spelling, or make sure the script runs after the element it needs (put <code>&lt;script&gt;</code> at the end of <code>&lt;body&gt;</code>).'],
      [/Cannot read propert/, 'The script tried to use an element that wasn\'t found (e.g. a wrong <code>id</code>). Make sure <code>getElementById("…")</code> matches an <code>id</code> in your HTML.']
    ],
    c: [
      [/expected (?:['‘`]?,['’`]? or )?['‘`]?;['’`]? (before|after)/, 'A semicolon <code>;</code> is missing at the end of a statement — usually on the line <i>above</i> the one reported.'],
      [/['‘`](\w+)['’`] undeclared|use of undeclared identifier ['‘`](\w+)/, 'The name <code>$1$2</code> hasn\'t been declared. Declare the variable with its type first (e.g. <code>int x;</code>), check spelling, or <code>#include</code> the right header.'],
      [/implicit declaration of function ['‘`](\w+)/, 'You called <code>$1</code> but the compiler hasn\'t seen it. Add the matching <code>#include</code> (e.g. <code>&lt;stdio.h&gt;</code> for printf, <code>&lt;string.h&gt;</code> for strlen) or define the function above <code>main</code>.'],
      [/undefined reference to/, 'The code compiled but the linker can\'t find a function\'s body. Did you declare a function but never define it?'],
      [/Segmentation fault|SIGSEGV|signal 11|Segmentation/i, 'A <b>segmentation fault</b> means the program touched memory it doesn\'t own — commonly an array index out of range, a <code>NULL</code> pointer, or using memory after <code>free()</code>.'],
      [/format ['‘`]%\w+['’`] expects/, 'The <code>printf</code> format code (<code>%d</code>, <code>%s</code>, <code>%f</code>…) doesn\'t match the type of the value you gave it.'],
      [/control reaches end of non-void|no return statement/, 'A function that promises to return a value reaches its end without a <code>return</code>.'],
      [/expected declaration or statement|expected expression|expected ['‘`]\)['’`]/, 'The compiler found something that doesn\'t fit the grammar. Look for unbalanced <code>()</code> / <code>{}</code> or a typo on this line or just above.'],
      [/Aborted|SIGABRT|double free|free\(\)/, 'The program aborted, often because of invalid memory use such as freeing memory twice.']
    ],
    cpp: [
      [/was not declared in this scope|not declared|undeclared identifier/, 'The compiler doesn\'t know this name. Declare it first, check spelling, and make sure you <code>#include</code> the right header (e.g. <code>&lt;vector&gt;</code>, <code>&lt;string&gt;</code>) and use <code>std::</code> or <code>using namespace std;</code>.'],
      [/expected (?:['‘`]?,['’`]? or )?['‘`]?;['’`]? (before|after)/, 'A semicolon <code>;</code> is missing — usually on the line <i>above</i> the one reported.'],
      [/no match for ['‘`]operator|invalid operands/, 'You used an operator on types that don\'t support it (e.g. adding a <code>std::string</code> to an <code>int</code>).'],
      [/no matching function for call/, 'The arguments you passed don\'t match any version of that function. Check the number and types of arguments.'],
      [/undefined reference to/, 'The linker can\'t find a function\'s body — declared but never defined?'],
      [/Segmentation fault|SIGSEGV|signal 11/i, 'Segmentation fault: the program touched invalid memory (bad pointer, array out of bounds, dangling reference).'],
      [/terminate called after throwing an instance of ['‘`]?([\w:]+)/, 'An exception of type <code>$1</code> was thrown and nothing caught it. Wrap the risky code in <code>try { } catch (…) { }</code>.'],
      [/invalid conversion from/, 'You assigned a value of one type to a variable of an incompatible type. Convert it explicitly or use the right type.']
    ],
    java: [
      [/cannot find symbol/, 'Java doesn\'t recognise a name. Check spelling and capitalisation (Java is case-sensitive), that the variable is declared in scope, and that you <code>import</code> the class (e.g. <code>java.util.*</code>).'],
      [/['‘`]?;['’`]? expected/, 'A semicolon <code>;</code> is missing, usually at the end of the line above.'],
      [/incompatible types: (.+)/, 'You\'re putting one kind of value into another kind of variable: <code>$1</code>. Use a cast, a conversion method (e.g. <code>Integer.parseInt</code>), or the right variable type.'],
      [/missing return statement/, 'A method that declares a return type has a path that ends without <code>return</code>.'],
      [/class (\w+) is public, should be declared in a file named/, 'Name your public class <code>Main</code> here.'],
      [/NullPointerException/, 'You used an object variable that is <code>null</code> (points to nothing). Make sure it was assigned with <code>new …</code> before calling methods on it.'],
      [/ArrayIndexOutOfBoundsException|IndexOutOfBoundsException/, 'You accessed a position that doesn\'t exist. Valid indexes go from <code>0</code> to <code>length - 1</code>.'],
      [/ArithmeticException: \/ by zero/, 'Integer division by zero.'],
      [/NumberFormatException/, 'You tried to convert text that isn\'t a valid number.'],
      [/ClassCastException/, 'You cast an object to a type it isn\'t.'],
      [/StackOverflowError/, 'A method kept calling itself without a base case.'],
      [/non-static .* cannot be referenced from a static context/, '<code>main</code> is <code>static</code>, so it can only use other static members directly, or create an object first (<code>new MyClass()</code>).'],
      [/unreported exception/, 'This code can throw a checked exception. Handle it with <code>try/catch</code> or declare <code>throws</code>.'],
      [/might not have been initialized/, 'You read a local variable before giving it a value.']
    ],
    csharp: [
      [/CS1002|; expected/, 'A semicolon <code>;</code> is missing (look at the end of the line above).'],
      [/CS0103|does not exist in the current context/, 'That name doesn\'t exist here. Check spelling/capitalisation, that it is declared in scope, and the <code>using</code> directives at the top.'],
      [/CS0029|Cannot implicitly convert type/, 'You\'re assigning one type to another without conversion. Use a cast like <code>(int)x</code> or <code>Convert.ToInt32(...)</code>.'],
      [/CS0161|not all code paths return a value/, 'A method with a return type has a path with no <code>return</code>.'],
      [/CS0165|unassigned local variable/, 'You used a variable before giving it a value.'],
      [/CS0246|could not be found/, 'The type or namespace isn\'t known. Add the right <code>using</code> directive.'],
      [/NullReferenceException/, 'An object variable is <code>null</code>. Create it with <code>new</code> before using it.'],
      [/IndexOutOfRangeException|ArgumentOutOfRangeException/, 'You accessed an index that doesn\'t exist. Valid indexes are 0 to Length-1.'],
      [/DivideByZeroException/, 'Integer division by zero.'],
      [/FormatException/, 'The text isn\'t in the right format for that conversion.'],
      [/InvalidCastException/, 'You cast an object to a type it isn\'t.']
    ],
    rust: [
      [/E0382|borrow of moved value|use of moved value/, 'Rust\'s <b>ownership</b> rule: a value can have only one owner, and passing it by value <i>moves</i> it. Borrow it with <code>&amp;value</code> or make a copy with <code>.clone()</code>.'],
      [/E0384|cannot assign twice to immutable variable/, 'Variables are immutable by default in Rust. Declare it with <code>let mut</code> if it needs to change.'],
      [/E0308|mismatched types/, 'The type you provided isn\'t the type expected here (e.g. an integer where a <code>String</code> is expected). Check the types printed in the error.'],
      [/E0425|cannot find (value|function) ['‘`](\w+)/, 'Rust can\'t find the name <code>$2</code> — misspelled, not declared yet, or out of scope.'],
      [/E0502|E0499|cannot borrow/, 'Rust allows either many readers (<code>&amp;</code>) <i>or</i> one writer (<code>&amp;mut</code>) at a time, never both. Restructure so the borrows don\'t overlap.'],
      [/E0599|no method named/, 'That type has no such method. Check the name and whether a trait needs to be imported with <code>use</code>.'],
      [/E0106|missing lifetime specifier/, 'Rust needs to know how long a returned reference lives. Add a lifetime like <code>&amp;\'a str</code>, or return an owned <code>String</code>.'],
      [/panicked at/, 'The program <b>panicked</b> (a deliberate crash on a bug such as an out-of-range index, <code>unwrap()</code> on <code>None</code>, or overflow). The message shows where.'],
      [/expected [`'‘]?;/, 'A semicolon is missing at the end of a statement.']
    ],
    go: [
      [/declared (and|but) not used|declared and not used/, 'Go refuses to compile if a variable is declared but never used. Use it, or replace it with <code>_</code>.'],
      [/imported and not used/, 'Remove the unused <code>import</code> (or use the package).'],
      [/undefined: (\w+)/, 'Go doesn\'t know <code>$1</code>. Check spelling, capitalisation (exported names start with a capital) and imports.'],
      [/cannot use .* as .* value|mismatched types/, 'Go is strict about types and never converts silently. Convert explicitly, e.g. <code>float64(x)</code>.'],
      [/missing return/, 'A function with a return type must return on every path.'],
      [/syntax error: unexpected/, 'Syntax problem near the reported spot: check braces (the opening <code>{</code> must be on the same line), commas and parentheses.'],
      [/non-name .* on left side of :=/, '<code>:=</code> can only declare plain variable names.'],
      [/index out of range/, 'You accessed a slice/array position that doesn\'t exist.'],
      [/nil pointer dereference/, 'You used a pointer that is <code>nil</code>.'],
      [/all goroutines are asleep - deadlock/, 'Every goroutine is waiting on a channel/lock that nothing will ever release.']
    ],
    ruby: [
      [/undefined local variable or method [`'‘](\w+)/, 'Ruby doesn\'t know <code>$1</code>: misspelled, or not assigned yet.'],
      [/undefined method [`'‘](\w+)['’] for (nil|an instance of \w+|.+)/, 'You called <code>.$1</code> on <code>$2</code>, which doesn\'t have that method. If it says <code>nil</code>, something earlier returned nothing.'],
      [/syntax error, unexpected end-of-input|unexpected end-of-input|unexpected 'end'|unexpected `end'/, 'Blocks (<code>def</code>, <code>if</code>, <code>do</code>, <code>class</code>…) need a matching <code>end</code>. Count them.'],
      [/syntax error/, 'Ruby can\'t parse this line: look for a missing <code>end</code>, bracket, quote or comma nearby.'],
      [/ZeroDivisionError/, 'Divided an integer by zero.'],
      [/TypeError: (.+) can't be coerced|no implicit conversion/, 'You mixed types (e.g. a number + a string). Convert with <code>.to_s</code> or <code>.to_i</code>.'],
      [/ArgumentError: wrong number of arguments/, 'You called a method with the wrong number of arguments.'],
      [/uninitialized constant (\w+)/, 'A class/constant named <code>$1</code> doesn\'t exist (capitalised names are constants).']
    ],
    php: [
      [/Parse error: syntax error, unexpected/, 'PHP can\'t parse the code: usually a missing semicolon <code>;</code>, an unclosed bracket/quote, or a missing <code>$</code> before a variable.'],
      [/Undefined variable [\$]?(\w+)/, 'The variable <code>$$1</code> was used before it was assigned. Variables always start with <code>$</code>.'],
      [/Call to undefined function (\w+)/, 'There is no function <code>$1</code>. Check the spelling or define it.'],
      [/Call to a member function (\w+)\(\) on null/, 'You called <code>$1()</code> on <code>null</code> — the object doesn\'t exist.'],
      [/Division by zero|DivisionByZeroError/, 'Division by zero.'],
      [/Uncaught TypeError/, 'A function received the wrong type of value.'],
      [/Undefined (index|array key)/, 'You read an array key that doesn\'t exist. Check with <code>isset($arr[\'key\'])</code> first.']
    ]
  };
  H.html.push(...H.javascript);

  function explain(langId, text) {
    const list = (H[langId] || []).concat(langId === 'html' ? [] : []);
    for (const [re, tip] of list) {
      const m = re.exec(text);
      if (m) return tip.replace(/\$(\d)/g, (x, n) => (m[+n] !== undefined ? m[+n].replace(/</g, '&lt;') : ''));
    }
    return null;
  }
  window.Hints = { explain };
})();
