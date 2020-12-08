using GDB.Common.DTOs.Interfaces;

namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelValueProposition : IIdentifiedObject
    {
        public BusinessModelValueProposition()
        {
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }

        public IdentifiedList<IdentifiedPrimitive<string>> Genres { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> Platforms { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> Entries { get; set; }

    }
}