import type { WritableDraft } from "immer/dist/types/types-external";
import { roundCurrency } from "../../../../../../utilities/currency";
import { AdditionalEmployeeExpenseFrequency, AdditionalEmployeeExpenseType, ICashForecast } from "../../_types/cashForecast";
import { ExpenseCategory } from "../../_types/cashForecast";
import { IProjectedCashFlowData, SubTotalType } from "./types";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export function applyDirectEmployeesOut(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  monthStart: Date,
  monthEnd: Date
): void {
  draftState.GrossProfit_DirectEmployees[i].amount = 0;
  forecast.employees.list.forEach(employee => {
    if (employee.category.value === ExpenseCategory.DirectExpenses) {
      const detail = draftState.details.get(SubTotalType.GrossProfit_DirectEmployees).get(employee.globalId)[i];

      if (employee.startDate.value < monthEnd && employee.endDate.value >= monthStart) {
        const proRate = getProRate(monthStart, monthEnd, employee.startDate.value, employee.endDate.value);
        // prorate * salary * 1 + (benefits %)
        detail.amount = roundCurrency(-1 * proRate * employee.salaryAmount.value * (1 + employee.benefitsPercent.value));
        // bonus
        employee.additionalPay.list.forEach(pay => {
          const date = pay.frequency.value === AdditionalEmployeeExpenseFrequency.Date ? pay.date.value : forecast.launchDate.value;
          switch (pay.type.value) {
            case AdditionalEmployeeExpenseType.BonusDollarsAnnual:
              if (date.getUTCMonth() == monthStart.getUTCMonth()) {
                detail.amount += -pay.amount.value;
              }
              break;
            case AdditionalEmployeeExpenseType.BonusPercentAnnual:
              if (date.getUTCMonth() == monthStart.getUTCMonth()) {
                detail.amount += -roundCurrency(pay.amount.value * employee.salaryAmount.value * 12);
              }
              break;
            case AdditionalEmployeeExpenseType.BonusDollarsOnce:
              if (date >= monthStart && date < monthEnd) {
                detail.amount += -pay.amount.value;
              }
              break;
            case AdditionalEmployeeExpenseType.BonusPercentOnce:
              if (date >= monthStart && date < monthEnd) {
                detail.amount += -roundCurrency(pay.amount.value * employee.salaryAmount.value * 12);
              }
              break;
            case AdditionalEmployeeExpenseType.NetProfitShare:
              // TBD - will handle later as seperate method for profit sharing category
              break;
          }
        });
      }

      draftState.GrossProfit_DirectEmployees[i].amount += detail.amount;
    }
  });
}

function getProRate(monthStart: Date, monthEnd: Date, employeeStartDate: Date, employeeEndDate: Date) {
  // note: need to bump last day for employee to include that day in prorated pay
  const start = Math.max(monthStart.getTime(), employeeStartDate.getTime());
  const end = Math.min(monthEnd.getTime(), employeeEndDate.getTime() + ONE_DAY_IN_MS);
  return roundish((end - start) / (monthEnd.getTime() - monthStart.getTime()));
}

function roundish(value) {
  return (100 * value) / 100;
}
