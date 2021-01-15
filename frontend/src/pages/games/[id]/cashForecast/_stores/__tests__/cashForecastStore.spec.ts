import { createEmptyCashForecast } from "../../../../../../testUtils/dataModel";
import type { ICashForecast } from "../../_types/cashForecast";
import { cashForecastEventStore, eventApplier, events } from "../cashForecastStore";

cashForecastEventStore.initialize("unit-test", "1", { testMode: true });

function getSampleModel() {
  return {
    globalId: 'ut',
    bankBalance: {
      parentId: 'ut',
      globalId: 'ut:b',
      amount: { parentId: 'ut:b', globalId: 'ut:b:a', value: 0 }
    }
  } as ICashForecast;
}

describe("cashForecastEventStore", () => {
  describe("eventApplier", () => {
    it("SetBankBalanceAmount", () => {
      const model = getSampleModel();
      const originalValue = model.bankBalance.amount.value;
      const event = events.SetBankBalanceAmount({
        parentId: model.bankBalance.amount.parentId,
        globalId: model.bankBalance.amount.globalId,
        value: 123.45
      });
      const applied = eventApplier.apply(model, event);
      expect(applied.bankBalance.amount.value).toBe(123.45);
      expect(model.bankBalance.amount.value).toBe(originalValue);
    });

    it("SetBankBalanceAmount - bad id, conflict logic means does not alter value", () => {
      const model = getSampleModel();
      const originalValue = model.bankBalance.amount.value;
      const event = events.SetBankBalanceAmount({
        parentId: model.bankBalance.amount.parentId + 'a',
        globalId: model.bankBalance.amount.globalId,
        value: 123.45
      });
      const applied = eventApplier.apply(model, event);
      expect(applied.bankBalance.amount.value).toBe(originalValue);
    });
  });
});
