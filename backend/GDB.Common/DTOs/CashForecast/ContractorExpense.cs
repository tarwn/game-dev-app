﻿using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class ContractorExpense : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public ContractorExpense() { }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }

        public IdentifiedPrimitive<ExpenseFrequency> Type { get; set; }
        public IdentifiedPrimitive<DateTime?> StartDate { get; set; }
        public IdentifiedPrimitive<DateTime?> EndDate { get; set; }
        public IdentifiedPrimitive<decimal> Amount { get; set; }
    }
}