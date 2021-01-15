using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.Interfaces
{
    public class IdentifiedList<T> : IIdentifiedList<T>
        where T : IIdentified
    {
        [Obsolete("serialization only", false)]
        public IdentifiedList()
        {
            List = new List<T>();
        }

        public IdentifiedList(string parentId, string globalId, string? field = null)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Field = field;
            List = new List<T>();
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string? Field { get; set; }
        public List<T> List { get; set; }
    }
}
