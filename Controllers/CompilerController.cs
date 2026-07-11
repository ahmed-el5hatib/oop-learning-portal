using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

namespace OopLearningPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompilerController : ControllerBase
    {
        public class CompileRequest
        {
            public string Code { get; set; } = string.Empty;
        }

        [HttpPost("run")]
        public IActionResult RunCode([FromBody] CompileRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Code))
            {
                return BadRequest(new { success = false, errors = "Code is empty! Please write some C# code." });
            }

            try
            {
                // Parse code
                var syntaxTree = CSharpSyntaxTree.ParseText(request.Code);

                // Collect references from AppDomain
                var references = new List<MetadataReference>();
                foreach (var asm in AppDomain.CurrentDomain.GetAssemblies())
                {
                    try
                    {
                        if (!asm.IsDynamic && !string.IsNullOrEmpty(asm.Location))
                        {
                            references.Add(MetadataReference.CreateFromFile(asm.Location));
                        }
                    }
                    catch
                    {
                        // Skip if unable to load assembly reference
                    }
                }

                // Add standard netstandard/runtime assemblies if they are not already loaded
                var coreDir = Path.GetDirectoryName(typeof(object).Assembly.Location) ?? string.Empty;
                string[] sysAssemblies = [ "mscorlib.dll", "System.Runtime.dll", "System.Console.dll", "System.Collections.dll", "System.Linq.dll" ];
                foreach (var sysDll in sysAssemblies)
                {
                    try
                    {
                        if (!string.IsNullOrEmpty(coreDir))
                        {
                            var path = Path.Combine(coreDir, sysDll);
                            if (System.IO.File.Exists(path) && !references.Any(r => r.Display != null && r.Display.EndsWith(sysDll, StringComparison.OrdinalIgnoreCase)))
                            {
                                references.Add(MetadataReference.CreateFromFile(path));
                            }
                        }
                    }
                    catch
                    {
                        // Skip if failed
                    }
                }

                // Setup compilation options
                var compilation = CSharpCompilation.Create(
                    "Sandbox_" + Guid.NewGuid().ToString("N"),
                    [syntaxTree],
                    references,
                    new CSharpCompilationOptions(OutputKind.ConsoleApplication));

                using var ms = new MemoryStream();
                var emitResult = compilation.Emit(ms);

                if (!emitResult.Success)
                {
                    var errors = emitResult.Diagnostics
                        .Where(d => d.Severity == DiagnosticSeverity.Error)
                        .Select(d => $"{d.Id}: {d.GetMessage()} at line {d.Location.GetLineSpan().StartLinePosition.Line + 1}");
                    
                    return Ok(new { success = false, errors = string.Join("\n", errors) });
                }

                ms.Seek(0, SeekOrigin.Begin);
                var assembly = Assembly.Load(ms.ToArray());
                var entryPoint = assembly.EntryPoint;

                if (entryPoint == null)
                {
                    return Ok(new { success = false, errors = "Error: No Entry Point (Main method) found in your code. Please write code containing a class and a static void Main() method." });
                }

                // Run code in a separate thread to handle timeout and avoid locking the request thread
                var tcs = new TaskCompletionSource<bool>();
                string output = "";
                string? exception = null;

                var thread = new Thread(() =>
                {
                    var originalOut = Console.Out;
                    using var sw = new StringWriter();
                    Console.SetOut(sw);
                    try
                    {
                        var parameters = entryPoint.GetParameters().Length == 0 ? null : new object[] { Array.Empty<string>() };
                        entryPoint.Invoke(null, parameters);
                        output = sw.ToString();
                    }
                    catch (TargetInvocationException tie)
                    {
                        output = sw.ToString();
                        exception = tie.InnerException != null ? tie.InnerException.ToString() : tie.ToString();
                    }
                    catch (Exception ex)
                    {
                        output = sw.ToString();
                        exception = ex.ToString();
                    }
                    finally
                    {
                        Console.SetOut(originalOut);
                        tcs.SetResult(true);
                    }
                });

                thread.Start();

                // Wait for the execution with 3.5 seconds timeout
                if (Task.WaitAny([tcs.Task], TimeSpan.FromSeconds(3.5)) == 0)
                {
                    if (exception != null)
                    {
                        return Ok(new { success = false, output, exception, errors = "Runtime Exception occurred during execution." });
                    }
                    return Ok(new { success = true, output });
                }
                else
                {
                    try
                    {
                        thread.Interrupt();
                        // thread.Abort() is not supported in .NET Core, so we interrupt and let it finish or join
                    }
                    catch { }
                    return Ok(new { success = false, output = output + "\n[Error: Execution timed out! The program was stopped because it took more than 3.5 seconds (possible infinite loop detected).]", exception = "TimeoutException: Execution timed out." });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, errors = $"System Error: {ex.Message}" });
            }
        }
    }
}
