using GDB.Common.DTOs._Events;
using GDB.Common.DTOs.BusinessModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend.Models.BusinessModel
{
    public class ChangeModel
    {
        public int PreviousVersionNumber { get; set; }
        public ChangeEvent Change { get; set; }
    }
}
