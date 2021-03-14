using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class EstimatedRevenue : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public EstimatedRevenue() { }

        public EstimatedRevenue(string parentId, string globalId)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Field = "estimatedRevenue";
            MinimumPrice = new IdentifiedPrimitive<decimal>(GlobalId, $"{GlobalId}:0", 0, "minimumPrice");
            TargetPrice = new IdentifiedPrimitive<decimal>(GlobalId, $"{GlobalId}:1", 0, "targetPrice");
            MaximumPrice = new IdentifiedPrimitive<decimal>(GlobalId, $"{GlobalId}:2", 0, "maximumPrice");
            LowUnitsSold = new IdentifiedPrimitive<decimal>(GlobalId, $"{GlobalId}:3", 0, "lowUnitsSold");
            TargetUnitsSold = new IdentifiedPrimitive<decimal>(GlobalId, $"{GlobalId}:4", 0, "targetUnitsSold");
            HighUnitsSold = new IdentifiedPrimitive<decimal>(GlobalId, $"{GlobalId}:5", 0, "HighUnitsSold");
            Platforms = new IdentifiedList<EstimatedRevenuePlatform>(GlobalId, $"{GlobalId}:6");
        }

        public string ParentId { get; set; }
        public string GlobalId { get; set; }
        public string Field { get; set; }

        public IdentifiedPrimitive<decimal> MinimumPrice { get; set; }
        public IdentifiedPrimitive<decimal> TargetPrice { get; set; }
        public IdentifiedPrimitive<decimal> MaximumPrice { get; set; }
        public IdentifiedPrimitive<decimal> LowUnitsSold { get; set; }
        public IdentifiedPrimitive<decimal> TargetUnitsSold { get; set; }
        public IdentifiedPrimitive<decimal> HighUnitsSold { get; set; }
        public IdentifiedList<EstimatedRevenuePlatform> Platforms { get; set; }

    }
}