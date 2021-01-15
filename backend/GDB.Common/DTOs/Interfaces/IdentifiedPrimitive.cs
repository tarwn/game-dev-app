using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.Interfaces
{
    public class IdentifiedPrimitive<T> : IIdentifiedPrimitive<T>
    {
        public IdentifiedPrimitive(){}

        public IdentifiedPrimitive(string parentId, string globalId, T value, string? field = null)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Value = value;
            Field = field;
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string? Field { get; set; }
        public T Value { get; set; }
    }
}
