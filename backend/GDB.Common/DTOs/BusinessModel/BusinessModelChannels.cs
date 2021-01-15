using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelChannels : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public BusinessModelChannels() { }

        public BusinessModelChannels(string parentId, string globalId, string field = null)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Field = field;
            Awareness = new IdentifiedList<IdentifiedPrimitive<string>>(globalId, $"{globalId}:aware", "awareness");
            Consideration = new IdentifiedList<IdentifiedPrimitive<string>>(globalId, $"{globalId}:cons", "consideration");
            Purchase = new IdentifiedList<IdentifiedPrimitive<string>>(globalId, $"{globalId}:p", "purchase");
            PostPurchase = new IdentifiedList<IdentifiedPrimitive<string>>(globalId, $"{globalId}:pp", "postPurchase");
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> Awareness { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> Consideration { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> Purchase { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> PostPurchase { get; set; }
    }
}