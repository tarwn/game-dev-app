using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class EstimatedRevenuePlatform : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public EstimatedRevenuePlatform() { }

        public EstimatedRevenuePlatform(string parentId, string globalId, IdentifiedPrimitive<string> name, IdentifiedPrimitive<BasicDateOption> dateType,
            IdentifiedPrimitive<DateTime> startDate, IdentifiedPrimitive<decimal> percentOfSales, IdentifiedList<EstimatedRevenuePlatformShare> revenueShares)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Name = name;
            DateType = dateType;
            StartDate = startDate;
            PercentOfSales = percentOfSales;
            RevenueShares = revenueShares;
        }

        public string ParentId { get; set; }
        public string GlobalId { get; set; }
        public string Field { get; set; }
        public IdentifiedPrimitive<string> Name { get; set; }
        public IdentifiedPrimitive<BasicDateOption> DateType { get; set; }
        public IdentifiedPrimitive<DateTime> StartDate { get; set; }
        public IdentifiedPrimitive<decimal> PercentOfSales { get; set; }
        public IdentifiedList<EstimatedRevenuePlatformShare> RevenueShares { get; set; }
    }

    public enum BasicDateOption {
        Date = 1,
        Launch = 2
    }
}