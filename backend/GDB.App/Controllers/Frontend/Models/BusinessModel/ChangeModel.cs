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
        public BusinessModelChangeEvent Change { get; set; }
    }
}
