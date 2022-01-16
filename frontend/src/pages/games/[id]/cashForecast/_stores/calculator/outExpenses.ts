import type { WritableDraft } from "immer/dist/types/types-external";
import { ExpenseCategory, ExpenseFrequency, ExpenseUntil } from "../../_types/cashForecast";
import type { ICashForecast } from "../../_types/cashForecast";
import { SubTotalType } from "./types";
import type { ICashValue, IProjectedCashFlowData } from "./types";

export function applyDirectExpensesOut(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  monthStart: Date,
  monthEnd: Date
): void {
  applyExpensesOut(forecast, i, monthStart, monthEnd,
    draftState.GrossProfit_DirectExpenses,
    draftState.details.get(SubTotalType.GrossProfit_DirectExpenses),
    (category) => category === ExpenseCategory.DirectExpenses
  );
}

export function applyIndirectExpensesOut(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  monthStart: Date,
  monthEnd: Date
): void {
  applyExpensesOut(forecast, i, monthStart, monthEnd,
    draftState.NetProfit_IndirectExpenses,
    draftState.details.get(SubTotalType.NetProfit_IndirectExpenses),
    (category) => category !== ExpenseCategory.DirectExpenses
  );
}

function applyExpensesOut(
  forecast: ICashForecast,
  i: number,
  monthStart: Date,
  monthEnd: Date,
  subTotalGroup: WritableDraft<ICashValue>[],
  subTotalDetails: Map<string, WritableDraft<ICashValue>[]>,
  isRelevant: (category: ExpenseCategory) => boolean
): void {
  subTotalGroup[i].amount = 0;
  forecast.expenses.list.forEach(expense => {
    if (isRelevant(expense.category.value)) {
      const detail = subTotalDetails.get(expense.globalId)[i];
      detail.amount = 0;

      const endDate = (expense.until.value == ExpenseUntil.Date
        ? expense.endDate.value
        : forecast.launchDate.value
      );
      switch (expense.frequency.value) {
        case ExpenseFrequency.OneTime:
          if (expense.startDate.value >= monthStart && expense.startDate.value < monthEnd) {
            detail.amount += -expense.amount.value;
          }
          break;
        case ExpenseFrequency.Monthly:
          if (expense.startDate.value < monthEnd && endDate >= monthStart) {
            detail.amount += -expense.amount.value;
          }
          break;
        case ExpenseFrequency.Annual:
          if (expense.startDate.value.getUTCMonth() == monthStart.getUTCMonth() &&
            expense.startDate.value < monthEnd &&
            endDate >= monthStart
          ) {
            detail.amount += -expense.amount.value;
          }
          break;
        default:
          throw new Error(`Expense does not support frequency of ${expense.frequency.value} (id='${expense.globalId}')`);
      }

      subTotalGroup[i].amount += detail.amount;
    }
  });
}
