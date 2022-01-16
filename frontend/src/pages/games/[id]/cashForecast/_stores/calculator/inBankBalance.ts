import type { WritableDraft } from "immer/dist/types/types-external";
import type { ICashForecast } from "../../_types/cashForecast";
import { SubTotalType } from "./types";
import type { IProjectedCashFlowData } from "./types";

export function applyBankBalance(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  monthStart: Date,
  monthEnd: Date
): void {
  draftState.details.get(SubTotalType.BeginningCash_Balances).get(forecast.bankBalance.globalId)[i].amount =
    (forecast.bankBalance.date.value >= monthStart && forecast.bankBalance.date.value < monthEnd)
      ? forecast.bankBalance.amount.value
      : 0;

  draftState.BeginningCash_Balances[i].amount =
    draftState.details.get(SubTotalType.BeginningCash_Balances).get(forecast.bankBalance.globalId)[i].amount;

  draftState.BeginningCash[i].amount =
    draftState.BeginningCash_Balances[i].amount +
    (i === 0 ? 0 : draftState.EndingCash[i - 1].amount);
}

