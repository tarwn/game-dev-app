import type { WritableDraft } from "immer/dist/types/types-external";
import { getUtcDate } from "../../../../../../utilities/date";
import { ICashForecast, LoanRepaymentType } from "../../_types/cashForecast";
import { IProjectedCashFlowData, SubTotalType } from "./types";

export function applyLoansOut(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  monthStart: Date,
  monthEnd: Date
): void {
  draftState.OtherCash_LoanOut[i].amount = 0;
  forecast.loans.list.forEach(loan => {
    const detail = draftState.details.get(SubTotalType.OtherCash_LoanOut).get(loan.globalId)[i];
    detail.amount = 0;

    loan.repaymentTerms?.cashOut.list.forEach(co => {
      const monthlyLoanEnd = getUtcDate(
        co.startDate.value.getUTCFullYear(),
        co.startDate.value.getUTCMonth() + co.numberOfMonths.value - 1,
        co.startDate.value.getUTCDate()
      );
      switch (co.type.value) {
        case LoanRepaymentType.OneTime:
          if (co.startDate.value >= monthStart && co.startDate.value < monthEnd) {
            detail.amount += 0 - co.amount.value;
          }
          break;
        case LoanRepaymentType.Monthly:
          if (co.startDate.value < monthEnd && monthlyLoanEnd >= monthStart) {
            detail.amount += 0 - co.amount.value;
          }

          break;
      }
    });

    draftState.OtherCash_LoanOut[i].amount += detail.amount;
  });
}
