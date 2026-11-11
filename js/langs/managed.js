// ================================================================
//  js/langs/managed.js: content for Java and C#
// ================================================================
//  This file holds DATA, not behaviour: each language's starter program,
//  syntax guide lessons, tips and settings. The other JavaScript files
//  (app.js, engines.js...) read this data to build the screens.
//
//  Every language object has the same fields; js/langs/web.js explains
//  each field in detail at the top of that file.
// ================================================================
/* Java, C# */
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

  /* ===================================================================== Java */
  // JAVA
  // Compiled on Wandbox ("slow": can take 20 to 60 seconds). Wandbox
  // saves the code as prog.java, and Java won't compile a PUBLIC class
  // named Main in a file with a different name, so "transform" quietly
  // removes the word public from "public class Main" before sending it.
  // The line count stays the same, so error line numbers still match.
  LANGS.push({
    id: 'java', name: 'Java', tag: 'Java', color: '#e76f00', file: 'Main.java', cmd: 'javac Main.java && java Main',
    kind: 'cloud', engine: 'wandbox', trace: 'explain', mode: 'text/x-java', indent: 4, comment: ['//'],
    // Wandbox saves the file as prog.java, so a *public* class named Main won't compile there; strip "public" (same line count).
    wb: { lang: 'Java', slow: true, transform: (code) => code.replace(/^(\s*)public\s+((?:final\s+)?class\s+Main\b)/m, '$1$2') },
    wrap: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n{{CODE}}\n    }\n}\n', wrapIndent: '        ',
    scaffold: 'import java.util.*;\n\n{{COMMENT}}\n\npublic class Main {\n    public static void main(String[] args) {\n        // Your code here\n\n    }\n}\n',
    blurb: 'Write once, run anywhere. Powers Android, enterprise back-ends and big-data systems. Strongly typed and object-oriented.',
    intro: 'Java is a statically typed, object-oriented language that compiles to bytecode for the Java Virtual Machine (JVM). Every piece of code lives inside a **class**, and programs start at `public static void main(String[] args)`. Code is compiled with OpenJDK 22 on the Wandbox service — Java compilation there can take 10–30 seconds.',
    docs: 'https://dev.java/learn/',
    keywords: ['public', 'private', 'protected', 'static', 'final', 'class', 'interface', 'extends', 'implements', 'abstract', 'void', 'int', 'double', 'boolean', 'char', 'long', 'String', 'new', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'throws', 'this', 'super', 'null', 'true', 'false', 'import', 'System', 'out', 'println', 'printf', 'ArrayList', 'HashMap', 'List', 'Map', 'Scanner', 'length', 'size', 'record', 'var'],
    // The starter program shown the first time you open Java.
    starter: R`// Welcome to Java! Press ▶ Run (or Ctrl+Enter).
// Java is compiled on the free Wandbox service (needs internet; can take ~20s).
import java.util.*;

public class Main {
    record Student(String name, int grade) {}

    public static void main(String[] args) {
        List<Student> students = new ArrayList<>(List.of(
            new Student("Ada", 92),
            new Student("Linus", 78),
            new Student("Grace", 88)
        ));

        students.sort(Comparator.comparingInt(Student::grade).reversed());

        int total = 0;
        for (Student s : students) {
            System.out.printf("%-6s %d%n", s.name(), s.grade());
            total += s.grade();
        }
        System.out.println("Average: " + (double) total / students.size());
    }
}
`,
    // Java syntax guide lessons, from beginner to advanced.
    sections: [
      { id: 'hello', title: 'Program structure & Hello, World', level: 'beginner', full: true,
        body: "All Java code lives inside a **class**. The program starts at the `main` method, whose signature is always `public static void main(String[] args)`. `System.out.println` prints a line. Statements end with `;` and blocks use `{ }`.",
        code: R`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.print("print has no newline, ");
        System.out.println("println does.");
        System.out.printf("Java turned %d in %d%n", 30, 2025);
    }
}`,
        deep: "Normally the file name must match the public class (`Main.java`). `javac` compiles source into `.class` bytecode, which the JVM runs and JIT-compiles to machine code. Since Java 21, preview features allow even simpler `void main()` entry points." },
      { id: 'vars', title: 'Variables & primitive types', level: 'beginner',
        body: "Java is statically typed: declare the type before the name. Primitive types: `int`, `long`, `double`, `boolean`, `char` (plus `byte`, `short`, `float`). `String` is a class, written with a capital S. `final` makes a variable unchangeable. `var` lets the compiler infer a local variable's type.",
        code: R`int age = 36;
double height = 1.65;
boolean isCoder = true;
char initial = 'A';               // single quotes for char
long population = 8_000_000_000L; // underscores for readability
String name = "Ada";              // double quotes for String
final int DAYS = 7;               // constant
var city = "London";              // type inferred: String

age++;
System.out.println(name + " " + age + " " + height + " " + isCoder + " " + initial);
System.out.println(population + " " + DAYS + " " + city);
System.out.println(Integer.MAX_VALUE + " " + (7 / 2) + " " + (7 / 2.0));`,
        deep: "Primitives hold values directly; every other type is a reference to an object. Each primitive has a wrapper class (`Integer`, `Double`…) used in collections, with automatic boxing/unboxing. `int` overflow wraps silently — use `Math.addExact` or `long` when it matters." },
      { id: 'strings', title: 'Strings', level: 'beginner',
        body: "Strings are immutable objects with many methods: `length()`, `toUpperCase()`, `substring()`, `contains()`, `split()`... Compare strings with `.equals()`, **not** `==` (which compares object identity).",
        code: R`String first = "Grace";
String last = "Hopper";
String full = first + " " + last;

System.out.println(full.length() + " " + full.toUpperCase());
System.out.println(full.substring(0, 5) + " " + full.charAt(6) + " " + full.indexOf("Hop"));
System.out.println(full.contains("Hop") + " " + full.replace("Grace", "Admiral"));
System.out.println(String.join("-", "a", "b", "c") + " " + Arrays.toString("x,y".split(",")));
System.out.println("  trim  ".strip() + "|" + "ha".repeat(3));
System.out.println(String.format("%s is %d", first, 85));

String typed = new String("Grace");
System.out.println((typed == first) + " vs " + typed.equals(first));

String block = """
    Text blocks keep
    line breaks.""";
System.out.println(block);`,
        deep: "Building strings in a loop with `+` creates many temporary objects; use `StringBuilder`. `String.valueOf(x)` and `Integer.parseInt(s)` convert between strings and numbers." },
      { id: 'input', title: 'Reading input with Scanner', level: 'beginner', full: true,
        body: "`Scanner` reads input: `nextLine()` reads a line, `nextInt()` a number. Type your input into the **Program input** box below the terminal before running.",
        code: R`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // Put a name on line 1 and an age on line 2 of "Program input".
        Scanner in = new Scanner(System.in);
        System.out.print("Name? ");
        String name = in.hasNextLine() ? in.nextLine() : "stranger";
        System.out.print("Age? ");
        if (!in.hasNextInt()) {
            System.out.println("\nNo age given.");
            return;
        }
        int age = in.nextInt();
        System.out.printf("%nHi %s, next year you'll be %d.%n", name, age + 1);
    }
}`,
        deep: "Mixing `nextInt()` and `nextLine()` leaves the newline behind, so the next `nextLine()` returns an empty string — call `nextLine()` once to consume it. For large inputs, `BufferedReader` is much faster." },
      { id: 'cond', title: 'Conditionals & switch', level: 'beginner',
        body: "`if / else if / else` choose between paths; combine conditions with `&&`, `||`, `!`. Modern Java's **switch expression** uses arrows `->` and returns a value, without fall-through.",
        code: R`int temperature = 23;

if (temperature > 30) {
    System.out.println("Hot!");
} else if (temperature > 15) {
    System.out.println("Pleasant");
} else {
    System.out.println("Cold");
}

String label = temperature >= 18 ? "warm" : "cool";
System.out.println(label);

String day = "SAT";
String type = switch (day) {
    case "SAT", "SUN" -> "Weekend";
    case "MON", "TUE", "WED", "THU", "FRI" -> "Weekday";
    default -> "Unknown";
};
System.out.println(type);`,
        deep: "Java 21 adds pattern matching for switch: `case Circle c -> c.radius()` and record deconstruction patterns. The old `switch` statement with `case X:` falls through without `break` — prefer the arrow form." },
      { id: 'loops', title: 'Loops', level: 'beginner',
        body: "The classic `for (init; condition; update)`, the **enhanced for** `for (Type x : collection)` for arrays and lists, `while`, and `do-while`. `break` and `continue` control the flow.",
        code: R`for (int i = 1; i <= 3; i++) {
    System.out.println("i = " + i);
}

String[] fruits = {"apple", "banana", "cherry"};
for (String fruit : fruits) {
    System.out.println("I like " + fruit);
}

int n = 3;
while (n > 0) {
    System.out.println("countdown " + n);
    n--;
}

for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;
    if (i > 7) break;
    System.out.print(i + " ");
}
System.out.println();`,
        deep: "Don't remove items from a list inside an enhanced for loop (`ConcurrentModificationException`); use `list.removeIf(...)` or an explicit `Iterator`." },
      { id: 'methods', title: 'Methods', level: 'beginner', full: true,
        body: "A method has a return type (`void` for none), a name and typed parameters. `static` methods belong to the class and can be called directly from `main`. **Overloading** means several methods share a name but take different parameters.",
        code: R`public class Main {
    static int add(int a, int b) {
        return a + b;
    }

    static double add(double a, double b) {   // overload
        return a + b;
    }

    static String greet(String name) {
        return "Hello, " + name + "!";
    }

    static int sum(int... numbers) {           // varargs
        int total = 0;
        for (int n : numbers) total += n;
        return total;
    }

    static int factorial(int n) {              // recursion
        return n <= 1 ? 1 : n * factorial(n - 1);
    }

    public static void main(String[] args) {
        System.out.println(add(2, 3) + " " + add(2.5, 0.25));
        System.out.println(greet("Ada"));
        System.out.println(sum(1, 2, 3, 4) + " " + factorial(10));
    }
}`,
        deep: "Java is always pass-by-value — but for objects the value passed is the reference, so a method can mutate an object's contents but can't make the caller's variable point to a different object." },
      { id: 'arrays', title: 'Arrays & ArrayList', level: 'beginner',
        body: "**Arrays** have a fixed length: `int[] a = new int[5]`. `ArrayList` grows as needed: `add`, `get`, `set`, `remove`, `size`. Collections hold objects, so use wrapper types like `Integer` in generics.",
        code: R`int[] scores = {90, 72, 85};
scores[1] = 75;
System.out.println(scores.length + " " + scores[0] + " " + Arrays.toString(scores));
Arrays.sort(scores);
System.out.println("sorted: " + Arrays.toString(scores));

List<String> names = new ArrayList<>();
names.add("Ada");
names.add("Linus");
names.add(0, "Grace");
names.remove("Linus");
System.out.println(names + " size=" + names.size() + " first=" + names.get(0));
System.out.println(names.contains("Ada") + " " + names.indexOf("Ada"));

Collections.sort(names);
System.out.println(names);
List<Integer> fixed = List.of(3, 1, 2);   // immutable list
System.out.println(fixed);`,
        deep: "Program to interfaces: declare `List<String> names = new ArrayList<>()`. `List.of` and `Map.of` create immutable collections. Arrays are covariant (a `String[]` is an `Object[]`), generics are not." },
      { id: 'maps', title: 'HashMap & other collections', level: 'intermediate',
        body: "`HashMap` stores key→value pairs. `put` adds or replaces, `get` reads (returns `null` if missing), `getOrDefault` gives a fallback. `HashSet` stores unique values.",
        code: R`Map<String, Integer> ages = new HashMap<>();
ages.put("Ada", 36);
ages.put("Linus", 54);
ages.put("Ada", 37);                       // replaces
System.out.println(ages.get("Ada") + " " + ages.getOrDefault("Bob", 0));
System.out.println(ages.containsKey("Linus") + " " + ages.size());

for (Map.Entry<String, Integer> e : ages.entrySet()) {
    System.out.println(e.getKey() + " -> " + e.getValue());
}

Map<Character, Integer> counts = new TreeMap<>();   // sorted keys
for (char c : "banana".toCharArray()) {
    counts.merge(c, 1, Integer::sum);
}
System.out.println(counts);

Set<String> tags = new HashSet<>(List.of("java", "code", "java"));
System.out.println(tags.size() + " unique tags");`,
        deep: "`HashMap` gives O(1) average operations with no ordering; `LinkedHashMap` keeps insertion order; `TreeMap` keeps keys sorted. Objects used as keys must implement `equals` and `hashCode` consistently (records do this automatically)." },
      { id: 'classes', title: 'Classes & objects', level: 'intermediate', full: true,
        body: "A class defines **fields** (data) and **methods** (behaviour). A **constructor** initialises new objects created with `new`. Keep fields `private` and expose methods — this is **encapsulation**. `this` refers to the current object.",
        code: R`class BankAccount {
    private final String owner;
    private double balance;

    BankAccount(String owner, double initial) {
        this.owner = owner;
        this.balance = initial;
    }

    void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
        balance += amount;
    }

    double getBalance() {
        return balance;
    }

    @Override
    public String toString() {
        return owner + ": £" + String.format("%.2f", balance);
    }
}

public class Main {
    public static void main(String[] args) {
        BankAccount acct = new BankAccount("Ada", 100);
        acct.deposit(50.5);
        System.out.println(acct);
        System.out.println(acct.getBalance());
    }
}`,
        deep: "For simple immutable data carriers, use a `record` (`record Point(int x, int y) {}`), which generates the constructor, accessors, `equals`, `hashCode` and `toString`. Make fields `final` whenever possible." },
      { id: 'oop', title: 'Inheritance, interfaces & polymorphism', level: 'intermediate', full: true,
        body: "A class can `extend` one parent class and `implement` many interfaces. An **interface** is a contract: a list of methods a class promises to provide. **Polymorphism** lets you treat different classes through a shared type.",
        code: R`import java.util.List;

interface Shape {
    double area();
    default String describe() {             // default method
        return getClass().getSimpleName() + " with area " + String.format("%.2f", area());
    }
}

abstract class NamedShape implements Shape {
    protected final String label;
    NamedShape(String label) { this.label = label; }
}

class Circle extends NamedShape {
    private final double r;
    Circle(double r) { super("circle"); this.r = r; }
    public double area() { return Math.PI * r * r; }
}

class Rect extends NamedShape {
    private final double w, h;
    Rect(double w, double h) { super("rect"); this.w = w; this.h = h; }
    public double area() { return w * h; }
}

public class Main {
    public static void main(String[] args) {
        List<Shape> shapes = List.of(new Circle(1), new Rect(3, 4));
        double total = 0;
        for (Shape s : shapes) {
            System.out.println(s.describe());
            total += s.area();
        }
        System.out.printf("Total: %.2f%n", total);
    }
}`,
        deep: "Favour composition and interfaces over deep inheritance trees. Sealed interfaces (`sealed interface Shape permits Circle, Rect`) combined with pattern-matching `switch` give exhaustive, type-safe handling of a fixed set of subtypes." },
      { id: 'exceptions', title: 'Exceptions', level: 'intermediate', full: true,
        body: "Errors are **exceptions**. Handle them with `try / catch / finally`. Throw your own with `throw new SomeException(...)`. **Checked** exceptions must be caught or declared with `throws`; **unchecked** ones (like `IllegalArgumentException`) don't have to be.",
        code: R`public class Main {
    static int parseAge(String text) {
        int age = Integer.parseInt(text);           // may throw NumberFormatException
        if (age < 0) throw new IllegalArgumentException("age cannot be negative");
        return age;
    }

    public static void main(String[] args) {
        String[] inputs = {"42", "abc", "-5"};
        for (String in : inputs) {
            try {
                System.out.println(in + " -> " + parseAge(in));
            } catch (NumberFormatException e) {
                System.out.println(in + " -> not a number");
            } catch (IllegalArgumentException e) {
                System.out.println(in + " -> " + e.getMessage());
            } finally {
                System.out.println("   (checked " + in + ")");
            }
        }
        // Remove the // below to see an uncaught exception and its stack trace:
        // int[] a = new int[2]; a[5] = 1;
    }
}`,
        deep: "Use try-with-resources (`try (var reader = Files.newBufferedReader(path)) { ... }`) to close resources automatically. Catch the most specific exception you can handle, never swallow exceptions silently, and preserve the cause when re-throwing." },
      { id: 'streams', title: 'Generics, lambdas & streams', level: 'advanced', full: true,
        body: "**Generics** (`List<String>`, `Box<T>`) make code type-safe and reusable. **Lambdas** (`x -> x * 2`) are short functions. The **Stream API** processes collections declaratively with `filter`, `map`, `reduce` and `collect`.",
        code: R`import java.util.*;
import java.util.stream.*;

public class Main {
    static class Box<T> {
        private final T value;
        Box(T value) { this.value = value; }
        T get() { return value; }
    }

    static <T extends Comparable<T>> T max(List<T> items) {
        T best = items.get(0);
        for (T item : items) if (item.compareTo(best) > 0) best = item;
        return best;
    }

    public static void main(String[] args) {
        Box<String> b = new Box<>("hello");
        System.out.println(b.get().toUpperCase() + " " + max(List.of(3, 9, 2)));

        List<String> words = List.of("apple", "banana", "avocado", "cherry", "blueberry");
        List<String> aWords = words.stream()
            .filter(w -> w.startsWith("a"))
            .map(String::toUpperCase)
            .collect(Collectors.toList());
        System.out.println(aWords);

        Map<Character, List<String>> byLetter = words.stream()
            .collect(Collectors.groupingBy(w -> w.charAt(0), TreeMap::new, Collectors.toList()));
        System.out.println(byLetter);

        int sumOfSquares = IntStream.rangeClosed(1, 5).map(n -> n * n).sum();
        double avgLen = words.stream().mapToInt(String::length).average().orElse(0);
        System.out.println(sumOfSquares + " " + avgLen);

        Optional<String> longest = words.stream().max(Comparator.comparingInt(String::length));
        System.out.println(longest.orElse("none"));
    }
}`,
        deep: "Streams are lazy and single-use. Prefer method references (`String::length`) when they read clearly, avoid side-effects inside stream operations, and remember a plain loop is sometimes clearer. Generics use type erasure: type parameters don't exist at runtime." }
    ],
    // Java best practices (the "Best practices" tab).
    tips: [
      'Follow conventions: `PascalCase` classes, `camelCase` methods and variables, `UPPER_SNAKE_CASE` constants, one public class per file.',
      'Compare strings and objects with `.equals()`, not `==`.',
      'Keep fields `private` (and `final` when possible); expose behaviour through methods.',
      'Program to interfaces: `List<String> list = new ArrayList<>();`.',
      'Use records for simple data classes and enums for fixed sets of values.',
      'Use try-with-resources for files, streams and connections.',
      'Catch specific exceptions and never leave an empty `catch` block.',
      'Prefer `StringBuilder` for building strings in loops, and the Stream API for clear collection processing.'
    ],
    // Common Java beginner mistakes.
    pitfalls: [
      'Forgetting a semicolon or a closing brace.',
      'Comparing strings with `==`.',
      'Integer division: `7 / 2` is `3`; write `7 / 2.0` for `3.5`.',
      'Calling a method on a `null` reference (NullPointerException).',
      'Calling a non-static method directly from `static main` without creating an object.'
    ]
  });

  /* ===================================================================== C# */
  // C#
  // Compiled with Mono (an older C# compiler) on Wandbox, because the
  // newer .NET compiler there is too slow. Examples therefore avoid the
  // very newest C# syntax.
  LANGS.push({
    id: 'csharp', name: 'C#', aka: 'csharp dotnet .net', tag: 'C#', color: '#68217a', file: 'Program.cs', cmd: 'csc Program.cs && mono Program.exe',
    kind: 'cloud', engine: 'wandbox', wb: { lang: 'C#', prefer: /^mono/ }, trace: 'explain', mode: 'text/x-csharp', indent: 4, comment: ['//'],
    wrap: 'using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program\n{\n    static void Main()\n    {\n{{CODE}}\n    }\n}\n', wrapIndent: '        ',
    scaffold: 'using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\n{{COMMENT}}\n\nclass Program\n{\n    static void Main()\n    {\n        // Your code here\n\n    }\n}\n',
    blurb: 'Microsoft\'s modern, versatile language for .NET: games with Unity, web APIs, desktop and cloud apps.',
    intro: 'C# is a statically typed, object-oriented language with strong functional features (LINQ, lambdas) running on .NET. It\'s the scripting language of the Unity game engine. Code here is compiled with **Mono** (C# 7) on the Wandbox service, so examples avoid the very newest syntax; newer features such as records and switch expressions are described under "Going deeper".',
    docs: 'https://learn.microsoft.com/dotnet/csharp/',
    keywords: ['using', 'namespace', 'class', 'struct', 'interface', 'enum', 'public', 'private', 'protected', 'internal', 'static', 'readonly', 'const', 'void', 'int', 'double', 'decimal', 'bool', 'char', 'string', 'var', 'new', 'return', 'if', 'else', 'for', 'foreach', 'in', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'this', 'base', 'null', 'true', 'false', 'override', 'virtual', 'abstract', 'get', 'set', 'async', 'await', 'Console', 'WriteLine', 'List', 'Dictionary', 'Where', 'Select', 'ToList', 'Count'],
    // The starter program shown the first time you open C#.
    starter: R`// Welcome to C#! Press ▶ Run (or Ctrl+Enter).
// C# is compiled on the free Wandbox service (needs internet).
using System;
using System.Collections.Generic;
using System.Linq;

class Program
{
    static void Main()
    {
        var scores = new Dictionary<string, int>
        {
            ["Ada"] = 92,
            ["Linus"] = 78,
            ["Grace"] = 88
        };

        foreach (var entry in scores.OrderByDescending(kv => kv.Value))
        {
            Console.WriteLine($"{entry.Key,-6} {entry.Value}");
        }

        double average = scores.Values.Average();
        string top = scores.OrderByDescending(kv => kv.Value).First().Key;
        Console.WriteLine($"Average: {average:F1}, top student: {top}");
    }
}
`,
    // C# syntax guide lessons, from beginner to advanced.
    sections: [
      { id: 'hello', title: 'Program structure & Hello, World', level: 'beginner', full: true,
        body: "`using System;` gives access to `Console`. Code lives in classes, and execution starts in the `static void Main()` method. `Console.WriteLine` prints a line; `Console.Write` doesn't add a newline.",
        code: R`using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, World!");
        Console.Write("Write has no newline, ");
        Console.WriteLine("WriteLine does.");
        Console.WriteLine("C# was released in {0}", 2002);
    }
}`,
        deep: "Since C# 9 you can use **top-level statements**: a file containing just `Console.WriteLine(\"Hi\");` is a complete program. Modern projects also use file-scoped namespaces (`namespace MyApp;`) and implicit `using` directives." },
      { id: 'vars', title: 'Variables & types', level: 'beginner',
        body: "Declare a type and a name: `int`, `double`, `decimal` (money), `bool`, `char`, `string`. `var` lets the compiler infer the type from the value. `const` values never change.",
        code: R`int age = 36;
double height = 1.65;
decimal price = 19.99m;      // m suffix = decimal (exact, good for money)
bool isCoder = true;
char initial = 'A';
string name = "Ada";
var city = "London";          // inferred as string
const int DaysInWeek = 7;

age++;
Console.WriteLine($"{name} {age} {height} {price} {isCoder} {initial} {city}");
Console.WriteLine($"{DaysInWeek} {int.MaxValue} {7 / 2} {7 / 2.0}");
Console.WriteLine(age.GetType());`,
        deep: "Value types (`int`, `double`, `struct`) hold data directly; reference types (`class`, `string`, arrays) hold references. Nullable value types use `int?`. In modern C# with nullable reference types enabled, `string?` marks strings that may be null." },
      { id: 'strings', title: 'Strings & interpolation', level: 'beginner',
        body: "Prefix a string with `$` to **interpolate** values with `{}` — you can add format specifiers like `{price:F2}` or alignment `{name,-10}`. Strings are immutable and have many methods.",
        code: R`string first = "Grace", last = "Hopper";
string full = first + " " + last;
double price = 4.5;

Console.WriteLine($"Hello, {full}! Coffee costs {price:C}");
Console.WriteLine($"{full.Length} {full.ToUpper()} {full.Substring(0, 5)}");
Console.WriteLine($"{full.Contains("Hop")} {full.IndexOf('H')} {full.Replace("Grace", "Admiral")}");
Console.WriteLine(string.Join("-", "a,b,c".Split(',')));
Console.WriteLine($"[{"left",-8}] [{"right",8}] [{3.14159:F2}]");
Console.WriteLine(@"Verbatim: C:\temp\no\escapes");
Console.WriteLine(string.IsNullOrWhiteSpace("   "));`,
        deep: "Use `StringBuilder` when concatenating in loops. Compare with `string.Equals(a, b, StringComparison.OrdinalIgnoreCase)` for case-insensitive checks. Newer C# adds raw string literals (`\"\"\"...\"\"\"`)." },
      { id: 'input', title: 'Reading input', level: 'beginner', full: true,
        body: "`Console.ReadLine()` reads one line of text (or `null` at end of input). Convert text to numbers safely with `int.TryParse`. Type your input into the **Program input** box before running.",
        code: R`using System;

class Program
{
    static void Main()
    {
        // Put a name on line 1 and an age on line 2 of "Program input".
        Console.Write("Name? ");
        string name = Console.ReadLine() ?? "stranger";
        Console.Write("Age? ");
        string text = Console.ReadLine();

        int age;
        if (int.TryParse(text, out age))
        {
            Console.WriteLine($"\nHi {name}, next year you'll be {age + 1}.");
        }
        else
        {
            Console.WriteLine($"\n'{text}' is not a valid age.");
        }
    }
}`,
        deep: "`int.Parse` throws `FormatException` on bad input; `TryParse` returns `false` instead, which is better for user input. `??` supplies a default when the left side is `null`." },
      { id: 'cond', title: 'Conditionals & switch', level: 'beginner',
        body: "`if / else if / else`, the ternary `cond ? a : b`, and `switch`. C# `switch` cases need `break` (no accidental fall-through), and you can match on types with patterns.",
        code: R`int temperature = 23;

if (temperature > 30)
{
    Console.WriteLine("Hot!");
}
else if (temperature > 15)
{
    Console.WriteLine("Pleasant");
}
else
{
    Console.WriteLine("Cold");
}

string label = temperature >= 18 ? "warm" : "cool";
Console.WriteLine(label);

string day = "Sat";
switch (day)
{
    case "Sat":
    case "Sun":
        Console.WriteLine("Weekend");
        break;
    default:
        Console.WriteLine("Weekday");
        break;
}

object thing = 42;
if (thing is int n && n > 40) Console.WriteLine($"a big int: {n}");`,
        deep: "C# 8+ has **switch expressions**: `var type = day switch { \"Sat\" or \"Sun\" => \"Weekend\", _ => \"Weekday\" };` plus property and relational patterns (`{ Age: >= 18 }`). They're concise and the compiler checks exhaustiveness." },
      { id: 'loops', title: 'Loops', level: 'beginner',
        body: "`for`, `while`, `do-while`, and `foreach` (for any collection). `break` and `continue` work as usual.",
        code: R`for (int i = 1; i <= 3; i++)
{
    Console.WriteLine($"i = {i}");
}

var fruits = new List<string> { "apple", "banana", "cherry" };
foreach (var fruit in fruits)
{
    Console.WriteLine($"I like {fruit}");
}

int n = 3;
while (n > 0)
{
    Console.WriteLine($"countdown {n}");
    n--;
}

for (int i = 0; i < 10; i++)
{
    if (i % 2 == 0) continue;
    if (i > 7) break;
    Console.Write($"{i} ");
}
Console.WriteLine();`,
        deep: "You can't modify a `List` while iterating it with `foreach`; use `RemoveAll(predicate)` or loop backwards with `for`." },
      { id: 'methods', title: 'Methods', level: 'beginner', full: true,
        body: "Methods have a return type, name and parameters. Parameters can be optional (default values) and passed by name. `out` and `ref` parameters let a method give back extra values. Short methods can use `=>` (expression-bodied).",
        code: R`using System;

class Program
{
    static int Add(int a, int b) => a + b;              // expression-bodied

    static string Greet(string name, string greeting = "Hello")
    {
        return $"{greeting}, {name}!";
    }

    static void MinMax(int[] values, out int min, out int max)
    {
        min = int.MaxValue;
        max = int.MinValue;
        foreach (var v in values)
        {
            if (v < min) min = v;
            if (v > max) max = v;
        }
    }

    static int Sum(params int[] numbers)
    {
        int total = 0;
        foreach (var n in numbers) total += n;
        return total;
    }

    static void Main()
    {
        Console.WriteLine(Add(2, 3));
        Console.WriteLine(Greet("Ada") + " " + Greet(greeting: "Hi", name: "Bjarne"));
        int lo, hi;
        MinMax(new[] { 4, 9, 1, 7 }, out lo, out hi);
        Console.WriteLine($"{lo} {hi} {Sum(1, 2, 3, 4)}");
    }
}`,
        deep: "Modern C# often returns **tuples** instead of `out` parameters: `(int min, int max) MinMax(...)` then `var (lo, hi) = MinMax(data);`. Local functions (methods declared inside methods) keep helpers close to where they're used." },
      { id: 'collections', title: 'Arrays, List & Dictionary', level: 'beginner',
        body: "Arrays have a fixed size; `List<T>` grows dynamically; `Dictionary<TKey, TValue>` maps keys to values. Use `TryGetValue` to read safely from a dictionary.",
        code: R`int[] scores = { 90, 72, 85 };
Array.Sort(scores);
Console.WriteLine($"{scores.Length} {scores[0]} [{string.Join(", ", scores)}]");

var names = new List<string> { "Ada", "Linus" };
names.Add("Grace");
names.Insert(0, "Alan");
names.Remove("Linus");
Console.WriteLine($"{names.Count} {names[0]} {names.Contains("Ada")} [{string.Join(", ", names)}]");

var ages = new Dictionary<string, int> { ["Ada"] = 36, ["Linus"] = 54 };
ages["Grace"] = 85;
ages["Ada"]++;
int age;
if (ages.TryGetValue("Bob", out age)) Console.WriteLine(age);
else Console.WriteLine("No Bob");
foreach (var pair in ages) Console.WriteLine($"{pair.Key}: {pair.Value}");

var unique = new HashSet<int> { 1, 2, 2, 3 };
Console.WriteLine(unique.Count);`,
        deep: "Choose the right collection: `List<T>` for ordered data, `Dictionary` for lookups, `HashSet` for membership, `Queue`/`Stack` for FIFO/LIFO. Expose read-only views (`IReadOnlyList<T>`) from classes to protect internal state." },
      { id: 'classes', title: 'Classes & properties', level: 'intermediate', full: true,
        body: "Classes contain fields, **properties** (smart fields with `get`/`set`), constructors and methods. Auto-properties like `public string Name { get; }` create the backing field for you. `override ToString()` controls how an object prints.",
        code: R`using System;

class BankAccount
{
    public string Owner { get; }                  // read-only auto-property
    public decimal Balance { get; private set; }  // public get, private set

    public BankAccount(string owner, decimal initial = 0)
    {
        Owner = owner;
        Balance = initial;
    }

    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be positive");
        Balance += amount;
    }

    public bool IsRich => Balance > 1000;          // computed property

    public override string ToString() => $"{Owner}: {Balance:C}";
}

class Program
{
    static void Main()
    {
        var acct = new BankAccount("Ada", 100);
        acct.Deposit(50.5m);
        Console.WriteLine(acct);
        Console.WriteLine($"{acct.Balance} rich? {acct.IsRich}");
        var other = new BankAccount("Linus") { };
        Console.WriteLine(other);
    }
}`,
        deep: "C# 9+ **records** (`public record Person(string Name, int Age);`) give immutable data types with value equality and `with` expressions for copies. Use `init` accessors for properties settable only during construction." },
      { id: 'oop', title: 'Inheritance & interfaces', level: 'intermediate', full: true,
        body: "A class can inherit from one base class (`: Base`) and implement many interfaces. Mark methods `virtual` (or `abstract`) in the base and `override` them in derived classes. Interfaces start with `I` by convention.",
        code: R`using System;
using System.Collections.Generic;

interface IShape
{
    double Area();
}

abstract class Shape : IShape
{
    public abstract double Area();
    public virtual string Describe() => $"{GetType().Name} with area {Area():F2}";
}

class Circle : Shape
{
    private readonly double _r;
    public Circle(double r) { _r = r; }
    public override double Area() => Math.PI * _r * _r;
}

class Square : Shape
{
    private readonly double _side;
    public Square(double side) { _side = side; }
    public override double Area() => _side * _side;
    public override string Describe() => "A square! " + base.Describe();
}

class Program
{
    static void Main()
    {
        var shapes = new List<Shape> { new Circle(1), new Square(3) };
        foreach (var s in shapes) Console.WriteLine(s.Describe());
    }
}`,
        deep: "Prefer interfaces and composition for flexibility and testability (dependency injection is built into ASP.NET Core). Seal classes not designed for inheritance (`sealed`). Interfaces can have default implementations since C# 8." },
      { id: 'linq', title: 'LINQ & lambdas', level: 'intermediate',
        body: "**LINQ** (Language Integrated Query) lets you filter, transform, sort and group collections with methods like `Where`, `Select`, `OrderBy` and `GroupBy`, using **lambda** expressions such as `x => x * 2`.",
        code: R`var numbers = Enumerable.Range(1, 10).ToList();

var evenSquares = numbers.Where(n => n % 2 == 0).Select(n => n * n).ToList();
Console.WriteLine(string.Join(", ", evenSquares));
Console.WriteLine($"sum={numbers.Sum()} avg={numbers.Average()} max={numbers.Max()}");
Console.WriteLine($"any > 9? {numbers.Any(n => n > 9)}  all > 0? {numbers.All(n => n > 0)}");

var words = new[] { "apple", "banana", "avocado", "cherry", "blueberry" };
foreach (var group in words.GroupBy(w => w[0]).OrderBy(g => g.Key))
{
    Console.WriteLine($"{group.Key}: {string.Join(", ", group)}");
}

var query = from w in words
            where w.Length > 5
            orderby w.Length descending
            select w.ToUpper();
Console.WriteLine(string.Join(" ", query));

Func<int, int> triple = x => x * 3;
Console.WriteLine(triple(7));`,
        deep: "LINQ queries are **lazy** — they run when enumerated (e.g. by `ToList()` or `foreach`), and enumerating twice runs them twice. The same syntax queries databases through Entity Framework, where it's translated into SQL." },
      { id: 'exceptions', title: 'Exceptions', level: 'intermediate', full: true,
        body: "Handle errors with `try / catch / finally`. Catch specific exception types first. Throw with `throw new ArgumentException(...)`. `using` blocks dispose resources automatically.",
        code: R`using System;

class Program
{
    static int ParseAge(string text)
    {
        int age = int.Parse(text);                 // may throw FormatException
        if (age < 0) throw new ArgumentOutOfRangeException(nameof(text), "Age cannot be negative");
        return age;
    }

    static void Main()
    {
        foreach (var input in new[] { "42", "abc", "-5" })
        {
            try
            {
                Console.WriteLine($"{input} -> {ParseAge(input)}");
            }
            catch (FormatException)
            {
                Console.WriteLine($"{input} -> not a number");
            }
            catch (ArgumentOutOfRangeException e)
            {
                Console.WriteLine($"{input} -> {e.Message}");
            }
            finally
            {
                Console.WriteLine("   (checked)");
            }
        }
    }
}`,
        deep: "Use `throw;` (not `throw e;`) to re-throw while preserving the stack trace. Exception filters (`catch (Exception e) when (e.Message.Contains(\"x\"))`) catch conditionally. Don't use exceptions for normal control flow — prefer `TryParse`-style APIs." },
      { id: 'async', title: 'Generics & async/await', level: 'advanced', full: true,
        body: "**Generics** (`List<T>`, `Box<T>`) give type-safe reusable code. `async`/`await` run slow operations (network, files, delays) without blocking; an `async` method returns a `Task` or `Task<T>`.",
        code: R`using System;
using System.Collections.Generic;
using System.Threading.Tasks;

class Box<T>
{
    public T Value { get; }
    public Box(T value) { Value = value; }
}

class Program
{
    static T Largest<T>(IEnumerable<T> items) where T : IComparable<T>
    {
        T best = default(T);
        bool first = true;
        foreach (var item in items)
        {
            if (first || item.CompareTo(best) > 0) { best = item; first = false; }
        }
        return best;
    }

    static async Task<string> BrewAsync(string drink, int ms)
    {
        await Task.Delay(ms);
        return $"{drink} ready after {ms} ms";
    }

    static async Task MainAsync()
    {
        Console.WriteLine(new Box<string>("hello").Value + " " + Largest(new[] { 3, 9, 2 }));
        var tea = BrewAsync("Tea", 200);
        var coffee = BrewAsync("Coffee", 100);
        Console.WriteLine("Both started...");
        string[] results = await Task.WhenAll(tea, coffee);
        foreach (var r in results) Console.WriteLine(r);
    }

    static void Main()
    {
        MainAsync().GetAwaiter().GetResult();
    }
}`,
        deep: "Modern C# allows `static async Task Main()` directly. Avoid `async void` except for event handlers, pass `CancellationToken`s through async APIs, and never block on async code with `.Result` in UI or ASP.NET contexts (deadlock risk)." }
    ],
    // C# best practices (the "Best practices" tab).
    tips: [
      'Follow .NET naming: `PascalCase` for classes, methods and properties; `camelCase` for locals and parameters; `_camelCase` for private fields; interfaces start with `I`.',
      'Use properties instead of public fields, and make them read-only when possible.',
      'Use `var` when the type is obvious from the right-hand side.',
      'Use string interpolation (`$"..."`) and `decimal` for money.',
      'Prefer `TryParse`/`TryGetValue` over catching exceptions for expected failures.',
      'Use LINQ for clear data processing, but avoid enumerating the same query multiple times.',
      'Dispose resources with `using`, and use `async`/`await` all the way for I/O.',
      'Enable nullable reference types and treat warnings as errors in real projects.'
    ],
    // Common C# beginner mistakes.
    pitfalls: [
      'Forgetting `break` at the end of a `switch` case (it\'s a compile error in C#).',
      'Integer division: `7 / 2` is `3`.',
      'Calling a method on `null` (NullReferenceException).',
      'Using `==` on floating-point values; compare with a tolerance instead.',
      'Modifying a collection while iterating it with `foreach`.'
    ]
  });
})();
