# C# OOP Interactive Learning Portal 🚀

An interactive web application designed to help computer science students master Object-Oriented Programming (OOP) concepts in C# through visual simulations, hands-on programming labs, drag-and-drop challenges, and output prediction exercises.

---

## 🌟 Key Features

### 1. Interactive Visual Simulators 🎮
Visualize abstract programming and memory management concepts in real-time:
* **Section 1 (Methods & Call Stack):** Step-by-step interactive call stack visualizer showing parameters passing (`ref`, `out`, and value types) on stack frames.
* **Section 2 (Memory Layout):** Contiguous memory addresses grid visualizing 1D/2D arrays, structs, and enums.
* **Section 3 (Classes & Objects):** Dynamic object composition and reference linking.
* **Section 5 (Properties):** Composition visualizer with validation feedback.
* **Section 6 & 7 (Inheritance & Polymorphism):** Class hierarchy builder and method resolution order.
* **Section 8 (Abstraction):** Discount rules builder validating abstract constraints.

### 2. Live Monaco Compiler & Code Labs 💻
Write, run, and compile C# code directly in the browser:
* Powered by the **Monaco Editor** (the engine behind VS Code) with syntax highlighting, auto-complete, and indent guides.
* Features a secure, sandbox in-memory C# compiler (using Roslyn compiler technology) that compiles and runs student code on-the-fly.
* Guided coding labs requiring students to write or debug C# classes (e.g. `Person`, `Employee`, `Circle`, `Account`) to match specified expected outputs.

### 3. Drag-and-Drop Concept Matching 🧩
Interactive matching boards where students drag C# OOP vocabulary words and drop them onto their correct definitions to verify comprehension.

### 4. Predict the Output Exercises 👁️
Test mental execution models! Students read code snippets and type what they expect to print to the console. System runs line-by-line normalized diffing to pinpoint errors.

### 5. Adaptive Quiz Engine 📝
Multiple choice questions with detailed explanations, scoring systems, and progress tracking saved locally (`localStorage`).

---

## 🛠️ How to Deploy & Host Online 🌐

Since this portal runs an **in-memory C# compiler (Roslyn)** on the server, it requires a hosting service that runs C#/.NET 10.0 backend code. Static hosts like GitHub Pages will not work. Below are the easiest free hosting options:

### Option A: Deploying on Render (Free Container Hosting)
Render allows you to host the portal using the included `Dockerfile` directly from your GitHub repository:
1. Go to [Render](https://render.com/) and sign up / log in with your GitHub account.
2. Click **New +** and select **Web Service**.
3. Select your repository `oop-learning-portal`.
4. Render will automatically detect the `Dockerfile`.
5. Set the **Instance Type** to **Free**.
6. Click **Deploy Web Service**. Your portal will be live in a few minutes!

### Option B: Deploying on Railway (Recommended)
1. Register on [Railway.app](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `oop-learning-portal`.
4. Railway will automatically detect the C# project and launch it.

### Option C: Deploying on SmarterASP.net (Free Windows .NET Hosting)
1. Register for a free trial on [SmarterASP.net](https://www.smarterasp.net/).
2. Run `dotnet publish -c Release` on your local machine to build the deployment files.
3. Upload the contents of the publish folder via FTP or the SmarterASP control panel.

---

## 💻 Local Development

### Prerequisites
* [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)

### Steps
1. Clone this repository:
   ```bash
   git clone https://github.com/ahmed-el5hatib/oop-learning-portal.git
   cd oop-learning-portal
   ```
2. Run the application:
   ```bash
   dotnet run
   ```
3. Open your browser and navigate to `http://localhost:5253`.

---

## 📚 Curriculum Structure
1. **Methods & Parameter Passing** (`ref`, `out`, value types, overloading)
2. **Arrays, Structs & Enums** (contiguous memory, value types, status codes)
3. **Classes, Objects & Encapsulation** (constructors, fields, getters/setters)
4. **UML Class Diagrams** (class specifications, design patterns)
5. **Properties & Object Composition** (validation, HAS-A relations, static trackers)
6. **Inheritance Basics** (base classing, code reuse)
7. **Polymorphism & Abstraction** (dynamic binding, overrides, abstract rules)
8. **Exception Handling & File I/O** (robustness, streams)
9. **C# Generics** (avoiding boxing, type parameterization)
10. **Final Practical Labs** (final OOP integration exercises)
