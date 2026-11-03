/* Python, Lua, Ruby, PHP */
window.LANGS = window.LANGS || [];
(function () {
  const R = String.raw;

  /* ===================================================================== Python */
  LANGS.push({
    id: 'python', name: 'Python', aka: 'py', tag: 'Py', color: '#3776ab', file: 'main.py', cmd: 'python3 main.py',
    kind: 'browser', engine: 'py', trace: 'trace', mode: 'python', indent: 4, comment: ['#'],
    scaffold: '{{COMMENT}}\n\n# Your code here\n',
    blurb: 'Readable, versatile and beginner-friendly. Used for automation, data science, AI, web back-ends and more.',
    intro: 'Python reads almost like English and uses **indentation** (4 spaces) instead of braces to group code. It is dynamically typed and comes with a huge standard library. This page runs real CPython 3.12 in your browser (via Pyodide). The first run downloads the runtime, so it takes a few seconds.',
    docs: 'https://docs.python.org/3/tutorial/',
    keywords: ['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'is', 'None', 'True', 'False', 'class', 'self', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'lambda', 'yield', 'pass', 'break', 'continue', 'print', 'input', 'range', 'len', 'list', 'dict', 'set', 'tuple', 'str', 'int', 'float', 'bool', 'enumerate', 'zip', 'sorted', 'sum', 'min', 'max', 'append', 'items', 'keys', 'values', 'format', 'isinstance'],
    starter: R`# Welcome to Python! Press ▶ Run (or Ctrl+Enter).
# Tip: open the 👁 Visualizer to watch each line run.

def average(numbers):
    total = 0
    for n in numbers:
        total += n
    return total / len(numbers)

scores = {"Ada": [90, 85, 97], "Linus": [70, 88, 79]}

for name, marks in scores.items():
    avg = average(marks)
    grade = "A" if avg >= 90 else "B"
    print(f"{name}: average {avg:.1f} -> grade {grade}")

squares = [x * x for x in range(1, 6)]
print("Squares:", squares)
`,
    sections: [
      { id: 'hello', title: 'Hello, World & print', level: 'beginner',
        body: "`print()` shows values in the terminal. Give it several values separated by commas and it puts spaces between them. Text (a **string**) goes inside quotes.\n\nEverything after `#` on a line is a **comment** — a note for humans that Python ignores.",
        code: R`# This is a comment
print("Hello, World!")
print("The answer is", 42)
print("a", "b", "c", sep="-")      # change the separator
print("no newline", end=" ")      # change the ending
print("...continues here")`,
        deep: "`print` writes to `sys.stdout`; use `print(..., file=sys.stderr)` for diagnostics. In larger programs prefer the `logging` module over print statements, so verbosity can be controlled without editing code." },
      { id: 'vars', title: 'Variables & types', level: 'beginner',
        body: "Create a variable just by assigning to it with `=`. Python figures out the type itself. The core types are `int` (whole numbers), `float` (decimals), `str` (text), `bool` (`True`/`False`) and `None` (no value).\n\nUse `type(x)` to see a value's type. Name variables in `snake_case`.",
        code: R`name = "Ada"          # str
age = 36              # int
height = 1.65         # float
is_coder = True       # bool
nickname = None       # no value yet

print(name, age, height, is_coder, nickname)
print(type(name), type(age), type(height))

age = age + 1         # variables can change
x, y = 10, 20         # assign several at once
x, y = y, x           # swap!
print(age, x, y)`,
        deep: "Variables are *names bound to objects*, not boxes. `a = b = []` makes both names refer to the **same** list. Python is dynamically but **strongly** typed: `'1' + 1` is an error rather than silently converting. Integers have arbitrary precision — `2 ** 200` just works." },
      { id: 'ops', title: 'Numbers & operators', level: 'beginner',
        body: "`+ - * /` work as expected; `/` always gives a float. `//` is floor division (rounds down), `%` is the remainder and `**` is power.\n\nConvert between types with `int()`, `float()` and `str()`. Shorthand operators like `+=` update a variable in place.",
        code: R`print(7 / 2)      # 3.5
print(7 // 2)     # 3   floor division
print(7 % 2)      # 1   remainder
print(2 ** 10)    # 1024

total = 10
total += 5        # same as total = total + 5
print(total)

print(int("42") + 1, float("2.5") * 2, str(99) + "!")
print(round(3.14159, 2), abs(-7), max(3, 9, 4))
print(0.1 + 0.2)  # 0.30000000000000004 — floating point!`,
        deep: "Use `decimal.Decimal` for money and `fractions.Fraction` for exact ratios. `math.isclose(a, b)` compares floats safely. `divmod(17, 5)` returns `(3, 2)` in one step." },
      { id: 'strings', title: 'Strings & f-strings', level: 'beginner',
        body: "Strings can use single or double quotes. **f-strings** (`f\"...\"`) insert values with `{}` and can format them: `{price:.2f}` shows two decimals.\n\nStrings are sequences: index with `s[0]`, slice with `s[1:4]`, and get the length with `len(s)`. Methods like `.upper()` return a *new* string.",
        code: R`name = "Grace Hopper"
price = 4.5

print(f"Hello, {name}! Coffee costs £{price:.2f}")
print(name.upper(), name.lower(), len(name))
print(name[0], name[-1], name[0:5], name[::-1])   # first, last, slice, reversed
print("Hop" in name, name.count("r"), name.find("H"))
print(name.split(" "), "-".join(["a", "b", "c"]))
print("  padded  ".strip() + "|", "ha" * 3)

multi = """Triple quotes
span several lines."""
print(multi)`,
        deep: "Strings are immutable Unicode sequences. Building a long string with `+=` in a loop is O(n²); collect pieces in a list and `''.join(parts)`. f-strings support expressions and debugging: `f'{x=}'` prints `x=5`." },
      { id: 'input', title: 'Reading input', level: 'beginner',
        body: "`input()` reads one line of text typed by the user. Here, type your answers into the **Program input** box below the terminal — one line per `input()` call — then press Run.\n\n`input()` always returns a **string**, so convert it with `int()` or `float()` before doing maths.",
        code: R`# Type a name and an age (on two lines) in the "Program input" box first!
name = input("What is your name? ")
age = int(input("How old are you? "))

print(f"Hi {name}, next year you'll be {age + 1}.")`,
        deep: "Wrap conversions in `try/except ValueError` to handle bad input gracefully. For command-line tools, `argparse` parses arguments, and `sys.stdin` can be iterated line by line for piped data." },
      { id: 'cond', title: 'Conditionals', level: 'beginner',
        body: "`if` runs an indented block when its condition is `True`. Add `elif` (else-if) and `else` for other cases. Notice the colon `:` and the 4-space indentation — they are required.\n\nCompare with `==`, `!=`, `<`, `>=`. Combine with `and`, `or`, `not`.",
        code: R`temperature = 23

if temperature > 30:
    print("Hot!")
elif temperature > 15:
    print("Pleasant")
else:
    print("Cold")

sunny = True
if sunny and temperature > 20:
    print("Beach day")

label = "warm" if temperature >= 18 else "cool"   # conditional expression
print(label)

command = "stop"
match command:              # Python 3.10+
    case "go":
        print("Going")
    case "stop" | "halt":
        print("Stopping")
    case _:
        print("Unknown")`,
        deep: "Empty containers, `0`, `''` and `None` are falsy; prefer `if items:` over `if len(items) > 0:`. Compare to `None` with `is None`. Comparisons chain: `0 < x < 10`. `match` supports powerful structural patterns, e.g. `case {'type': 'point', 'x': x}`." },
      { id: 'loops', title: 'Loops', level: 'beginner',
        body: "A `for` loop walks through each item of a sequence. `range(start, stop)` produces numbers up to (but **not including**) `stop`. A `while` loop repeats while its condition is true.\n\n`enumerate()` gives you the index too; `zip()` walks several lists together. `break` exits, `continue` skips ahead.",
        code: R`for i in range(1, 4):
    print("i =", i)

fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print("I like", fruit)

for index, fruit in enumerate(fruits, start=1):
    print(index, fruit)

prices = [0.5, 0.25, 3.0]
for fruit, price in zip(fruits, prices):
    print(f"{fruit}: {price}")

n = 3
while n > 0:
    print("countdown", n)
    n -= 1`,
        deep: "Loops have an `else` clause that runs if the loop wasn't `break`-ed — handy for searches. Don't modify a list while iterating over it; iterate over a copy (`for x in items[:]`) or build a new list." },
      { id: 'func', title: 'Functions', level: 'beginner',
        body: "Define a function with `def`, then call it by name. Parameters can have **default values**, and callers can pass arguments by name (keyword arguments). `return` sends back a result — even several, as a tuple.\n\nA string right under `def` is a **docstring** describing the function.",
        code: R`def greet(name, greeting="Hello"):
    """Return a friendly greeting."""
    return f"{greeting}, {name}!"

print(greet("Lin"))
print(greet("Sam", greeting="Hi"))

def min_max(values):
    return min(values), max(values)   # returns a tuple

low, high = min_max([4, 9, 1, 7])
print(low, high)

def total(*numbers, **options):       # any number of args
    result = sum(numbers)
    return round(result, options.get("digits", 0))

print(total(1.25, 2.5, 3, digits=1))

square = lambda x: x * x              # tiny anonymous function
print(square(5))`,
        deep: "**Never use a mutable default** like `def f(items=[])` — the same list is shared between calls. Use `None` and create the list inside. Variables assigned inside a function are local; `global`/`nonlocal` change that (use sparingly). Functions are first-class objects, which enables decorators and higher-order functions." },
      { id: 'lists', title: 'Lists & tuples', level: 'beginner',
        body: "A **list** is an ordered, changeable collection: `[1, 2, 3]`. Index from 0; negative indexes count from the end. Use `.append()`, `.insert()`, `.remove()`, `.pop()` and `.sort()` to change it.\n\nA **tuple** `(1, 2)` is like a list that can't change — good for fixed groups of values.",
        code: R`nums = [5, 3, 8]
nums.append(1)            # add to the end
nums.insert(0, 10)        # insert at position 0
print(nums, len(nums), nums[0], nums[-1])

nums.sort()
print("sorted:", nums)
print("slice:", nums[1:3], "reversed:", nums[::-1])
print("biggest:", max(nums), "sum:", sum(nums), "has 8?", 8 in nums)

last = nums.pop()          # remove & return last item
print(last, nums)

point = (3, 4)             # tuple
x, y = point               # unpacking
print(x, y)
matrix = [[1, 2], [3, 4]]  # nested lists
print(matrix[1][0])`,
        deep: "`sorted(seq)` returns a new list while `list.sort()` sorts in place and returns `None`. Sort by a key: `sorted(people, key=lambda p: p['age'], reverse=True)`. Use `collections.deque` for fast appends/pops at both ends." },
      { id: 'dicts', title: 'Dictionaries & sets', level: 'beginner',
        body: "A **dictionary** maps keys to values: `{'name': 'Ada'}`. Look up with `d[key]`, or `d.get(key, default)` to avoid errors when a key is missing. Loop over `.items()` to get key/value pairs.\n\nA **set** holds unique values and supports maths like union `|` and intersection `&`.",
        code: R`person = {"name": "Ada", "age": 36}
person["email"] = "ada@example.com"     # add / update
person["age"] += 1
print(person["name"], person.get("phone", "no phone"))

for key, value in person.items():
    print(key, "->", value)

print(list(person.keys()), "age" in person)
del person["email"]
print(person)

colours = {"red", "green", "red", "blue"}
print(colours)                             # duplicates removed
print({1, 2, 3} | {3, 4}, {1, 2, 3} & {2, 3, 9})`,
        deep: "Dicts preserve insertion order (3.7+) and give O(1) average lookups. `collections.Counter`, `defaultdict` and `ChainMap` cover common patterns. Keys must be hashable (immutable): tuples are fine, lists are not." },
      { id: 'comp', title: 'Comprehensions', level: 'intermediate',
        body: "A **comprehension** builds a list, dict or set in one readable line: `[expression for item in iterable if condition]`. It replaces the common pattern of creating an empty list and appending in a loop.",
        code: R`numbers = range(1, 11)

squares = [n * n for n in numbers]
evens = [n for n in numbers if n % 2 == 0]
labels = ["even" if n % 2 == 0 else "odd" for n in range(4)]
print(squares)
print(evens)
print(labels)

words = ["apple", "kiwi", "banana"]
lengths = {w: len(w) for w in words}          # dict comprehension
first_letters = {w[0] for w in words}         # set comprehension
print(lengths, first_letters)

pairs = [(x, y) for x in range(3) for y in range(2)]
print(pairs)`,
        deep: "Use a **generator expression** `(n * n for n in numbers)` when you only iterate once — it's lazy and uses constant memory: `sum(n * n for n in range(10**6))`. If a comprehension needs more than one `if` or nested loops, a normal loop is often clearer." },
      { id: 'classes', title: 'Classes & objects', level: 'intermediate',
        body: "A **class** bundles data (attributes) and behaviour (methods). `__init__` runs when you create an object; `self` is the object itself. A subclass inherits from a parent and can override methods; `super()` calls the parent's version.\n\n`__str__` controls how the object prints.",
        code: R`class Account:
    interest = 0.02                      # class attribute (shared)

    def __init__(self, owner, balance=0):
        self.owner = owner               # instance attributes
        self.balance = balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self.balance += amount
        return self.balance

    def __str__(self):
        return f"{self.owner}: £{self.balance:.2f}"

class Savings(Account):
    def add_interest(self):
        self.deposit(self.balance * self.interest)

acct = Savings("Ada", 100)
acct.deposit(50)
acct.add_interest()
print(acct)
print(isinstance(acct, Account))`,
        deep: "`@dataclass` (from `dataclasses`) generates `__init__`, `__repr__` and `__eq__` for data-holding classes. Use `@property` for computed attributes instead of getter methods. Python has no private members; a leading underscore `_name` signals \"internal\" by convention." },
      { id: 'errors', title: 'Exceptions', level: 'intermediate',
        body: "When something goes wrong Python **raises an exception**. Handle it with `try`/`except` instead of crashing. `else` runs if nothing failed; `finally` always runs. Raise your own with `raise ValueError('...')`.\n\nCatch *specific* exceptions — a bare `except:` hides bugs.",
        code: R`def parse_age(text):
    age = int(text)                      # may raise ValueError
    if age < 0:
        raise ValueError("age cannot be negative")
    return age

for text in ["42", "abc", "-5"]:
    try:
        age = parse_age(text)
    except ValueError as err:
        print(f"{text!r} -> error: {err}")
    else:
        print(f"{text!r} -> ok: {age}")
    finally:
        print("  (checked)")

# Remove the # below to see an unhandled error and its traceback:
# print(10 / 0)`,
        deep: "Python favours EAFP (\"easier to ask forgiveness than permission\"): try the operation and handle the exception rather than pre-checking. Use `with` (context managers) for resources so cleanup happens automatically. Define custom exceptions by subclassing `Exception`, and chain with `raise ... from err`." },
      { id: 'gen', title: 'Generators & decorators', level: 'advanced',
        body: "A **generator** function uses `yield` to produce values one at a time, pausing between them. It's memory-efficient for large or infinite sequences.\n\nA **decorator** wraps a function to add behaviour, applied with `@name` above the definition.",
        code: R`def countdown(n):
    while n > 0:
        yield n          # pause here and hand back n
        n -= 1

for value in countdown(3):
    print("generated", value)

import functools, time

def timed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.perf_counter() - start:.5f}s")
        return result
    return wrapper

@timed
def slow_sum(n):
    return sum(range(n))

print(slow_sum(100_000))

@functools.lru_cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
print(fib(80))`,
        deep: "Generators are the basis of lazy pipelines; `itertools` provides composable building blocks (`islice`, `chain`, `groupby`, `accumulate`). `yield from` delegates to a sub-generator. Decorators can take arguments by adding one more level of nesting." },
      { id: 'modules', title: 'Modules, type hints & the standard library', level: 'advanced',
        body: "`import` loads a module. Python's standard library covers maths, dates, random numbers, JSON, regular expressions and much more.\n\n**Type hints** document what types a function expects and returns. Python doesn't enforce them at runtime, but editors and tools like mypy use them to catch bugs.",
        code: R`import math
import random
from collections import Counter
from datetime import date

print(math.sqrt(16), math.pi)
random.seed(1)
print(random.randint(1, 6), random.choice(["a", "b", "c"]))
print(Counter("mississippi").most_common(2))
print(date(2026, 1, 1).strftime("%A"))

def mean(values: list[float]) -> float:
    """Average of a non-empty list."""
    return sum(values) / len(values)

print(mean([1.0, 2.5, 4.0]))

if __name__ == "__main__":
    print("Run directly (not imported)")`,
        deep: "Structure projects as packages with `pyproject.toml`, isolate dependencies in virtual environments (`python -m venv .venv`), format with Black/Ruff and type-check with mypy or pyright. The `if __name__ == '__main__':` guard keeps script code from running on import." }
    ],
    tips: [
      'Follow **PEP 8**: 4-space indentation, `snake_case` for variables and functions, `PascalCase` for classes, `UPPER_CASE` for constants.',
      'Use f-strings for formatting: `f"{name} is {age}"`.',
      'Prefer `for item in items:` over `for i in range(len(items)):`; use `enumerate` when you need the index.',
      'Use comprehensions for simple transformations, but switch to a normal loop when they get hard to read.',
      'Catch specific exceptions (`except ValueError:`), never a bare `except:`.',
      'Use `with open(...) as f:` so files are always closed.',
      'Never use a mutable default argument (`def f(x=[])`); use `None` instead.',
      'Add type hints and docstrings to public functions; run a linter/formatter such as Ruff and Black.'
    ],
    pitfalls: [
      'Mixing tabs and spaces, or inconsistent indentation inside a block.',
      'Forgetting the colon `:` after `if`, `for`, `while`, `def` and `class`.',
      'Forgetting that `input()` returns a string — `"5" + 1` is an error.',
      'Off-by-one with `range`: `range(1, 5)` stops at 4.',
      'Using `=` instead of `==` in a condition.'
    ]
  });

  /* ===================================================================== Lua */
  LANGS.push({
    id: 'lua', name: 'Lua', tag: 'Lua', color: '#2c2d72', file: 'main.lua', cmd: 'lua main.lua',
    kind: 'browser', engine: 'lua', trace: 'trace', mode: 'lua', indent: 2, comment: ['--'],
    scaffold: '{{COMMENT}}\n\n-- Your code here\n',
    blurb: 'Small, fast and embeddable. Powers game scripting (Roblox, LÖVE, WoW add-ons) and tools like Neovim.',
    intro: 'Lua is a tiny, elegant scripting language designed to be embedded in other programs, which is why it\'s everywhere in games (Roblox uses a Lua dialect). It has one data structure, the **table**, that acts as array, dictionary and object. This page runs Lua 5.3 (Fengari) in your browser.',
    docs: 'https://www.lua.org/manual/5.3/',
    keywords: ['local', 'function', 'end', 'if', 'then', 'elseif', 'else', 'for', 'in', 'do', 'while', 'repeat', 'until', 'return', 'break', 'nil', 'true', 'false', 'and', 'or', 'not', 'print', 'pairs', 'ipairs', 'table', 'insert', 'remove', 'concat', 'string', 'format', 'tostring', 'tonumber', 'type', 'math', 'floor', 'random', 'pcall', 'error', 'setmetatable', 'self'],
    starter: R`-- Welcome to Lua! Press ▶ Run (or Ctrl+Enter).
-- Tip: open the 👁 Visualizer to watch each line run.

local function factorial(n)
  if n <= 1 then
    return 1
  end
  return n * factorial(n - 1)
end

local inventory = { apples = 3, pears = 5 }
inventory.plums = 7

local total = 0
for fruit, count in pairs(inventory) do
  total = total + count
end

local primes = { 2, 3, 5, 7, 11 }

print("5! =", factorial(5))
print("Total fruit: " .. total)
print("Third prime: " .. primes[3] .. ", how many: " .. #primes)
`,
    sections: [
      { id: 'hello', title: 'Hello, World & comments', level: 'beginner',
        body: "`print()` writes values to the terminal, separated by tabs. `--` starts a comment; `--[[ ... ]]` comments out several lines.\n\nSemicolons are optional in Lua, and line breaks don't matter much — blocks are closed with the keyword `end`.",
        code: R`-- single-line comment
print("Hello, World!")
print("several", "values", 42)
io.write("io.write doesn't add a newline... ")
io.write("see?\n")

--[[
  multi-line
  comment
]]`,
        deep: "`print` calls `tostring` on each argument. For formatted output use `string.format('%5.2f', x)` with `io.write`." },
      { id: 'vars', title: 'Variables & types', level: 'beginner',
        body: "Declare variables with `local` — without it, a variable becomes **global**, which is a common source of bugs. Lua's types: `nil`, `boolean`, `number`, `string`, `table`, `function` (plus `userdata` and `thread`).\n\nA variable that was never assigned is simply `nil`.",
        code: R`local name = "Ada"
local age = 36
local height = 1.65
local isCoder = true
local nothing = nil

print(name, age, height, isCoder, nothing)
print(type(name), type(age), type(isCoder), type(nothing), type(print))

local a, b = 1, 2
a, b = b, a              -- swap
print(a, b)
print(undefinedVariable) -- nil, not an error`,
        deep: "Lua 5.3 distinguishes integer and float subtypes (`math.type(3)` is `'integer'`, `math.type(3.0)` is `'float'`). Only `nil` and `false` are falsy — `0` and `\"\"` are truthy, unlike many languages." },
      { id: 'strings', title: 'Strings & operators', level: 'beginner',
        body: "Join strings with `..` (two dots). `#` gives the length. Arithmetic: `+ - * /`, `//` floor division, `%` remainder, `^` power. Comparison uses `==` and `~=` (**not equal** — not `!=`).\n\nThe `string` library has helpers; you can call them with colon syntax: `s:upper()`.",
        code: R`local first, last = "Grace", "Hopper"
local full = first .. " " .. last
print(full, #full)
print(full:upper(), full:lower(), full:sub(1, 5))
print(string.format("%s is %d years old", first, 85))
print(("ha"):rep(3), full:find("Hop"), full:gsub("Grace", "Admiral"))

print(7 / 2, 7 // 2, 7 % 2, 2 ^ 10)
print(5 == 5, 5 ~= 3, "10" + 5)   -- strings auto-convert in arithmetic
print(tostring(42) .. "!", tonumber("3.5") * 2)`,
        deep: "Strings are immutable byte sequences; string indexes start at 1 and negative indexes count from the end (`s:sub(-3)`). Lua patterns (in `find`, `match`, `gmatch`, `gsub`) are lighter than regex: `%d` digit, `%a` letter, `%s` space." },
      { id: 'cond', title: 'Conditionals', level: 'beginner',
        body: "`if condition then ... elseif ... else ... end`. Combine with `and`, `or`, `not`.\n\nA common idiom: `x = value or default` gives `default` when `value` is `nil`.",
        code: R`local temperature = 23

if temperature > 30 then
  print("Hot!")
elseif temperature > 15 then
  print("Pleasant")
else
  print("Cold")
end

local sunny = true
if sunny and temperature > 20 then
  print("Beach day")
end

local nickname = nil
print("Hello, " .. (nickname or "friend"))

local label = temperature >= 18 and "warm" or "cool"   -- ternary idiom
print(label)`,
        deep: "`a and b or c` works as a ternary only when `b` is never `false`/`nil`. Lua has no `switch`; use `if/elseif` chains or a lookup table of functions." },
      { id: 'loops', title: 'Loops', level: 'beginner',
        body: "Numeric `for i = start, stop, step do ... end` includes `stop`. `while cond do ... end` checks first; `repeat ... until cond` runs at least once.\n\nThe generic `for` with `ipairs` walks an array in order; `pairs` walks every key of a table.",
        code: R`for i = 1, 3 do
  print("i =", i)
end

for i = 10, 1, -3 do
  print("down", i)
end

local n = 3
while n > 0 do
  print("countdown", n)
  n = n - 1
end

local tries = 0
repeat
  tries = tries + 1
until tries >= 2
print("tries:", tries)

local fruits = { "apple", "banana", "cherry" }
for index, fruit in ipairs(fruits) do
  print(index, fruit)
end`,
        deep: "The loop variable of a numeric `for` is local to the loop. There's no `continue` in Lua 5.3; use `goto continue` with a `::continue::` label, or restructure with `if`." },
      { id: 'func', title: 'Functions', level: 'beginner',
        body: "Define functions with `function name(params) ... end` (make them `local` too). Functions can return **multiple values**, and can accept a variable number of arguments with `...`.\n\nFunctions are values: store them in variables or tables, and pass them to other functions.",
        code: R`local function greet(name)
  name = name or "friend"          -- default value idiom
  return "Hello, " .. name .. "!"
end
print(greet("Lin"), greet())

local function minMax(a, b)
  if a < b then return a, b end
  return b, a
end
local low, high = minMax(9, 4)
print(low, high)

local function sum(...)
  local total = 0
  for _, v in ipairs({ ... }) do total = total + v end
  return total
end
print(sum(1, 2, 3, 4))

local function makeCounter()
  local count = 0
  return function() count = count + 1; return count end
end
local nextId = makeCounter()
print(nextId(), nextId(), nextId())`,
        deep: "Lua has proper tail calls: `return f(x)` reuses the stack frame, so tail-recursive loops never overflow. Closures capture *upvalues* by reference, enabling private state as shown with `makeCounter`." },
      { id: 'tables', title: 'Tables as arrays', level: 'beginner',
        body: "Tables with consecutive integer keys act as arrays. **Indexing starts at 1**, not 0. `#t` gives the length; `table.insert`, `table.remove`, `table.sort` and `table.concat` manipulate them.",
        code: R`local nums = { 5, 3, 8 }
table.insert(nums, 1)             -- append
table.insert(nums, 1, 10)         -- insert at position 1
print(#nums, nums[1], nums[#nums])

table.sort(nums)
print(table.concat(nums, ", "))

local removed = table.remove(nums)  -- remove last
print("removed", removed, "->", table.concat(nums, " "))

table.sort(nums, function(a, b) return a > b end)
print("descending:", table.concat(nums, " "))

local grid = { { 1, 2 }, { 3, 4 } }
print(grid[2][1])`,
        deep: "`#` is only reliable for sequences without `nil` holes. Removing from the middle shifts elements (O(n)); for queues keep head/tail indexes instead." },
      { id: 'dict', title: 'Tables as dictionaries', level: 'intermediate',
        body: "Tables can use any value (except `nil`) as a key. `t.name` is shorthand for `t[\"name\"]`. Loop over all pairs with `pairs` (order is not guaranteed). Assign `nil` to delete a key.",
        code: R`local person = { name = "Ada", age = 36 }
person.email = "ada@example.com"
person["favourite language"] = "Lua"
person.age = person.age + 1

print(person.name, person["age"], person.phone)

for key, value in pairs(person) do
  print(key, "=", value)
end

person.email = nil                 -- delete
local count = 0
for _ in pairs(person) do count = count + 1 end
print("keys left:", count)`,
        deep: "Tables are the only data structure, used for arrays, maps, sets, objects and modules. To get deterministic order from `pairs`, collect keys into an array and `table.sort` them first." },
      { id: 'oop', title: 'Metatables & objects', level: 'advanced',
        body: "**Metatables** let you customise how tables behave. Setting `__index` makes a table look up missing keys in another table — this is how Lua does classes and inheritance. The colon `:` passes the object as `self` automatically.",
        code: R`local Animal = {}
Animal.__index = Animal

function Animal.new(name, sound)
  local self = setmetatable({}, Animal)
  self.name, self.sound = name, sound
  return self
end

function Animal:speak()
  return self.name .. " says " .. self.sound
end

local Dog = setmetatable({}, { __index = Animal })
Dog.__index = Dog
function Dog.new(name)
  local self = Animal.new(name, "woof")
  return setmetatable(self, Dog)
end
function Dog:fetch() return self.name .. " fetches!" end

local rex = Dog.new("Rex")
print(rex:speak())
print(rex:fetch())

local Vec = {}
Vec.__add = function(a, b) return setmetatable({ x = a.x + b.x }, Vec) end
local v = setmetatable({ x = 1 }, Vec) + setmetatable({ x = 2 }, Vec)
print(v.x)`,
        deep: "Other metamethods: `__tostring`, `__eq`, `__lt`, `__call`, `__len`, `__newindex` (useful for read-only tables or change tracking). `obj:method(x)` is sugar for `obj.method(obj, x)`." },
      { id: 'errors', title: 'Error handling', level: 'intermediate',
        body: "`error(message)` raises an error. `pcall(f, args...)` (protected call) runs a function and catches errors, returning `false` plus the message instead of crashing.",
        code: R`local function divide(a, b)
  if b == 0 then
    error("cannot divide by zero")
  end
  return a / b
end

local ok, result = pcall(divide, 10, 2)
print(ok, result)

ok, result = pcall(divide, 1, 0)
print(ok, result)

local ok2, err = pcall(function()
  local t = nil
  return t.field            -- runtime error
end)
print(ok2, err)

-- Remove the -- below to see an uncaught error:
-- print(divide(1, 0))`,
        deep: "`xpcall(f, handler)` lets you attach `debug.traceback` to errors. You can `error` with a table to carry structured error data. `assert(value, message)` raises if value is falsy and returns it otherwise — handy for validating results." },
      { id: 'co', title: 'Coroutines', level: 'advanced',
        body: "A **coroutine** is a function that can pause itself with `coroutine.yield()` and be resumed later, keeping its local state. Games use them for scripted sequences that span many frames.",
        code: R`local producer = coroutine.create(function()
  for i = 1, 3 do
    print("producing", i)
    coroutine.yield(i * 10)
  end
  return "done"
end)

while true do
  local ok, value = coroutine.resume(producer)
  print("got", value, "status:", coroutine.status(producer))
  if coroutine.status(producer) == "dead" then break end
end

local gen = coroutine.wrap(function()
  for c in ("abc"):gmatch(".") do coroutine.yield(c) end
end)
print(gen(), gen(), gen())`,
        deep: "Coroutines are cooperative: only one runs at a time and they switch only at `yield`. `coroutine.wrap` returns a plain function, which makes building custom iterators for the generic `for` easy." }
    ],
    tips: [
      'Always declare variables with `local`. Accidental globals are the #1 Lua bug.',
      'Remember arrays start at 1, and use `ipairs` for arrays and `pairs` for dictionaries.',
      'Use `..` to join strings, and `table.concat` to join many pieces efficiently.',
      'Cache frequently used globals in locals (`local insert = table.insert`) in hot code.',
      'Use `pcall` around operations that can fail rather than letting the program crash.',
      'Return a table from a file to create a module: `local M = {} ... return M`.',
      'Use `:` for method calls on objects so `self` is passed automatically.'
    ],
    pitfalls: [
      'Writing `!=` instead of `~=`.',
      'Forgetting `then`, `do` or `end`.',
      'Using `+` to join strings (it tries to do arithmetic).',
      'Treating `0` or `""` as false — in Lua they are true.',
      'Calling `obj.method()` instead of `obj:method()` and getting `self` as nil.'
    ]
  });

  /* ===================================================================== Ruby */
  LANGS.push({
    id: 'ruby', name: 'Ruby', tag: 'Rb', color: '#cc342d', file: 'main.rb', cmd: 'ruby main.rb',
    kind: 'cloud', engine: 'wandbox', wb: { lang: 'Ruby', prefer: /^ruby-/ }, trace: 'explain', mode: 'ruby', indent: 2, comment: ['#'],
    scaffold: '{{COMMENT}}\n\n# Your code here\n',
    blurb: 'Designed for programmer happiness. Elegant, expressive and the language behind Ruby on Rails.',
    intro: 'Ruby is a dynamic, fully object-oriented language (everything, even `5`, is an object) focused on readability and developer happiness. Blocks and iterators make collection processing expressive. Code is run on the Wandbox online service.',
    docs: 'https://www.ruby-lang.org/en/documentation/',
    keywords: ['def', 'end', 'if', 'elsif', 'else', 'unless', 'case', 'when', 'while', 'until', 'for', 'in', 'do', 'each', 'map', 'select', 'reject', 'reduce', 'times', 'puts', 'print', 'class', 'module', 'attr_accessor', 'attr_reader', 'initialize', 'self', 'return', 'yield', 'begin', 'rescue', 'ensure', 'raise', 'nil', 'true', 'false', 'require', 'length', 'include?', 'to_s', 'to_i'],
    starter: R`# Welcome to Ruby! Press ▶ Run (or Ctrl+Enter).
# Ruby is run on the free Wandbox service (needs internet).

class Greeter
  def initialize(name)
    @name = name
  end

  def greet(times = 1)
    times.times { |i| puts "Hello, #{@name}! (#{i + 1})" }
  end
end

Greeter.new("Matz").greet(2)

numbers = [5, 3, 8, 1, 9]
evens, odds = numbers.partition(&:even?)
puts "Sorted: #{numbers.sort.inspect}"
puts "Evens: #{evens}, odds: #{odds}"
puts "Sum of squares: #{numbers.sum { |n| n * n }}"
`,
    sections: [
      { id: 'hello', title: 'Hello, World & output', level: 'beginner',
        body: "`puts` prints a value followed by a newline; `print` doesn't add the newline; `p` prints a debug-friendly version (strings keep their quotes). Comments start with `#`.\n\nParentheses on method calls are optional: `puts(\"hi\")` and `puts \"hi\"` are the same.",
        code: R`# a comment
puts "Hello, World!"
print "no newline, "
print "see?\n"
p "p shows quotes"
p [1, 2, 3]
puts 1, 2      # each argument on its own line`,
        deep: "`puts` calls `to_s` on its argument while `p` calls `inspect` and returns its argument, so you can insert `p` into an expression to debug it. `$stderr.puts` writes to standard error." },
      { id: 'vars', title: 'Variables & types', level: 'beginner',
        body: "Assign with `=`; names use `snake_case`. Everything is an object with a class: `Integer`, `Float`, `String`, `Symbol`, `TrueClass`, `NilClass`, `Array`, `Hash`...\n\nOnly `nil` and `false` are falsy. Constants start with a capital letter.",
        code: R`name = "Ada"
age = 36
height = 1.65
coder = true
nothing = nil
MAX_USERS = 100            # constant

puts name, age, height, coder
p nothing
puts name.class, age.class, height.class, nothing.class
puts 5.even?, 3.14.round, -7.abs
a, b = 1, 2
a, b = b, a
puts "#{a} #{b}"`,
        deep: "Variables hold references to objects. Integers are arbitrary-precision. Methods ending in `?` return booleans by convention and methods ending in `!` mutate the receiver or are \"dangerous\"." },
      { id: 'strings', title: 'Strings & symbols', level: 'beginner',
        body: "Double-quoted strings support **interpolation** with `#{...}`; single-quoted strings don't. Strings have many handy methods. A **symbol** like `:name` is a lightweight, immutable identifier, often used as hash keys.",
        code: R`first = "Grace"
last = 'Hopper'
full = "#{first} #{last}"
puts full, full.length, full.upcase, full.reverse
puts full.include?("Hop"), full.sub("Grace", "Admiral")
puts full[0], full[0, 5], full[-6..]
puts "a,b,c".split(",").inspect, ["x", "y"].join("-")
puts "ha" * 3
puts "%.2f" % 3.14159
p :status, :status.to_s, "name".to_sym`,
        deep: "Add `# frozen_string_literal: true` at the top of files to make string literals immutable (faster, safer). Use heredocs (`<<~TEXT`) for multi-line strings with indentation stripped." },
      { id: 'cond', title: 'Conditionals', level: 'beginner',
        body: "`if / elsif / else / end`, plus `unless` (if not). Short conditions can be written as **modifiers** at the end of a line: `puts 'hi' if ready`. `case/when` matches values, ranges and classes.",
        code: R`temperature = 23

if temperature > 30
  puts "Hot!"
elsif temperature > 15
  puts "Pleasant"
else
  puts "Cold"
end

puts "Beach day" if temperature > 20
puts "Bring a coat" unless temperature > 10

label = temperature >= 18 ? "warm" : "cool"
puts label

grade = case 85
        when 90.. then "A"
        when 80...90 then "B"
        else "C"
        end
puts grade`,
        deep: "`if` and `case` are expressions that return values. `case/when` uses the `===` operator, so it matches ranges, regexes, classes and lambdas. Ruby 3 adds pattern matching with `case/in`." },
      { id: 'loops', title: 'Loops & iterators', level: 'beginner',
        body: "Rubyists rarely write `for` loops. Instead they call iterator methods with a **block**: `3.times { }`, `array.each { |x| }`, `1.upto(5)`. `while` and `until` also exist.",
        code: R`3.times { |i| puts "i = #{i}" }

fruits = ["apple", "banana", "cherry"]
fruits.each { |fruit| puts "I like #{fruit}" }

fruits.each_with_index do |fruit, index|
  puts "#{index}: #{fruit}"
end

(1..3).each { |n| print n, " " }
puts

n = 3
while n > 0
  puts "countdown #{n}"
  n -= 1
end

10.step(1, -4) { |x| puts x }`,
        deep: "`{ }` and `do...end` both define blocks; by convention braces for one-liners and `do...end` for multi-line. `next` skips to the next iteration and `break` exits; both can carry a value." },
      { id: 'methods', title: 'Methods', level: 'beginner',
        body: "Define methods with `def ... end`. The **last expression is returned automatically**, so `return` is often unnecessary. Parameters can have defaults and be passed by keyword.",
        code: R`def greet(name = "friend")
  "Hello, #{name}!"          # implicit return
end

def area(width:, height: 1)  # keyword arguments
  width * height
end

def stats(*numbers)
  [numbers.min, numbers.max, numbers.sum]
end

puts greet("Lin"), greet
puts area(width: 3, height: 4), area(width: 5)
low, high, total = stats(4, 9, 1)
puts "#{low} #{high} #{total}"

def even?(n) = n % 2 == 0    # endless method (Ruby 3)
puts even?(4)`,
        deep: "Methods can accept a block implicitly and call it with `yield`, or capture it with `&block`. Use `block_given?` to make the block optional." },
      { id: 'arrays', title: 'Arrays', level: 'beginner',
        body: "Arrays are ordered lists: `[1, 2, 3]`. Add with `<<` or `push`, read with `[i]` (negative counts from the end). Powerful methods like `map`, `select`, `reject`, `sort_by` and `sum` transform them with blocks.",
        code: R`nums = [5, 3, 8]
nums << 1
nums.push(10)
p nums, nums.length, nums.first, nums.last, nums[-2]

p nums.sort, nums.max, nums.sum
p nums.map { |n| n * 2 }
p nums.select(&:even?)
p nums.reject { |n| n > 5 }
p nums.include?(8), nums.index(8)
p nums.each_slice(2).to_a
p nums.sort.reverse.take(2)`,
        deep: "`&:even?` is shorthand for `{ |n| n.even? }` (Symbol#to_proc). Methods like `map!` and `sort!` modify the array in place; the plain versions return new arrays." },
      { id: 'hashes', title: 'Hashes', level: 'beginner',
        body: "A **hash** maps keys to values. With symbol keys you can use the short `name: value` syntax. Use `fetch` for safe lookups with a default, and `each` to loop over pairs.",
        code: R`person = { name: "Ada", age: 36 }
person[:email] = "ada@example.com"
person[:age] += 1

puts person[:name], person.fetch(:phone, "no phone")
person.each { |key, value| puts "#{key}: #{value}" }

p person.keys, person.key?(:age)
p person.select { |k, v| v.is_a?(String) }
p person.transform_values(&:to_s)

counts = Hash.new(0)              # default value 0
"hello world".each_char { |c| counts[c] += 1 unless c == " " }
p counts.max_by { |_, n| n }`,
        deep: "Hashes keep insertion order. `Hash.new { |h, k| h[k] = [] }` creates a default *per key* (avoid `Hash.new([])`, which shares one array between keys)." },
      { id: 'blocks', title: 'Blocks, procs & lambdas', level: 'intermediate',
        body: "A **block** is a chunk of code passed to a method. Your own methods can call it with `yield`. **Lambdas** and **procs** are blocks stored as objects so you can keep and reuse them.",
        code: R`def twice
  yield 1
  yield 2
end
twice { |n| puts "block got #{n}" }

def measure(label)
  start = Time.now
  result = yield
  puts "#{label}: #{result} (#{((Time.now - start) * 1000).round(2)} ms)"
end
measure("sum") { (1..100_000).sum }

square = ->(x) { x * x }        # lambda
add = lambda { |a, b| a + b }
puts square.call(5), square.(6), add[2, 3]
p [1, 2, 3].map(&square)`,
        deep: "Lambdas check their argument count and `return` from themselves; procs are lenient and `return` from the enclosing method. Blocks capture surrounding variables (closures)." },
      { id: 'classes', title: 'Classes & modules', level: 'intermediate',
        body: "Classes define objects. `initialize` is the constructor; `@variables` are instance variables. `attr_reader`/`attr_accessor` generate getter/setter methods. `<` inherits; `include` mixes in a **module** of shared methods.",
        code: R`module Describable
  def describe = "#{self.class.name}: #{self}"
end

class Animal
  include Describable
  attr_reader :name

  def initialize(name)
    @name = name
  end

  def speak = "..."
  def to_s = "#{name} says #{speak}"
end

class Dog < Animal
  def speak = "Woof"
end

rex = Dog.new("Rex")
puts rex, rex.describe, rex.name
puts rex.is_a?(Animal), Dog.ancestors.take(3).inspect`,
        deep: "Including `Comparable` and defining `<=>` gives you `<`, `>`, `between?` and `clamp` for free; including `Enumerable` and defining `each` gives you `map`, `select`, `sort` and dozens more — a hallmark of idiomatic Ruby." },
      { id: 'errors', title: 'Exceptions', level: 'intermediate',
        body: "Handle errors with `begin / rescue / else / ensure / end` (inside a method, the `begin` is optional). Raise errors with `raise`. Rescue specific error classes.",
        code: R`def divide(a, b)
  raise ArgumentError, "cannot divide by zero" if b.zero?
  a / b
end

[2, 0].each do |d|
  begin
    puts divide(10, d)
  rescue ArgumentError => e
    puts "Error: #{e.message}"
  ensure
    puts "(done with #{d})"
  end
end

def parse(text)
  Integer(text)
rescue ArgumentError
  nil
end
p parse("42"), parse("abc")`,
        deep: "Define custom errors by subclassing `StandardError`. A bare `rescue` catches `StandardError` (not every exception). `retry` inside a `rescue` re-runs the `begin` block — useful with a retry counter for flaky operations." },
      { id: 'enum', title: 'Enumerable power tools', level: 'advanced',
        body: "Ruby's `Enumerable` module offers expressive methods for crunching collections: grouping, tallying, chunking, zipping and lazy evaluation of infinite sequences.",
        code: R`words = %w[apple avocado banana blueberry cherry]
p words.group_by { |w| w[0] }
p words.map(&:length).tally
p words.partition { |w| w.length > 6 }
p words.each_with_object({}) { |w, h| h[w] = w.length }
p words.min_by(&:length), words.sum("") { |w| w[0] }
p (1..Float::INFINITY).lazy.select(&:even?).map { _1 * _1 }.first(4)
p [1, 2, 3].zip([:a, :b, :c]).to_h
p (1..10).each_slice(3).map(&:sum)`,
        deep: "`lazy` turns an enumerator chain into a pipeline that only computes what's needed. `_1` and `it` (Ruby 3.4) are implicit block parameters. Prefer these declarative methods over manual loops with accumulators." }
    ],
    tips: [
      'Use 2-space indentation and `snake_case` for methods and variables, `CamelCase` for classes and modules.',
      'Prefer iterators (`each`, `map`, `select`) over `for` loops.',
      'Use string interpolation `"#{x}"` instead of concatenation.',
      'Rely on implicit returns; use explicit `return` only for early exits.',
      'Use `?` for predicate methods and `!` for methods that mutate or are dangerous.',
      'Use guard clauses (`return unless valid?`) to avoid deep nesting.',
      'Add `# frozen_string_literal: true` and use RuboCop to keep style consistent.'
    ],
    pitfalls: [
      'Forgetting `end` to close `def`, `if`, `do`, `class`.',
      'Using single quotes and expecting `#{}` interpolation to work.',
      'Calling a method on `nil` (NoMethodError) — use `&.` (safe navigation) when a value may be missing.',
      'Thinking `0` is falsy — in Ruby only `nil` and `false` are.',
      'Mutating a string or array you received when you meant to make a copy.'
    ]
  });

  /* ===================================================================== PHP */
  LANGS.push({
    id: 'php', name: 'PHP', tag: 'PHP', color: '#777bb4', file: 'index.php', cmd: 'php index.php',
    kind: 'cloud', engine: 'wandbox', wb: { lang: 'PHP' }, trace: 'explain', mode: 'application/x-httpd-php', snippetMode: 'text/x-php', indent: 4, comment: ['//'],
    wrap: '<?php\n{{CODE}}\n', wrapIndent: '',
    scaffold: '<?php\n{{COMMENT}}\n\n// Your code here\n',
    blurb: 'The server-side language behind WordPress, Laravel and a huge share of the web.',
    intro: 'PHP runs on web servers to generate pages and APIs. Modern PHP (8.x) has types, classes, enums and fast performance. Code goes between `<?php` and (optionally) `?>`; every variable starts with `$`. Code is run on the Wandbox online service.',
    docs: 'https://www.php.net/manual/en/',
    keywords: ['echo', 'print', 'function', 'return', 'if', 'elseif', 'else', 'foreach', 'for', 'while', 'as', 'array', 'class', 'public', 'private', 'protected', 'static', 'new', 'extends', 'implements', 'interface', 'try', 'catch', 'throw', 'match', 'fn', 'null', 'true', 'false', 'count', 'strlen', 'implode', 'explode', 'array_map', 'array_filter', 'printf', 'sprintf', 'isset', 'empty', 'var_dump', 'print_r', 'PHP_EOL'],
    starter: R`<?php
// Welcome to PHP! Press ▶ Run (or Ctrl+Enter).
// PHP is run on the free Wandbox service (needs internet).

declare(strict_types=1);

function average(array $numbers): float
{
    return array_sum($numbers) / count($numbers);
}

$scores = ['Ada' => [90, 85, 97], 'Linus' => [70, 88, 79]];

foreach ($scores as $name => $marks) {
    $avg = average($marks);
    printf("%s: average %.1f\n", $name, $avg);
}

$squares = array_map(fn($x) => $x * $x, range(1, 5));
echo "Squares: " . implode(', ', $squares) . PHP_EOL;
`,
    sections: [
      { id: 'hello', title: 'Hello, World & echo', level: 'beginner',
        body: "PHP code lives between `<?php` and `?>` (the closing tag is usually omitted in pure-PHP files). `echo` outputs text; statements end with a semicolon `;`.\n\nComments use `//`, `#` or `/* ... */`.",
        code: R`// single-line comment
echo "Hello, World!\n";
echo "Several ", "pieces ", "joined", PHP_EOL;
print "print works too\n";
/* multi-line
   comment */`,
        deep: "Outside `<?php ... ?>`, everything is sent to the output as-is — that's how PHP templates mix HTML and code. Omitting the final `?>` avoids accidental whitespace being sent before headers." },
      { id: 'vars', title: 'Variables & types', level: 'beginner',
        body: "Variables always start with `$` and are created by assignment. Types: `int`, `float`, `string`, `bool`, `array`, `null`, objects. `var_dump()` shows a value's type and contents — great for debugging.",
        code: R`$name = "Ada";
$age = 36;
$height = 1.65;
$isCoder = true;
$nothing = null;

echo "$name is $age\n";
var_dump($age, $height, $isCoder, $nothing);
echo gettype($name), PHP_EOL;

$age++;
[$a, $b] = [1, 2];
[$a, $b] = [$b, $a];              // swap
echo "$age $a $b\n";
const MAX_USERS = 100;
echo MAX_USERS, PHP_EOL;`,
        deep: "Add `declare(strict_types=1);` at the top of files so scalar type declarations are enforced instead of silently coerced. Compare with `===` (value *and* type) instead of `==`." },
      { id: 'strings', title: 'Strings', level: 'beginner',
        body: "Double-quoted strings interpolate variables (`\"Hi $name\"` or `\"{$user['name']}\"`); single-quoted strings don't. Join strings with the dot operator `.`. PHP has hundreds of string functions.",
        code: R`$first = "Grace";
$last = 'Hopper';
$full = $first . " " . $last;      // concatenation with .

echo "Name: $full ({$first[0]}.)\n";
echo strlen($full), " ", strtoupper($full), " ", strrev($full), PHP_EOL;
echo str_contains($full, "Hop") ? "found\n" : "missing\n";
echo str_replace("Grace", "Admiral", $full), PHP_EOL;
echo substr($full, 0, 5), PHP_EOL;
print_r(explode(",", "a,b,c"));
echo implode("-", ["x", "y", "z"]), PHP_EOL;
printf("Pi is about %.2f\n", M_PI);`,
        deep: "Use the `mb_*` functions (`mb_strlen`, `mb_substr`) for UTF-8 text — the classic functions count bytes. Heredoc (`<<<EOT`) and nowdoc syntax are handy for long blocks of text." },
      { id: 'cond', title: 'Conditionals & match', level: 'beginner',
        body: "`if / elseif / else` work like other C-style languages. The modern `match` expression (PHP 8) compares strictly and returns a value. `??` gives a default when a value is null or missing.",
        code: R`$temperature = 23;

if ($temperature > 30) {
    echo "Hot!\n";
} elseif ($temperature > 15) {
    echo "Pleasant\n";
} else {
    echo "Cold\n";
}

$label = $temperature >= 18 ? "warm" : "cool";
echo $label, PHP_EOL;

$status = 404;
echo match ($status) {
    200, 201 => "OK",
    404 => "Not found",
    default => "Unknown",
}, PHP_EOL;

$user = [];
echo $user['name'] ?? 'guest', PHP_EOL;`,
        deep: "`match` uses strict comparison (`===`) and throws `UnhandledMatchError` if nothing matches, unlike `switch`, which uses loose comparison and falls through without `break`." },
      { id: 'loops', title: 'Loops', level: 'beginner',
        body: "`for`, `while` and `do...while` work as in C. `foreach` is the everyday loop for arrays: `foreach ($items as $item)` or with keys `foreach ($map as $key => $value)`.",
        code: R`for ($i = 1; $i <= 3; $i++) {
    echo "i = $i\n";
}

$fruits = ["apple", "banana", "cherry"];
foreach ($fruits as $fruit) {
    echo "I like $fruit\n";
}

$prices = ["apple" => 0.5, "banana" => 0.25];
foreach ($prices as $fruit => $price) {
    echo "$fruit costs $price\n";
}

$n = 3;
while ($n > 0) {
    echo "countdown $n\n";
    $n--;
}`,
        deep: "`foreach ($arr as &$v)` iterates by reference so you can modify elements — but always `unset($v)` afterwards, or a later loop will overwrite the last element." },
      { id: 'func', title: 'Functions', level: 'beginner',
        body: "Functions can declare parameter and return **types**, default values and named arguments. Arrow functions `fn($x) => $x * 2` are short one-liners that capture outer variables automatically.",
        code: R`function greet(string $name = "friend"): string
{
    return "Hello, $name!";
}

function area(float $width, float $height = 1.0): float
{
    return $width * $height;
}

function total(int ...$numbers): int
{
    return array_sum($numbers);
}

echo greet("Lin"), " ", greet(), PHP_EOL;
echo area(height: 4, width: 3), PHP_EOL;   // named arguments
echo total(1, 2, 3, 4), PHP_EOL;

$factor = 3;
$triple = fn(int $x): int => $x * $factor;
echo $triple(5), PHP_EOL;`,
        deep: "Arrays and scalars are passed by value (copy-on-write); objects are passed by handle. Use `?string` for nullable types and union types like `int|float`. Anonymous `function () use ($x) {}` captures variables explicitly." },
      { id: 'arrays', title: 'Arrays', level: 'beginner',
        body: "PHP arrays are ordered maps that serve as both lists (`[1, 2, 3]`) and dictionaries (`['name' => 'Ada']`). Useful functions: `count`, `array_map`, `array_filter`, `sort`, `in_array`, `array_keys`.",
        code: R`$nums = [5, 3, 8];
$nums[] = 1;                         // append
echo count($nums), " ", $nums[0], PHP_EOL;

sort($nums);
echo implode(", ", $nums), PHP_EOL;

$doubled = array_map(fn($n) => $n * 2, $nums);
$evens = array_filter($nums, fn($n) => $n % 2 === 0);
echo implode(" ", $doubled), " | ", implode(" ", $evens), PHP_EOL;

$person = ["name" => "Ada", "age" => 36];
$person["email"] = "ada@example.com";
print_r($person);
echo in_array(8, $nums) ? "has 8\n" : "no 8\n";
echo json_encode($person), PHP_EOL;`,
        deep: "`array_filter` preserves keys — wrap it in `array_values()` to reindex. `usort($arr, fn($a, $b) => $a <=> $b)` sorts with a comparator using the spaceship operator." },
      { id: 'classes', title: 'Classes & objects', level: 'intermediate',
        body: "Classes have properties and methods with visibility (`public`, `private`, `protected`). **Constructor promotion** declares and assigns properties in one go. Access members with `->`.",
        code: R`class Animal
{
    public function __construct(
        protected string $name,
        private string $sound = "..."
    ) {}

    public function speak(): string
    {
        return "{$this->name} says {$this->sound}";
    }
}

class Dog extends Animal
{
    public function __construct(string $name)
    {
        parent::__construct($name, "Woof");
    }

    public function fetch(): string
    {
        return "{$this->name} fetches!";
    }
}

$rex = new Dog("Rex");
echo $rex->speak(), PHP_EOL, $rex->fetch(), PHP_EOL;
var_dump($rex instanceof Animal);`,
        deep: "Interfaces define contracts, abstract classes share partial implementations and traits reuse methods horizontally. `readonly` properties (8.1) and readonly classes (8.2) make immutable value objects easy." },
      { id: 'errors', title: 'Exceptions', level: 'intermediate',
        body: "Throw exceptions with `throw new Exception('...')` and handle them with `try / catch / finally`. Catch specific classes such as `InvalidArgumentException`.",
        code: R`function divide(int $a, int $b): float
{
    if ($b === 0) {
        throw new InvalidArgumentException("Cannot divide by zero");
    }
    return $a / $b;
}

foreach ([2, 0] as $d) {
    try {
        echo divide(10, $d), PHP_EOL;
    } catch (InvalidArgumentException $e) {
        echo "Error: ", $e->getMessage(), PHP_EOL;
    } finally {
        echo "(checked $d)\n";
    }
}`,
        deep: "Since PHP 7, many engine errors are thrown as `Error` (e.g. `TypeError`, `DivisionByZeroError`); catch `Throwable` to handle both exceptions and errors at application boundaries." },
      { id: 'modern', title: 'Modern PHP: enums, null-safe & more', level: 'advanced',
        body: "PHP 8 added many modern features: **enums**, the null-safe operator `?->`, `readonly` properties, first-class callables and more.",
        code: R`enum Suit: string
{
    case Hearts = 'H';
    case Spades = 'S';

    public function color(): string
    {
        return match ($this) {
            Suit::Hearts => 'Red',
            Suit::Spades => 'Black',
        };
    }
}

final class Point
{
    public function __construct(public readonly int $x, public readonly int $y) {}
}

echo Suit::Hearts->color(), " ", Suit::from('S')->name, PHP_EOL;
$p = new Point(2, 3);
echo "($p->x, $p->y)\n";

$user = null;
echo $user?->address?->city ?? "unknown city", PHP_EOL;

$upper = strtoupper(...);              // first-class callable
echo implode(",", array_map($upper, ["a", "b"])), PHP_EOL;`,
        deep: "Use Composer for dependencies and PSR-4 autoloading, follow the PSR-12 coding style, and run static analysis (PHPStan or Psalm) to catch type errors before production." }
    ],
    tips: [
      'Start files with `declare(strict_types=1);` and type every parameter, property and return value.',
      'Always compare with `===` and `!==`.',
      'Escape output with `htmlspecialchars()` when printing user data into HTML (prevents XSS).',
      'Use prepared statements (PDO) for database queries — never concatenate user input into SQL.',
      'Follow PSR-12: 4 spaces, `camelCase` methods, `PascalCase` classes, braces on new lines for classes and functions.',
      'Use `match`, null-coalescing `??` and constructor promotion to keep code short and clear.',
      'Manage dependencies with Composer and analyse code with PHPStan.'
    ],
    pitfalls: [
      'Forgetting the `$` in front of a variable name.',
      'Forgetting the semicolon at the end of a statement.',
      'Using `+` instead of `.` to join strings.',
      'Single-quoted strings don\'t interpolate variables or `\\n`.',
      'Loose comparison surprises: `"abc" == 0` was true before PHP 8.'
    ]
  });
})();
