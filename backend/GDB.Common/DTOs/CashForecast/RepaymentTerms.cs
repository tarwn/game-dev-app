using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class RepaymentTerms : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public RepaymentTerms() { }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedPrimitive<RepaymentType> Type { get; set; }
        public IdentifiedList<CashOut> CashOut { get; set; }
    }
}