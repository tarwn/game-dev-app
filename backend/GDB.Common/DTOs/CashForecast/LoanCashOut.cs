using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class LoanCashOut : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public LoanCashOut() { }

        public LoanCashOut(string parentId, string globalId, IdentifiedPrimitive<LoanRepaymentType> type, IdentifiedPrimitive<decimal> amount, IdentifiedPrimitive<DateTime>  startDate, IdentifiedPrimitive<decimal> limitFixedAmount = null, IdentifiedPrimitive<int> numberOfMonths = null, string field = null)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Type = type;
            Amount = amount;
            StartDate = startDate;
            LimitFixedAmount = limitFixedAmount;
            NumberOfMonths = numberOfMonths;
            Field = field;
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedPrimitive<LoanRepaymentType> Type { get; set; }
        public IdentifiedPrimitive<decimal> Amount { get; set; }
        public IdentifiedPrimitive<DateTime> StartDate { get; set; }
        public IdentifiedPrimitive<decimal>? LimitFixedAmount { get; set; }
        public IdentifiedPrimitive<int>? NumberOfMonths { get; set; }
    }
}