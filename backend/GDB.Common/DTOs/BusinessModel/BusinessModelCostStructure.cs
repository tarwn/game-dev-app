using GDB.Common.DTOs.Interfaces;
using System;
using System.Collections.Generic;

namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelCostStructure : IIdentifiedList<BusinessModelCost>
    {
        [Obsolete("serialization only", false)]
        public BusinessModelCostStructure()
        {
            List = new List<BusinessModelCost>();
        }

        public BusinessModelCostStructure(string parentId, string globalId, string field = null)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Field = field;
            List = new List<BusinessModelCost>();
        }

        public string ParentId { get; set; }
        public string GlobalId { get; set; }
        public string Field { get; set; }
        public List<BusinessModelCost> List { get; set; }
    }
}
