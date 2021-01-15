using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class CashOut : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public CashOut() { }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedPrimitive<CashOutType> Type { get; set; }
        public IdentifiedPrimitive<decimal> Amount { get; set; }
        public IdentifiedPrimitive<decimal?> LimitFixedAmount { get; set; }
        public IdentifiedPrimitive<int?> NumberOfMonths { get; set; }
    }
}