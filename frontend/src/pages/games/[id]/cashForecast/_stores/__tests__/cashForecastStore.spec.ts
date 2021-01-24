import { createEmptyCashForecast } from "../../../../../../testUtils/dataModel";
import { getUtcDate } from "../../../../../../utilities/date";
import { LoanType } from "../../_types/cashForecast";
import { cashForecastEventStore, eventApplier, events } from "../cashForecastStore";

cashForecastEventStore.initialize("unit-test", "1", { testMode: true });

describe("cashForecastEventStore", () => {

  describe("eventApplier", () => {
    it("SetBankBalanceName", () => {
      const model = createEmptyCashForecast();
      const originalValue = model.bankBalance.name.value;
      const event = events.SetBankBalanceName({
        parentId: model.bankBalance.name.parentId,
        globalId: model.bankBalance.name.globalId
      }, "new name");
      const applied = eventApplier.apply(model, event);
      expect(applied.bankBalance.name.value).toBe("new name");
      expect(model.bankBalance.name.value).toBe(originalValue);
    });

    it("SetBankBalanceName - bad id, conflict logic means does not alter value", () => {
      const model = createEmptyCashForecast();
      const originalValue = model.bankBalance.name.value;
      const event = events.SetBankBalanceName({
        parentId: model.bankBalance.name.parentId + 'a',
        globalId: model.bankBalance.name.globalId
      }, "new name");
      const applied = eventApplier.apply(model, event);
      expect(applied.bankBalance.name.value).toBe(originalValue);
    });

    it("SetBankBalanceAmount", () => {
      const model = createEmptyCashForecast();
      const originalValue = model.bankBalance.amount.value;
      const event = events.SetBankBalanceAmount({
        parentId: model.bankBalance.amount.parentId,
        globalId: model.bankBalance.amount.globalId
      }, 123.45);
      const applied = eventApplier.apply(model, event);
      expect(applied.bankBalance.amount.value).toBe(123.45);
      expect(model.bankBalance.amount.value).toBe(originalValue);
    });

    it("SetBankBalanceAmount - bad id, conflict logic means does not alter value", () => {
      const model = createEmptyCashForecast();
      const originalValue = model.bankBalance.amount.value;
      const event = events.SetBankBalanceAmount({
        parentId: model.bankBalance.amount.parentId + 'a',
        globalId: model.bankBalance.amount.globalId
      }, 123.45);
      const applied = eventApplier.apply(model, event);
      expect(applied.bankBalance.amount.value).toBe(originalValue);
    });

    it("AddLoan", () => {
      const model = createEmptyCashForecast();
      const expectedDate = getUtcDate(2022, 0, 1);
      const event = events.AddLoan(model.loans.globalId, { date: expectedDate });
      const applied = eventApplier.apply(model, event);
      expect(applied.loans.list.length).toBe(1);
      expect(applied.loans.list[0].name.value).toBe("");
      expect(applied.loans.list[0].type.value).toBe(LoanType.OneTime);
      expect(applied.loans.list[0].repaymentTerms).toBeUndefined();
      expect(applied.loans.list[0].cashIn.list.length).toBe(1);
      expect(applied.loans.list[0].cashIn.list[0].date.value).toEqual(expectedDate);
      expect(applied.loans.list[0].cashIn.list[0].amount.value).toEqual(0);
      expect(model.loans.list.length).toBe(0);
    });

    describe("LoanEvents", () => {
      const premodel = createEmptyCashForecast();
      const event = events.AddLoan(premodel.loans.globalId, { date: getUtcDate(2022, 0, 1) });
      const model = eventApplier.apply(premodel, event);
      console.log({ l: model.loans.list });

      it("SetLoanName", () => {
        const originalValue = model.loans.list[0].name.value;
        const expectedValue = originalValue + "123";
        const event = events.SetLoanName({
          parentId: model.loans.list[0].name.parentId,
          globalId: model.loans.list[0].name.globalId
        }, expectedValue);
        console.log({ op: event.operations[0], l: model.loans.list[0].name });
        const applied = eventApplier.apply(model, event);
        expect(applied.loans.list[0].name.value).toBe(expectedValue);
        expect(model.loans.list[0].name.value).not.toBe(expectedValue);
      });

      it("SetLoanType", () => {
        const originalValue = model.loans.list[0].type.value;
        const event = events.SetLoanType({
          parentId: model.loans.list[0].type.parentId,
          globalId: model.loans.list[0].type.globalId
        }, LoanType.Multiple);
        const applied = eventApplier.apply(model, event);
        expect(applied.loans.list[0].type.value).toBe(LoanType.Multiple);
        expect(model.loans.list[0].type.value).toBe(originalValue);
      });

      it("SetLoanCashInDate on first CashIn", () => {
        const originalValue = model.loans.list[0].cashIn.list[0].date.value;
        const expectedDate = getUtcDate(2025, 4, 3);
        const event = events.SetLoanCashInDate({
          parentId: model.loans.list[0].cashIn.list[0].date.parentId,
          globalId: model.loans.list[0].cashIn.list[0].date.globalId
        }, expectedDate);
        const applied = eventApplier.apply(model, event);
        expect(applied.loans.list[0].cashIn.list[0].date.value).toEqual(expectedDate);
        expect(model.loans.list[0].cashIn.list[0].date.value).toBe(originalValue);
      });

      it("SetLoanCashInAmount on first CashIn", () => {
        const originalValue = model.loans.list[0].cashIn.list[0].amount.value;
        const expectedValue = originalValue + 123456.78;
        const event = events.SetLoanCashInAmount({
          parentId: model.loans.list[0].cashIn.list[0].amount.parentId,
          globalId: model.loans.list[0].cashIn.list[0].amount.globalId
        }, expectedValue);
        const applied = eventApplier.apply(model, event);
        expect(applied.loans.list[0].cashIn.list[0].amount.value).toBe(expectedValue);
        expect(model.loans.list[0].cashIn.list[0].amount.value).toBe(originalValue);
      });
    });

    // todo: AddCashIn, DeleteCashIn, test the 2 events agsint a 2nd CashIn
    //        UI for 1 row vs multiple
    //      Back-end for these events
    //      What happens if we build a search tree?

  });
});
