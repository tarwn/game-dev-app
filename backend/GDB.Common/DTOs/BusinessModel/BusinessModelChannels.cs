using GDB.Common.DTOs.Interfaces;

namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelChannels : IIdentifiedObject
    {
        public BusinessModelChannels() { }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> Awareness { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> Consideration { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> Purchase { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> PostPurchase { get; set; }
    }
}