﻿using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class FundingCashOut : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public FundingCashOut() { }

        public FundingCashOut(string parentId, string globalId, IdentifiedPrimitive<FundingRepaymentType> type, IdentifiedPrimitive<decimal> amount, IdentifiedPrimitive<DateTime> startDate, IdentifiedPrimitive<decimal> limitFixedAmount = null, IdentifiedPrimitive<int> numberOfMonths = null, string field = null)
        {
            ParentId = parentId;
            GlobalId = globalId;
            Type = type;
            Amount = amount;
            StartDate = startDate;
            LimitFixedAmount = limitFixedAmount;
            NumberOfMonths = numberOfMonths;
            Field = field;
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedPrimitive<FundingRepaymentType> Type { get; set; }
        public IdentifiedPrimitive<decimal> Amount { get; set; }
        public IdentifiedPrimitive<DateTime> StartDate { get; set; }
        public IdentifiedPrimitive<decimal>? LimitFixedAmount { get; set; }
        public IdentifiedPrimitive<int>? NumberOfMonths { get; set; }
    }
}