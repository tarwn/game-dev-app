using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.Interfaces
{
    public interface IIdentifiedObject : IIdentified
    {
        public string? Field { get; set; }
    }
}
