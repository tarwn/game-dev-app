using System.Collections.Generic;

namespace GDB.Common.DTOs.BusinessModel
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