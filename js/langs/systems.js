// ================================================================
//  js/langs/systems.js: content for C, C++, Rust and Go
// ================================================================
//  This file holds DATA, not behaviour: each language's starter program,
//  syntax guide lessons, tips and settings. The other JavaScript files
//  (app.js, engines.js...) read this data to build the screens.
//
//  Every language object has the same fields; js/langs/web.js explains
//  each field in detail at the top of that file.
// ================================================================
/* C, C++, Rust, Go */
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
  // Go code is written with 4-space indents here and converted to gofmt-style tabs.
  // G is like R, but for Go examples: it also converts every 4 spaces at the
  // start of a line into one tab character, Go's standard formatting.
  const G = (s) => String.raw(s).replace(/^(?: {4})+/gm, (m) => '\t'.repeat(m.length / 4));

  /* ===================================================================== C */
  // C
  // Compiled by GCC on Wandbox with -Wall (show all common warnings).
  // "wrap" puts short examples inside main() with the usual #include lines.
  LANGS.push({
    id: 'c', name: 'C', tag: 'C', color: '#5c6bc0', file: 'main.c', cmd: 'gcc main.c -o main && ./main',
    kind: 'cloud', engine: 'wandbox', wb: { lang: 'C', prefer: /^gcc/, flags: '-Wall' }, trace: 'explain', mode: 'text/x-csrc', indent: 4, comment: ['//'],
    wrap: '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n\nint main(void) {\n{{CODE}}\n    return 0;\n}\n', wrapIndent: '    ',
    scaffold: '#include <stdio.h>\n\n{{COMMENT}}\n\nint main(void) {\n    // Your code here\n\n    return 0;\n}\n',
    blurb: 'The foundation of operating systems and embedded devices. Learn how computers really manage memory.',
    intro: 'C (1972) is small, fast and close to the hardware. It powers operating systems, databases, microcontrollers and the runtimes of other languages. You manage memory yourself with pointers, which is powerful and demanding. Code is compiled with GCC (`-Wall` warnings on) on the Wandbox service.',
    docs: 'https://en.cppreference.com/w/c',
    keywords: ['int', 'char', 'float', 'double', 'long', 'short', 'unsigned', 'void', 'bool', 'const', 'static', 'struct', 'typedef', 'enum', 'sizeof', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'default', 'printf', 'scanf', 'fprintf', 'stderr', 'malloc', 'free', 'realloc', 'strlen', 'strcpy', 'strcmp', 'strcat', 'NULL', 'include', 'define', 'main'],
    // The starter program shown the first time you open C.
    starter: R`// Welcome to C! Press ▶ Run (or Ctrl+Enter).
// C is compiled on the free Wandbox service (needs internet).
#include <stdio.h>

int square(int n) {
    return n * n;
}

int main(void) {
    int numbers[] = {3, 7, 1, 9, 4};
    int count = sizeof(numbers) / sizeof(numbers[0]);
    int total = 0;

    for (int i = 0; i < count; i++) {
        total += numbers[i];
        printf("numbers[%d] = %d, squared = %d\n", i, numbers[i], square(numbers[i]));
    }

    double average = (double) total / count;
    printf("Total: %d, average: %.2f\n", total, average);
    return 0;
}
`,
    // C syntax guide lessons, from beginner to advanced.
    sections: [
      { id: 'hello', title: 'Program structure & Hello, World', level: 'beginner', full: true,
        body: "`#include <stdio.h>` brings in the standard input/output library so you can use `printf`. Every C program starts running in the function `main`. Statements end with `;` and blocks are wrapped in `{ }`.\n\n`\\n` inside a string means \"new line\". `return 0;` tells the operating system the program succeeded.",
        code: R`#include <stdio.h>   // gives us printf

// Every C program starts running at main()
int main(void) {
    printf("Hello, World!\n");   // \n = new line
    printf("C was created in %d\n", 1972);
    return 0;                     // 0 means "success"
}`,
        deep: "C is compiled ahead of time: the preprocessor expands `#include`/`#define`, the compiler produces object code, and the linker combines it with libraries into an executable. Always compile with warnings (`-Wall -Wextra`) and treat them as errors you need to fix." },
      { id: 'vars', title: 'Variables & data types', level: 'beginner',
        body: "In C you must declare a variable's **type** before using it: `int` (whole numbers), `double` (decimals), `char` (one character, in single quotes), and `bool` (via `<stdbool.h>`). `const` makes a value read-only.\n\n`sizeof` tells you how many bytes a type uses.",
        code: R`int age = 36;              // whole number
double height = 1.65;      // decimal number
char initial = 'A';        // single character (single quotes!)
bool isCoder = true;       // needs <stdbool.h>
const int DAYS_IN_WEEK = 7;

age = age + 1;
printf("age=%d height=%.2f initial=%c coder=%d\n", age, height, initial, isCoder);
printf("int: %zu bytes, double: %zu bytes\n", sizeof(int), sizeof(double));
printf("Days in a week: %d\n", DAYS_IN_WEEK);`,
        deep: "Type sizes are implementation-defined: `int` is at least 16 bits (usually 32). Use `<stdint.h>` types like `int32_t` and `uint8_t` when exact widths matter. Uninitialised local variables contain garbage — always initialise them. Signed integer overflow is **undefined behaviour**." },
      { id: 'io', title: 'printf, scanf & format specifiers', level: 'beginner', full: true,
        body: "`printf` uses **format specifiers** as placeholders: `%d` int, `%f` double, `%.2f` two decimals, `%c` char, `%s` string, `%zu` size. `scanf` reads input using the same codes — pass the variable's **address** with `&`.\n\nType input into the **Program input** box below the terminal before running.",
        code: R`#include <stdio.h>

int main(void) {
    // Put a name and an age (on two lines) in the "Program input" box first.
    char name[50];
    int age;

    printf("Name? ");
    if (scanf("%49s", name) != 1) {   // %49s reads one word, max 49 chars
        printf("(no input given)\n");
        return 1;
    }
    printf("Age? ");
    if (scanf("%d", &age) != 1) {      // & = "address of" age
        printf("(no age given)\n");
        return 1;
    }

    printf("\nHello %s, in 10 years you'll be %d.\n", name, age + 10);
    printf("|%5d|%-5d|%05d|\n", 42, 42, 42);   // width, left-align, zero-pad
    printf("|%8.3f|%e|\n", 3.14159, 12345.678);
    return 0;
}`,
        deep: "Always check `scanf`'s return value (the number of items read). For robust line input, read with `fgets` and then parse with `sscanf` or `strtol`. A mismatched format specifier is undefined behaviour — `-Wall` (on here) warns about it." },
      { id: 'ops', title: 'Operators & integer maths', level: 'beginner',
        body: "Arithmetic: `+ - * / %`. Watch out: dividing two `int`s throws away the remainder (`7 / 2` is `3`). **Cast** one side to `double` to get `3.5`.\n\nComparisons (`== != < > <= >=`) produce `1` (true) or `0` (false). Logical operators: `&&`, `||`, `!`.",
        code: R`int a = 7, b = 2;
printf("%d %d %d %d %d\n", a + b, a - b, a * b, a / b, a % b);  // 7/2 is 3!
printf("%.1f\n", (double) a / b);                               // cast -> 3.5

int x = 5;
x += 3;     // 8
x++;        // 9
printf("x = %d\n", x);
printf("%d %d %d\n", a > b, a == b, (a > 0) && (b > 0));      // 1 = true`,
        deep: "`&&` and `||` short-circuit: the right side isn't evaluated if the left decides the result. `x++` vs `++x` differ in the value of the expression; never modify a variable twice in one expression (`i = i++` is undefined behaviour)." },
      { id: 'cond', title: 'Conditionals', level: 'beginner',
        body: "`if (condition) { ... } else if (...) { ... } else { ... }`. Any non-zero value counts as true.\n\n`switch` jumps to a matching `case`; don't forget `break`, otherwise execution **falls through** into the next case.",
        code: R`int temperature = 23;

if (temperature > 30) {
    printf("Hot!\n");
} else if (temperature > 15) {
    printf("Pleasant\n");
} else {
    printf("Cold\n");
}

char grade = 'B';
switch (grade) {
    case 'A':
        printf("Excellent\n");
        break;
    case 'B':
    case 'C':
        printf("Good\n");
        break;
    default:
        printf("Keep trying\n");
}

int max = (temperature > 20) ? temperature : 20;   // ternary
printf("max = %d\n", max);`,
        deep: "A classic bug is `if (x = 5)` (assignment, always true) instead of `if (x == 5)`; `-Wall` warns about it. Some programmers write `if (5 == x)` so the typo becomes a compile error." },
      { id: 'loops', title: 'Loops', level: 'beginner',
        body: "`for (start; condition; step)` is the most common loop. `while` checks before each iteration; `do ... while` runs at least once. `break` exits a loop and `continue` skips to the next iteration.",
        code: R`for (int i = 1; i <= 3; i++) {
    printf("for: i = %d\n", i);
}

int n = 3;
while (n > 0) {
    printf("while: %d\n", n);
    n--;
}

int tries = 0;
do {
    tries++;
} while (tries < 5);
printf("do-while ran %d times\n", tries);

for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;
    if (i > 7) break;
    printf("odd: %d\n", i);
}`,
        deep: "Declaring the loop variable inside `for` (C99) limits its scope to the loop. Prefer `<` with the count (`i < n`) over `<=` with `n - 1` to avoid off-by-one errors." },
      { id: 'func', title: 'Functions', level: 'beginner', full: true,
        body: "A function has a return type, a name and typed parameters. `void` means it returns nothing. A **prototype** (declaration) above `main` lets you define the body later.\n\nC passes arguments **by value**: the function gets a copy, so changing a parameter doesn't affect the caller's variable.",
        code: R`#include <stdio.h>

int add(int a, int b);        // prototype (declaration)
void tryToChange(int n);

int main(void) {
    printf("3 + 4 = %d\n", add(3, 4));
    int value = 10;
    tryToChange(value);
    printf("value is still %d (C passes copies)\n", value);
    return 0;
}

int add(int a, int b) {       // definition
    return a + b;
}

void tryToChange(int n) {
    n = 99;
    printf("inside the function n = %d\n", n);
}`,
        deep: "To let a function modify the caller's data, pass a pointer (see the Pointers section). Mark helper functions `static` to keep them private to their file, and put prototypes for shared functions in a header (`.h`) file." },
      { id: 'arrays', title: 'Arrays & strings', level: 'intermediate',
        body: "An **array** is a fixed-size row of values of the same type, indexed from 0. C doesn't check bounds — reading past the end is a serious bug.\n\nA **string** is an array of `char` ending with the special null character `'\\0'`. `<string.h>` provides `strlen`, `strcpy`, `strcat` and `strcmp`.",
        code: R`int scores[5] = {90, 72, 85, 64, 99};
int n = sizeof(scores) / sizeof(scores[0]);
int best = scores[0];
for (int i = 1; i < n; i++) {
    if (scores[i] > best) best = scores[i];
}
printf("%d scores, best = %d\n", n, best);

char word[20] = "Hello";          // 5 letters + '\0'
strcat(word, "!");                // append (needs room!)
printf("%s has length %zu\n", word, strlen(word));
printf("first char: %c, as a number: %d\n", word[0], word[0]);
printf("apple before banana? %d\n", strcmp("apple", "banana") < 0);`,
        deep: "`strcpy`/`strcat` don't check sizes and are a major source of buffer overflows; prefer `snprintf(buf, sizeof buf, ...)`. `sizeof(arr)/sizeof(arr[0])` only works on real arrays, not on pointers passed into functions — pass the length separately." },
      { id: 'pointers', title: 'Pointers', level: 'intermediate', full: true,
        body: "A **pointer** stores a memory address. `&x` gives the address of `x`; `*p` reads or writes the value at the address `p` holds (\"dereferencing\").\n\nPointers let functions modify the caller's variables, and they are how C works with arrays and dynamic memory.",
        code: R`#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;     // *a = "the value a points to"
    *a = *b;
    *b = temp;
}

int main(void) {
    int x = 1, y = 2;
    int *p = &x;                  // p holds the address of x
    printf("x=%d, address=%p, via pointer=%d\n", x, (void *) p, *p);

    *p = 42;                      // change x through the pointer
    printf("x is now %d\n", x);

    swap(&x, &y);
    printf("after swap: x=%d y=%d\n", x, y);

    int arr[3] = {10, 20, 30};
    int *q = arr;                 // an array decays to a pointer to element 0
    printf("%d %d %d\n", *q, *(q + 1), q[2]);
    return 0;
}`,
        deep: "Pointer arithmetic moves in units of the pointed-to type, so `q + 1` advances by `sizeof(int)` bytes. Dereferencing `NULL`, an uninitialised pointer, or memory that has been freed is undefined behaviour — often a segmentation fault." },
      { id: 'structs', title: 'Structs', level: 'intermediate', full: true,
        body: "A `struct` groups related variables into one type. `typedef` gives it a short name. Access fields with `.`, or with `->` when you have a pointer to the struct.",
        code: R`#include <stdio.h>
#include <string.h>

typedef struct {
    char name[32];
    int age;
} Person;

void birthday(Person *p) {
    p->age++;                     // -> accesses a field through a pointer
}

int main(void) {
    Person ada = {"Ada", 36};
    Person people[2];
    people[0] = ada;              // structs are copied by value
    strcpy(people[1].name, "Linus");
    people[1].age = 54;

    birthday(&people[0]);
    for (int i = 0; i < 2; i++) {
        printf("%s is %d\n", people[i].name, people[i].age);
    }
    printf("The original ada is still %d\n", ada.age);
    return 0;
}`,
        deep: "Pass large structs by pointer (`const Person *p` when read-only) to avoid copying. The compiler may add padding between fields for alignment; order fields from largest to smallest to reduce it." },
      { id: 'memory', title: 'Dynamic memory: malloc & free', level: 'advanced', full: true,
        body: "When you don't know the size at compile time, request memory from the **heap** with `malloc`, grow it with `realloc`, and give it back with `free`. Always check for `NULL` (allocation failure), and free everything you allocate — otherwise you leak memory.",
        code: R`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;
    int *squares = malloc(n * sizeof *squares);   // ask for memory
    if (squares == NULL) {
        fprintf(stderr, "out of memory\n");
        return 1;
    }
    for (int i = 0; i < n; i++) squares[i] = i * i;

    int *bigger = realloc(squares, 2 * n * sizeof *bigger);  // grow it
    if (bigger == NULL) {
        free(squares);
        return 1;
    }
    squares = bigger;
    for (int i = n; i < 2 * n; i++) squares[i] = i * i;

    for (int i = 0; i < 2 * n; i++) printf("%d ", squares[i]);
    printf("\n");

    free(squares);    // every malloc needs exactly one free
    squares = NULL;   // avoid a dangling pointer
    return 0;
}`,
        deep: "Common heap bugs: leaks, double free, use-after-free and buffer overruns. Tools like Valgrind and AddressSanitizer (`-fsanitize=address`) find them. Writing `sizeof *ptr` instead of `sizeof(int)` keeps allocations correct if the type changes." },
      { id: 'pre', title: 'The preprocessor & macros', level: 'advanced', full: true,
        body: "Lines starting with `#` are handled by the **preprocessor** before compilation. `#define` creates constants and macros (text substitution); `#if`/`#endif` include code conditionally.",
        code: R`#include <stdio.h>

#define PI 3.14159
#define SQUARE(x) ((x) * (x))     // the parentheses matter!
#define DEBUG 1

int main(void) {
    printf("Area of an r=2 circle: %.2f\n", PI * SQUARE(2));
    printf("SQUARE(1 + 2) = %d\n", SQUARE(1 + 2));
#if DEBUG
    printf("[debug] line %d of %s\n", __LINE__, __FILE__);
#endif
    return 0;
}`,
        deep: "Macros are plain text replacement with no type checking; `SQUARE(i++)` increments twice. Prefer `const` variables, `enum`s and `static inline` functions where possible. Header files use include guards (`#ifndef FOO_H / #define FOO_H / #endif`) to avoid double inclusion." }
    ],
    // C best practices (the "Best practices" tab).
    tips: [
      'Compile with warnings enabled (`-Wall -Wextra`) and fix every warning.',
      'Initialise every variable when you declare it.',
      'Check return values: `malloc` may return `NULL`, `scanf` returns the number of items read.',
      'Every `malloc` needs exactly one `free`; set pointers to `NULL` after freeing.',
      'Never trust array sizes: pass lengths alongside arrays and use `snprintf` instead of `strcpy`/`sprintf`.',
      'Use `const` for data a function shouldn\'t modify (`const char *name`).',
      'Keep functions short, name them clearly in `snake_case`, and use `static` for file-private helpers.',
      'Use tools like AddressSanitizer and Valgrind to catch memory errors early.'
    ],
    // Common C beginner mistakes.
    pitfalls: [
      'Forgetting the `;` at the end of a statement or after a `struct` definition.',
      'Integer division: `5 / 2` is `2`, not `2.5`.',
      'Forgetting `&` in `scanf("%d", &x)`.',
      'Writing past the end of an array or forgetting room for the string terminator `\\0`.',
      'Using `=` instead of `==` in conditions.'
    ]
  });

  /* ===================================================================== C++ */
  // C++
  // Compiled by GCC on Wandbox using the C++20 standard. "wrap" adds the
  // usual #include lines and a main() function.
  LANGS.push({
    id: 'cpp', name: 'C++', aka: 'cpp cplusplus', tag: 'C++', color: '#00599c', file: 'main.cpp', cmd: 'g++ -std=c++20 main.cpp -o main && ./main',
    kind: 'cloud', engine: 'wandbox', wb: { lang: 'C++', prefer: /^gcc/, flags: '-std=c++20 -Wall' }, trace: 'explain', mode: 'text/x-c++src', indent: 4, comment: ['//'],
    wrap: '#include <iostream>\n#include <string>\n#include <vector>\n#include <map>\n#include <algorithm>\n#include <numeric>\n#include <memory>\n#include <optional>\n#include <cctype>\n\nint main() {\n{{CODE}}\n    return 0;\n}\n', wrapIndent: '    ',
    scaffold: '#include <iostream>\n\n{{COMMENT}}\n\nint main() {\n    // Your code here\n\n    return 0;\n}\n',
    blurb: 'High-performance and expressive. Used for games, browsers, finance and anything where speed matters.',
    intro: 'C++ builds on C with classes, templates, a rich standard library (strings, vectors, maps, algorithms) and automatic resource management (RAII). Modern C++ (C++11 and later) is much safer and nicer than the old style. Code is compiled with GCC in C++20 mode on the Wandbox service.',
    docs: 'https://en.cppreference.com/w/cpp',
    keywords: ['int', 'double', 'char', 'bool', 'auto', 'void', 'const', 'constexpr', 'static', 'class', 'struct', 'public', 'private', 'protected', 'virtual', 'override', 'template', 'typename', 'namespace', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'new', 'delete', 'nullptr', 'true', 'false', 'std', 'cout', 'cin', 'endl', 'string', 'vector', 'map', 'push_back', 'size', 'begin', 'end', 'sort', 'unique_ptr', 'make_unique', 'shared_ptr', 'include'],
    // The starter program shown the first time you open C++.
    starter: R`// Welcome to C++! Press ▶ Run (or Ctrl+Enter).
// C++ is compiled on the free Wandbox service (needs internet).
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

struct Player {
    std::string name;
    int score;
};

int main() {
    std::vector<Player> players = {{"Ada", 92}, {"Linus", 78}, {"Grace", 88}};

    std::sort(players.begin(), players.end(),
              [](const Player& a, const Player& b) { return a.score > b.score; });

    int total = 0;
    for (const auto& p : players) {
        std::cout << p.name << ": " << p.score << '\n';
        total += p.score;
    }
    std::cout << "Average: " << static_cast<double>(total) / players.size() << '\n';
    return 0;
}
`,
    // C++ syntax guide lessons, from beginner to advanced.
    sections: [
      { id: 'hello', title: 'Hello, World & iostream', level: 'beginner', full: true,
        body: "`#include <iostream>` gives access to `std::cout` (console output). The `<<` operator sends values to the stream. Everything in the standard library lives in the `std` **namespace**, hence the `std::` prefix.\n\nExecution starts in `main`.",
        code: R`#include <iostream>

int main() {
    std::cout << "Hello, World!\n";
    std::cout << "2 + 3 = " << 2 + 3 << std::endl;
    std::cerr << "This goes to the error stream\n";
    return 0;
}`,
        deep: "`std::endl` writes a newline *and* flushes the buffer, which is slow in loops — prefer `'\\n'`. Avoid `using namespace std;` in headers (and ideally everywhere): it pollutes the global namespace and causes name clashes." },
      { id: 'vars', title: 'Variables, types & auto', level: 'beginner',
        body: "C++ is statically typed: `int`, `double`, `char`, `bool`, and `std::string` for text. `auto` lets the compiler deduce the type from the initial value. `const` values can't change.\n\nBrace initialisation `int x{42};` prevents accidental narrowing conversions.",
        code: R`int age = 36;
double height = 1.65;
char initial = 'A';
bool coder = true;
std::string name = "Ada";
auto year = 2026;            // deduced as int
const double PI = 3.14159;
int brace{42};               // brace initialisation

std::cout << name << ' ' << age << ' ' << height << ' ' << initial << '\n';
std::cout << std::boolalpha << coder << ' ' << year << ' ' << PI << ' ' << brace << '\n';
std::cout << "int is " << sizeof(int) << " bytes\n";`,
        deep: "Use `constexpr` for values computable at compile time. `auto` is great for long iterator types, but spell out types when it aids readability. `int x{3.7};` is a compile error (narrowing), while `int x = 3.7;` silently truncates." },
      { id: 'strings', title: 'Strings', level: 'beginner',
        body: "`std::string` manages its own memory and grows as needed. Concatenate with `+`, compare with `==`, and use methods like `size()`, `substr()`, `find()` and `push_back()`. Convert numbers with `std::to_string` and `std::stoi`.",
        code: R`std::string first = "Grace", last = "Hopper";
std::string full = first + " " + last;
std::cout << full << " (" << full.size() << " chars)\n";
std::cout << full.substr(0, 5) << ' ' << full.find("Hop") << ' ' << full[0] << '\n';

full += "!";
for (char& c : full) c = std::toupper(static_cast<unsigned char>(c));
std::cout << full << '\n';

std::cout << std::to_string(42) + "?" << ' ' << std::stoi("17") + 1 << '\n';
std::cout << std::boolalpha << (first == "Grace") << '\n';`,
        deep: "`find` returns `std::string::npos` when not found. Use `std::string_view` for read-only string parameters to avoid copies. C++20 adds `starts_with`/`ends_with`, and C++23 `contains`." },
      { id: 'input', title: 'Reading input', level: 'beginner', full: true,
        body: "`std::cin >> variable` reads one whitespace-separated value. `std::getline(std::cin, line)` reads a whole line. Type your input into the **Program input** box before running.",
        code: R`#include <iostream>
#include <string>

int main() {
    // Put a full name on line 1 and an age on line 2 of "Program input".
    std::string name;
    int age = 0;

    std::cout << "Full name? ";
    std::getline(std::cin, name);
    std::cout << "Age? ";
    if (!(std::cin >> age)) {
        std::cout << "\nThat wasn't a number!\n";
        return 1;
    }
    std::cout << "\nHi " << name << ", next year you'll be " << age + 1 << ".\n";
    return 0;
}`,
        deep: "After `cin >> x`, the newline remains in the buffer, so a following `getline` reads an empty line — call `std::cin.ignore()` first. Check the stream state (`if (std::cin >> x)`) to detect bad input." },
      { id: 'control', title: 'Conditionals & loops', level: 'beginner',
        body: "`if/else`, `switch`, `for`, `while` and `do-while` work like in C. The **range-based for** loop `for (auto x : container)` walks over every element.",
        code: R`int temperature = 23;
if (temperature > 30) {
    std::cout << "Hot!\n";
} else if (temperature > 15) {
    std::cout << "Pleasant\n";
} else {
    std::cout << "Cold\n";
}

for (int i = 1; i <= 3; ++i) {
    std::cout << "i = " << i << '\n';
}

std::vector<std::string> fruits = {"apple", "banana", "cherry"};
for (const auto& fruit : fruits) {
    std::cout << "I like " << fruit << '\n';
}

int n = 3;
while (n > 0) std::cout << "countdown " << n-- << '\n';`,
        deep: "Use `const auto&` in range-for to avoid copying elements; use `auto&` when you want to modify them. C++17 allows initialisers in `if` and `switch`: `if (auto it = m.find(k); it != m.end()) { ... }`." },
      { id: 'func', title: 'Functions, references & overloading', level: 'intermediate', full: true,
        body: "Pass by **reference** (`int&`) to let a function modify the caller's variable, or by `const&` to avoid copying large objects. **Overloading** lets several functions share a name with different parameter types. Parameters can have default values.",
        code: R`#include <iostream>
#include <string>

void doubleIt(int& n) { n *= 2; }                 // reference parameter

double area(double r) { return 3.14159 * r * r; } // overloads
double area(double w, double h) { return w * h; }

std::string greet(const std::string& name, const std::string& greeting = "Hello") {
    return greeting + ", " + name + "!";
}

int main() {
    int value = 21;
    doubleIt(value);
    std::cout << value << '\n';
    std::cout << area(1.0) << ' ' << area(3.0, 4.0) << '\n';
    std::cout << greet("Ada") << ' ' << greet("Bjarne", "Hi") << '\n';

    auto add = [](int a, int b) { return a + b; };  // lambda
    std::cout << add(2, 3) << '\n';
    return 0;
}`,
        deep: "Rule of thumb: pass cheap types (int, double, pointers) by value; pass large objects by `const&` for input and by `&` for output. Return objects by value — move semantics and copy elision make it efficient." },
      { id: 'vector', title: 'std::vector', level: 'beginner',
        body: "`std::vector` is a resizable array — the default container in C++. Add with `push_back`, read with `[i]` or `.at(i)` (bounds-checked), and get the length with `.size()`.",
        code: R`std::vector<int> nums = {5, 3, 8};
nums.push_back(1);
nums.push_back(10);
std::cout << "size " << nums.size() << ", first " << nums.front() << ", last " << nums.back() << '\n';

std::sort(nums.begin(), nums.end());
for (int n : nums) std::cout << n << ' ';
std::cout << '\n';

int total = std::accumulate(nums.begin(), nums.end(), 0);
auto maxIt = std::max_element(nums.begin(), nums.end());
std::cout << "sum " << total << ", max " << *maxIt << '\n';

nums.pop_back();
std::cout << "after pop_back: " << nums.size() << " items, nums.at(0) = " << nums.at(0) << '\n';`,
        deep: "Vectors store elements contiguously, so they're cache-friendly and usually faster than linked lists. `reserve(n)` avoids repeated reallocations. Inserting may invalidate iterators and references to elements." },
      { id: 'stl', title: 'Maps & STL algorithms', level: 'intermediate',
        body: "`std::map` stores sorted key→value pairs (`std::unordered_map` is a faster hash map). `<algorithm>` provides ready-made, well-tested operations like `sort`, `find`, `count_if` and `transform` — prefer them over hand-written loops.",
        code: R`std::map<std::string, int> ages = {{"Ada", 36}, {"Linus", 54}};
ages["Grace"] = 85;               // insert or update
ages["Ada"] += 1;

for (const auto& [name, age] : ages) {        // structured bindings
    std::cout << name << " is " << age << '\n';
}
std::cout << "has Bob? " << ages.count("Bob") << '\n';

std::vector<int> v = {4, 8, 15, 16, 23, 42};
auto evens = std::count_if(v.begin(), v.end(), [](int x) { return x % 2 == 0; });
std::vector<int> squares(v.size());
std::transform(v.begin(), v.end(), squares.begin(), [](int x) { return x * x; });
std::cout << evens << " evens, last square " << squares.back() << '\n';

auto it = std::find(v.begin(), v.end(), 15);
std::cout << "15 found at index " << (it - v.begin()) << '\n';`,
        deep: "`map[key]` inserts a default value if the key is missing — use `find` or `contains` (C++20) to check without inserting. C++20 ranges allow `std::ranges::sort(v)` and composable views like `v | std::views::filter(...)`." },
      { id: 'classes', title: 'Classes & objects', level: 'intermediate', full: true,
        body: "A `class` bundles data and the functions (methods) that work on it. Members are `private` by default; expose behaviour with `public` methods. Constructors initialise objects; `virtual` and `override` enable polymorphism.",
        code: R`#include <iostream>
#include <string>
#include <vector>
#include <memory>

class Shape {
public:
    explicit Shape(std::string name) : name_(std::move(name)) {}
    virtual ~Shape() = default;
    virtual double area() const = 0;              // pure virtual
    const std::string& name() const { return name_; }
private:
    std::string name_;
};

class Circle : public Shape {
public:
    explicit Circle(double r) : Shape("circle"), r_(r) {}
    double area() const override { return 3.14159 * r_ * r_; }
private:
    double r_;
};

class Rect : public Shape {
public:
    Rect(double w, double h) : Shape("rectangle"), w_(w), h_(h) {}
    double area() const override { return w_ * h_; }
private:
    double w_, h_;
};

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Circle>(1.0));
    shapes.push_back(std::make_unique<Rect>(3.0, 4.0));
    for (const auto& s : shapes) {
        std::cout << s->name() << " area = " << s->area() << '\n';
    }
    return 0;
}`,
        deep: "Base classes used polymorphically need a `virtual` destructor. Mark single-argument constructors `explicit`, methods that don't modify state `const`, and use member initialiser lists. Follow the Rule of Zero: let members (vectors, smart pointers) manage resources so you don't write copy/move/destructor code." },
      { id: 'pointers', title: 'Pointers & smart pointers', level: 'advanced', full: true,
        body: "Raw pointers (`int*`) work as in C, but in modern C++ you rarely use `new`/`delete` directly. **Smart pointers** free memory automatically: `std::unique_ptr` (single owner) and `std::shared_ptr` (shared ownership, reference-counted).",
        code: R`#include <iostream>
#include <memory>
#include <string>

struct Resource {
    std::string name;
    explicit Resource(std::string n) : name(std::move(n)) { std::cout << "acquire " << name << '\n'; }
    ~Resource() { std::cout << "release " << name << '\n'; }
};

int main() {
    int x = 10;
    int* p = &x;
    *p = 20;
    std::cout << "x = " << x << '\n';

    {
        auto a = std::make_unique<Resource>("A");     // freed at end of scope
        std::cout << "using " << a->name << '\n';
    }

    auto s1 = std::make_shared<Resource>("B");
    {
        auto s2 = s1;                                  // shared ownership
        std::cout << "owners: " << s1.use_count() << '\n';
    }
    std::cout << "owners: " << s1.use_count() << '\n';
    std::cout << "end of main\n";
    return 0;
}`,
        deep: "This is **RAII** (Resource Acquisition Is Initialisation): resources are tied to object lifetimes, so they are released even when exceptions are thrown. Prefer `unique_ptr`; reach for `shared_ptr` only for genuinely shared ownership, and break cycles with `weak_ptr`." },
      { id: 'templates', title: 'Templates (generic code)', level: 'advanced', full: true,
        body: "**Templates** let you write a function or class once and use it with many types. The compiler generates a version for each type you use. C++20 **concepts** constrain which types are allowed.",
        code: R`#include <iostream>
#include <string>
#include <concepts>

template <typename T>
T biggest(T a, T b) {
    return a > b ? a : b;
}

template <typename T>
class Box {
public:
    explicit Box(T value) : value_(value) {}
    T get() const { return value_; }
private:
    T value_;
};

template <std::integral T>          // C++20 concept
T sumTo(T n) { return n * (n + 1) / 2; }

int main() {
    std::cout << biggest(3, 7) << ' ' << biggest(2.5, 1.5) << ' '
              << biggest(std::string("apple"), std::string("pear")) << '\n';
    Box<std::string> b("hello");
    Box<int> n(42);
    std::cout << b.get() << ' ' << n.get() << ' ' << sumTo(100) << '\n';
    return 0;
}`,
        deep: "The whole STL is built on templates. Template errors used to be notoriously long; concepts produce far clearer messages. Use `if constexpr` for compile-time branching and variadic templates (`typename... Ts`) for any number of arguments." },
      { id: 'modern', title: 'Modern C++: optional, lambdas & more', level: 'advanced',
        body: "Modern C++ adds safer, more expressive tools: `std::optional` for \"maybe a value\", lambdas that capture variables, structured bindings, and `constexpr` computation at compile time.",
        code: R`auto findIndex = [](const std::vector<int>& v, int target) -> std::optional<size_t> {
    for (size_t i = 0; i < v.size(); ++i)
        if (v[i] == target) return i;
    return std::nullopt;
};

std::vector<int> data = {7, 3, 9};
if (auto idx = findIndex(data, 9)) std::cout << "found at " << *idx << '\n';
std::cout << "missing -> " << findIndex(data, 4).value_or(999) << '\n';

int factor = 3;
auto scale = [factor](int x) { return x * factor; };   // capture by value
int counter = 0;
auto bump = [&counter]() { ++counter; };              // capture by reference
bump(); bump();
std::cout << scale(5) << ' ' << counter << '\n';

constexpr int squared = 12 * 12;                       // computed at compile time
static_assert(squared == 144);
std::cout << squared << '\n';`,
        deep: "Other modern essentials: `std::variant` (type-safe unions), `std::span` (non-owning array views), `std::format` (Python-style formatting, C++20), move semantics (`std::move`) and range-based algorithms." }
    ],
    // C++ best practices (the "Best practices" tab).
    tips: [
      'Prefer `std::vector`, `std::string` and smart pointers over raw arrays, C strings and `new`/`delete`.',
      'Use RAII: tie every resource (memory, files, locks) to an object whose destructor releases it.',
      'Pass large objects by `const&`; mark methods that don\'t modify state `const`.',
      'Use `auto` for complex types, range-based `for`, and STL algorithms instead of manual loops.',
      'Avoid `using namespace std;` — write `std::` explicitly.',
      'Initialise every variable; prefer brace initialisation `{}` to catch narrowing.',
      'Compile with `-Wall -Wextra` and, while developing, sanitizers (`-fsanitize=address,undefined`).',
      'Follow the C++ Core Guidelines (isocpp.github.io/CppCoreGuidelines).'
    ],
    // Common C++ beginner mistakes.
    pitfalls: [
      'Forgetting `std::` (or the right `#include`) and getting "not declared in this scope".',
      'Integer division: `5 / 2` is `2`.',
      'Accessing a vector out of bounds with `[]` (no check) — use `.at()` while learning.',
      'Returning a reference or pointer to a local variable (it dies when the function returns).',
      'Mixing `cin >>` and `getline` without `cin.ignore()`.'
    ]
  });

  /* ===================================================================== Rust */
  // RUST
  // Compiled on Wandbox. "wrap" puts short examples inside fn main().
  LANGS.push({
    id: 'rust', name: 'Rust', aka: 'rs', tag: 'Rs', color: '#ce422b', file: 'main.rs', cmd: 'rustc main.rs && ./main',
    kind: 'cloud', engine: 'wandbox', wb: { lang: 'Rust' }, trace: 'explain', mode: 'rust', indent: 4, comment: ['//'],
    wrap: 'fn main() {\n{{CODE}}\n}\n', wrapIndent: '    ',
    scaffold: '{{COMMENT}}\n\nfn main() {\n    // Your code here\n}\n',
    blurb: 'Memory-safe without a garbage collector. Fast, reliable and loved by developers year after year.',
    intro: 'Rust gives C-level speed with guaranteed memory safety, enforced at compile time by its **ownership** and **borrowing** rules. The compiler is strict but its error messages are famously helpful — read them carefully! Code is compiled with rustc on the Wandbox service.',
    docs: 'https://doc.rust-lang.org/book/',
    keywords: ['fn', 'let', 'mut', 'const', 'static', 'if', 'else', 'match', 'loop', 'while', 'for', 'in', 'break', 'continue', 'return', 'struct', 'enum', 'impl', 'trait', 'pub', 'use', 'mod', 'self', 'Self', 'where', 'as', 'ref', 'move', 'true', 'false', 'Some', 'None', 'Ok', 'Err', 'Option', 'Result', 'String', 'Vec', 'HashMap', 'println', 'format', 'vec', 'unwrap', 'expect', 'iter', 'map', 'collect', 'clone', 'len', 'push'],
    // The starter program shown the first time you open Rust.
    starter: R`// Welcome to Rust! Press ▶ Run (or Ctrl+Enter).
// Rust is compiled on the free Wandbox service (needs internet).

#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let shapes = vec![
        Rectangle { width: 3, height: 4 },
        Rectangle { width: 10, height: 2 },
    ];

    let mut total = 0;
    for shape in &shapes {
        println!("{:?} has area {}", shape, shape.area());
        total += shape.area();
    }

    let largest = shapes.iter().max_by_key(|s| s.area()).unwrap();
    println!("Total area: {total}, largest: {largest:?}");
}
`,
    // Rust syntax guide lessons, from beginner to advanced.
    sections: [
      { id: 'hello', title: 'Hello, World & println!', level: 'beginner', full: true,
        body: "Programs start in `fn main()`. `println!` (the `!` means it's a **macro**) prints a line; `{}` placeholders are filled with values, and you can name variables directly inside: `{name}`. `{:?}` prints the debug representation.",
        code: R`fn main() {
    println!("Hello, World!");
    let name = "Ferris";
    println!("Hi {}, you are {} years old", name, 8);
    println!("Inline variables: {name}");
    println!("Debug view: {:?}", (1, "two", 3.0));
    println!("Padding: [{:>6}] [{:<6}] [{:06.2}]", 42, "ab", 3.14159);
}`,
        deep: "Formatting is checked at compile time — a mismatched placeholder is a compile error, not a runtime bug. `eprintln!` writes to stderr and `format!` returns a `String` instead of printing." },
      { id: 'vars', title: 'Variables, mutability & types', level: 'beginner',
        body: "`let` creates a variable that is **immutable by default**. Add `mut` to allow changes. You can redeclare a name (**shadowing**) to transform a value.\n\nScalar types: integers (`i32`, `u8`, `u64`...), floats (`f64`), `bool` and `char`. Compound types: tuples `(1, 'a')` and arrays `[1, 2, 3]`.",
        code: R`let x = 5;                  // immutable
let mut count = 0;          // mutable
count += 1;
let x = x * 2;              // shadowing creates a new x
const MAX_POINTS: u32 = 100_000;

let age: u8 = 36;           // explicit type
let pi: f64 = 3.14159;
let is_fun = true;
let letter = 'R';
let tuple = (1, "a", 2.5);
let array = [1, 2, 3];

println!("{x} {count} {MAX_POINTS} {age} {pi} {is_fun} {letter}");
println!("{} {:?} {}", tuple.1, array, array.len());`,
        deep: "Integer overflow panics in debug builds and wraps in release builds; use `checked_add`, `wrapping_add` or `saturating_add` to be explicit. Rust never converts numeric types implicitly — use `as` or `From`/`TryFrom`." },
      { id: 'control', title: 'if & match', level: 'beginner',
        body: "`if` doesn't need parentheses, and it's an **expression**: it can produce a value. `match` compares a value against **patterns** and must cover every possibility (`_` matches anything else).",
        code: R`let temperature = 23;
let feel = if temperature > 30 {
    "hot"
} else if temperature > 15 {
    "pleasant"
} else {
    "cold"
};
println!("It's {feel}");

let grade = match 85 {
    90..=100 => 'A',
    80..=89 => 'B',
    _ => 'C',
};
println!("Grade {grade}");

let pair = (0, -2);
match pair {
    (0, y) => println!("on the y axis at {y}"),
    (x, 0) => println!("on the x axis at {x}"),
    _ => println!("somewhere else"),
}`,
        deep: "Exhaustive matching is a key safety feature: add a new enum variant and the compiler shows every `match` you need to update. Use `if let` when you only care about one pattern." },
      { id: 'loops', title: 'Loops', level: 'beginner',
        body: "`for x in 1..=3` loops over a range (`..` excludes the end, `..=` includes it). `while` repeats while a condition holds. `loop` repeats forever until `break` — and can return a value.",
        code: R`for i in 1..=3 {
    println!("i = {i}");
}

let fruits = ["apple", "banana", "cherry"];
for (index, fruit) in fruits.iter().enumerate() {
    println!("{index}: {fruit}");
}

let mut n = 3;
while n > 0 {
    println!("countdown {n}");
    n -= 1;
}

let mut tries = 0;
let result = loop {
    tries += 1;
    if tries == 4 {
        break tries * 10;       // loop returns a value
    }
};
println!("result = {result}");`,
        deep: "Loop labels (`'outer: loop { ... break 'outer; }`) break out of nested loops. Iterating with `for x in &vec` borrows; `for x in vec` consumes (moves) the vector." },
      { id: 'func', title: 'Functions & closures', level: 'beginner', full: true,
        body: "Functions declare parameter types and a return type after `->`. The **last expression without a semicolon** is the return value. Closures `|x| x * 2` are anonymous functions that can capture surrounding variables.",
        code: R`fn add(a: i32, b: i32) -> i32 {
    a + b // no semicolon = this is the return value
}

fn divide(a: f64, b: f64) -> (f64, bool) {
    if b == 0.0 {
        return (0.0, false); // early return
    }
    (a / b, true)
}

fn main() {
    println!("3 + 4 = {}", add(3, 4));
    let (value, ok) = divide(10.0, 4.0);
    println!("{value} {ok}");

    let offset = 10;
    let shift = |x: i32| x + offset; // closure captures offset
    println!("{}", shift(5));
}`,
        deep: "Expressions vs statements is fundamental: adding a `;` to the last line turns it into a statement returning `()`, causing a type-mismatch error. Closures implement `Fn`, `FnMut` or `FnOnce` depending on how they use captured variables." },
      { id: 'ownership', title: 'Ownership & borrowing', level: 'intermediate',
        body: "Rust's big idea: every value has **one owner**. Assigning a `String` to another variable **moves** it — the old name can't be used. To use a value without taking ownership, **borrow** it with `&` (read-only) or `&mut` (mutable).\n\nRule: you can have many `&` borrows **or** one `&mut` borrow at a time.",
        code: R`let s1 = String::from("hello");
let s2 = s1;                       // ownership MOVES to s2
// println!("{s1}");               // error: s1 was moved — try uncommenting!
println!("{s2}");

let s3 = s2.clone();               // deep copy: both are valid
println!("{s2} {s3}");

let len = calculate_length(&s3);   // borrow with &
println!("'{s3}' has {len} chars");

let mut text = String::from("Hi");
add_excitement(&mut text);         // mutable borrow
println!("{text}");

fn calculate_length(s: &str) -> usize {
    s.len()
}

fn add_excitement(s: &mut String) {
    s.push_str("!!!");
}`,
        deep: "Simple `Copy` types (integers, floats, bool, char) are copied instead of moved. The borrow checker prevents data races and use-after-free at compile time. When a borrow-checker error confuses you, try restructuring so borrows end sooner, or clone deliberately." },
      { id: 'structs', title: 'Structs & methods', level: 'intermediate', full: true,
        body: "A `struct` groups named fields. Methods go in an `impl` block; their first parameter `&self` borrows the instance. Associated functions without `self` (like `new`) act as constructors. `#[derive(Debug)]` lets you print the struct with `{:?}`.",
        code: R`#[derive(Debug, Clone, PartialEq)]
struct Account {
    owner: String,
    balance: f64,
}

impl Account {
    fn new(owner: &str) -> Self {
        Account { owner: owner.to_string(), balance: 0.0 }
    }

    fn deposit(&mut self, amount: f64) {
        self.balance += amount;
    }

    fn summary(&self) -> String {
        format!("{} has £{:.2}", self.owner, self.balance)
    }
}

fn main() {
    let mut acct = Account::new("Ada");
    acct.deposit(150.0);
    acct.deposit(25.5);
    println!("{}", acct.summary());
    println!("{:?}", acct);
    println!("{:#?}", acct.clone()); // pretty-printed debug
}`,
        deep: "`&self` borrows, `&mut self` borrows mutably, and `self` takes ownership (consuming the value). Struct update syntax `Account { balance: 1.0, ..other }` copies remaining fields. Fields are private to the module unless marked `pub`." },
      { id: 'enums', title: 'Enums & Option', level: 'intermediate', full: true,
        body: "Rust enums can hold data in each variant, and `match` unpacks them. Rust has no `null`; instead a value that might be missing is an `Option<T>`: either `Some(value)` or `None`. The compiler forces you to handle both cases.",
        code: R`enum Shape {
    Circle(f64),
    Rect { w: f64, h: f64 },
    Point,
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => 3.14159 * r * r,
        Shape::Rect { w, h } => w * h,
        Shape::Point => 0.0,
    }
}

fn find_even(nums: &[i32]) -> Option<i32> {
    for &n in nums {
        if n % 2 == 0 {
            return Some(n);
        }
    }
    None
}

fn main() {
    let shapes = [Shape::Circle(1.0), Shape::Rect { w: 2.0, h: 3.0 }, Shape::Point];
    for s in &shapes {
        println!("area = {:.2}", area(s));
    }

    match find_even(&[1, 3, 8, 5]) {
        Some(n) => println!("first even: {n}"),
        None => println!("no evens"),
    }
    if let Some(n) = find_even(&[1, 3]) {
        println!("found {n}");
    } else {
        println!("none found");
    }
    println!("{}", find_even(&[7]).unwrap_or(-1));
}`,
        deep: "Option has many combinators: `map`, `and_then`, `unwrap_or_else`, `ok_or`, `filter`. Avoid `unwrap()` in production code — it panics on `None`; prefer `?`, `match` or `expect(\"why this can't fail\")`." },
      { id: 'errors', title: 'Error handling with Result', level: 'intermediate', full: true,
        body: "Operations that can fail return `Result<T, E>`: `Ok(value)` or `Err(error)`. The `?` operator returns the error early to the caller if something fails, keeping code short. `panic!` is reserved for unrecoverable bugs.",
        code: R`use std::num::ParseIntError;

fn parse_and_double(text: &str) -> Result<i32, ParseIntError> {
    let n: i32 = text.trim().parse()?; // ? returns early on Err
    Ok(n * 2)
}

fn safe_divide(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        return Err(String::from("division by zero"));
    }
    Ok(a / b)
}

fn main() {
    for input in ["21", "abc", " 7 "] {
        match parse_and_double(input) {
            Ok(v) => println!("{input:?} -> {v}"),
            Err(e) => println!("{input:?} -> error: {e}"),
        }
    }
    println!("{:?}", safe_divide(10, 2));
    println!("{:?}", safe_divide(1, 0));
}`,
        deep: "Define your own error enums and implement `From` so `?` converts between error types; crates like `thiserror` (libraries) and `anyhow` (applications) remove the boilerplate. `main` can return `Result<(), Box<dyn Error>>` to use `?` at the top level." },
      { id: 'collections', title: 'Vec, HashMap & strings', level: 'intermediate',
        body: "`Vec<T>` is a growable list (create one with `vec![...]`). `HashMap<K, V>` maps keys to values. `String` is an owned, growable UTF-8 string; `&str` is a borrowed string slice.",
        code: R`use std::collections::HashMap;

let mut nums = vec![5, 3, 8];
nums.push(1);
nums.sort();
println!("{:?} len={} first={:?}", nums, nums.len(), nums.first());

let mut ages: HashMap<&str, u32> = HashMap::new();
ages.insert("Ada", 36);
ages.insert("Linus", 54);
*ages.entry("Ada").or_insert(0) += 1;
println!("Ada is {}", ages["Ada"]);
println!("Bob: {:?}", ages.get("Bob"));

let mut word_counts = HashMap::new();
for word in "the cat and the hat".split_whitespace() {
    *word_counts.entry(word).or_insert(0) += 1;
}
println!("'the' appears {} times", word_counts["the"]);

let mut s = String::from("Hello");
s.push_str(", world");
println!("{s} ({} bytes) upper={}", s.len(), s.to_uppercase());`,
        deep: "Strings can't be indexed by integer (`s[0]`) because UTF-8 characters vary in byte length — use `s.chars()`, `s.bytes()` or slices on character boundaries. The `entry` API avoids double lookups when updating maps." },
      { id: 'traits', title: 'Traits & generics', level: 'advanced', full: true,
        body: "A **trait** defines shared behaviour (like an interface). Types implement traits with `impl Trait for Type`. **Generics** with trait bounds let one function work for any type that has the required behaviour.",
        code: R`trait Describe {
    fn name(&self) -> String;
    fn describe(&self) -> String {
        // default method
        format!("This is {}", self.name())
    }
}

struct Dog;
struct Robot {
    id: u32,
}

impl Describe for Dog {
    fn name(&self) -> String {
        "a dog".to_string()
    }
}

impl Describe for Robot {
    fn name(&self) -> String {
        format!("robot #{}", self.id)
    }
    fn describe(&self) -> String {
        format!("BEEP. I am {}", self.name())
    }
}

fn introduce<T: Describe>(item: &T) {
    println!("{}", item.describe());
}

fn largest<T: PartialOrd + Copy>(items: &[T]) -> T {
    let mut max = items[0];
    for &i in items {
        if i > max {
            max = i;
        }
    }
    max
}

fn main() {
    introduce(&Dog);
    introduce(&Robot { id: 7 });
    let things: Vec<Box<dyn Describe>> = vec![Box::new(Dog), Box::new(Robot { id: 1 })];
    for t in &things {
        println!("- {}", t.name());
    }
    println!("{} {}", largest(&[3, 9, 2]), largest(&[1.5, 0.2]));
}`,
        deep: "Generics are monomorphised (a copy per type: zero-cost but larger binaries); `dyn Trait` uses dynamic dispatch through a vtable. Standard traits like `Display`, `From`, `Iterator`, `Default` and `PartialEq` integrate your types with the whole ecosystem." },
      { id: 'iter', title: 'Iterators & closures', level: 'advanced',
        body: "Iterators process sequences lazily and chain together: `map`, `filter`, `sum`, `collect` and many more. They compile down to code as fast as hand-written loops.",
        code: R`let nums = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let even_squares: Vec<i32> = nums.iter()
    .filter(|&&n| n % 2 == 0)
    .map(|&n| n * n)
    .collect();
println!("{even_squares:?}");

let total: i32 = nums.iter().sum();
let max = nums.iter().max().unwrap();
println!("sum={total} max={max}");

let words = ["apple", "bob", "kayak", "rust"];
let palindromes: Vec<&str> = words.iter()
    .copied()
    .filter(|w| w.chars().rev().collect::<String>() == *w)
    .collect();
println!("palindromes: {palindromes:?}");

let (small, big): (Vec<i32>, Vec<i32>) = nums.iter().partition(|&&n| n < 5);
println!("{small:?} {big:?}");
println!("{:?}", nums.windows(2).map(|w| w[1] - w[0]).collect::<Vec<_>>());`,
        deep: "`iter()` yields `&T`, `iter_mut()` yields `&mut T` and `into_iter()` yields `T` (consuming the collection). Nothing happens until a consumer like `collect`, `sum` or `for` drives the iterator." }
    ],
    // Rust best practices (the "Best practices" tab).
    tips: [
      'Read compiler errors top to bottom — they usually tell you exactly how to fix the problem.',
      'Run `cargo fmt` and `cargo clippy` on real projects; Clippy teaches idiomatic Rust.',
      'Prefer borrowing (`&T`, `&str`, `&[T]`) in function parameters over taking ownership.',
      'Avoid `unwrap()` outside quick experiments and tests; use `?`, `match` or `expect` with a message.',
      'Make illegal states unrepresentable with enums and the type system.',
      'Prefer iterators and combinators over manual index loops.',
      'Keep variables immutable unless they truly need `mut`.',
      'Name things `snake_case` for functions/variables, `PascalCase` for types and traits, `SCREAMING_CASE` for constants.'
    ],
    // Common Rust beginner mistakes.
    pitfalls: [
      'Using a value after it has been moved — borrow with `&` or `.clone()` it.',
      'Forgetting `mut` and getting "cannot assign twice to immutable variable".',
      'Adding a `;` to the last line of a function, so it no longer returns the value.',
      'Trying to index a `String` with `s[0]`.',
      'Holding a `&mut` borrow while also reading the same value.'
    ]
  });

  /* ===================================================================== Go */
  // GO
  // Compiled on Wandbox ("slow": Go builds there can take up to a minute).
  // Go code uses tab characters for indentation, so its examples are
  // written with spaces here and G converts them to tabs. "wrap" adds
  // package main, import "fmt" and func main().
  LANGS.push({
    id: 'go', name: 'Go', aka: 'golang', tag: 'Go', color: '#00add8', file: 'main.go', cmd: 'go run main.go',
    kind: 'cloud', engine: 'wandbox', wb: { lang: 'Go', slow: true }, trace: 'explain', mode: 'text/x-go', indent: 4, tabs: true, comment: ['//'],
    wrap: 'package main\n\nimport "fmt"\n\nfunc main() {\n{{CODE}}\n}\n', wrapIndent: '\t',
    scaffold: 'package main\n\nimport "fmt"\n\n{{COMMENT}}\n\nfunc main() {\n\t// Your code here\n\tfmt.Println()\n}\n',
    blurb: 'Simple, fast and built for servers and the cloud. Great concurrency with goroutines. Powers Docker and Kubernetes.',
    intro: 'Go (Golang) was designed at Google for simplicity: a small language, fast compilation, a single binary, and first-class concurrency with **goroutines** and **channels**. It deliberately leaves out features like inheritance. Go is strict: unused variables and imports are compile errors. Code is compiled on the Wandbox service.',
    docs: 'https://go.dev/doc/',
    keywords: ['package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan', 'go', 'defer', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'select', 'nil', 'true', 'false', 'string', 'int', 'float64', 'bool', 'error', 'fmt', 'Println', 'Printf', 'Sprintf', 'make', 'append', 'len', 'cap', 'errors', 'strings', 'main'],
    // The starter program shown the first time you open Go.
    starter: G`// Welcome to Go! Press ▶ Run (or Ctrl+Enter).
// Go is compiled on the free Wandbox service (needs internet).
package main

import (
    "fmt"
    "strings"
)

type Task struct {
    Title string
    Done  bool
}

func summary(tasks []Task) (done, pending int) {
    for _, t := range tasks {
        if t.Done {
            done++
        } else {
            pending++
        }
    }
    return
}

func main() {
    tasks := []Task{{"Learn Go", true}, {"Build an API", false}, {"Write tests", false}}
    for i, t := range tasks {
        fmt.Printf("%d. %-14s done=%v\n", i+1, t.Title, t.Done)
    }
    d, p := summary(tasks)
    fmt.Println(strings.Repeat("-", 28))
    fmt.Printf("%d done, %d pending\n", d, p)
}
`,
    // Go syntax guide lessons, from beginner to advanced.
    sections: [
      { id: 'hello', title: 'Hello, World & packages', level: 'beginner', full: true,
        body: "Every Go file starts with `package`. Executable programs use `package main` with a `func main()`. `import` brings in packages such as `fmt` (formatting and printing).\n\nGo uses braces but no semicolons; the opening `{` **must** be on the same line.",
        code: G`package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    fmt.Println("Go was released in", 2009)
    fmt.Print("Print adds no newline. ")
    fmt.Printf("Printf formats: %s is %d\n", "Go", 15)
}`,
        deep: "`gofmt` formats all Go code the same way (tabs for indentation), ending style debates. Exported names start with a capital letter (`fmt.Println`); lowercase names are private to their package." },
      { id: 'vars', title: 'Variables, constants & types', level: 'beginner',
        body: "Declare with `var name type = value`, or inside functions use the short form `name := value` (type inferred). Variables declared without a value get a **zero value**: `0`, `\"\"`, `false` or `nil`.\n\nGo refuses to compile if you declare a variable and never use it.",
        code: G`var name string = "Ada"
age := 36             // short declaration: type inferred
var height float64    // zero value: 0
const pi = 3.14159
isCoder, year := true, 2026

age++
fmt.Println(name, age, height, pi, isCoder, year)
fmt.Printf("%T %T %T %T\n", name, age, height, isCoder)

var x int = 7
y := float64(x) / 2    // explicit conversion required
fmt.Println(y)`,
        deep: "Basic types: `bool`, `string`, `int`/`int8`…`int64`, `uint`…, `float32`/`float64`, `byte` (alias for `uint8`) and `rune` (alias for `int32`, a Unicode code point). Go never converts types implicitly, even between `int` and `int64`." },
      { id: 'fmt', title: 'Strings & formatting', level: 'beginner', full: true,
        body: "`fmt.Printf` formats with verbs: `%d` integer, `%f` float, `%s` string, `%v` any value, `%+v` struct with field names, `%T` type, `%q` quoted string. `fmt.Sprintf` returns the string instead of printing. The `strings` package has text helpers.",
        code: G`package main

import (
    "fmt"
    "strings"
)

func main() {
    name := "Grace Hopper"
    fmt.Printf("%s has %d bytes\n", name, len(name))
    fmt.Printf("%q %v %.2f %5d|\n", name, []int{1, 2}, 3.14159, 42)

    fmt.Println(strings.ToUpper(name), strings.Contains(name, "Hop"))
    fmt.Println(strings.Split("a,b,c", ","), strings.Join([]string{"x", "y"}, "-"))
    fmt.Println(strings.Replace(name, "Grace", "Admiral", 1), name[0:5])

    msg := fmt.Sprintf("%s was born in %d", "Grace", 1906)
    fmt.Println(msg)

    for i, r := range "héllo" {
        fmt.Printf("%d:%c ", i, r)
    }
    fmt.Println()
}`,
        deep: "Strings are immutable byte sequences (usually UTF-8). `len` counts bytes; `range` over a string yields runes. Build strings efficiently with `strings.Builder`." },
      { id: 'control', title: 'if & switch', level: 'beginner',
        body: "`if` needs no parentheses but always needs braces. It can start with a short statement: `if n := f(); n > 3 { }`. `switch` cases don't fall through (no `break` needed) and can list several values.",
        code: G`temperature := 23
if temperature > 30 {
    fmt.Println("Hot!")
} else if temperature > 15 {
    fmt.Println("Pleasant")
} else {
    fmt.Println("Cold")
}

if n := len("hello"); n > 3 {
    fmt.Println("long word:", n)
}

switch day := "sat"; day {
case "sat", "sun":
    fmt.Println("Weekend")
default:
    fmt.Println("Weekday")
}

switch {
case temperature < 0:
    fmt.Println("freezing")
case temperature < 25:
    fmt.Println("mild")
}`,
        deep: "A `switch` with no value is a clean replacement for long if/else chains. Use `fallthrough` explicitly if you really want C-style fall-through. Type switches (`switch v := x.(type)`) branch on an interface's dynamic type." },
      { id: 'loops', title: 'Loops (just for!)', level: 'beginner',
        body: "Go has only one loop keyword: `for`. It covers classic loops, while-style loops (`for condition { }`), infinite loops (`for { }`) and iteration with `range` over slices, maps, strings and channels.",
        code: G`for i := 1; i <= 3; i++ {
    fmt.Println("i =", i)
}

n := 3
for n > 0 {        // like while
    fmt.Println("countdown", n)
    n--
}

fruits := []string{"apple", "banana", "cherry"}
for index, fruit := range fruits {
    fmt.Println(index, fruit)
}
for _, fruit := range fruits {   // _ ignores the index
    fmt.Print(fruit, " ")
}
fmt.Println()

count := 0
for {
    count++
    if count == 5 {
        break
    }
}
fmt.Println("count:", count)`,
        deep: "Since Go 1.22 each loop iteration gets its own copy of the loop variable, fixing a classic closure bug. You can also `range` over an integer (`for i := range 10`) in Go 1.22+." },
      { id: 'func', title: 'Functions & multiple returns', level: 'beginner', full: true,
        body: "Functions declare types after names: `func add(a, b int) int`. They can return **multiple values** — idiomatically a result and an error. Functions are values, and closures capture surrounding variables. `defer` schedules a call to run when the function returns.",
        code: G`package main

import "fmt"

func add(a, b int) int {
    return a + b
}

func divmod(a, b int) (int, int) {
    return a / b, a % b
}

func sum(nums ...int) (total int) {     // variadic + named result
    for _, n := range nums {
        total += n
    }
    return
}

func counter() func() int {             // returns a closure
    c := 0
    return func() int {
        c++
        return c
    }
}

func main() {
    defer fmt.Println("deferred: printed last")
    fmt.Println(add(3, 4))
    q, r := divmod(17, 5)
    fmt.Println(q, r)
    fmt.Println(sum(1, 2, 3, 4))
    next := counter()
    fmt.Println(next(), next(), next())
}`,
        deep: "Deferred calls run in LIFO order and are perfect for cleanup (`defer file.Close()`, `defer mu.Unlock()`). Go passes everything by value; pass a pointer to let a function modify the caller's data." },
      { id: 'slices', title: 'Slices & maps', level: 'beginner',
        body: "A **slice** is a flexible view over an array: `[]int{1, 2, 3}`. Grow it with `append` (always assign the result back!). A **map** stores key→value pairs: `map[string]int{}`. Looking up a missing key returns the zero value; use the \"comma ok\" form to check existence.",
        code: G`nums := []int{5, 3, 8}
nums = append(nums, 1, 10)
fmt.Println(nums, len(nums), nums[0], nums[len(nums)-1])
fmt.Println(nums[1:3])          // slicing

grid := make([][]int, 2)
for i := range grid {
    grid[i] = make([]int, 3)
}
grid[1][2] = 9
fmt.Println(grid)

ages := map[string]int{"Ada": 36, "Linus": 54}
ages["Grace"] = 85
ages["Ada"]++
delete(ages, "Linus")
age, ok := ages["Bob"]          // comma-ok idiom
fmt.Println(ages["Ada"], len(ages), age, ok)
for name, a := range ages {
    fmt.Println(name, a)
}`,
        deep: "Slices share their underlying array, so modifying a sub-slice can change the original; `append` may or may not reallocate. Map iteration order is randomised on purpose. Use `slices` and `maps` packages (Go 1.21+) for sorting and searching." },
      { id: 'structs', title: 'Structs, methods & pointers', level: 'intermediate', full: true,
        body: "A `struct` groups fields. Methods are functions with a **receiver**: `func (a *Account) Deposit(...)`. Use a pointer receiver (`*Account`) when the method modifies the struct. `&x` takes the address; Go has pointers but no pointer arithmetic.",
        code: G`package main

import "fmt"

type Account struct {
    Owner   string
    Balance float64
}

func NewAccount(owner string) *Account {    // constructor function
    return &Account{Owner: owner}
}

func (a *Account) Deposit(amount float64) { // pointer receiver: modifies
    a.Balance += amount
}

func (a Account) String() string {          // value receiver: read-only
    return fmt.Sprintf("%s: £%.2f", a.Owner, a.Balance)
}

type Point struct{ X, Y int }

func main() {
    acct := NewAccount("Ada")
    acct.Deposit(100)
    acct.Deposit(25.5)
    fmt.Println(acct)            // uses String()
    fmt.Printf("%+v\n", *acct)

    p := Point{1, 2}
    q := &p
    q.X = 10                     // automatic dereference
    fmt.Println(p)
}`,
        deep: "Go favours composition over inheritance: embed one struct in another (`type Admin struct { User; Level int }`) to promote its fields and methods. Be consistent: if any method needs a pointer receiver, give all methods pointer receivers." },
      { id: 'interfaces', title: 'Interfaces', level: 'intermediate', full: true,
        body: "An **interface** lists method signatures. Any type that has those methods satisfies the interface automatically — no `implements` keyword. This makes code flexible and easy to test.",
        code: G`package main

import (
    "fmt"
    "math"
)

type Shape interface {
    Area() float64
    Name() string
}

type Circle struct{ R float64 }
type Rect struct{ W, H float64 }

func (c Circle) Area() float64 { return math.Pi * c.R * c.R }
func (c Circle) Name() string  { return "circle" }
func (r Rect) Area() float64   { return r.W * r.H }
func (r Rect) Name() string    { return "rectangle" }

func describe(s Shape) {
    fmt.Printf("%s with area %.2f\n", s.Name(), s.Area())
}

func main() {
    shapes := []Shape{Circle{1}, Rect{3, 4}}
    total := 0.0
    for _, s := range shapes {
        describe(s)
        total += s.Area()
    }
    fmt.Printf("total %.2f\n", total)

    var s Shape = Rect{2, 2}
    if r, ok := s.(Rect); ok {   // type assertion
        fmt.Println("it's a rect of width", r.W)
    }
}`,
        deep: "\"Accept interfaces, return structs.\" Keep interfaces small (`io.Reader` has one method) and define them where they're used. `any` (alias for `interface{}`) holds any value but loses type safety; prefer generics or specific interfaces." },
      { id: 'errors', title: 'Error handling', level: 'intermediate', full: true,
        body: "Go has no exceptions for normal errors. Functions return an `error` as their last value, and callers check `if err != nil` right away. Create errors with `errors.New` or `fmt.Errorf`; wrap them with `%w` to add context.",
        code: G`package main

import (
    "errors"
    "fmt"
    "strconv"
)

var ErrNegative = errors.New("negative number")

func parseAge(s string) (int, error) {
    n, err := strconv.Atoi(s)
    if err != nil {
        return 0, fmt.Errorf("parseAge(%q): %w", s, err)
    }
    if n < 0 {
        return 0, ErrNegative
    }
    return n, nil
}

func main() {
    for _, in := range []string{"42", "abc", "-3"} {
        age, err := parseAge(in)
        if errors.Is(err, ErrNegative) {
            fmt.Println(in, "-> negative!")
            continue
        }
        if err != nil {
            fmt.Println(in, "-> error:", err)
            continue
        }
        fmt.Println(in, "-> age", age)
    }
}`,
        deep: "`errors.Is` checks for a specific error anywhere in a wrapped chain, and `errors.As` extracts a typed error. `panic`/`recover` exist for truly unrecoverable situations, not ordinary control flow." },
      { id: 'goroutines', title: 'Goroutines & channels', level: 'advanced', full: true,
        body: "Put `go` before a function call to run it concurrently in a lightweight **goroutine**. **Channels** let goroutines send each other values safely. A `sync.WaitGroup` waits for a group of goroutines to finish.",
        code: G`package main

import (
    "fmt"
    "sync"
    "time"
)

func worker(id int, jobs <-chan int, results chan<- string, wg *sync.WaitGroup) {
    defer wg.Done()
    for j := range jobs {
        time.Sleep(10 * time.Millisecond) // pretend to work
        results <- fmt.Sprintf("worker %d squared %d = %d", id, j, j*j)
    }
}

func main() {
    jobs := make(chan int, 5)
    results := make(chan string, 5)
    var wg sync.WaitGroup

    for w := 1; w <= 3; w++ {
        wg.Add(1)
        go worker(w, jobs, results, &wg)
    }
    for j := 1; j <= 5; j++ {
        jobs <- j
    }
    close(jobs)

    wg.Wait()
    close(results)
    for r := range results {
        fmt.Println(r)
    }
}`,
        deep: "\"Don't communicate by sharing memory; share memory by communicating.\" `select` waits on multiple channels (great with `time.After` for timeouts). Use `sync.Mutex` for simple shared state and `context.Context` for cancellation. Run tests with `-race` to detect data races." },
      { id: 'generics', title: 'Generics', level: 'advanced', full: true,
        body: "Since Go 1.18, functions and types can take **type parameters** in square brackets. Constraints like `cmp.Ordered` say which types are allowed.",
        code: G`package main

import (
    "cmp"
    "fmt"
)

func Max[T cmp.Ordered](items []T) T {
    best := items[0]
    for _, v := range items[1:] {
        if v > best {
            best = v
        }
    }
    return best
}

func Map[T, U any](items []T, f func(T) U) []U {
    out := make([]U, 0, len(items))
    for _, v := range items {
        out = append(out, f(v))
    }
    return out
}

type Stack[T any] struct{ items []T }

func (s *Stack[T]) Push(v T) { s.items = append(s.items, v) }
func (s *Stack[T]) Pop() T {
    v := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return v
}

func main() {
    fmt.Println(Max([]int{3, 9, 2}), Max([]string{"pear", "apple"}))
    fmt.Println(Map([]int{1, 2, 3}, func(n int) string { return fmt.Sprint(n * n) }))
    var s Stack[string]
    s.Push("a")
    s.Push("b")
    fmt.Println(s.Pop(), s.Pop())
}`,
        deep: "Use generics for data structures and algorithms that are truly type-agnostic; plain interfaces remain the idiomatic choice for behaviour. The standard `slices` and `maps` packages are built with generics." }
    ],
    // Go best practices (the "Best practices" tab).
    tips: [
      'Run `gofmt` (or `go fmt`) — all Go code uses the same formatting with tabs.',
      'Handle errors immediately with `if err != nil { return ... }`; add context with `fmt.Errorf("doing X: %w", err)`.',
      'Keep names short in small scopes (`i`, `r`, `err`) and descriptive at package level. Exported names start with a capital letter.',
      'Accept interfaces, return concrete types, and keep interfaces small.',
      'Use `defer` for cleanup right after acquiring a resource.',
      'Prefer composition (struct embedding) over inheritance-style designs.',
      'Don\'t start goroutines without knowing how they will stop; use `context` for cancellation.',
      'Use `go vet`, `staticcheck` and `go test -race` regularly.'
    ],
    // Common Go beginner mistakes.
    pitfalls: [
      'Declaring a variable or importing a package and not using it — that\'s a compile error.',
      'Putting the opening `{` on a new line (Go inserts a semicolon and fails).',
      'Forgetting to assign the result of `append`: `s = append(s, x)`.',
      'Writing to a `nil` map (declare with `make(map[K]V)` or a literal).',
      'Using `:=` inside an `if` or loop and accidentally shadowing an outer variable.'
    ]
  });
})();
