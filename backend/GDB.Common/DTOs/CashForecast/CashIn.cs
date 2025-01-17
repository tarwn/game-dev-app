﻿using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class CashIn : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public CashIn() { }

        public CashIn(string parentId, string globalId, IdentifiedPrimitive<DateTime> cashInDate, IdentifiedPrimitive<decimal> cashInAmount)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Field = null;
            Date = cashInDate;
            Amount = cashInAmount;
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }

        public IdentifiedPrimitive<DateTime> Date { get; set; }
        public IdentifiedPrimitive<decimal> Amount { get; set; }
    }
}