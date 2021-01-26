import { createEventStore } from "../../../../_stores/eventStore/eventStore";
import { createLocalStore } from "../../../../_stores/eventStore/localStore";
import { createImmutableAutomaticEventApplier } from "../../../../_stores/eventStore/eventApplier";
import { Identified, IEvent, ValueType } from "../../../../_stores/eventStore/types";
import { CashOutType, ICashForecast, ICashOut, LoanType, RepaymentType } from "../_types/cashForecast";
import { api } from "./cashForecastApi";
import { createAutomaticEventFactory, opsFactory } from "../../../../_stores/eventStore/eventFactory";

export const eventApplier = createImmutableAutomaticEventApplier<ICashForecast>();
export const cashForecastEventStore = createEventStore(api, eventApplier);
export const cashForecastLocalStore = createLocalStore(cashForecastEventStore, eventApplier);

const eventfactory = createAutomaticEventFactory(cashForecastEventStore);
export const events = {
  "SetBankBalanceName": eventfactory.createPropUpdate<string>("SetBankBalanceName", ValueType.string),
  "SetBankBalanceAmount": eventfactory.createPropUpdate<number>("SetBankBalanceAmount", ValueType.decimal),
  "AddLoan": eventfactory.createObjectInsert<{ date: Date }>("AddLoan", undefined, [
    (ids, nextId) => opsFactory.insertProp(ids[0], nextId, ValueType.string, "", "name"),
    (ids, nextId) => opsFactory.insertProp(ids[0], nextId, ValueType.integer, LoanType.OneTime, "type"),
    (ids, nextId) => opsFactory.insertList(ids[0], nextId, "cashIn"),
    (ids, nextId) => opsFactory.insertObject(ids[3], nextId),
    (ids, nextId, args) => opsFactory.insertProp(ids[4], nextId, ValueType.date, args.date.toISOString(), "date"),
    (ids, nextId) => opsFactory.insertProp(ids[4], nextId, ValueType.decimal, 0, "amount")
  ]),
  "SetLoanName": eventfactory.createPropUpdate<string>("SetLoanName", ValueType.string),
  "SetLoanType": eventfactory.createPropUpdate<LoanType>("SetLoanType", ValueType.integer),
  "SetLoanTypeMonthly": (loanType: Identified, loanNumOfMonths: Identified, numberOfMonths: number): IEvent<ICashForecast> => {
    return cashForecastEventStore.createEvent((actor, seqNo) => ({
      type: "SetLoanTypeMonthly",
      operations: [
        opsFactory.updateProp(loanType.parentId, loanType.globalId, ValueType.integer, LoanType.Monthly),
        opsFactory.insertProp(loanType.parentId, loanNumOfMonths?.globalId ?? `${actor}-${seqNo + 1}`, ValueType.integer, numberOfMonths, "numberOfMonths")
      ]
    }));
  },
  "AddLoanNumberOfMonths": eventfactory.createPropInsert<number>("SetLoanNumberOfMonths", ValueType.integer, "numberOfMonths"),
  "SetLoanNumberOfMonths": eventfactory.createPropUpdate<number>("SetLoanNumberOfMonths", ValueType.integer),
  "AddLoanCashIn": eventfactory.createObjectInsert<{ date: Date }>("AddLoanCashIn", undefined, [
    (ids, nextId, args) => opsFactory.insertProp(ids[0], nextId, ValueType.date, args.date.toISOString(), "date"),
    (ids, nextId) => opsFactory.insertProp(ids[0], nextId, ValueType.decimal, 0, "amount")
  ]),
  // TODO - test + wire UI actions from here down
  "SetLoanCashInDate": eventfactory.createPropUpdate<Date>("SetLoanCashInDate", ValueType.date),
  "SetLoanCashInAmount": eventfactory.createPropUpdate<number>("SetLoanCashInAmount", ValueType.decimal),
  "DeleteLoanCashIn": eventfactory.createDelete("AddLoanCashIn", ValueType.object, undefined),
  "AddLoanRepaymentTerms": eventfactory.createObjectInsert<{ date: Date }>("AddLoanRepaymentTerms", undefined, [
    (ids, nextId) => opsFactory.insertProp(ids[0], nextId, ValueType.integer, RepaymentType.Monthly, "type"),
    (ids, nextId) => opsFactory.insertList(ids[0], nextId, "cashOut"),
    (ids, nextId) => opsFactory.insertObject(ids[2], nextId),
    (ids, nextId) => opsFactory.insertProp(ids[3], nextId, ValueType.integer, CashOutType.FixedAmount, "type"),
    (ids, nextId) => opsFactory.insertProp(ids[3], nextId, ValueType.decimal, 0, "amount"),
    (ids, nextId, args) => opsFactory.insertProp(ids[3], nextId, ValueType.date, args.date.toISOString(), "startDate"),
    (ids, nextId) => opsFactory.insertProp(ids[3], nextId, ValueType.decimal, 1, "limitFixedAmount"),
    (ids, nextId) => opsFactory.insertProp(ids[3], nextId, ValueType.integer, 1, "numberOfMonths")
  ]),
  "SetLoanRepaymentTermsType": eventfactory.createPropUpdate<RepaymentType>("SetLoanRepaymentTermsType", ValueType.integer),
  "AddLoanRepaymentTermsCashOut": eventfactory.createObjectInsert<{ date: Date }>("AddLoanRepaymentTermsCashOut", undefined, [
    (ids, nextId) => opsFactory.insertObject(ids[0], nextId),
    (ids, nextId) => opsFactory.insertProp(ids[1], nextId, ValueType.integer, CashOutType.FixedAmount, "type"),
    (ids, nextId) => opsFactory.insertProp(ids[1], nextId, ValueType.decimal, 0, "amount"),
    (ids, nextId, args) => opsFactory.insertProp(ids[1], nextId, ValueType.date, args.date.toISOString(), "startDate"),
    (ids, nextId) => opsFactory.insertProp(ids[1], nextId, ValueType.decimal, 1, "limitFixedAmount"),
    (ids, nextId) => opsFactory.insertProp(ids[1], nextId, ValueType.integer, 1, "numberOfMonths")
  ]),
  "DeleteLoanRepaymentTermsCashOut": eventfactory.createDelete("DeleteLoanRepaymentTermsCashOut", ValueType.object, undefined),
  "SetLoanRepaymentTermsCashOutType": (cashOut: ICashOut, type: CashOutType, amount: number): IEvent<ICashForecast> => {
    return cashForecastEventStore.createEvent(() => ({
      type: "SetLoanRepaymentTermsCashOutType",
      operations: [
        opsFactory.updateProp(cashOut.type.parentId, cashOut.type.globalId, ValueType.integer, type),
        opsFactory.insertProp(cashOut.amount.parentId, cashOut.amount.globalId, ValueType.decimal, amount, "amount")
      ]
    }));
  },
  "SetLoanRepaymentTermsCashOutAmount": eventfactory.createPropUpdate<number>("SetLoanRepaymentTermsCashOutAmount", ValueType.decimal),
  "SetLoanRepaymentTermsCashOutStartDate": eventfactory.createPropUpdate<Date>("SetLoanRepaymentTermsCashOutStartDate", ValueType.date),
  "SetLoanRepaymentTermsCashOutLimitFixedAmount": eventfactory.createPropUpdate<number>("SetLoanRepaymentTermsCashOutLimitFixedAmount", ValueType.date),
  "SetLoanRepaymentTermsCashOutNumberOfMonths": eventfactory.createPropUpdate<CashOutType>("SetLoanRepaymentTermsCashOutNumberOfMonths", ValueType.date),
};

