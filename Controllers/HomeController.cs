using System.Diagnostics;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using OopLearningPortal.Models;

namespace OopLearningPortal.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            var sections = SectionRepository.GetAll();
            return View(sections);
        }

        [Route("LabManual")]
        public IActionResult LabManual()
        {
            return View();
        }

        [Route("Section/{id}")]
        public IActionResult Section(int id)
        {
            var sections = SectionRepository.GetAll();
            var section = sections.FirstOrDefault(s => s.Id == id);
            if (section == null)
            {
                return RedirectToAction("Index");
            }
            ViewBag.AllSections = sections;
            return View(section);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
