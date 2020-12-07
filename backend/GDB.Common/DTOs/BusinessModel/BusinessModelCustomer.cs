using GDB.Common.DTOs.Interfaces;

namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelCustomer : IIdentifiedObject
    {
        public BusinessModelCustomer()
        {
            Entries = new IdentifiedList<IdentifiedPrimitive<string>>();
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedPrimitive<string> Name { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> Entries { get; set; }
        public IdentifiedPrimitive<string> Type { get; set; }
    }
}