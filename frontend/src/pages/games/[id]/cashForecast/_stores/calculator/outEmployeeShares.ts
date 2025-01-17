import type { WritableDraft } from "immer/dist/types/types-external";
import { roundCurrency } from "../../../../../../utilities/currency";
import { AdditionalEmployeeExpenseType } from "../../_types/cashForecast";
import type { ICashForecast } from "../../_types/cashForecast";
import { SubTotalType } from "./types";
import type { IProjectedCashFlowData } from "./types";

export function applyEmployeeSharesOut(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number
): void {

  // don't reset this, it's reset from outside:  draftState.TaxesAndProfitSharing_ProfitSharing[i].amount = 0;
  forecast.employees.list.forEach(employee => {
    if (draftState.details.get(SubTotalType.TaxesAndProfitSharing_ProfitSharing).has(employee.globalId)) {
      const detail = draftState.details.get(SubTotalType.TaxesAndProfitSharing_ProfitSharing).get(employee.globalId)[i];
      detail.amount = 0;

      if (draftState.NetProfit[i].amount <= 0) return;

      employee.additionalPay.list.forEach(ap => {
        if (ap.type.value === AdditionalEmployeeExpenseType.NetProfitShare) {
          detail.amount = roundCurrency(-1 * ap.amount.value * draftState.NetProfit[i].amount);
        }
      });
      draftState.TaxesAndProfitSharing_ProfitSharing[i].amount += detail.amount;
    }
  });
}
