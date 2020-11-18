using System.Collections.Generic;

namespace GDB.App.Controllers.Frontend.Models.BusinessModel
{
    public class FreeFormCollection
    {
        public FreeFormCollection()
        {
            Entries = new List<FreeFormEntry>();
        }

        public string GlobalId { get; set; }
        public string Name { get; set; }
        public List<FreeFormEntry> Entries { get; set; }
    }
}