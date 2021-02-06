using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class GenericExpense : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public GenericExpense() { }

        public GenericExpense(string parentId, string globalId, IdentifiedPrimitive<string> name, IdentifiedPrimitive<ExpenseCategory> category, IdentifiedPrimitive<ExpenseFrequency> frequency, IdentifiedPrimitive<DateTime> startDate, IdentifiedPrimitive<ExpenseUntil> until, IdentifiedPrimitive<DateTime> endDate, IdentifiedPrimitive<decimal> amount)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Name = name;
            Category = category;
            Frequency = frequency;
            StartDate = startDate;
            Until = until;
            EndDate = endDate;
            Amount = amount;
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }

        public IdentifiedPrimitive<string> Name { get; set; }
        public IdentifiedPrimitive<ExpenseCategory> Category { get; set; }
        public IdentifiedPrimitive<ExpenseFrequency> Frequency { get; set; }
        public IdentifiedPrimitive<DateTime> StartDate { get; set; }
        public IdentifiedPrimitive<ExpenseUntil> Until { get; set; }
        public IdentifiedPrimitive<DateTime> EndDate { get; set; }
        public IdentifiedPrimitive<decimal> Amount { get; set; }
    }
}