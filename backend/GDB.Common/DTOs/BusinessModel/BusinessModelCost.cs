using GDB.Common.DTOs.Interfaces;

namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelCost : IIdentifiedObject
    {
        public BusinessModelCost() { }

        public string Field { get; set; }
        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public IdentifiedPrimitive<string> Type { get; set; }
        public IdentifiedPrimitive<string> Summary { get; set; }
        public IdentifiedPrimitive<bool> IsPreLaunch { get; set; }
        public IdentifiedPrimitive<bool> IsPostLaunch { get; set; }
    }
}