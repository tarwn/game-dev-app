using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.General.Models
{
    public class StudioChoiceInputModel
    {
        public int UserId { get; set; }
        public int StudioId { get; set; }
        public string ReturnUrl { get; set; }
    }
}
