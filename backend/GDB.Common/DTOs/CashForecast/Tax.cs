using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class Tax : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public Tax() { }

        public Tax(string parentId, string globalId, IdentifiedPrimitive<string> name, IdentifiedPrimitive<NetIncomeCategory> basedOn, IdentifiedPrimitive<decimal> amount, IdentifiedPrimitive<TaxSchedule> schedule, IdentifiedPrimitive<DateTime> dueDate)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Name = name;
            BasedOn = basedOn;
            Amount = amount;
            Schedule = schedule;
            DueDate = dueDate;
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }

        public IdentifiedPrimitive<string> Name { get; set; }
        public IdentifiedPrimitive<NetIncomeCategory> BasedOn { get; set; }
        public IdentifiedPrimitive<decimal> Amount{ get; set; }
        public IdentifiedPrimitive<TaxSchedule> Schedule { get; set; }
        public IdentifiedPrimitive<DateTime> DueDate{ get; set; }
    }
}