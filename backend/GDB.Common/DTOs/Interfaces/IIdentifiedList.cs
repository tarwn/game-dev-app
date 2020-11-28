using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.Interfaces
{
    public interface IIdentifiedList<T> : IIdentified
        where T: IIdentified
    {
        public string? Field { get; set; }
        public List<T> List { get; set; }
    }
}
