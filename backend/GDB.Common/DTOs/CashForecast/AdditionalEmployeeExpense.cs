using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class AdditionalEmployeeExpense : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public AdditionalEmployeeExpense() { }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }

        public IdentifiedPrimitive<AdditionalEmployeeExpenseType> Type { get; set; }
        public IdentifiedPrimitive<decimal> Amount { get; set; }
        public IdentifiedPrimitive<AdditionalEmployeeExpenseFrequency> Frequency { get; set; }
        public IdentifiedPrimitive<DateTime>? Date { get; set; }
    }
}