using System;

namespace GDB.Common.DTOs.CashForecast
{
    public enum AdditionalEmployeeExpenseType
    {
        [Obsolete("no longer in use: not doing gross shares unless someone asks and has real-world experience", false)]
        GrossRevenueShare = 1,
        [Obsolete("no longer in use: not doing gross shares unless someone asks and has real-world experience", false)]
        GrossProfitShare = 2,
        NetProfitShare = 3,
        BonusPercentOnce = 4,
        BonusPercentAnnual = 5,
        BonusDollarsOnce = 6,
        BonusDollarsAnnual = 7
    }
}