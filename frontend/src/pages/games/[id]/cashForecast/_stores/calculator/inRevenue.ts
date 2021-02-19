import type { WritableDraft } from "immer/dist/types/types-external";
import { ICashForecast, RevenueModelType } from "../../_types/cashForecast";
import { IProjectedCashFlowData, SubTotalType } from "./types";

export function applySalesRevenue(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  monthStart: Date,
  monthEnd: Date
): void {
  draftState.GrossRevenue_SalesRevenue[i].amount = 0;
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
}
