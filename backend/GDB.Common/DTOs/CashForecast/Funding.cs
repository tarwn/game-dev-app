using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class Funding : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public Funding() { }

        public Funding(string parentId, string globalId, IdentifiedPrimitive<string> name, IdentifiedPrimitive<LoanType> type, IdentifiedList<CashIn> cashIn, FundingRepaymentTerms repaymentTerms = null)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Field = null;
            Name = name;
            Type = type;
            CashIn = cashIn;
            RepaymentTerms = repaymentTerms;
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedPrimitive<string> Name { get; set; }
        public IdentifiedPrimitive<LoanType> Type{ get; set; }
        public IdentifiedList<CashIn> CashIn { get; set; }
        public FundingRepaymentTerms? RepaymentTerms { get; set; }
    }
}