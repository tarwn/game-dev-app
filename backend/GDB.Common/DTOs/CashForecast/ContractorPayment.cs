using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class ContractorPayment : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public ContractorPayment() { }

        public ContractorPayment(string parentId, string globalId, IdentifiedPrimitive<DateTime> startDate, IdentifiedPrimitive<decimal> amount, IdentifiedPrimitive<DateTime> endDate)
        {
            ParentId = parentId;
            GlobalId = globalId;
            StartDate = startDate;
            Amount = amount;
            EndDate = endDate;
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }

        public IdentifiedPrimitive<DateTime> StartDate { get; set; }
        public IdentifiedPrimitive<decimal> Amount { get; set; }
        public IdentifiedPrimitive<DateTime> EndDate { get; set; }
    }
}