import type { WritableDraft } from "immer/dist/types/types-external";
import { roundCurrency } from "../../../../../../utilities/currency";
import { ICashForecast, NetIncomeCategory, TaxSchedule } from "../../_types/cashForecast";
import { IProjectedCashFlowData, SubTotalType } from "./types";

export function applyTaxesOut(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  monthStart: Date
): void {
  draftState.TaxesAndProfitSharing_Taxes[i].amount = 0;
  forecast.taxes.list.forEach(tax => {
    const detail = draftState.details.get(SubTotalType.TaxesAndProfitSharing_Taxes).get(tax.globalId)[i];
    detail.amount = 0;

    if (tax.schedule.value === TaxSchedule.Annual) {
      const currentMonth = monthStart.getUTCMonth();
      if (tax.dueDate.value.getUTCMonth() == currentMonth) {
        const amountToTax = getAmountToTax(tax.basedOn.value, draftState, i, 12);
        detail.amount += roundCurrency(-1 * tax.amount.value * amountToTax);
      }
    }
    else {
      throw new Error(`Unrecognized tax schedule provided ${tax.schedule.value} for tax id=${tax.globalId}`);
    }

    draftState.TaxesAndProfitSharing_Taxes[i].amount += detail.amount;
  });
}

function getAmountToTax(
  basedOn: NetIncomeCategory,
  draftState: WritableDraft<IProjectedCashFlowData>,
  curMonth: number,
  numMonths: number
): number {
  let group;
  switch (basedOn) {
    case NetIncomeCategory.GrossRevenueShare:
      group = draftState.GrossRevenue_SalesRevenue;
      break;
    case NetIncomeCategory.GrossProfitShare:
      group = draftState.GrossProfit;
      break;
    case NetIncomeCategory.NetProfitShare:
      group = draftState.NetProfit;
      break;
    default:
      throw new Error(`Unrecognized tax basedOn group ${basedOn}`);
  }

  let total = 0;
  for (let i = Math.max(0, curMonth - numMonths + 1); i <= curMonth; i++) {
    total += group[i].amount;
  }

  if (total <= 0)
    return 0;
  return total;
}
