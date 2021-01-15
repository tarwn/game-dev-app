using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class EmployeeExpense : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public EmployeeExpense() { }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }

        public IdentifiedPrimitive<string> Name { get; set; }
        public IdentifiedPrimitive<DateTime?> StartDate { get; set; }
        public IdentifiedPrimitive<DateTime?> EndDate { get; set; }
        public IdentifiedPrimitive<decimal> SalaryAmount { get; set; }
        public IdentifiedPrimitive<decimal> BenefitsPercent { get; set; }
        public IdentifiedList<AdditionalEmployeeExpense> AdditionalPay { get; set; }
    }
}