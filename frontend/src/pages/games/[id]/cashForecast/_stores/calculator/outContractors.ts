import type { WritableDraft } from "immer/dist/types/types-external";
import { ContractorExpenseFrequency, ExpenseCategory, ICashForecast } from "../../_types/cashForecast";
import { ICashValue, IProjectedCashFlowData, SubTotalType } from "./types";

export function applyDirectContractorsOut(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  monthStart: Date,
  monthEnd: Date
): void {
  applyContractorsOut(forecast, i, monthStart, monthEnd,
    draftState.GrossProfit_DirectContractors,
    draftState.details.get(SubTotalType.GrossProfit_DirectContractors),
    (category) => category === ExpenseCategory.DirectExpenses
  );
}

export function applyIndirectContractorsOut(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  monthStart: Date,
  monthEnd: Date
): void {
  applyContractorsOut(forecast, i, monthStart, monthEnd,
    draftState.NetProfit_IndirectContractors,
    draftState.details.get(SubTotalType.NetProfit_IndirectContractors),
    (category) => category !== ExpenseCategory.DirectExpenses
  );
}

function applyContractorsOut(
  forecast: ICashForecast,
  i: number,
  monthStart: Date,
  monthEnd: Date,
  subTotalGroup: WritableDraft<ICashValue>[],
  subTotalDetails: Map<string, WritableDraft<ICashValue>[]>,
  isRelevant: (category: ExpenseCategory) => boolean
): void {
  subTotalGroup[i].amount = 0;
  forecast.contractors.list.forEach(contractor => {
    if (isRelevant(contractor.category.value)) {
      const detail = subTotalDetails.get(contractor.globalId)[i];
      detail.amount = 0;
      contractor.payments.list.forEach(payment => {
        if (contractor.frequency.value == ContractorExpenseFrequency.Custom) {
          // one-time payments based on the month of the start date
          if (monthStart <= payment.startDate.value && monthEnd > payment.startDate.value) {
            detail.amount += -payment.amount.value;
          }
        }
        else if (contractor.frequency.value == ContractorExpenseFrequency.Monthly) {
          // monthly payment using start + end date - not pro-rating for now
          if (payment.startDate.value < monthEnd && payment.endDate.value >= monthStart) {
            detail.amount += -payment.amount.value;
          }
        }
        else {
          throw new Error("Unknown contractor payment frequency");
        }
      });

      subTotalGroup[i].amount += detail.amount;
    }
  });
}
