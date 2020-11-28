using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.Interfaces
{
    public interface IIdentifiedPrimitive<T> : IIdentified
    {
        public string? Field { get; set; }
        public T Value { get; set; }
    }
}
