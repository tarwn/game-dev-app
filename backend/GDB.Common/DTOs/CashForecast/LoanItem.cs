using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class LoanItem : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public LoanItem() { }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IIdentifiedPrimitive<string> Name { get; set; }
        public IIdentifiedPrimitive<LoanType> Type { get; set; }
        public IIdentifiedList<CashIn> CashIn { get; set; }
        public RepaymentTerms RepaymentTerms { get; set; }
    }
}