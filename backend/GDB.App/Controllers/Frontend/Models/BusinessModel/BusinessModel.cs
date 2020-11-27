using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend.Models.BusinessModel
{
    public class BusinessModel
    {

        public BusinessModel()
        {
            Customers = new List<FreeFormCollection>();
        }

        public string GlobalId { get; set; }
        public string GlobalGameId { get; set; }
        public int VersionNumber { get; set; }

        public List<FreeFormCollection> Customers { get; set; }

    }
}
