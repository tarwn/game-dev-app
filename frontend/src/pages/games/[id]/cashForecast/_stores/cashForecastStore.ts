import { createEventStore } from "../../../../_stores/eventStore/eventStore";
import { createLocalStore } from "../../../../_stores/eventStore/localStore";
import { createImmutableAutomaticEventApplier } from "../../../../_stores/eventStore/eventApplier";
import { ValueType } from "../../../../_stores/eventStore/types";
import { ICashForecast, LoanType } from "../_types/cashForecast";
import { api } from "./cashForecastApi";
import { createAutomaticEventFactory, opsFactory } from "../../../../_stores/eventStore/eventFactory";

export const eventApplier = createImmutableAutomaticEventApplier<ICashForecast>();
export const cashForecastEventStore = createEventStore(api, eventApplier);
export const cashForecastLocalStore = createLocalStore(cashForecastEventStore, eventApplier);

const eventfactory = createAutomaticEventFactory(cashForecastEventStore);
export const events = {
  "SetBankBalanceName": eventfactory.createPropUpdate("SetBankBalanceName", ValueType.string),
  "SetBankBalanceAmount": eventfactory.createPropUpdate("SetBankBalanceAmount", ValueType.decimal),
  "AddLoan": eventfactory.createObjectInsert<{ date: Date }>("AddLoan", undefined, [
    (ids, nextId) => opsFactory.insertProp(ids[0], nextId, ValueType.string, "", "name"),
    (ids, nextId) => opsFactory.insertProp(ids[0], nextId, ValueType.integer, LoanType.OneTime, "type"),
    (ids, nextId) => opsFactory.insertList(ids[0], nextId, "cashIn"),
    (ids, nextId) => opsFactory.insertObject(ids[3], nextId),
    (ids, nextId, args) => opsFactory.insertProp(ids[4], nextId, ValueType.date, args.date.toISOString(), "date"),
    (ids, nextId) => opsFactory.insertProp(ids[4], nextId, ValueType.decimal, 0, "amount")
  ]),
  "SetLoanName": eventfactory.createPropUpdate("SetLoanName", ValueType.string),
  "SetLoanType": eventfactory.createPropUpdate("SetLoanType", ValueType.integer),
  "SetLoanCashInDate": eventfactory.createPropUpdate("SetLoanCashInDate", ValueType.date),
  "SetLoanCashInAmount": eventfactory.createPropUpdate("SetLoanCashInAmount", ValueType.decimal),
};

