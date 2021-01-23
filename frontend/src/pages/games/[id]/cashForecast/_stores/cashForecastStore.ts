import { createEventStore } from "../../../../_stores/eventStore/eventStore";
import { createLocalStore } from "../../../../_stores/eventStore/localStore";
import { createImmutableEventApplier, search } from "../../../../_stores/eventStore/eventApplier";
import { Identified, IEvent, IEventApplier, IIdentifiedList, IIdentifiedPrimitive, OperationType, ValueType } from "../../../../_stores/eventStore/types";
import { ICashForecast, LoanType } from "../_types/cashForecast";
import { api } from "./cashForecastApi";
import { operations } from "../../../../_stores/eventStore/operationsFactory";

type Evt = IEvent<ICashForecast>;
type IdentifiedValueUpdate<T> = Identified & { value: T };

type NamedThing = { constructor: { name: string } };

const primitiveFactory = {
  makeUpdate: <T extends NamedThing>(eventName: string, valueType: ValueType) => {
    return {
      get: ({ parentId, globalId, value }: IdentifiedValueUpdate<T>): Evt => {
        return cashForecastEventStore.createEvent(() => ({
          type: eventName,
          operations: [
            { action: OperationType.Set, $type: valueType, objectId: globalId, parentId, value }
          ]
        }));
      },
      apply: (model: ICashForecast, event: Evt): void => {
        // const primitive = getPrimitive(model, event);
        const primitive = search(model, { parentId: event.operations[0].parentId, globalId: event.operations[0].objectId });
        if (primitive == null) return;
        primitive.value = event.operations[0].value;

        console.log({ isMatch: primitive.globalId == event.operations[0].objectId, primitive, id: { parentId: event.operations[0].parentId, globalId: event.operations[0].objectId } });
      }
    };
  }
};

const basicListFactory = {
  makeAdd: (eventName: string, valueType: ValueType, getParent: (ICashForecast, Evt) => IIdentifiedList<IIdentifiedPrimitive<string>>) => {
    return {
      get: ({ parentId, value }: { parentId: string, value: string }): Evt => {
        return cashForecastEventStore.createEvent((actor, seqNo) => ({
          type: eventName,
          operations: [
            { action: OperationType.Set, $type: valueType, objectId: `${seqNo}@${actor}`, parentId, value, insert: true },
          ]
        }));
      },
      apply: (model: ICashForecast, event: Evt): void => {
        const parent = getParent(model, event);
        if (!parent) return;
        parent.list.push({
          globalId: event.operations[0].objectId,
          parentId: event.operations[0].parentId,
          value: event.operations[0].value,
          field: event.operations[0].field
        });
      }
    };
  },
  makeUpdate: (eventName: string, valueType: ValueType, getParent: (ICashForecast, Evt) => IIdentifiedList<IIdentifiedPrimitive<string>>) => {
    return {
      get: ({ parentId, globalId, value }: IdentifiedValueUpdate<string>): Evt => {
        return cashForecastEventStore.createEvent(() => ({
          type: eventName,
          operations: [
            { action: OperationType.Set, $type: valueType, objectId: globalId, parentId, value }
          ]
        }));
      },
      apply: (model: ICashForecast, event: Evt): void => {
        const parent = getParent(model, event);
        if (!parent) return;
        const eIndex = parent.list.findIndex(e => e.globalId == event.operations[0].objectId);
        if (eIndex == -1) {
          // conflict/out of order event
          return;
        }
        parent.list[eIndex].value = event.operations[0].value;
      }
    };
  },
  makeDelete: (eventName: string, valueType: ValueType, getParent: (ICashForecast, Evt) => IIdentifiedList<IIdentifiedPrimitive<string>>) => {
    return {
      get: ({ parentId, globalId }: Identified): Evt => {
        return cashForecastEventStore.createEvent(() => ({
          type: eventName,
          operations: [
            { action: OperationType.Delete, $type: valueType, objectId: globalId, parentId }
          ]
        }));
      },
      apply: (model: ICashForecast, event: Evt): void => {
        const parent = getParent(model, event);
        if (!parent) return;
        const eIndex = parent.list.findIndex(e => e.globalId == event.operations[0].objectId);
        if (eIndex == -1) {
          // conflict/out of order event
          return;
        }
        parent.list.splice(eIndex, 1);
      }
    };
  }
};

const rawEvents = {
  "SetBankBalanceName": primitiveFactory.makeUpdate<string>("SetBankBalanceName", ValueType.string),
  "SetBankBalanceAmount": primitiveFactory.makeUpdate<number>("SetBankBalanceAmount", ValueType.decimal),
  "AddLoan": {
    get: ({ parentId, date }: { parentId: string, date: Date }): Evt => {
      return cashForecastEventStore.createEvent((actor, seqNo) => ({
        type: "AddLoan",
        operations: [
          operations.makeObject(parentId, `${seqNo}@${actor}`),
          operations.set(`${seqNo}@${actor}`, `${seqNo + 1}@${actor}`, ValueType.string, "", "name"),
          operations.set(`${seqNo}@${actor}`, `${seqNo + 2}@${actor}`, ValueType.integer, LoanType.OneTime, "type"),
          operations.makeList(`${seqNo}@${actor}`, `${seqNo + 3}@${actor}`, "cashIn"),
          operations.makeObject(`${seqNo + 3}@${actor}`, `${seqNo + 4}@${actor}`),
          operations.set(`${seqNo + 4}@${actor}`, `${seqNo + 5}@${actor}`, ValueType.date, date.toISOString(), "date"),
          operations.set(`${seqNo + 4}@${actor}`, `${seqNo + 6}@${actor}`, ValueType.decimal, 0, "amount"),
        ]
      }));
    },
    apply: (model: ICashForecast, event: Evt): void => {
      const { operations } = event;
      if (event.operations[0].parentId == model.loans.globalId) {
        model.loans.list.push({
          globalId: operations[0].objectId,
          parentId: operations[0].parentId,
          name: { globalId: operations[1].objectId, parentId: operations[1].parentId, value: operations[1].value, field: operations[1].field },
          type: { globalId: operations[2].objectId, parentId: operations[2].parentId, value: operations[2].value, field: operations[2].field },
          cashIn: {
            globalId: operations[3].objectId, parentId: operations[3].parentId, field: operations[3].field, list: [
              {
                globalId: operations[4].objectId,
                parentId: operations[4].parentId,
                date: { globalId: operations[5].objectId, parentId: operations[5].parentId, value: new Date(operations[5].value), field: operations[5].field },
                amount: { globalId: operations[6].objectId, parentId: operations[6].parentId, value: (operations[6].value as LoanType), field: operations[6].field },
              },
            ]
          },
          repaymentTerms: null
        });
      }
    }
  },
  "SetLoanName": primitiveFactory.makeUpdate<string>("SetLoanName", ValueType.string),
  "SetLoanType": primitiveFactory.makeUpdate<LoanType>("SetLoanType", ValueType.integer),
  "SetLoanCashInDate": primitiveFactory.makeUpdate<Date>("SetLoanCashInDate", ValueType.date),
  "SetLoanCashInAmount": primitiveFactory.makeUpdate<number>("SetLoanCashInAmount", ValueType.decimal),
};

export const events = {
  "SetBankBalanceName": rawEvents.SetBankBalanceName.get,
  "SetBankBalanceAmount": rawEvents.SetBankBalanceAmount.get,
  "AddLoan": rawEvents.AddLoan.get,
  "SetLoanName": rawEvents.SetLoanName.get,
  "SetLoanType": rawEvents.SetLoanType.get,
  "SetLoanCashInDate": rawEvents.SetLoanCashInDate.get,
  "SetLoanCashInAmount": rawEvents.SetLoanCashInAmount.get,
};

export const eventApplier: IEventApplier<ICashForecast> = createImmutableEventApplier(Object.keys(rawEvents).reduce((result, key) => {
  result[key] = rawEvents[key].apply;
  return result;
}, {}));
export const cashForecastEventStore = createEventStore(api, eventApplier);
export const cashForecastLocalStore = createLocalStore(cashForecastEventStore, eventApplier);

