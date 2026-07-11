using System.Collections.Generic;

namespace OopLearningPortal.Models
{
    public class Section
    {
        public int Id { get; set; }
        public string TitleEn { get; set; } = string.Empty;
        public string TitleAr { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string LearnContentHtml { get; set; } = string.Empty;
        public string InitialCode { get; set; } = string.Empty;
        public string ChallengeTitle { get; set; } = string.Empty;
        public string ChallengeDescription { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
        public List<QuizQuestion> Quiz { get; set; } = [];
        public string? UmlDiagram { get; set; }
        public List<CodeLab> Labs { get; set; } = [];
        public DragDropExercise DragDrop { get; set; } = new();
        public List<PredictOutputExercise> PredictOutputs { get; set; } = [];
        public SpotBugExercise? BugHunter { get; set; }
    }

    public class CodeLab
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string InitialCode { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
    }

    /// <summary>
    /// A "Predict the Output" exercise: student reads code and types what they think will print.
    /// </summary>
    public class PredictOutputExercise
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Hint { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
    }

    /// <summary>
    /// A "Spot the Bug" exercise: student clicks the buggy line of code.
    /// </summary>
    public class SpotBugExercise
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> CodeLines { get; set; } = [];
        public int BuggyLineIndex { get; set; } // 0-based index of the buggy line
        public string Explanation { get; set; } = string.Empty;
    }

    public class DragDropExercise
    {
        public string ExerciseTitle { get; set; } = string.Empty;
        public List<DragDropPair> Pairs { get; set; } = [];
    }

    public class DragDropPair
    {
        public string Id { get; set; } = string.Empty;
        public string Term { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class QuizQuestion
    {
        public int Id { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public List<string> Options { get; set; } = [];
        public int CorrectOptionIndex { get; set; }
        public string Explanation { get; set; } = string.Empty;
    }

    public static class SectionRepository
    {
        public static List<Section> GetAll()
        {
            return [
                // =====================================================
                // SECTION 1: Introduction & Programming Paradigms
                // =====================================================
                new Section
                {
                    Id = 1,
                    TitleEn = "Methods & Parameter Passing",
                    TitleAr = "Methods & Parameter Passing",
                    Summary = "Master C# method declarations, overloading rules, and parameter passing using value, ref, and out mechanisms.",
                    LearnContentHtml = @"
<h3 class='text-cyan Cairo-bold'>1. Method Definition & Syntax</h3>
<p>A <strong>Method</strong> is a block of code containing a series of statements that performs a specific task. It can be executed (invoked) when needed, which helps prevent code duplication and improves code organization.</p>

<h4 class='text-cyan font-outfit'>1.1 Method Syntax</h4>
<p>The standard syntax for a method in C# is:</p>
<pre><code class='language-csharp'>returnType methodName(parameters)
{
    // method body
    // return statement (if returnType is not void)
}</code></pre>

<h4 class='text-cyan font-outfit'>1.2 Method Types</h4>
<ul>
    <li><strong>Built-in Methods:</strong> Provided by the .NET Framework Class Library (e.g., <code>Console.WriteLine()</code>, <code>Math.Sqrt()</code>).</li>
    <li><strong>User-Defined Methods:</strong> Declared and implemented by the developer to solve custom problems.</li>
</ul>

<h3 class='text-cyan Cairo-bold'>2. Method Overloading</h3>
<p><strong>Method Overloading</strong> in C# allows a class to have multiple methods with the same name but with different parameter lists (different number, types, or order of parameters). The compiler distinguishes between overloads based on their <strong>method signature</strong> (method name + parameters list). Note that the return type is <em>not</em> part of the method signature.</p>

<div class='concept-callout'>
<span class='callout-icon'><i class='fa-solid fa-lightbulb'></i></span>
<span class='callout-text'><strong>Overloading Signature Rule:</strong> Overloading is resolved at compile time. Methods cannot differ by return type alone.</span>
</div>

<h3 class='text-cyan Cairo-bold'>3. Passing Parameters</h3>
<p>C# supports two main ways to pass parameters to methods:</p>
<table class='comparison-table'>
<thead><tr><th>Mechanism</th><th>Keyword</th><th>Behavior</th><th>Requirements</th></tr></thead>
<tbody>
<tr><td><strong>By Value</strong></td><td><em>None (Default)</em></td><td>Creates a copy of the argument. Modifications inside the method do not affect the original variable.</td><td>Variable must be initialized before passing.</td></tr>
<tr><td><strong>By Reference (ref)</strong></td><td><code>ref</code></td><td>Passes a reference (alias) to the original variable. Modifications directly update the original variable.</td><td>Variable must be initialized before passing.</td></tr>
<tr><td><strong>By Reference (out)</strong></td><td><code>out</code></td><td>Passes a reference to the original variable. Used to return multiple values from a method.</td><td>Method <em>must</em> assign a value to the parameter before returning. Original variable does not need to be initialized before passing.</td></tr>
</tbody>
</table>

<div class='alert alert-info-glow my-4'>
<h5 class='text-cyan font-outfit'><i class='fa-solid fa-code'></i> Code Example: Parameter Swapping using ref</h5>
<pre><code class='language-csharp'>using System;

class Program
{
    static void Swap(ref int x, ref int y)
    {
        int temp = x;
        x = y;
        y = temp;
    }

    static void Main()
    {
        int a = 10, b = 20;
        Swap(ref a, ref b);
        Console.WriteLine($""a: {a}, b: {b}""); // Output: a: 20, b: 10
    }
}</code></pre>
</div>",
                    InitialCode = @"using System;

class Program
{
    static void Main()
    {
        int a = 10, b = 20;
        Console.WriteLine($""Before Swap: a={a}, b={b}"");
        // Call Swap here
        Console.WriteLine($""After Swap: a={a}, b={b}"");
    }

    // Implement static void Swap(ref int x, ref int y)
}",
                    ChallengeTitle = "Swapping Variables",
                    ChallengeDescription = "Complete the Swap method using reference parameters (`ref int`) to swap the values of variables `a` and `b` in memory.",
                    ExpectedOutput = "Before Swap: a=10, b=20\r\nAfter Swap: a=20, b=10",
                    Quiz = [
                        new QuizQuestion { Id = 1, QuestionText = "What constitutes a method signature in C#?", Options = ["Method name and return type", "Method name and parameter list (types, number, order)", "Return type and parameters only", "Access modifier and method name"], CorrectOptionIndex = 1, Explanation = "A method signature consists of the method name and the types, order, and number of parameters. Return type is not included." },
                        new QuizQuestion { Id = 2, QuestionText = "Which parameter passing mechanism requires the variable to be initialized before passing, and allows it to be updated?", Options = ["by value", "by reference (out)", "by reference (ref)", "by reference (in)"], CorrectOptionIndex = 2, Explanation = "The 'ref' keyword requires the variable to be initialized before being passed and allows reading and writing." },
                        new QuizQuestion { Id = 3, QuestionText = "What is a key requirement when using the 'out' parameter modifier?", Options = ["The variable must be initialized before passing it to the method.", "The method must assign a value to the out parameter before it returns.", "The out parameter must be of type string.", "The method must return void."], CorrectOptionIndex = 1, Explanation = "The compiler enforces that any out parameter must be assigned a value inside the method before returning." }
                    ],
                    Labs = [
                        new CodeLab
                        {
                            Id = 1,
                            Title = "Overloaded Add Method",
                            Description = "Implement three overloaded methods named `Add`: one adding two integers, one adding a float and an integer, and one adding three integers. Print results inside Main.",
                            InitialCode = @"using System;

class Program
{
    static void Main()
    {
        Console.WriteLine(Add(5, 10));
        Console.WriteLine(Add(2.5f, 4));
        Console.WriteLine(Add(1, 2, 3));
    }

    // Add overloads here
}",
                            ExpectedOutput = "15\r\n6.5\r\n6"
                        },
                        new CodeLab
                        {
                            Id = 2,
                            Title = "Sum Calculator ref/out",
                            Description = "Write a method that takes three parameters: two input integers passed by value, and a third parameter passed by reference (`out`) to store their sum.",
                            InitialCode = @"using System;

class Program
{
    static void Main()
    {
        int result;
        CalculateSum(15, 30, out result);
        Console.WriteLine(""Result: "" + result);
    }

    // Implement CalculateSum method here
}",
                            ExpectedOutput = "Result: 45"
                        }
                    ],
                    DragDrop = new DragDropExercise
                    {
                        ExerciseTitle = "Methods & Parameters Matching",
                        Pairs = [
                            new DragDropPair { Id = "dd-1-1", Term = "Method Overloading", Description = "Same name but different parameter list signature." },
                            new DragDropPair { Id = "dd-1-2", Term = "ref parameter", Description = "Passes variable by reference; must be initialized before call." },
                            new DragDropPair { Id = "dd-1-3", Term = "out parameter", Description = "Passes variable by reference; must be assigned inside the method." },
                            new DragDropPair { Id = "dd-1-4", Term = "By Value passing", Description = "Passes a copy of the argument; leaves caller variable unaffected." }
                        ]
                    },
                    PredictOutputs =
                    [
                        new PredictOutputExercise
                        {
                            Id = 1,
                            Title = "Value vs Reference — Who Changes?",
                            Hint = "Think carefully: does the caller's variable change when passed by value?",
                            Code = @"using System;
class Program {
    static void Double(int x) { x = x * 2; }
    static void Main() {
        int n = 10;
        Double(n);
        Console.WriteLine(n);
    }
}",
                            ExpectedOutput = "10"
                        },
                        new PredictOutputExercise
                        {
                            Id = 2,
                            Title = "The ref Keyword in Action",
                            Hint = "With ref, the method works on the original variable directly.",
                            Code = @"using System;
class Program {
    static void Triple(ref int x) { x = x * 3; }
    static void Main() {
        int n = 5;
        Triple(ref n);
        Console.WriteLine(n);
    }
}",
                            ExpectedOutput = "15"
                        },
                        new PredictOutputExercise
                        {
                            Id = 3,
                            Title = "Method Overloading — Which Gets Called?",
                            Hint = "C# picks the overload based on the argument types at compile time.",
                            Code = @"using System;
class Program {
    static void Print(int x) { Console.WriteLine(""int: "" + x); }
    static void Print(double x) { Console.WriteLine(""double: "" + x); }
    static void Main() {
        Print(7);
        Print(7.0);
    }
}",
                            ExpectedOutput = "int: 7\r\ndouble: 7"
                        }
                    ],
                    BugHunter = new SpotBugExercise
                    {
                        Title = "Invalid Use of out Parameter",
                        Description = "Locate the line that causes a C# compiler error. Remember the rule: an 'out' parameter must be initialized/assigned a value inside the method before you can read from it or before the method exits.",
                        CodeLines = [
                            "using System;",
                            "class Program {",
                            "    static void Triple(out int x) {",
                            "        x = x * 3; // Trying to multiply the unassigned value",
                            "    }",
                            "    static void Main() {",
                            "        int n = 5;",
                            "        Triple(out n);",
                            "        Console.WriteLine(n);",
                            "    }",
                            "}"
                        ],
                        BuggyLineIndex = 3,
                        Explanation = "Line 4 contains the error: 'x = x * 3;'. In C#, an 'out' parameter is considered unassigned upon method entry. Therefore, you cannot read its value (e.g., using it in 'x * 3' on the right-hand side) before assigning it a value first. You must write e.g., 'x = 3;' first, then you can read from it."
                    }
                },

                // =====================================================
                // SECTION 2: Arrays, Structs & Enums
                // =====================================================
                new Section
                {
                    Id = 2,
                    TitleEn = "Arrays, Structs & Enums",
                    TitleAr = "Arrays, Structs & Enums",
                    Summary = "Understand contiguous memory arrays, struct value types, and enum state representations in C#.",
                    LearnContentHtml = @"
<h3 class='text-cyan Cairo-bold'>1. C# Arrays</h3>
<p>An <strong>Array</strong> is a group of contiguous memory locations that share a common name and are used to store multiple values of the same datatype. Arrays in C# have a fixed size defined at creation time.</p>

<h4 class='text-cyan font-outfit'>1.1 Declaring & Initializing Arrays</h4>
<pre><code class='language-csharp'>// Declaring an array with a fixed size of 5
int[] numbers = new int[5];

// Declaring and initializing directly (Array literal)
int[] grades = { 90, 85, 92, 78, 88 };</code></pre>

<h4 class='text-cyan font-outfit'>1.2 Array Length & Looping</h4>
<p>You can access the number of elements using the <code>Length</code> property. Looping can be done via <code>for</code> or <code>foreach</code> statements:</p>
<pre><code class='language-csharp'>for (int i = 0; i < grades.Length; i++)
{
    Console.WriteLine(grades[i]);
}</code></pre>

<h3 class='text-cyan Cairo-bold'>2. C# Structures (Structs)</h3>
<p>In C#, a <strong>struct</strong> is a value type data type. It groups related data of various datatypes under a single variable slot. Unlike classes, structs are allocated directly on the Stack (unless embedded inside a class object on the Heap).</p>

<h4 class='text-cyan font-outfit'>2.1 Key Features of Structs</h4>
<ul>
    <li>Structs can contain fields, constructors, properties, and methods.</li>
    <li>Structs do <em>not</em> support inheritance (they cannot inherit or be inherited from), but they can implement interfaces.</li>
    <li>Structs can be instantiated without the <code>new</code> operator. However, all fields must be manually initialized before accessing any members.</li>
</ul>

<table class='comparison-table'>
<thead><tr><th>Feature</th><th>Class (Reference Type)</th><th>Struct (Value Type)</th></tr></thead>
<tbody>
<tr><td><strong>Memory Location</strong></td><td>Managed Heap</td><td>Stack (inline)</td></tr>
<tr><td><strong>Inheritance</strong></td><td>Fully supported</td><td>No (interfaces only)</td></tr>
<tr><td><strong>Destructors</strong></td><td>Yes</td><td>No</td></tr>
<tr><td><strong>Default Assignment</strong></td><td>Copies reference (pointer)</td><td>Copies all member values</td></tr>
</tbody>
</table>

<h3 class='text-cyan Cairo-bold'>3. Enumerations (Enums)</h3>
<p>An <strong>Enum</strong> is a distinct value type that defines a set of named integer constants. Enums are highly useful for improving code readability by replacing magic numbers with clear state labels.</p>
<pre><code class='language-csharp'>enum OrderStatus
{
    Pending,    // 0
    Processing, // 1
    Shipped,    // 2
    Delivered   // 3
}</code></pre>

<div class='concept-callout'>
<span class='callout-icon'><i class='fa-solid fa-lightbulb'></i></span>
<span class='callout-text'><strong>Enum Casting:</strong> Convert an enum variable to its integer index using a cast expression: <code>int index = (int)OrderStatus.Shipped;</code> (returns 2).</span>
</div>",
                    InitialCode = @"using System;

struct Book
{
    public string Title;
    public string Author;
    public int BookID;

    public void PrintDetails()
    {
        Console.WriteLine($""Title: {Title}, Author: {Author}, ID: {BookID}"");
    }
}

class Program
{
    static void Main()
    {
        // Declare and populate a Book variable
        Book myBook;
        myBook.Title = ""C# Guide"";
        myBook.Author = ""Farahat"";
        myBook.BookID = 105;

        myBook.PrintDetails();
    }
}",
                    ChallengeTitle = "Creating a Struct Instance",
                    ChallengeDescription = "Initialize a struct variable representing a Student with Name (string), Age (int), and GPA (double). Assign values (Name=\"Zara\", Age=20, GPA=3.7) and print them in Main.",
                    ExpectedOutput = "Title: C# Guide, Author: Farahat, ID: 105",
                    Quiz = [
                        new QuizQuestion { Id = 1, QuestionText = "Where are struct value types allocated in C# by default?", Options = ["On the managed heap", "Directly on the stack", "In LOH", "Inside the JIT registry"], CorrectOptionIndex = 1, Explanation = "Structs are value types and are allocated directly inline on the Stack memory." },
                        new QuizQuestion { Id = 2, QuestionText = "What is a main difference between structs and classes?", Options = ["Structs cannot have methods.", "Structs do not support inheritance.", "Classes cannot contain properties.", "Structs must always use 'new' operator."], CorrectOptionIndex = 1, Explanation = "Unlike classes, C# structures do not support inheritance." },
                        new QuizQuestion { Id = 3, QuestionText = "What index does a C# array start with?", Options = ["1", "0", "-1", "Dynamic index"], CorrectOptionIndex = 1, Explanation = "All C# arrays are zero-indexed, starting at index 0." }
                    ],
                    Labs = [
                        new CodeLab
                        {
                            Id = 1,
                            Title = "Manual Array Copier",
                            Description = "Copy all elements from the source array into the target array using a loop, then print the target array values separated by spaces.",
                            InitialCode = @"using System;

class Program
{
    static void Main()
    {
        int[] source = { 10, 20, 30, 40 };
        int[] target = new int[source.Length];

        // Copy elements here

        for(int i = 0; i < target.Length; i++)
        {
            Console.Write(target[i] + "" "");
        }
    }
}",
                            ExpectedOutput = "10 20 30 40 "
                        },
                        new CodeLab
                        {
                            Id = 2,
                            Title = "Find Max Array Element",
                            Description = "Complete the method FindMax to return the largest number in the array parameter.",
                            InitialCode = @"using System;

class Program
{
    static void Main()
    {
        int[] numbers = { 12, 45, 23, 56, 34 };
        Console.WriteLine(""Max: "" + FindMax(numbers));
    }

    static int FindMax(int[] arr)
    {
        // Find and return max
        return 0;
    }
}",
                            ExpectedOutput = "Max: 56"
                        }
                    ],
                    DragDrop = new DragDropExercise
                    {
                        ExerciseTitle = "Arrays & Structs Matching",
                        Pairs = [
                            new DragDropPair { Id = "dd-2-1", Term = "Array Length", Description = "Property returning the count of elements in the collection." },
                            new DragDropPair { Id = "dd-2-2", Term = "struct keyword", Description = "Declares a Stack-allocated value type with custom fields." },
                            new DragDropPair { Id = "dd-2-3", Term = "enum keyword", Description = "Defines a set of named integer constants for states." },
                            new DragDropPair { Id = "dd-2-4", Term = "Value Type", Description = "Directly stores data values in stack memory slot." }
                        ]
                    },
                    PredictOutputs =
                    [
                        new PredictOutputExercise
                        {
                            Id = 1,
                            Title = "Array Index Access",
                            Hint = "Arrays are zero-indexed — element at [0] is the first one.",
                            Code = @"using System;
class Program {
    static void Main() {
        int[] scores = { 85, 90, 78, 95, 60 };
        Console.WriteLine(scores[0]);
        Console.WriteLine(scores[scores.Length - 1]);
        Console.WriteLine(scores.Length);
    }
}",
                            ExpectedOutput = "85\r\n60\r\n5"
                        },
                        new PredictOutputExercise
                        {
                            Id = 2,
                            Title = "Struct Value Copy Semantics",
                            Hint = "Structs are value types — assigning one to another creates a COPY, not a reference.",
                            Code = @"using System;
struct Point { public int X; public int Y; }
class Program {
    static void Main() {
        Point a = new Point { X = 3, Y = 7 };
        Point b = a;
        b.X = 99;
        Console.WriteLine(a.X);
        Console.WriteLine(b.X);
    }
}",
                            ExpectedOutput = "3\r\n99"
                        },
                        new PredictOutputExercise
                        {
                            Id = 3,
                            Title = "Enum Integer Values",
                            Hint = "By default, the first enum member = 0, and each subsequent member increments by 1.",
                            Code = @"using System;
enum Season { Spring, Summer, Autumn, Winter }
class Program {
    static void Main() {
        Season s = Season.Autumn;
        Console.WriteLine(s);
        Console.WriteLine((int)s);
    }
}",
                            ExpectedOutput = "Autumn\r\n2"
                        }
                    ]
                },

                // =====================================================
                // SECTION 3: Classes, Objects & Encapsulation
                // =====================================================
                new Section
                {
                    Id = 3,
                    TitleEn = "Classes, Objects & Encapsulation",
                    TitleAr = "Classes, Objects & Encapsulation",
                    Summary = "Design robust class blueprints, constructors, and getters/setters to protect state invariants in memory.",
                    LearnContentHtml = @"
<h3 class='text-cyan Cairo-bold'>1. Class Definition & Fields</h3>
<p>A <strong>Class</strong> is a reference type template defining fields (attributes) and methods (behaviors). <strong>Encapsulation</strong> dictates that fields should be marked <code>private</code> to prevent direct outside access. The state can only be accessed or modified via public getters and setters.</p>

<h4 class='text-cyan font-outfit'>1.1 Private Fields & Constructors</h4>
<pre><code class='language-csharp'>class Person
{
    private int id;
    private string name;
    private int age;
    private string gender;

    // Default Constructor: Initializes default values
    public Person()
    {
        id = 0; name = "" ""; age = 0; gender = "" "";
    }

    // Parameterized Constructor: Sets initial values via methods
    public Person(int id, string name, int age, string gender)
    {
        SetID(id);
        SetName(name);
        SetAge(age);
        this.gender = gender;
    }
}</code></pre>

<h3 class='text-cyan Cairo-bold'>2. Getter & Setter Methods</h3>
<p>Getters and setters are public methods that provide read/write access to private fields. They can contain validation rules to reject invalid values and maintain the internal integrity of the object.</p>
<pre><code class='language-csharp'>public void SetID(int id)
{
    if (id > 0) this.id = id;
    else Console.WriteLine(""ID must be positive."");
}
public int GetID() => id;

public void SetAge(int age)
{
    if (age > 0) this.age = age;
    else Console.WriteLine(""Age must be positive."");
}
public int GetAge() => age;</code></pre>

<div class='common-mistake'>
<div class='mistake-title'><i class='fa-solid fa-triangle-exclamation me-1'></i> Access Restrictions</div>
<div class='mistake-body'>Attempting to access <code>person.id = 5</code> directly from another class results in a compilation error: <em>'Person.id is inaccessible due to its protection level'</em>. Clients must use the public <code>SetID()</code> method instead.</div>
</div>",
                    InitialCode = @"using System;

class Person
{
    private int id;
    private string name;

    public Person()
    {
        id = 0; name = "" "";
    }

    public void SetID(int newId)
    {
        if (newId > 0) id = newId;
    }

    public int GetID() => id;

    public void SetName(string newName) => name = newName;
    public string GetName() => name;
}

class Program
{
    static void Main()
    {
        Person p = new Person();
        // Call setters to assign ID = 50 and Name = ""Ahmed""
        // Print GetID() and GetName()
    }
}",
                    ChallengeTitle = "Class Fields & Getters/Setters",
                    ChallengeDescription = "Initialize the Person instance inside Main, assign valid values using setters, and output the ID and Name.",
                    ExpectedOutput = "ID: 50, Name: Ahmed",
                    Quiz = [
                        new QuizQuestion { Id = 1, QuestionText = "What is a constructor?", Options = ["A method that deletes objects", "A special method that initializes new objects", "A property template", "An array allocator"], CorrectOptionIndex = 1, Explanation = "Constructors are executed automatically upon object instantiation to initialize object fields." },
                        new QuizQuestion { Id = 2, QuestionText = "Why do we make class fields private?", Options = ["To increase compilation speed", "To prevent direct external access and force validation", "To allow inheritance", "To fit inside stack frames"], CorrectOptionIndex = 1, Explanation = "Private fields implement encapsulation, preventing external code from corrupting the object's internal state." },
                        new QuizQuestion { Id = 3, QuestionText = "Which method gets called automatically when you execute 'new Person()'?", Options = ["Main method", "Default constructor", "SetID method", "Destructor"], CorrectOptionIndex = 1, Explanation = "Executing 'new' with empty parenthesis invokes the class's default (parameterless) constructor." }
                    ],
                    Labs = [
                        new CodeLab
                        {
                            Id = 1,
                            Title = "Person Parameterized Constructor",
                            Description = "Implement a parameterized constructor in the Person class that takes 'id' and 'name' parameters and validates them using setters.",
                            InitialCode = @"using System;

class Person
{
    private int id;
    private string name;

    // Default constructor
    public Person() { }

    // Implement parameterized constructor here

    public void SetID(int val) { if (val > 0) id = val; }
    public int GetID() => id;
    public void SetName(string val) => name = val;
    public string GetName() => name;
}

class Program
{
    static void Main()
    {
        Person p = new Person(12, ""Sara"");
        Console.WriteLine($""{p.GetID()}: {p.GetName()}"");
    }
}",
                            ExpectedOutput = "12: Sara"
                        },
                        new CodeLab
                        {
                            Id = 2,
                            Title = "Person Input Validation",
                            Description = "In the SetAge method, ensure the age is greater than zero; otherwise, set it to 18 and print a warning message 'Invalid Age! Defaulting to 18.'",
                            InitialCode = @"using System;

class Person
{
    private int age;

    public void SetAge(int val)
    {
        // Validate age here
    }

    public int GetAge() => age;
}

class Program
{
    static void Main()
    {
        Person p = new Person();
        p.SetAge(-5);
        Console.WriteLine(""Age: "" + p.GetAge());
    }
}",
                            ExpectedOutput = "Invalid Age! Defaulting to 18.\r\nAge: 18"
                        }
                    ],
                    DragDrop = new DragDropExercise
                    {
                        ExerciseTitle = "Classes & Objects Matching",
                        Pairs = [
                            new DragDropPair { Id = "dd-3-1", Term = "Default Constructor", Description = "A parameterless constructor that sets default initial field values." },
                            new DragDropPair { Id = "dd-3-2", Term = "Getter Method", Description = "A public method that returns the value of a private field." },
                            new DragDropPair { Id = "dd-3-3", Term = "Setter Method", Description = "A public method that assigns a validated value to a private field." },
                            new DragDropPair { Id = "dd-3-4", Term = "Parameterized Constructor", Description = "Accepts arguments at instantiation to initialize fields directly." }
                        ]
                    },
                    PredictOutputs =
                    [
                        new PredictOutputExercise
                        {
                            Id = 1,
                            Title = "Default Constructor Values",
                            Hint = "The default constructor sets id=0 and name to empty string. What does GetID return?",
                            Code = @"using System;
class Person {
    private int id;
    private string name;
    public Person() { id = 0; name = """"; }
    public int GetID() => id;
    public string GetName() => name;
}
class Program {
    static void Main() {
        Person p = new Person();
        Console.WriteLine(p.GetID());
        Console.WriteLine(p.GetName() == """" ? ""(empty)"" : p.GetName());
    }
}",
                            ExpectedOutput = "0\r\n(empty)"
                        },
                        new PredictOutputExercise
                        {
                            Id = 2,
                            Title = "Setter Validation in Action",
                            Hint = "The setter checks if age > 0. What happens when we pass -5?",
                            Code = @"using System;
class Student {
    private int age = 18;
    public void SetAge(int val) {
        if (val > 0) age = val;
        else Console.WriteLine(""Invalid age!"");
    }
    public int GetAge() => age;
}
class Program {
    static void Main() {
        Student s = new Student();
        s.SetAge(-5);
        Console.WriteLine(s.GetAge());
        s.SetAge(22);
        Console.WriteLine(s.GetAge());
    }
}",
                            ExpectedOutput = "Invalid age!\r\n18\r\n22"
                        },
                        new PredictOutputExercise
                        {
                            Id = 3,
                            Title = "Parameterized Constructor Chain",
                            Hint = "The parameterized constructor uses SetID which validates id > 0.",
                            Code = @"using System;
class Person {
    private int id;
    public Person(int id) { SetID(id); }
    public void SetID(int val) { if (val > 0) this.id = val; }
    public int GetID() => id;
}
class Program {
    static void Main() {
        Person p1 = new Person(5);
        Person p2 = new Person(-3);
        Console.WriteLine(p1.GetID());
        Console.WriteLine(p2.GetID());
    }
}",
                            ExpectedOutput = "5\r\n0"
                        }
                    ],
                    BugHunter = new SpotBugExercise
                    {
                        Title = "Encapsulation Violation",
                        Description = "Find the line that violates encapsulation principles and causes a compilation error in C#.",
                        CodeLines = [
                            "using System;",
                            "class Student {",
                            "    private string name = \"Zara\";",
                            "    public string GetName() => name;",
                            "}",
                            "class Program {",
                            "    static void Main() {",
                            "        Student s = new Student();",
                            "        s.name = \"Ahmed\"; // Assigning name",
                            "        Console.WriteLine(s.GetName());",
                            "    }",
                            "}"
                        ],
                        BuggyLineIndex = 8,
                        Explanation = "Line 9 contains the error: 's.name = \"Ahmed\";'. The field 'name' in class 'Student' is marked as 'private', meaning it can only be accessed or modified from inside the 'Student' class. Accessing it directly from 'Program.Main' is a compilation error."
                    }
                },

                // =====================================================
                // SECTION 4: UML Class Diagrams
                // =====================================================
                new Section
                {
                    Id = 4,
                    TitleEn = "UML Diagrams & Circle/Account Classes",
                    TitleAr = "UML Diagrams & Circle/Account Classes",
                    Summary = "Convert visual UML specifications into C# source code, featuring validation and multi-value parameters.",
                    LearnContentHtml = @"
<h3 class='text-cyan Cairo-bold'>1. UML Class Diagrams</h3>
<p><strong>Unified Modeling Language (UML)</strong> is a standardized visual language for software modeling. A UML class representation consists of three compartments:</p>
<ol>
    <li><strong>Class Name:</strong> Located at the top.</li>
    <li><strong>Attributes (Fields):</strong> <code>visibility name : type</code>.</li>
    <li><strong>Operations (Methods):</strong> <code>visibility name(parameters) : returnType</code>.</li>
</ol>

<h4 class='text-cyan font-outfit'>1.1 UML Visibility Identifiers</h4>
<ul>
    <li><code>-</code> represents <code>private</code></li>
    <li><code>+</code> represents <code>public</code></li>
    <li><code>#</code> represents <code>protected</code></li>
</ul>

<h3 class='text-cyan Cairo-bold'>2. Converting UML to C#</h3>
<p>Below is a visual C# mapping of a bank Account class designed using UML visibility standards. It features balance protection and multi-value reference getters.</p>

<div class='alert alert-info-glow my-4'>
<h5 class='text-cyan font-outfit'><i class='fa-solid fa-code'></i> Code Example: Account Class (UML Conversion)</h5>
<pre><code class='language-csharp'>class Account
{
    private int accountNumber;
    private double balance;

    public Account(int accountNumber, double balance)
    {
        SetAccountNumber(accountNumber);
        SetBalance(balance);
    }

    public void SetBalance(double val)
    {
        if (val >= 0) balance = val;
    }

    public void SetAccountNumber(int val)
    {
        if (val > 0) accountNumber = val;
    }

    // Get multiple fields using reference parameters (ref/out)
    public void GetAccountData(out int accNum, out double bal)
    {
        accNum = accountNumber;
        bal = balance;
    }

    public void Credit(double amount)
    {
        if (amount > 0) balance += amount;
    }

    public void Debit(double amount)
    {
        if (amount > 0 && amount <= balance) balance -= amount;
    }
}</code></pre>
</div>",
                    InitialCode = @"using System;

class Account
{
    private int accountNumber;
    private double balance;

    public Account(int accountNumber, double balance)
    {
        SetAccountNumber(accountNumber);
        SetBalance(balance);
    }

    public void SetAccountNumber(int num) { if (num > 0) accountNumber = num; }
    public void SetBalance(double bal) { if (bal >= 0) balance = bal; }

    public int GetAccountNumber() => accountNumber;
    public double GetBalance() => balance;

    // Implement Credit and Debit methods
}

class Program
{
    static void Main()
    {
        Account acc = new Account(1001, 500.0);
        // Deposit (Credit) 100
        // Withdraw (Debit) 200
        // Output balance
    }
}",
                    ChallengeTitle = "Implementing UML Methods",
                    ChallengeDescription = "Complete the Credit (deposit) and Debit (withdraw with balance validation) methods in the Account class according to the UML specification.",
                    ExpectedOutput = "Remaining Balance: 400",
                    Quiz = [
                        new QuizQuestion { Id = 1, QuestionText = "What visibility does a plus (+) symbol represent in UML?", Options = ["private", "public", "protected", "internal"], CorrectOptionIndex = 1, Explanation = "A plus (+) symbol indicates public visibility in UML notations." },
                        new QuizQuestion { Id = 2, QuestionText = "Which UML compartment holds method declarations?", Options = ["First (top)", "Second (middle)", "Third (bottom)", "None of the above"], CorrectOptionIndex = 2, Explanation = "The third (bottom) compartment contains methods, operations, and behaviors." },
                        new QuizQuestion { Id = 3, QuestionText = "How can a method return multiple values to its caller in C#?", Options = ["By using multiple 'return' statements", "By passing parameters with 'ref' or 'out' keywords", "It is impossible in C#", "By using a default constructor"], CorrectOptionIndex = 1, Explanation = "Passing arguments by reference (ref/out) allows a method to modify and return multiple values." }
                    ],
                    Labs = [
                        new CodeLab
                        {
                            Id = 1,
                            Title = "Circle Class UML Design",
                            Description = "Implement the Circle class from UML specification. The radius field must be positive, and include a method CalculateArea() returning Math.PI * radius * radius.",
                            InitialCode = @"using System;

class Circle
{
    private double radius;

    public Circle(double r) { SetRadius(r); }
    public void SetRadius(double r) { if (r > 0) radius = r; }
    public double GetRadius() => radius;

    // Implement CalculateArea here
}

class Program
{
    static void Main()
    {
        Circle c = new Circle(5.0);
        Console.WriteLine(""Area: "" + Math.Round(c.CalculateArea(), 2));
    }
}",
                            ExpectedOutput = "Area: 78.54"
                        },
                        new CodeLab
                        {
                            Id = 2,
                            Title = "Account Multi-Value Getter",
                            Description = "Implement GetAccountInfo using 'out' parameters to retrieve both AccountNumber and Balance from the Account object.",
                            InitialCode = @"using System;

class Account
{
    private int accountNumber;
    private double balance;

    public Account(int id, double bal) { accountNumber = id; balance = bal; }

    // Implement public void GetAccountInfo(out int id, out double bal)
}

class Program
{
    static void Main()
    {
        Account acc = new Account(999, 1250.5);
        int myId;
        double myBal;
        acc.GetAccountInfo(out myId, out myBal);
        Console.WriteLine($""ID: {myId}, Balance: {myBal}"");
    }
}",
                            ExpectedOutput = "ID: 999, Balance: 1250.5"
                        }
                    ],
                    DragDrop = new DragDropExercise
                    {
                        ExerciseTitle = "UML Visibility Matching",
                        Pairs = [
                            new DragDropPair { Id = "dd-4-1", Term = "- symbol", Description = "Represents private visibility. Accessible only inside the class." },
                            new DragDropPair { Id = "dd-4-2", Term = "+ symbol", Description = "Represents public visibility. Accessible by all outside clients." },
                            new DragDropPair { Id = "dd-4-3", Term = "# symbol", Description = "Represents protected visibility. Accessible by class and children." },
                            new DragDropPair { Id = "dd-4-4", Term = "UML Class", Description = "Represented visually as a 3-compartment rectangle." }
                        ]
                    },
                    PredictOutputs =
                    [
                        new PredictOutputExercise
                        {
                            Id = 1,
                            Title = "Circle Area Calculation",
                            Hint = "Area = π * r². Math.PI ≈ 3.14159. Math.Round to 2 decimal places.",
                            Code = @"using System;
class Circle {
    private double radius;
    public Circle(double r) { radius = r > 0 ? r : 1; }
    public double CalculateArea() => Math.PI * radius * radius;
}
class Program {
    static void Main() {
        Circle c = new Circle(5.0);
        Console.WriteLine(""Area: "" + Math.Round(c.CalculateArea(), 2));
    }
}",
                            ExpectedOutput = "Area: 78.54"
                        },
                        new PredictOutputExercise
                        {
                            Id = 2,
                            Title = "Account Credit and Debit",
                            Hint = "Start with 500, credit 100 = 600, debit 200 = 400.",
                            Code = @"using System;
class Account {
    private double balance;
    public Account(double b) { balance = b; }
    public void Credit(double amount) { balance += amount; }
    public void Debit(double amount) { if (amount <= balance) balance -= amount; }
    public double GetBalance() => balance;
}
class Program {
    static void Main() {
        Account a = new Account(500);
        a.Credit(100);
        a.Debit(200);
        Console.WriteLine(""Remaining Balance: "" + (int)a.GetBalance());
    }
}",
                            ExpectedOutput = "Remaining Balance: 400"
                        }
                    ]
                },

                // =====================================================
                // SECTION 5: Constructors & Properties
                // =====================================================
                new Section
                {
                    Id = 5,
                    TitleEn = "Properties & Object Composition",
                    TitleAr = "Properties & Object Composition",
                    Summary = "Model compound data systems using object composition, class properties validation, and static instance trackers.",
                    LearnContentHtml = @"
<h3 class='text-cyan Cairo-bold'>1. C# Properties Validation</h3>
<p>Properties provide a clean way to expose class fields while protecting state invariants. C# properties compile down to underlying get/set method calls. Range validations should be enforced inside the set accessor.</p>
<pre><code class='language-csharp'>class Square
{
    private double sideLength;

    public double SideLength
    {
        get { return sideLength; }
        set
        {
            if (value > 0) sideLength = value;
            else
            {
                Console.WriteLine(""Invalid length! Setting side length to default (1.0)."");
                sideLength = 1.0;
            }
        }
    }
}</code></pre>

<h3 class='text-cyan Cairo-bold'>2. Object Composition</h3>
<p><strong>Composition</strong> is a design pattern where a class contains a reference to an instance of another class as an attribute, modeling a <strong>HAS-A</strong> relationship. For example, a <code>BankAccount</code> HAS-A <code>Person</code> owner.</p>
<pre><code class='language-csharp'>class BankAccount
{
    private string accountNumber;
    private Person owner; // Reference to another object
    private double balance;

    public BankAccount(string accNum, Person p, double initialBalance)
    {
        accountNumber = accNum;
        owner = new Person(p.Name, p.Email); // Lifecycle ownership
        balance = initialBalance;
    }
}</code></pre>

<h3 class='text-cyan Cairo-bold'>3. Static Members</h3>
<p>A <strong>static</strong> variable is shared across all instances of a class. It is allocated once in the high-frequency heap and does not occupy memory space inside individual objects. It is commonly used to track the number of instantiated objects.</p>
<pre><code class='language-csharp'>class BankAccount
{
    private static int count = 0; // Shared counter

    public BankAccount()
    {
        count++; // Incremented on each object instantiation
    }

    public static int GetCount() => count;
}</code></pre>",
                    InitialCode = @"using System;

class Person
{
    public string Name { get; set; }
    public Person(string name) { Name = name; }
}

class BankAccount
{
    private string accNum;
    private Person owner;
    private static int activeAccounts = 0;

    public BankAccount(string num, Person p)
    {
        accNum = num;
        owner = p;
        // Increment activeAccounts counter
    }

    // Implement static int GetActiveCount()
}

class Program
{
    static void Main()
    {
        Person p = new Person(""Zara"");
        BankAccount a1 = new BankAccount(""A1001"", p);
        BankAccount a2 = new BankAccount(""A1002"", p);
        // Print active accounts count
    }
}",
                    ChallengeTitle = "Object Composition & Static Trackers",
                    ChallengeDescription = "Complete the BankAccount constructor to increment the static counter and implement the static getter GetActiveCount(). Output the total count.",
                    ExpectedOutput = "Active Accounts: 2",
                    Quiz = [
                        new QuizQuestion { Id = 1, QuestionText = "What relationship does object composition model?", Options = ["IS-A relationship", "HAS-A relationship", "USES-A relationship", "INHERITS-FROM relationship"], CorrectOptionIndex = 1, Explanation = "Object composition stores one object reference as a field inside another, modeling a HAS-A relationship." },
                        new QuizQuestion { Id = 2, QuestionText = "Where is a static variable stored in C#?", Options = ["Directly inside the stack frame of the thread", "Inside the memory block of each instantiated object", "Shared in class metadata memory", "Stored inside temporary registers"], CorrectOptionIndex = 2, Explanation = "Static variables are shared across all class objects and reside in the type metadata memory heap." },
                        new QuizQuestion { Id = 3, QuestionText = "What accessor validates inputs assigned to a C# property?", Options = ["get accessor", "set accessor", "constructor body", "static constructor"], CorrectOptionIndex = 1, Explanation = "The set accessor receives the implicit parameter 'value' and can perform validations before committing to fields." }
                    ],
                    Labs = [
                        new CodeLab
                        {
                            Id = 1,
                            Title = "Employee Copy & Compare System",
                            Description = "Implement the Employee class methods. void Copy(Employee other) copies fields from another employee. string Compare(Employee other) compares ID numbers, returning 'Same Employee' or 'Different Employees'.",
                            InitialCode = @"using System;

class Employee
{
    public int EmployeeID { get; set; }
    public string Name { get; set; }

    public Employee(int id, string name) { EmployeeID = id; Name = name; }

    // Implement Copy and Compare methods
}

class Program
{
    static void Main()
    {
        Employee e1 = new Employee(101, ""Ahmed"");
        Employee e2 = new Employee(102, ""Guest"");
        e2.Copy(e1);
        Console.WriteLine($""e2 Name: {e2.Name}, Compare: {e1.Compare(e2)}"");
    }
}",
                            ExpectedOutput = "e2 Name: Ahmed, Compare: Same Employee"
                        },
                        new CodeLab
                        {
                            Id = 2,
                            Title = "Square Property Verification",
                            Description = "Complete the Square class. The property SideLength must validate that value is greater than zero; otherwise display a warning and default to 1.0.",
                            InitialCode = @"using System;

class Square
{
    private double sideLength;

    public double SideLength
    {
        get { return sideLength; }
        // Implement setter validation here
    }

    public double CalculateArea() => SideLength * SideLength;
}

class Program
{
    static void Main()
    {
        Square sq = new Square();
        sq.SideLength = -3.5;
        Console.WriteLine(""Area: "" + sq.CalculateArea());
    }
}",
                            ExpectedOutput = "Area: 1"
                        }
                    ],
                    DragDrop = new DragDropExercise
                    {
                        ExerciseTitle = "Composition & Properties Matching",
                        Pairs = [
                            new DragDropPair { Id = "dd-5-1", Term = "HAS-A relation", Description = "A design relationship representing Object Composition." },
                            new DragDropPair { Id = "dd-5-2", Term = "static field", Description = "A variable shared across all object instances of a class." },
                            new DragDropPair { Id = "dd-5-3", Term = "properties", Description = "Syntactic sugar that acts as public variables but compiles to get/set methods." },
                            new DragDropPair { Id = "dd-5-4", Term = "deep copy", Description = "Cloning an object's nested reference attributes to prevent alias sharing." }
                        ]
                    },
                    PredictOutputs =
                    [
                        new PredictOutputExercise
                        {
                            Id = 1,
                            Title = "Property Setter Validation",
                            Hint = "The set accessor rejects values <= 0. What does CalculateArea return after setting -3.5?",
                            Code = @"using System;
class Square {
    private double sideLength = 1.0;
    public double SideLength {
        get { return sideLength; }
        set { if (value > 0) sideLength = value; }
    }
    public double CalculateArea() => SideLength * SideLength;
}
class Program {
    static void Main() {
        Square sq = new Square();
        sq.SideLength = -3.5;
        Console.WriteLine(""Area: "" + sq.CalculateArea());
        sq.SideLength = 4.0;
        Console.WriteLine(""Area: "" + sq.CalculateArea());
    }
}",
                            ExpectedOutput = "Area: 1\r\nArea: 16"
                        },
                        new PredictOutputExercise
                        {
                            Id = 2,
                            Title = "Static Counter Tracking",
                            Hint = "Static fields are shared. Each new Person() increments the SAME counter.",
                            Code = @"using System;
class Person {
    private static int count = 0;
    public Person() { count++; }
    public static int GetCount() => count;
}
class Program {
    static void Main() {
        new Person();
        new Person();
        new Person();
        Console.WriteLine(""Count: "" + Person.GetCount());
    }
}",
                            ExpectedOutput = "Count: 3"
                        }
                    ],
                    BugHunter = new SpotBugExercise
                    {
                        Title = "Recursive Property Stack Overflow",
                        Description = "Identify the line in this class property that will trigger a StackOverflowException at runtime. Remember: a property getter or setter must access the backing field (lowercase), not the property itself (PascalCase).",
                        CodeLines = [
                            "using System;",
                            "class Person {",
                            "    private string name = \"\";",
                            "    public string Name {",
                            "        get {",
                            "            return Name; // Fetching the name",
                            "        }",
                            "        set {",
                            "            name = value;",
                            "        }",
                            "    }",
                            "}",
                            "class Program {",
                            "    static void Main() {",
                            "        Person p = new Person();",
                            "        p.Name = \"John\";",
                            "        Console.WriteLine(p.Name);",
                            "    }",
                            "}"
                        ],
                        BuggyLineIndex = 5,
                        Explanation = "Line 6 contains the bug: 'return Name;'. In C#, returning 'Name' (with a capital N) inside the 'Name' property getter will call the getter method again, leading to an infinite recursion that crashes the application with a StackOverflowException. It must be written as 'return name;' (using the lowercase private backing field)."
                    }
                },

                // =====================================================
                // SECTION 6: Inheritance Basics
                // =====================================================
                new Section
                {
                    Id = 6,
                    TitleEn = "Inheritance Basics",
                    TitleAr = "Inheritance Basics",
                    Summary = "Learn subclassing hierarchies, base constructor chaining, and extending attributes and methods.",
                    LearnContentHtml = @"
<h3 class='text-cyan Cairo-bold'>1. Class Inheritance (IS-A)</h3>
<p><strong>Inheritance</strong> is a mechanism where a new class (derived class or subclass) inherits the attributes (fields) and behaviors (methods) of an existing class (base class or superclass). It represents an <strong>IS-A</strong> relationship (e.g., a Student IS-A Person).</p>

<h4 class='text-cyan font-outfit'>1.1 Constructor Chaining with <code>base</code></h4>
<p>When a derived class object is created, the base class constructor must run first to initialize the inherited fields. We use the <code>base</code> keyword to explicitly call the parameterized constructor of the base class.</p>
<pre><code class='language-csharp'>class Person
{
    private int id;
    private string name;

    public Person(int id, string name)
    {
        this.id = id;
        this.name = name;
    }
}

class Student : Person
{
    private double gpa;

    // Call the base constructor first!
    public Student(int id, string name, double gpa) : base(id, name)
    {
        this.gpa = gpa;
    }
}</code></pre>

<h3 class='text-cyan Cairo-bold'>2. Reusing Base Methods</h3>
<p>Inside a derived class method, you can invoke the parent class version of the method using <code>base.MethodName()</code>. This allows extending behaviors without rewriting base logic.</p>
<pre><code class='language-csharp'>public void Display()
{
    base.Display(); // Print Person details
    Console.WriteLine($""GPA: {gpa}""); // Print Student details
}</code></pre>",
                    InitialCode = @"using System;

class Person
{
    protected int id;
    protected string name;

    public Person(int id, string name)
    {
        this.id = id;
        this.name = name;
    }

    public void Display() => Console.Write($""ID: {id}, Name: {name}"");
}

class Student : Person
{
    private double gpa;

    public Student(int id, string name, double gpa) : base(id, name)
    {
        this.gpa = gpa;
    }

    // Implement DisplayStudent that calls base.Display and appends GPA info
}

class Program
{
    static void Main()
    {
        Student s = new Student(201, ""Omar"", 3.85);
        // Call DisplayStudent
    }
}",
                    ChallengeTitle = "Inherited Method Extension",
                    ChallengeDescription = "Implement the DisplayStudent method inside Student class. It must call base.Display() first, then print ', GPA: 3.85'.",
                    ExpectedOutput = "ID: 201, Name: Omar, GPA: 3.85",
                    Quiz = [
                        new QuizQuestion { Id = 1, QuestionText = "What keyword is used inside a subclass to call a base class constructor?", Options = ["this", "base", "parent", "super"], CorrectOptionIndex = 1, Explanation = "The 'base' keyword is used in derived class constructors to invoke base class constructors." },
                        new QuizQuestion { Id = 2, QuestionText = "Which visibility level allows members to be accessed inside subclasses but not by external classes?", Options = ["public", "private", "protected", "internal"], CorrectOptionIndex = 2, Explanation = "Protected members are accessible within the class body and by derived subclass instances." },
                        new QuizQuestion { Id = 3, QuestionText = "Does C# support inheriting from multiple base classes?", Options = ["Yes", "No, only single class inheritance", "Yes, using the comma operator", "Only sealed classes support it"], CorrectOptionIndex = 1, Explanation = "C# supports single inheritance only. A class can inherit from exactly one base class." }
                    ],
                    Labs = [
                        new CodeLab
                        {
                            Id = 1,
                            Title = "Constructing Derived Classes",
                            Description = "Add a parameterized constructor to Student that takes 'id', 'name', and 'gpa', and properly chains them to the base class constructor.",
                            InitialCode = @"using System;

class Person
{
    public int ID { get; }
    public Person(int id) { ID = id; }
}

class Student : Person
{
    public double GPA { get; }
    // Implement parameterized constructor here
}

class Program
{
    static void Main()
    {
        Student s = new Student(105, 3.9);
        Console.WriteLine($""ID: {s.ID}, GPA: {s.GPA}"");
    }
}",
                            ExpectedOutput = "ID: 105, GPA: 3.9"
                        },
                        new CodeLab
                        {
                            Id = 2,
                            Title = "Hierarchical Output",
                            Description = "Extend the base display. Overwrite a custom display in class GraduateStudent that prints the base Student info and appends ' Thesis: AI'.",
                            InitialCode = @"using System;

class Student
{
    public void Display() { Console.Write(""Student Info""); }
}

class GraduateStudent : Student
{
    public void DisplayGrad()
    {
        // Print base info and append Thesis info
    }
}

class Program
{
    static void Main()
    {
        GraduateStudent g = new GraduateStudent();
        g.DisplayGrad();
    }
}",
                            ExpectedOutput = "Student Info Thesis: AI"
                        }
                    ],
                    DragDrop = new DragDropExercise
                    {
                        ExerciseTitle = "Inheritance Basics Matching",
                        Pairs = [
                            new DragDropPair { Id = "dd-6-1", Term = "base keyword", Description = "Used to access base class constructors and methods from derived classes." },
                            new DragDropPair { Id = "dd-6-2", Term = "protected access", Description = "Permits access to subclass hierarchies while preventing outside access." },
                            new DragDropPair { Id = "dd-6-3", Term = "single inheritance", Description = "A design restriction in C# where a class can have only one direct parent class." },
                            new DragDropPair { Id = "dd-6-4", Term = "derived class", Description = "A subclass that inherits state and behavior properties from a base class." }
                        ]
                    }
                },

                // =====================================================
                // SECTION 7: Practical Inheritance Lab
                // =====================================================
                new Section
                {
                    Id = 7,
                    TitleEn = "Practical Inheritance Lab",
                    TitleAr = "Practical Inheritance Lab",
                    Summary = "Design hierarchical employee payroll systems using base constructor chaining and member extensions.",
                    LearnContentHtml = @"
<h3 class='text-cyan Cairo-bold'>1. Hierarchical Class Design</h3>
<p>In real-world business systems, objects share common state but differ in specific behaviors. We can design an <code>Employee</code> base class to hold shared properties, then derive specialized subclasses like <code>FullTimeEmployee</code> and <code>PartTimeEmployee</code> to handle different payroll structures.</p>

<h3 class='text-cyan Cairo-bold'>2. Implementation Overview</h3>
<p>Each employee has an ID, Name, and Gender. A full-time employee adds a fixed <strong>Salary</strong>, while a part-time employee is paid based on <strong>HourRate</strong> and <strong>NumberOfHours</strong>.</p>
<pre><code class='language-csharp'>class Employee
{
    protected int id;
    protected string name;
    protected string gender;

    public Employee(int id, string name, string gender)
    {
        this.id = id;
        this.name = name;
        this.gender = gender;
    }

    public virtual void PrintDetails()
    {
        Console.Write($""ID: {id}, Name: {name}, Gender: {gender}"");
    }
}</code></pre>

<h4 class='text-cyan font-outfit'>2.1 Derived Payroll Classes</h4>
<pre><code class='language-csharp'>class FullTimeEmployee : Employee
{
    private double salary;

    public FullTimeEmployee(int id, string name, string gender, double salary)
        : base(id, name, gender)
    {
        this.salary = salary;
    }

    public override void PrintDetails()
    {
        base.PrintDetails();
        Console.WriteLine($"", Salary: {salary}"");
    }
}</code></pre>

<div class='key-takeaway'>
<div class='takeaway-title'><i class='fa-solid fa-lightbulb me-1'></i> Design Strategy</div>
<div class='takeaway-body'>Derived classes inherit all non-private members of the base class. By using <code>virtual</code> methods in the base class and overriding them with <code>override</code> in derived classes, subclasses can customize their behaviors while utilizing base logic.</div>
</div>",
                    InitialCode = @"using System;

class Employee
{
    protected int id;
    protected string name;

    public Employee(int id, string name)
    {
        this.id = id;
        this.name = name;
    }

    public virtual void Print() => Console.Write($""ID: {id}, Name: {name}"");
}

class PartTimeEmployee : Employee
{
    private double hourRate;
    private int hours;

    public PartTimeEmployee(int id, string name, double rate, int hours) : base(id, name)
    {
        this.hourRate = rate;
        this.hours = hours;
    }

    // Override Print method to call base.Print() and append details
}

class Program
{
    static void Main()
    {
        PartTimeEmployee pt = new PartTimeEmployee(302, ""Laila"", 15.0, 40);
        pt.Print();
    }
}",
                    ChallengeTitle = "Employee Subclass Polymorphism",
                    ChallengeDescription = "Override the Print method in PartTimeEmployee. Call base.Print() and output hourly details. Verify it matches the expected output format.",
                    ExpectedOutput = "ID: 302, Name: Laila, Rate: 15, Hours: 40",
                    Quiz = [
                        new QuizQuestion { Id = 1, QuestionText = "Why do we use virtual/override keywords in class hierarchies?", Options = ["To make classes compile faster", "To enable subclass specialization of method behaviors", "To declare static attributes", "To avoid constructor execution"], CorrectOptionIndex = 1, Explanation = "Marking a base method virtual lets subclasses override its behavior dynamically at runtime." },
                        new QuizQuestion { Id = 2, QuestionText = "Which base class constructor gets executed when instantiating a derived class?", Options = ["Only the parameterless constructor", "The constructor chained via base()", "No constructor runs", "Only static constructors"], CorrectOptionIndex = 1, Explanation = "The constructor explicitly chained via the : base(...) syntax is executed." }
                    ],
                    Labs = [
                        new CodeLab
                        {
                            Id = 1,
                            Title = "FullTimeEmployee Constructor Chaining",
                            Description = "Implement the FullTimeEmployee class with a salary property. Make sure the constructor correctly chains to the base class constructor.",
                            InitialCode = @"using System;

class Employee
{
    public string Name { get; }
    public Employee(string name) { Name = name; }
}

class FullTimeEmployee : Employee
{
    public double Salary { get; }
    // Implement constructor
}

class Program
{
    static void Main()
    {
        FullTimeEmployee f = new FullTimeEmployee(""Kamel"", 5000.0);
        Console.WriteLine($""Name: {f.Name}, Salary: {f.Salary}"");
    }
}",
                            ExpectedOutput = "Name: Kamel, Salary: 5000"
                        },
                        new CodeLab
                        {
                            Id = 2,
                            Title = "Part-Time Salary Calculation",
                            Description = "Add a method GetSalary() in PartTimeEmployee that calculates and returns the salary (HourRate * NumberOfHours).",
                            InitialCode = @"using System;

class PartTimeEmployee
{
    public double HourRate { get; set; }
    public int Hours { get; set; }

    public PartTimeEmployee(double rate, int h) { HourRate = rate; Hours = h; }

    // Implement GetSalary()
}

class Program
{
    static void Main()
    {
        PartTimeEmployee pt = new PartTimeEmployee(20.0, 30);
        Console.WriteLine(""Salary: "" + pt.GetSalary());
    }
}",
                            ExpectedOutput = "Salary: 600"
                        }
                    ],
                    DragDrop = new DragDropExercise
                    {
                        ExerciseTitle = "Payroll Inheritance Matching",
                        Pairs = [
                            new DragDropPair { Id = "dd-7-1", Term = "Employee", Description = "A base superclass holding shared attributes like ID and Name." },
                            new DragDropPair { Id = "dd-7-2", Term = "FullTimeEmployee", Description = "A subclass representing employees paid a fixed monthly salary." },
                            new DragDropPair { Id = "dd-7-3", Term = "PartTimeEmployee", Description = "A subclass representing employees paid hourly." },
                            new DragDropPair { Id = "dd-7-4", Term = "virtual modifier", Description = "Allows derived classes to override methods dynamically." }
                        ]
                    },
                    PredictOutputs =
                    [
                        new PredictOutputExercise
                        {
                            Id = 1,
                            Title = "Inheritance Chain Constructor Calls",
                            Hint = "When derived class is instantiated with base(id, name), the base constructor runs first.",
                            Code = @"using System;
class Employee {
    protected int id;
    protected string name;
    public Employee(int id, string name) {
        this.id = id;
        this.name = name;
        Console.WriteLine(""Employee created: "" + name);
    }
}
class FullTimeEmployee : Employee {
    public double Salary { get; }
    public FullTimeEmployee(int id, string name, double sal) : base(id, name) {
        Salary = sal;
        Console.WriteLine(""FTE salary: "" + Salary);
    }
}
class Program {
    static void Main() {
        FullTimeEmployee f = new FullTimeEmployee(101, ""Ahmed"", 8000.0);
    }
}",
                            ExpectedOutput = "Employee created: Ahmed\r\nFTE salary: 8000"
                        },
                        new PredictOutputExercise
                        {
                            Id = 2,
                            Title = "Virtual Method Override",
                            Hint = "When calling Print() on a PartTimeEmployee reference, the overridden version runs, which calls base.Print() first.",
                            Code = @"using System;
class Employee {
    protected int id;
    public Employee(int id) { this.id = id; }
    public virtual void Print() => Console.Write(""ID: "" + id);
}
class PartTimeEmployee : Employee {
    private double rate;
    public PartTimeEmployee(int id, double rate) : base(id) { this.rate = rate; }
    public override void Print() {
        base.Print();
        Console.WriteLine("", Rate: "" + rate);
    }
}
class Program {
    static void Main() {
        PartTimeEmployee pt = new PartTimeEmployee(202, 15.0);
        pt.Print();
    }
}",
                            ExpectedOutput = "ID: 202, Rate: 15"
                        }
                    ],
                    BugHunter = new SpotBugExercise
                    {
                        Title = "Invalid Override Attempt",
                        Description = "Locate the line that causes a C# compiler error. Hint: You cannot override a base method unless it is explicitly marked as virtual, abstract, or override.",
                        CodeLines = [
                            "using System;",
                            "class Employee {",
                            "    public void Print() => Console.WriteLine(\"Employee\");",
                            "}",
                            "class PartTimeEmployee : Employee {",
                            "    public override void Print() {",
                            "        Console.WriteLine(\"Part-Time Employee\");",
                            "    }",
                            "}",
                            "class Program {",
                            "    static void Main() {",
                            "        Employee emp = new PartTimeEmployee();",
                            "        emp.Print();",
                            "    }",
                            "}"
                        ],
                        BuggyLineIndex = 5,
                        Explanation = "Line 6 contains the error: 'public override void Print()'. You cannot override the 'Print' method because it is not marked as 'virtual' or 'abstract' in the base class 'Employee'. To fix this, you must add 'virtual' to the base method declaration: 'public virtual void Print()'."
                    }
                },

                // =====================================================
                // SECTION 8: Polymorphism & Abstraction
                // =====================================================
                new Section
                {
                    Id = 8,
                    TitleEn = "Polymorphism & Abstraction",
                    TitleAr = "Polymorphism & Abstraction",
                    Summary = "Leverage virtual methods, abstract classes, and dynamic binding to create flexible polymorphic frameworks.",
                    LearnContentHtml = @"
<h3 class='text-cyan Cairo-bold'>1. Dynamic Polymorphism</h3>
<p><strong>Polymorphism</strong> is the capability of a method to perform different behaviors depending on the concrete object it is acting upon. In C#, dynamic polymorphism is achieved using <strong>virtual</strong> methods in base classes and overriding them using the <strong>override</strong> keyword in derived classes.</p>

<h3 class='text-cyan Cairo-bold'>2. Abstract Classes & Methods</h3>
<p>An <strong>Abstract Class</strong> is a restricted class that cannot be instantiated directly. It serves purely as a template for other classes. An <strong>Abstract Method</strong> can only be defined inside an abstract class; it has no body (implementation), and its signature is marked with the <code>abstract</code> keyword. Derived classes must provide a concrete implementation for it.</p>
<pre><code class='language-csharp'>abstract class Shape
{
    // Abstract methods (no body)
    public abstract double GetArea();
    public abstract double GetPerimeter();
}</code></pre>

<h4 class='text-cyan font-outfit'>2.1 Derived Shape Implementations</h4>
<pre><code class='language-csharp'>class Rectangle : Shape
{
    private double width, height;

    public Rectangle(double w, double h) { width = w; height = h; }

    public override double GetArea() => width * height;
    public override double GetPerimeter() => 2 * (width + height);
}</code></pre>

<div class='concept-callout'>
<span class='callout-icon'><i class='fa-solid fa-lightbulb'></i></span>
<span class='callout-text'><strong>Polymorphic Arrays:</strong> You can create an array of parent type references (e.g., <code>Shape[] shapes</code>) containing various subclass instances. Iterating and calling <code>shapes[i].GetArea()</code> invokes the specific child's method at runtime.</span>
</div>",
                    InitialCode = @"using System;

abstract class Shape
{
    public abstract double GetArea();
}

class Rectangle : Shape
{
    private double width, height;
    public Rectangle(double w, double h) { width = w; height = h; }

    // Implement GetArea override
}

class Program
{
    static void Main()
    {
        Shape rect = new Rectangle(5.0, 4.0);
        Console.WriteLine(""Area: "" + rect.GetArea());
    }
}",
                    ChallengeTitle = "Polymorphic Shape Area",
                    ChallengeDescription = "Override the GetArea method in the Rectangle class. Call rect.GetArea() in Main to output 'Area: 20'.",
                    ExpectedOutput = "Area: 20",
                    Quiz = [
                        new QuizQuestion { Id = 1, QuestionText = "Can you instantiate an abstract class using the 'new' operator?", Options = ["Yes", "No", "Only if it has no abstract methods", "Only if it has a constructor"], CorrectOptionIndex = 1, Explanation = "Abstract classes are incomplete blueprints and cannot be directly instantiated." },
                        new QuizQuestion { Id = 2, QuestionText = "What keyword is required in derived classes to implement abstract base methods?", Options = ["virtual", "new", "override", "base"], CorrectOptionIndex = 2, Explanation = "derived classes use the 'override' keyword to implement inherited abstract methods." },
                        new QuizQuestion { Id = 3, QuestionText = "If a class inherits from an abstract class, what must it do?", Options = ["Declare all its own methods as abstract", "Implement all abstract methods, or be declared abstract itself", "Define a parameterless default constructor", "It cannot have any fields"], CorrectOptionIndex = 1, Explanation = "A subclass must either implement all inherited abstract methods or be marked abstract itself." }
                    ],
                    Labs = [
                        new CodeLab
                        {
                            Id = 1,
                            Title = "Circle Abstraction",
                            Description = "Implement a Circle class inheriting from Shape. It must declare a radius field and override GetArea() returning Math.PI * radius * radius.",
                            InitialCode = @"using System;

abstract class Shape
{
    public abstract double GetArea();
}

class Circle : Shape
{
    private double radius;
    public Circle(double r) { radius = r; }

    // Implement GetArea
}

class Program
{
    static void Main()
    {
        Shape c = new Circle(10.0);
        Console.WriteLine(""Area: "" + Math.Round(c.GetArea(), 2));
    }
}",
                            ExpectedOutput = "Area: 314.16"
                        },
                        new CodeLab
                        {
                            Id = 2,
                            Title = "Polymorphic Sum of Shapes",
                            Description = "Calculate the sum of areas of different shapes in the array. Complete the SumAreas method.",
                            InitialCode = @"using System;

abstract class Shape
{
    public abstract double GetArea();
}

class Rectangle : Shape
{
    private double w, h;
    public Rectangle(double w, double h) { this.w = w; this.h = h; }
    public override double GetArea() => w * h;
}

class Program
{
    static void Main()
    {
        Shape[] shapes = { new Rectangle(2, 3), new Rectangle(4, 5) };
        Console.WriteLine(""Total Area: "" + SumAreas(shapes));
    }

    static double SumAreas(Shape[] arr)
    {
        // Loop and sum areas
        return 0;
    }
}",
                            ExpectedOutput = "Total Area: 26"
                        }
                    ],
                    DragDrop = new DragDropExercise
                    {
                        ExerciseTitle = "Polymorphism & Abstraction Matching",
                        Pairs = [
                            new DragDropPair { Id = "dd-8-1", Term = "abstract class", Description = "A class template that cannot be instantiated and may contain abstract methods." },
                            new DragDropPair { Id = "dd-8-2", Term = "abstract method", Description = "A method declaration with no body that must be overridden in subclasses." },
                            new DragDropPair { Id = "dd-8-3", Term = "override modifier", Description = "Required keyword in derived classes to implement virtual or abstract base methods." },
                            new DragDropPair { Id = "dd-8-4", Term = "dynamic dispatch", Description = "Resolving virtual method execution at runtime based on concrete object type." }
                        ]
                    },
                    PredictOutputs =
                    [
                        new PredictOutputExercise
                        {
                            Id = 1,
                            Title = "Abstract Method Dynamic Dispatch",
                            Hint = "When a base-class reference holds a derived object, calling a virtual method invokes the DERIVED override at runtime.",
                            Code = @"using System;
abstract class Shape {
    public abstract double CalculateArea();
}
class Circle : Shape {
    public override double CalculateArea() => 3.14 * 2 * 2;
}
class Rectangle : Shape {
    public override double CalculateArea() => 4 * 5;
}
class Program {
    static void Main() {
        Shape[] shapes = { new Circle(), new Rectangle() };
        foreach (Shape s in shapes)
            Console.WriteLine(s.CalculateArea());
    }
}",
                            ExpectedOutput = "12.56\r\n20"
                        },
                        new PredictOutputExercise
                        {
                            Id = 2,
                            Title = "Discount via Override",
                            Hint = "Each product type overrides CalcDiscount. The overridden version is called, NOT the base. FoodItem returns price * 0.1.",
                            Code = @"using System;
abstract class Product {
    protected double price;
    public Product(double p) { price = p; }
    public abstract double CalcDiscount();
}
class FoodItem : Product {
    public FoodItem(double p) : base(p) { }
    public override double CalcDiscount() => price * 0.1;
}
class ElectronicItem : Product {
    public ElectronicItem(double p) : base(p) { }
    public override double CalcDiscount() => price * 0.15;
}
class Program {
    static void Main() {
        Product[] prods = { new FoodItem(200), new ElectronicItem(1000) };
        foreach (Product p in prods)
            Console.WriteLine(p.CalcDiscount());
    }
}",
                            ExpectedOutput = "20\r\n150"
                        }
                    ]
                },

                // =====================================================
                // SECTION 9: C# Generics
                // =====================================================
                new Section
                {
                    Id = 9,
                    TitleEn = "C# Generics",
                    TitleAr = "Generics & Collections",
                    Summary = "Understand type parameterization, boxing avoidance, JIT code sharing, and generic constraints.",
                    LearnContentHtml = @"
<h3 class='text-cyan Cairo-bold'>1. Why Generics? The Boxing Problem</h3>
<p>Before C# 2.0 Generics, collections stored items as <code>System.Object</code>. This caused two critical issues:</p>
<ul>
<li><strong>No Type Safety:</strong> You could accidentally add an <code>int</code> and a <code>string</code> to the same collection — errors only appear at runtime.</li>
<li><strong>Boxing/Unboxing Overhead:</strong> Storing value types (int, double) in Object collections required <strong>boxing</strong> (wrapping on the heap) and <strong>unboxing</strong> (extracting back), causing CPU overhead.</li>
</ul>

<table class='comparison-table'>
<thead><tr><th>Feature</th><th><code>ArrayList</code> (pre-generics)</th><th><code>List&lt;T&gt;</code> (generics)</th></tr></thead>
<tbody>
<tr><td>Type Safety</td><td>❌ None (stores Object)</td><td>✅ Compile-time checked</td></tr>
<tr><td>Boxing for value types</td><td>Yes (performance hit)</td><td>No (optimized storage)</td></tr>
<tr><td>Casting needed</td><td>Yes, manual</td><td>No</td></tr>
</tbody>
</table>

<div class='concept-callout'>
<span class='callout-icon'><i class='fa-solid fa-gamepad'></i></span>
<span class='callout-text'><strong>Try This in the Simulator →</strong> Open the <em>Visual Simulator</em>, choose a generic type (int/string), enter a value, and watch the Generics Box validate type safety — rejecting incompatible values at compile-time.</span>
</div>

<h3 class='text-cyan Cairo-bold'>2. JIT Compilation of Generics</h3>
<table class='comparison-table'>
<thead><tr><th>Type Parameter</th><th>JIT Behavior</th><th>Why?</th></tr></thead>
<tbody>
<tr><td><strong>Reference types</strong></td><td>Shared code for all (e.g. List&lt;string&gt; and List&lt;Student&gt;)</td><td>All reference pointers are same size (64-bit)</td></tr>
<tr><td><strong>Value types</strong></td><td>Separate code per type (List&lt;int&gt; ≠ List&lt;double&gt;)</td><td>Different sizes (int=32bit, double=64bit)</td></tr>
</tbody>
</table>

<h3 class='text-cyan Cairo-bold'>3. Generic Constraints</h3>
<table class='comparison-table'>
<thead><tr><th>Constraint</th><th>Syntax</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td>Value type</td><td><code>where T : struct</code></td><td>T must be a value type</td></tr>
<tr><td>Reference type</td><td><code>where T : class</code></td><td>T must be a reference type</td></tr>
<tr><td>Constructor</td><td><code>where T : new()</code></td><td>T must have a parameterless constructor</td></tr>
<tr><td>Base class</td><td><code>where T : BaseClass</code></td><td>T must inherit from BaseClass</td></tr>
<tr><td>Interface</td><td><code>where T : IComparable</code></td><td>T must implement the interface</td></tr>
</tbody>
</table>

<div class='alert alert-info-glow my-4'>
<h5 class='text-cyan font-outfit'><i class='fa-solid fa-code'></i> Code Proof: Generic Class with Constraint</h5>
<pre><code class='language-csharp'>class Repository&lt;T&gt; where T : class, new() {
    private List&lt;T&gt; items = new();
    public void Add() { items.Add(new T()); }  // Safe: new() constraint guarantees constructor
    public int Count => items.Count;
}</code></pre>
</div>

<div class='key-takeaway'>
<div class='takeaway-title'><i class='fa-solid fa-lightbulb me-1'></i> Key Takeaway</div>
<div class='takeaway-body'>Generics provide compile-time type safety and eliminate boxing overhead. The JIT shares code for reference type parameters but generates specialized code for value types. Use constraints (<code>where T :</code>) to restrict allowed types.</div>
</div>

<div class='mt-4 border-top border-secondary pt-3'>
<h4 class='text-cyan Cairo-bold'><i class='fa-solid fa-flask'></i> Practice Exercises</h4>
<div class='mb-3'><strong>Exercise 9.1:</strong> Explain how generics prevent boxing overhead.<br/><span class='text-success small'><em>Answer:</em> Generic collections store value types directly without wrapping them in Object heap allocations. The JIT generates specialized code for each value type.</span></div>
<div class='mb-3'><strong>Exercise 9.2:</strong> Why does the JIT share code for List&lt;string&gt; and List&lt;Student&gt;?<br/><span class='text-success small'><em>Answer:</em> Both are reference types — their variables are 64-bit pointers regardless of the actual type, so the same machine code works for both.</span></div>
<div class='mb-3'><strong>Exercise 9.3:</strong> Write a generic Pair&lt;T1, T2&gt; class holding two values of different types.<br/><span class='text-success small'><em>Answer:</em> <code>class Pair&lt;T1,T2&gt; { public T1 First; public T2 Second; }</code></span></div>
<div class='mb-3'><strong>Exercise 9.4:</strong> What constraint ensures T has a parameterless constructor?<br/><span class='text-success small'><em>Answer:</em> <code>where T : new()</code></span></div>
<div class='mb-3'><strong>Exercise 9.5:</strong> What error occurs if you do <code>Box&lt;int&gt; b = new(); b.Set(""hello"");</code>?<br/><span class='text-success small'><em>Answer:</em> CS1503: cannot convert string to int. Generics enforce type safety at compile-time.</span></div>
</div>",
                    InitialCode = @"using System;

class Box<T>
{
    private T data;
    public void Set(T val) { data = val; }
    public T Get() { return data; }
}

class Program
{
    static void Main()
    {
        Box<string> stringBox = new Box<string>();
        stringBox.Set(""Hello Generics"");
        Console.WriteLine(stringBox.Get());
    }
}",
                    ChallengeTitle = "Generic Box with Int",
                    ChallengeDescription = "Instantiate Box<int>, call Set(999), print its content.",
                    ExpectedOutput = "999",
                    Quiz = [
                        new QuizQuestion { Id = 1, QuestionText = "What is the primary advantage of Generics over Object arrays?", Options = ["Faster compilation", "Compile-time type safety and no boxing overhead", "Smaller file sizes", "Multiple inheritance"], CorrectOptionIndex = 1, Explanation = "Generics provide type safety at compile time and eliminate boxing/unboxing overhead." },
                        new QuizQuestion { Id = 2, QuestionText = "What does the JIT do with Box<int>?", Options = ["Converts to Object internally", "Compiles specialized code optimized for int", "Throws a runtime exception", "Ignores the type"], CorrectOptionIndex = 1, Explanation = "The JIT compiles specialized native code for each value type parameter." },
                        new QuizQuestion { Id = 3, QuestionText = "Which constraint means T must be a reference type?", Options = ["where T : struct", "where T : class", "where T : new()", "where T : object"], CorrectOptionIndex = 1, Explanation = "'where T : class' constrains T to reference types only." },
                        new QuizQuestion { Id = 4, QuestionText = "Can List<string> and List<Student> share JIT-compiled code?", Options = ["No, each gets separate code", "Yes, because both are reference types with same pointer size", "Only if they implement the same interface", "Only in debug mode"], CorrectOptionIndex = 1, Explanation = "Reference types share JIT code because all reference pointers are the same 64-bit size." }
                    ],
                    Labs = [
                        new CodeLab
                        {
                            Id = 1,
                            Title = "Fix Generic Type Mismatch",
                            Description = "Box<int> is instantiated but a string is passed to Set(). Change the type parameter to Box<string>.",
                            InitialCode = @"using System;

class Box<T>
{
    private T data;
    public void Set(T val) { data = val; }
    public T Get() { return data; }
}

class Program
{
    static void Main()
    {
        Box<int> box = new Box<int>(); // Bug: should be Box<string>
        box.Set(""Hello Lab"");
        Console.WriteLine(box.Get());
    }
}",
                            ExpectedOutput = "Hello Lab"
                        },
                        new CodeLab
                        {
                            Id = 2,
                            Title = "Generic Key-Value Pair Storage",
                            Description = "Create a generic class 'Repository<T>' with a private variable of type T, exposing a method 'Add(T item)' and 'Get()'. Use it to store and print the integer 500.",
                            InitialCode = @"using System;

class Repository<T>
{
    // Define Generic repository structure
}

class Program
{
    static void Main()
    {
        Repository<int> repo = new Repository<int>();
        repo.Add(500);
        Console.WriteLine(repo.Get());
    }
}",
                            ExpectedOutput = "500"
                        }
                    ],
                    DragDrop = new DragDropExercise
                    {
                        ExerciseTitle = "Generics & Constraints Matching",
                        Pairs = [
                            new DragDropPair { Id = "dd-9-1", Term = "Boxing overhead", Description = "Wrapping value types inside Object instances on the heap, degrading CPU efficiency." },
                            new DragDropPair { Id = "dd-9-2", Term = "class constraint", Description = "Restricts the generic type parameter to reference types (classes) only." },
                            new DragDropPair { Id = "dd-9-3", Term = "struct constraint", Description = "Restricts the generic type parameter to value types (structs) only." },
                            new DragDropPair { Id = "dd-9-4", Term = "JIT code sharing", Description = "Sharing JIT machine code for all reference arguments since pointers are 64-bit." }
                        ]
                    },
                    PredictOutputs =
                    [
                        new PredictOutputExercise
                        {
                            Id = 1,
                            Title = "Generic List<T> Type Safety",
                            Hint = "List<int> stores ints directly — no boxing. Count returns how many items were added.",
                            Code = @"using System;
using System.Collections.Generic;
class Program {
    static void Main() {
        List<int> nums = new List<int>();
        nums.Add(10);
        nums.Add(20);
        nums.Add(30);
        Console.WriteLine(nums.Count);
        Console.WriteLine(nums[1]);
    }
}",
                            ExpectedOutput = "3\r\n20"
                        },
                        new PredictOutputExercise
                        {
                            Id = 2,
                            Title = "Generic Method with Constraint",
                            Hint = "The where T : struct constraint ensures only value types can be passed. What does PrintType print for int vs double?",
                            Code = @"using System;
class Box<T> where T : struct {
    private T value;
    public void Set(T v) { value = v; }
    public T Get() => value;
}
class Program {
    static void Main() {
        Box<int> intBox = new Box<int>();
        intBox.Set(42);
        Box<double> dblBox = new Box<double>();
        dblBox.Set(3.14);
        Console.WriteLine(intBox.Get());
        Console.WriteLine(dblBox.Get());
    }
}",
                            ExpectedOutput = "42\r\n3.14"
                        }
                    ]
                },

                // =====================================================
                // SECTION 10: Exception Handling
                // =====================================================
                new Section
                {
                    Id = 10,
                    TitleEn = "Exception Handling & File I/O",
                    TitleAr = "Exception Handling & File I/O",
                    Summary = "Learn Try-Catch-Finally, exception flows, and reading/writing text streams via StreamReader and StreamWriter.",
                    LearnContentHtml = @"
<h3 class='text-cyan Cairo-bold'>1. Exception Handling Overview</h3>
<p>An <strong>Exception</strong> is a runtime error that interrupts the normal execution of a program. We use <code>try-catch-finally</code> blocks to handle exceptions gracefully, avoiding application crashes.</p>
<pre><code class='language-csharp'>try
{
    int divisor = 0;
    int result = 10 / divisor;
}
catch (DivideByZeroException ex)
{
    Console.WriteLine(""Error: Attempted to divide by zero."");
}
finally
{
    Console.WriteLine(""This block always executes for cleanup."");
}</code></pre>

<h3 class='text-cyan Cairo-bold'>2. File Input/Output (I/O)</h3>
<p>C# offers classes like <code>StreamWriter</code> and <code>StreamReader</code> inside the <code>System.IO</code> namespace to write and read text files.</p>

<h4 class='text-cyan font-outfit'>2.1 Writing Files via <code>StreamWriter</code></h4>
<p>We wrap file resources in a <code>using</code> block to guarantee they are disposed of (closed) as soon as execution leaves the block, preventing resource locks.</p>
<pre><code class='language-csharp'>using (StreamWriter sw = new StreamWriter(""output.txt""))
{
    sw.WriteLine(""Hello OOP World!"");
    sw.WriteLine(""This is C# File I/O."");
}</code></pre>

<h4 class='text-cyan font-outfit'>2.2 Reading Files via <code>StreamReader</code></h4>
<pre><code class='language-csharp'>using (StreamReader sr = new StreamReader(""output.txt""))
{
    string line;
    while ((line = sr.ReadLine()) != null)
    {
        Console.WriteLine(line);
    }
}</code></pre>",
                    InitialCode = @"using System;
using System.IO;

class Program
{
    static void Main()
    {
        string filename = ""data.txt"";

        // Write content to data.txt
        using (StreamWriter sw = new StreamWriter(filename))
        {
            sw.WriteLine(""File I/O Success"");
        }

        // Read content from data.txt
        // Implement StreamReader to read and display content
    }
}",
                    ChallengeTitle = "Reading Text Streams",
                    ChallengeDescription = "Write a using block with StreamReader to read data.txt line by line and print the output.",
                    ExpectedOutput = "File I/O Success",
                    Quiz = [
                        new QuizQuestion { Id = 1, QuestionText = "Which namespace contains StreamWriter and StreamReader?", Options = ["System.Collections", "System.IO", "System.Text", "System.Files"], CorrectOptionIndex = 1, Explanation = "The System.IO namespace contains all file and stream read/write utility classes." },
                        new QuizQuestion { Id = 2, QuestionText = "What block is guaranteed to execute even if an exception occurs?", Options = ["try block", "catch block", "finally block", "using block"], CorrectOptionIndex = 2, Explanation = "The finally block always runs whether or not an exception is thrown." },
                        new QuizQuestion { Id = 3, QuestionText = "Why do we use the C# 'using' statement with File streams?", Options = ["To speed up write operations", "To ensure resources are automatically closed and disposed", "To encrypt the written file", "To prevent compile-time warnings"], CorrectOptionIndex = 1, Explanation = "The using statement is syntactic sugar that guarantees the Close/Dispose methods are called, unlocking file resources." }
                    ],
                    Labs = [
                        new CodeLab
                        {
                            Id = 1,
                            Title = "Safe Division Handler",
                            Description = "Catch the DivideByZeroException using a catch block. Print 'Zero Division Detected'.",
                            InitialCode = @"using System;

class Program
{
    static void Main()
    {
        try
        {
            int a = 10, b = 0;
            int c = a / b;
        }
        // Catch DivideByZeroException and print 'Zero Division Detected'
    }
}",
                            ExpectedOutput = "Zero Division Detected"
                        },
                        new CodeLab
                        {
                            Id = 2,
                            Title = "StreamWriter Content Creator",
                            Description = "Write a program using StreamWriter to create a file named 'hello.txt' containing the text 'Line 1'. Then, read it and print it.",
                            InitialCode = @"using System;
using System.IO;

class Program
{
    static void Main()
    {
        string path = ""hello.txt"";
        // Write 'Line 1' using StreamWriter

        // Read hello.txt using StreamReader and print it
        using (StreamReader sr = new StreamReader(path))
        {
            Console.WriteLine(sr.ReadLine());
        }
    }
}",
                            ExpectedOutput = "Line 1"
                        }
                    ],
                    DragDrop = new DragDropExercise
                    {
                        ExerciseTitle = "Exception & File Matching",
                        Pairs = [
                            new DragDropPair { Id = "dd-10-1", Term = "finally block", Description = "A block that always runs, clean up resource handles." },
                            new DragDropPair { Id = "dd-10-2", Term = "StreamWriter", Description = "A utility class used for writing text streams to files." },
                            new DragDropPair { Id = "dd-10-3", Term = "StreamReader", Description = "A utility class used for reading text streams from files." },
                            new DragDropPair { Id = "dd-10-4", Term = "using statement", Description = "Syntactic sugar that guarantees Dispose calls on resource exit." }
                        ]
                    },
                    PredictOutputs =
                    [
                        new PredictOutputExercise
                        {
                            Id = 1,
                            Title = "Try-Catch-Finally Execution Order",
                            Hint = "The finally block ALWAYS runs, even if an exception was caught. What prints first?",
                            Code = @"using System;
class Program {
    static void Main() {
        try {
            Console.WriteLine(""Trying..."");
            int x = 10 / 0;
            Console.WriteLine(""After divide"");
        }
        catch (DivideByZeroException) {
            Console.WriteLine(""Caught division error!"");
        }
        finally {
            Console.WriteLine(""Finally block runs."");
        }
    }
}",
                            ExpectedOutput = "Trying...\r\nCaught division error!\r\nFinally block runs."
                        },
                        new PredictOutputExercise
                        {
                            Id = 2,
                            Title = "Exception Type Matching",
                            Hint = "C# matches the FIRST catch block whose exception type fits. FormatException is thrown by int.Parse on invalid input.",
                            Code = @"using System;
class Program {
    static void Main() {
        try {
            int n = int.Parse(""abc"");
        }
        catch (OverflowException) {
            Console.WriteLine(""Overflow!"");
        }
        catch (FormatException) {
            Console.WriteLine(""Invalid format!"");
        }
        catch (Exception) {
            Console.WriteLine(""General error!"");
        }
    }
}",
                            ExpectedOutput = "Invalid format!"
                        }
                    ]
                }
            ];
        }
    }
}
