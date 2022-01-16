import type { WritableDraft } from "immer/dist/types/types-external";
import { getUtcDate } from "../../../../../../utilities/date";
import { LoanType } from "../../_types/cashForecast";
import type { ICashForecast } from "../../_types/cashForecast";
import { SubTotalType } from "./types";
import type { IProjectedCashFlowData } from "./types";

export function applyLoansIn(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  monthStart: Date,
  monthEnd: Date
): void {
  draftState.OtherCash_LoanIn[i].amount = 0;
  forecast.loans.list.forEach(loan => {
    const detail = draftState.details.get(SubTotalType.OtherCash_LoanIn).get(loan.globalId)[i];
    const monthlyLoanEnd = getUtcDate(
      loan.cashIn.list[0].date.value.getUTCFullYear(),
      loan.cashIn.list[0].date.value.getUTCMonth() + loan.numberOfMonths?.value - 1,
      loan.cashIn.list[0].date.value.getUTCDate()
    );
    detail.amount = 0;

    switch (loan.type.value) {
      case LoanType.OneTime:
        if (loan.cashIn.list[0].date.value >= monthStart && loan.cashIn.list[0].date.value < monthEnd) {
          detail.amount = loan.cashIn.list[0].amount.value;
        }
        break;
      case LoanType.Monthly:
        if (loan.cashIn.list[0].date.value < monthEnd && monthlyLoanEnd >= monthStart) {
          detail.amount = loan.cashIn.list[0].amount.value;
        }
        break;
      case LoanType.Multiple:
        detail.amount = loan.cashIn.list.reduce((ttl, cashIn) => {
          if (cashIn.date.value >= monthStart && cashIn.date.value < monthEnd) {
            return ttl + cashIn.amount.value;
          }
          return ttl;
        }, 0);
        break;
    }

    draftState.OtherCash_LoanIn[i].amount += detail.amount;
  });
}
