﻿using GDB.Common.DTOs.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.CashForecast
{
    public class CashForecastDTO : IIdentifiedTopObject
    {
        [Obsolete("Serialization only", false)]
        public CashForecastDTO()
        {
            Loans = new IdentifiedList<LoanItem>();
            Funding = new IdentifiedList<Funding>();
            Employees = new IdentifiedList<EmployeeExpense>();
            Contractors = new IdentifiedList<ContractorExpense>();
            Expenses = new IdentifiedList<GenericExpense>();
            Revenues = new IdentifiedList<Revenue>();
        }

        /// <summary>
        /// Creates a new "version 1" instance
        /// </summary>
        public CashForecastDTO(string parentId, string globalId)
        {
            ParentId = parentId;
            GlobalId = globalId;
            VersionNumber = 1;
            BankBalance = new BankBalance(globalId, $"{globalId}:b");
            Loans = new IdentifiedList<LoanItem>(globalId, $"{globalId}:l", "loans");
            Funding = new IdentifiedList<Funding>(globalId, $"{globalId}:f", "funding");
            Employees = new IdentifiedList<EmployeeExpense>(globalId, $"{globalId}:em", "employees");
            Contractors = new IdentifiedList<ContractorExpense>(globalId, $"{globalId}:c", "contractors");
            Expenses = new IdentifiedList<GenericExpense>(globalId, $"{globalId}:ex", "expenses");
            Revenues = new IdentifiedList<Revenue>(globalId, $"{globalId}:r", "revenues");
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string? Field { get; set; }
        public int VersionNumber { get; set; }
        public BankBalance BankBalance { get; set; }
        public IdentifiedList<LoanItem> Loans { get; set; }
        public IdentifiedList<Funding> Funding { get; set; }
        public IdentifiedList<EmployeeExpense> Employees { get; set; }
        public IdentifiedList<ContractorExpense> Contractors { get; set; }
        public IdentifiedList<GenericExpense> Expenses { get; set; }
        public IdentifiedList<Revenue> Revenues { get; set; }

    }
}