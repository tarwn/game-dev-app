using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class EstimatedRevenuePlatformShare : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public EstimatedRevenuePlatformShare() { }

        public EstimatedRevenuePlatformShare(string parentId, string globalId, IdentifiedPrimitive<decimal> revenueShare, IdentifiedPrimitive<decimal> untilAmount)
        {
            ParentId = parentId;
            GlobalId = globalId;
            RevenueShare = revenueShare;
            UntilAmount = untilAmount;
        }

        public string ParentId { get; set; }
        public string GlobalId { get; set; }
        public string Field { get; set; }
        public IdentifiedPrimitive<decimal> RevenueShare { get; set; }
        public IdentifiedPrimitive<decimal> UntilAmount { get; set; }
    }
}