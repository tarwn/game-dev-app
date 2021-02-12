using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class ContractorExpense : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public ContractorExpense()
        {
            Payments = new IdentifiedList<ContractorPayment>();
        }

        public ContractorExpense(string parentId, string globalId, IdentifiedPrimitive<string> name, IdentifiedPrimitive<ExpenseCategory> category, IdentifiedPrimitive<ContractorExpenseFrequency> frequency, IdentifiedList<ContractorPayment> payments)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Name = name;
            Category = category;
            Frequency = frequency;
            Payments = payments;
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }

        public IdentifiedPrimitive<string> Name { get; set; }
        public IdentifiedPrimitive<ExpenseCategory> Category { get; set; }
        public IdentifiedPrimitive<ContractorExpenseFrequency> Frequency { get; set; }
        public IdentifiedList<ContractorPayment> Payments { get; set; }
    }
}