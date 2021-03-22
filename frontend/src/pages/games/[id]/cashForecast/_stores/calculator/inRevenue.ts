import type { WritableDraft } from "immer/dist/types/types-external";
import { roundCurrency } from "../../../../../../utilities/currency";
import { BasicDateOption, EstimatedSalesCurve, ICashForecast, RevenueModelType } from "../../_types/cashForecast";
import { IProjectedCashFlowData, SubTotalType } from "./types";

export function applySalesRevenue(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  monthStart: Date,
  monthEnd: Date,
  monthNumAfterLaunch: number,
): void {
  draftState.GrossRevenue_SalesRevenue[i].amount = 0;

  // defined revenue items - maybe legacy?
  forecast.revenues.list.forEach(revenue => {
    const detail = draftState.details.get(SubTotalType.GrossRevenue_SalesRevenue).get(revenue.globalId)[i];
    detail.amount = 0;
    switch (revenue.type.value) {
      case RevenueModelType.ExplicitValues:
        detail.amount = revenue.values.list.reduce((ttl, v) => {
          if (v.date.value >= monthStart && v.date.value < monthEnd) {
            return ttl + v.amount.value;
          }
          return ttl;
        }, 0);
        break;
    }
    draftState.GrossRevenue_SalesRevenue[i].amount += detail.amount;
  });

  // estimated revenue items - only included if >= forecast date, currently missing curve
  const totalPlatformSalesPercent = forecast.estimatedRevenue.platforms.list.reduce((ttl, p) => {
    if ((p.dateType.value == BasicDateOption.Launch && monthNumAfterLaunch >= 0) ||
      (p.dateType.value == BasicDateOption.Date && p.startDate.value <= monthStart)) {
      return ttl + 1;
    }
    return ttl;
  }, 0);
  forecast.estimatedRevenue.platforms.list.forEach(platform => {
    const detail = draftState.details.get(SubTotalType.GrossRevenue_SalesRevenue).get(platform.globalId)[i];
    detail.amount = 0;
    if ((platform.dateType.value == BasicDateOption.Launch && monthNumAfterLaunch >= 0) ||
      (platform.dateType.value == BasicDateOption.Date && platform.startDate.value <= monthStart)) {
      // taking a percentage of unit sales forecast and passing it in so we don't have units split
      //  across multiple platforms - may exagerate rounding effects at edges based on number of platforms (shifting units later)
      const unitsShare = platform.percentOfSales.value / totalPlatformSalesPercent;
      detail.amount = calculateEstimatedSalesRevenue(
        forecast.estimatedRevenue.targetPrice.value,
        forecast.estimatedRevenue.targetUnitsSold.value * unitsShare,
        monthNumAfterLaunch, EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x);
    }
    draftState.GrossRevenue_SalesRevenue[i].amount += detail.amount;
  });
}

// eslint-disable-next-line max-len
export function calculateEstimatedSalesRevenue(targetPrice: number, targetUnits: number, monthAfterLaunch: number, curveType: EstimatedSalesCurve): number {
  switch (curveType) {
    case EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x:
      return roundCurrency(targetPrice * getUnitsForFirstWeekToFirstYearModel(targetUnits, monthAfterLaunch, 3));
    default:
      throw new Error("Unsupported sales estimation curve type");
  }
}


function getUnitsForFirstWeekToFirstYearModel(targetUnitsFor18Mo: number, currentMonth: number, firstYearToFirstWeekRatio: number) {
  // equation, R is ratio, M is 0-based num of months: value = x/R + x * (R-1)/R * M/11
  // solve for 18 months to back into 12 month value:
  //    value18 = x/R + x * (R-1)/R * (18-1)/11
  //    x = value18 / (1/R + ((R-1)/R * 17/11))
  // TODO - memoize this calc
  const r = firstYearToFirstWeekRatio;
  const month12 = targetUnitsFor18Mo / (1 / r + ((r - 1) / r * 17 / 11));

  const firstMonth = month12 / r;
  const laterMonth = month12 * (r - 1) / r * 1 / 11;

  // this gives you 1 fraction of sales on first month then even sales from there forward
  //  currentMonth is 0 index, so we can do straight math
  const thisMonth = firstMonth + laterMonth * currentMonth;
  // eslint-disable-next-line max-len
  const lastMonth = Math.floor(currentMonth > 0 ? (firstMonth + laterMonth * (currentMonth - 1)) : 0);

  return Math.floor(thisMonth - lastMonth);
}
