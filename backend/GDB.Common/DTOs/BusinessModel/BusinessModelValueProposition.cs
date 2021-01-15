using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelValueProposition : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public BusinessModelValueProposition() { }

        public BusinessModelValueProposition(string parentId, string globalId, string field = null)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Field = field;
            Genres = new IdentifiedList<IdentifiedPrimitive<string>>(globalId, $"{globalId}:genres", "genres");
            Platforms = new IdentifiedList<IdentifiedPrimitive<string>>(globalId, $"{globalId}:platforms", "platforms");
            Entries = new IdentifiedList<IdentifiedPrimitive<string>>(globalId, $"{globalId}:entries", "entries");
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }

        public IdentifiedList<IdentifiedPrimitive<string>> Genres { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> Platforms { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> Entries { get; set; }

    }
}