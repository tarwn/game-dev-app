using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class AdditionalEmployeeExpense : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public AdditionalEmployeeExpense() { }

        public AdditionalEmployeeExpense(string parentId, string globalId, IdentifiedPrimitive<AdditionalEmployeeExpenseType> type, IdentifiedPrimitive<decimal> amount, IdentifiedPrimitive<AdditionalEmployeeExpenseFrequency> frequency, IdentifiedPrimitive<DateTime> date)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Type = type;
            Amount = amount;
            Frequency = frequency;
            Date = date;
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }

        public IdentifiedPrimitive<AdditionalEmployeeExpenseType> Type { get; set; }
        public IdentifiedPrimitive<decimal> Amount { get; set; }
        public IdentifiedPrimitive<AdditionalEmployeeExpenseFrequency> Frequency { get; set; }
        public IdentifiedPrimitive<DateTime>? Date { get; set; }
    }
}