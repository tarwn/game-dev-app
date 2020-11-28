using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.Interfaces
{
    public interface IIdentified
    {
        public string GlobalId { get; set; }
        public string ParentId { get; set; }
    }
}
