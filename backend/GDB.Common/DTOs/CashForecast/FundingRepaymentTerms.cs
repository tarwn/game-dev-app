using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class FundingRepaymentTerms : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public FundingRepaymentTerms() { }

        public FundingRepaymentTerms(string parentId, string globalId, IdentifiedList<FundingCashOut> cashOut, string field = null)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Field = field;
            CashOut = cashOut;

        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedList<FundingCashOut> CashOut { get; set; }
    }
}