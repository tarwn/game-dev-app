﻿using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelKeyResources : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public BusinessModelKeyResources() { }

        public BusinessModelKeyResources(string parentId, string globalId, string field = null)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Field = field;
            Entries = new IdentifiedList<IdentifiedPrimitive<string>>(globalId, $"{globalId}:entries", "entries");
        }

        public string ParentId { get; set; }
        public string GlobalId { get; set; }
        public string Field { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> Entries { get; set; }
    }
}