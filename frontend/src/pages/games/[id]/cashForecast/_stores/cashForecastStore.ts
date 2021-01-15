import { createEventStore } from "../../../../_stores/eventStore/eventStore";
import { createLocalStore } from "../../../../_stores/eventStore/localStore";
import { createImmutableEventApplier } from "../../../../_stores/eventStore/eventApplier";
import { Identified, IEvent, IEventApplier, IIdentifiedList, IIdentifiedPrimitive, OperationType } from "../../../../_stores/eventStore/types";
import type { ICashForecast } from "../_types/cashForecast";
import { api } from "./cashForecastApi";
import { operations } from "../../../../_stores/eventStore/operationsFactory";

type Evt = IEvent<ICashForecast>;
type IdentifiedValueUpdate<T> = Identified & { value: T };

const primitiveFactory = {
  makeUpdate: <T>(type: string, getPrimitive: (ICashForecast, Evt) => IIdentifiedPrimitive<T>) => {
    return {
      get: ({ parentId, globalId, value }: IdentifiedValueUpdate<T>): Evt => {
        return cashForecastEventStore.createEvent(() => ({
          type,
          operations: [
            { action: OperationType.Set, objectId: globalId, parentId, value }
          ]
        }));
      },
      apply: (model: ICashForecast, event: Evt): void => {
        const primitive = getPrimitive(model, event);
        if (primitive == null) return;
        primitive.value = event.operations[0].value;
      }
    };
  }
};

const basicListFactory = {
  makeAdd: (type: string, getParent: (ICashForecast, Evt) => IIdentifiedList<IIdentifiedPrimitive<string>>) => {
    return {
      get: ({ parentId, value }: { parentId: string, value: string }): Evt => {
        return cashForecastEventStore.createEvent((actor, seqNo) => ({
          type,
          operations: [
            { action: OperationType.Set, objectId: `${seqNo}@${actor}`, parentId, value, insert: true },
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
  makeUpdate: (type: string, getParent: (ICashForecast, Evt) => IIdentifiedList<IIdentifiedPrimitive<string>>) => {
    return {
      get: ({ parentId, globalId, value }: IdentifiedValueUpdate<string>): Evt => {
        return cashForecastEventStore.createEvent(() => ({
          type,
          operations: [
            { action: OperationType.Set, objectId: globalId, parentId, value }
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
  makeDelete: (type: string, getParent: (ICashForecast, Evt) => IIdentifiedList<IIdentifiedPrimitive<string>>) => {
    return {
      get: ({ parentId, globalId }: Identified): Evt => {
        return cashForecastEventStore.createEvent(() => ({
          type,
          operations: [
            { action: OperationType.Delete, objectId: globalId, parentId }
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
  "SetBankBalanceAmount": primitiveFactory.makeUpdate<number>("SetBankBalanceAmount", (model, event) => {
    if (model.bankBalance.globalId != event.operations[0].parentId || model.bankBalance.amount.globalId != event.operations[0].objectId) {
      // bank balance some how has diff id's
      return null;
    }
    return model.bankBalance.amount;
  })
};

export const events = {
  "SetBankBalanceAmount": rawEvents.SetBankBalanceAmount.get,
};

export const eventApplier: IEventApplier<ICashForecast> = createImmutableEventApplier(Object.keys(rawEvents).reduce((result, key) => {
  result[key] = rawEvents[key].apply;
  return result;
}, {}));
export const cashForecastEventStore = createEventStore(api, eventApplier);
export const cashForecastLocalStore = createLocalStore(cashForecastEventStore, eventApplier);

