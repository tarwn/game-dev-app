import type { WritableDraft } from "immer/dist/types/types-external";
import { ICashForecast, LoanType } from "../../_types/cashForecast";
import { IProjectedCashFlowData, SubTotalType } from "./types";

export function applyFundingIn(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  monthStart: Date,
  monthEnd: Date
): void {
  draftState.OtherCash_FundingIn[i].amount = 0;
  forecast.funding.list.forEach(funding => {
    const detail = draftState.details.get(SubTotalType.OtherCash_FundingIn).get(funding.globalId)[i];
    detail.amount = 0;

    switch (funding.type.value) {
      case LoanType.OneTime:
        if (funding.cashIn.list[0].date.value >= monthStart && funding.cashIn.list[0].date.value < monthEnd) {
          detail.amount = funding.cashIn.list[0].amount.value;
        }
        break;
      case LoanType.Monthly:
        throw new Error("Monthly is not a valid type for a Funding");
      case LoanType.Multiple:
        detail.amount = funding.cashIn.list.reduce((ttl, cashIn) => {
          if (cashIn.date.value >= monthStart && cashIn.date.value < monthEnd) {
            return ttl + cashIn.amount.value;
          }
          return ttl;
        }, 0);
        break;
    }

    draftState.OtherCash_FundingIn[i].amount += detail.amount;
  });
}
