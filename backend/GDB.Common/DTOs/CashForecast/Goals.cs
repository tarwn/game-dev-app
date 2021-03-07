using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{

    public class Goals : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public Goals() { }

        public Goals(string parentId, string globalId, decimal userGoal, decimal partnerGoalPercent)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Field = "goals";
            YourGoal = new IdentifiedPrimitive<decimal>(GlobalId, $"{GlobalId}:0", userGoal, "yourGoal");
            PartnerGoal = new IdentifiedPrimitive<decimal>(GlobalId, $"{GlobalId}:1", partnerGoalPercent, "partnerGoal");
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedPrimitive<decimal> YourGoal { get; set; }
        public IdentifiedPrimitive<decimal> PartnerGoal { get; set; }
    }
}