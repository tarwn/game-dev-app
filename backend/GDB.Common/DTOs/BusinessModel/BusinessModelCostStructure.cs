using GDB.Common.DTOs.Interfaces;
using System.Collections.Generic;

namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelCostStructure : IIdentifiedList<BusinessModelCost>
    {
        public BusinessModelCostStructure()
        {
        }

        public string ParentId { get; set; }
        public string GlobalId { get; set; }
        public string Field { get; set; }
        public List<BusinessModelCost> List { get; set; }
    }
}
