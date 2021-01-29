using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class RepaymentTerms : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public RepaymentTerms() { }

        public RepaymentTerms(string parentId, string globalId,IdentifiedList<CashOut> cashOut, string field = null)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Field = field;
            CashOut = cashOut;

        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedList<CashOut> CashOut { get; set; }
    }
}