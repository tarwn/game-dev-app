using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class Funding : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public Funding() { }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedPrimitive<string> Name { get; set; }
        public IdentifiedPrimitive<LoanType> Type{ get; set; }
        public IdentifiedPrimitive<CashIn> CashIn { get; set; }
        public RepaymentTerms? RepaymentTerms { get; set; }
    }
}