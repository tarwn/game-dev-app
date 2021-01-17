﻿using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class BankBalance : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public BankBalance() { }

        public BankBalance(string parentId, string globalId)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Field = "bankBalance";
            Name = new IdentifiedPrimitive<string>(GlobalId, $"{GlobalId}:0", "", "name");
            Date = new IdentifiedPrimitive<DateTime>(GlobalId, $"{GlobalId}:1", GetStartDate(), "date");
            Amount = new IdentifiedPrimitive<decimal>(GlobalId, $"{GlobalId}:2", 0, "amount");
            MonthlyInterestRate = new IdentifiedPrimitive<decimal>(GlobalId, $"{GlobalId}:3", 0, "monthlyInterestRate");
        }

        private DateTime GetStartDate()
        {
            var now = DateTime.UtcNow;
            return new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedPrimitive<string> Name { get; set; }
        public IdentifiedPrimitive<DateTime> Date { get; set; }
        public IdentifiedPrimitive<decimal> Amount { get; set; }
        public IdentifiedPrimitive<decimal> MonthlyInterestRate { get; set; }
    }
}