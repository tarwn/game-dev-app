using GDB.Common.DTOs.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.CashForecast
{
    public class CashForecastDTO : IIdentifiedTopObject
    {
        const int DEFAULT_FORECAST_TO_LAUNCH_INIT = 24; // months - add 1 + subtract 1 day so launch is at end of period

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
        public CashForecastDTO(string parentId, string globalId, DateTime defaultForecastStartDate)
        {
            var defaultLaunchDate = defaultForecastStartDate.AddMonths(DEFAULT_FORECAST_TO_LAUNCH_INIT + 1).AddDays(-1);

            ParentId = parentId;
            GlobalId = globalId;
            VersionNumber = 1;
            ForecastStartDate = new IdentifiedPrimitive<DateTime>(globalId, $"{ globalId }:fsd", defaultForecastStartDate, "forecastStartDate");
            LaunchDate = new IdentifiedPrimitive<DateTime>(globalId, $"{ globalId }:ld", defaultLaunchDate, "launchDate");
            Stage = new IdentifiedPrimitive<ForecastStage>(globalId, $"{globalId}:fs", ForecastStage.RunwayToLaunch, "stage");
            ForecastMonthCount = new IdentifiedPrimitive<int>(globalId, $"{globalId}:fmc", DEFAULT_FORECAST_TO_LAUNCH_INIT);
            Goals = new Goals(globalId, $"{globalId}:g", 0, 2);
            BankBalance = new BankBalance(globalId, $"{globalId}:b", ForecastStartDate.Value);
            Loans = new IdentifiedList<LoanItem>(globalId, $"{globalId}:l", "loans");
            Funding = new IdentifiedList<Funding>(globalId, $"{globalId}:f", "funding");
            Employees = new IdentifiedList<EmployeeExpense>(globalId, $"{globalId}:em", "employees");
            Contractors = new IdentifiedList<ContractorExpense>(globalId, $"{globalId}:c", "contractors");
            Expenses = new IdentifiedList<GenericExpense>(globalId, $"{globalId}:ex", "expenses");
            Taxes = new IdentifiedList<Tax>(globalId, $"{globalId}:tax", "taxes");
            Revenues = new IdentifiedList<Revenue>(globalId, $"{globalId}:r", "revenues");
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string? Field { get; set; }
        public int VersionNumber { get; set; }
        public IdentifiedPrimitive<DateTime> ForecastStartDate { get; set; }
        public IdentifiedPrimitive<DateTime> LaunchDate { get; set; }
        public IdentifiedPrimitive<ForecastStage> Stage { get; set; }
        public IdentifiedPrimitive<int> ForecastMonthCount { get; set; }
        public Goals Goals { get; set; }
        public BankBalance BankBalance { get; set; }
        public IdentifiedList<LoanItem> Loans { get; set; }
        public IdentifiedList<Funding> Funding { get; set; }
        public IdentifiedList<EmployeeExpense> Employees { get; set; }
        public IdentifiedList<ContractorExpense> Contractors { get; set; }
        public IdentifiedList<GenericExpense> Expenses { get; set; }
        public IdentifiedList<Tax> Taxes { get; set; }
        public IdentifiedList<Revenue> Revenues { get; set; }

    }
}
