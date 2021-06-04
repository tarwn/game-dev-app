using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend.Models.Games
{
    public class UpdateGameDetailsRequestModel
    {
        public string GoalsDocUrl { get; set; }
        public string GoalsNotes { get; set; }
        public string GroundworkDocUrl { get; set; }
        public string GroundworkNotes { get; set; }
    }
}
