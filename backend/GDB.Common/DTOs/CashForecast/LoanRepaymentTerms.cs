using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class LoanRepaymentTerms : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public LoanRepaymentTerms() { }

        public LoanRepaymentTerms(string parentId, string globalId,IdentifiedList<LoanCashOut> cashOut, string field = null)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Field = field;
            CashOut = cashOut;

        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedList<LoanCashOut> CashOut { get; set; }
    }
}