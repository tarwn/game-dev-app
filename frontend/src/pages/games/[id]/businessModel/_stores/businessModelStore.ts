import { createEventStore } from "./eventSystem/eventStore";
import { Identified, IEvent, IEventApplier, OperationType } from "./eventSystem/types";
import type { IBusinessModel } from "../_types/businessModel";
import { createLocalStore } from "./eventSystem/localStore";
import { createImmutableEventApplier } from "./eventSystem/eventApplier";
import { api } from "./businessModelApi";

type Evt = IEvent<IBusinessModel>;
type EvtMethod = {
  get: (args?: any) => Evt,
  apply: (model: IBusinessModel, event: Evt) => void
}

type IdentifiedValueUpdate<T> = Identified & { value: T };

const businessModelEvents = {
  "AddNewCustomer": {
    get: ({ parentId }: { parentId: string }): Evt => {
      return businessModelEventStore.createEvent((actor, seqNo) => ({
        type: "AddNewCustomer",
        operations: [
          { action: OperationType.MakeObject, objectId: `${seqNo}@${actor}`, parentId },
          { action: OperationType.Set, objectId: `${seqNo + 1}@${actor}`, parentId: `${seqNo}@${actor}`, field: "name", value: "" },
          { action: OperationType.MakeList, objectId: `${seqNo + 2}@${actor}`, parentId: `${seqNo}@${actor}`, field: "entries" },
          { action: OperationType.Set, objectId: `${seqNo + 3}@${actor}`, parentId: `${seqNo}@${actor}`, field: "type", value: "both" },
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      model.customers.list.push({
        globalId: event.operations[0].objectId,
        parentId: event.operations[0].parentId,
        name: { globalId: event.operations[1].objectId, parentId: event.operations[1].parentId, value: event.operations[1].value, field: event.operations[1].field },
        entries: { globalId: event.operations[2].objectId, parentId: event.operations[2].parentId, list: [], field: event.operations[2].field },
        type: { globalId: event.operations[3].objectId, parentId: event.operations[3].parentId, value: event.operations[3].value, field: event.operations[3].field },
      });
    }
  },
  "DeleteCustomer": {
    get: ({ parentId, globalId }: Identified): Evt => {
      return businessModelEventStore.createEvent(() => ({
        type: "DeleteCustomer",
        operations: [
          { action: OperationType.Delete, objectId: globalId, parentId }
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      const cIndex = model.customers.list.findIndex(c => c.globalId == event.operations[0].objectId);
      if (cIndex == -1) {
        // conflict/out of order event
        return;
      }
      model.customers.list.splice(cIndex, 1);
    }
  },
  "AddCustomerEntry": {
    get: ({ parentId, value }: { parentId: string, value: string }): Evt => {
      return businessModelEventStore.createEvent((actor, seqNo) => ({
        type: "AddCustomerEntry",
        operations: [
          { action: OperationType.Set, objectId: `${seqNo}@${actor}`, parentId, value, insert: true },
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      const cIndex = model.customers.list.findIndex(c => c.entries.globalId == event.operations[0].parentId);
      if (cIndex == -1) {
        // conflict/out of order event
        return;
      }
      model.customers.list[cIndex].entries.list.push({
        globalId: event.operations[0].objectId,
        parentId: event.operations[0].parentId,
        value: event.operations[0].value,
        field: event.operations[0].field
      });
    }
  },
  "UpdateCustomerEntry": {
    get: ({ parentId, globalId, value }: IdentifiedValueUpdate<string>): Evt => {
      return businessModelEventStore.createEvent(() => ({
        type: "UpdateCustomerEntry",
        operations: [
          { action: OperationType.Set, objectId: globalId, parentId, value }
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      const cIndex = model.customers.list.findIndex(c => c.entries.globalId == event.operations[0].parentId);
      if (cIndex == -1) {
        // conflict/out of order event
        return;
      }
      const eIndex = model.customers.list[cIndex].entries.list.findIndex(e => e.globalId == event.operations[0].objectId);
      if (eIndex == -1) {
        // conflict/out of order event
        return;
      }
      model.customers.list[cIndex].entries.list[eIndex].value = event.operations[0].value;
    }
  },
  "DeleteCustomerEntry": {
    get: ({ parentId, globalId }: Identified): Evt => {
      return businessModelEventStore.createEvent(() => ({
        type: "DeleteCustomerEntry",
        operations: [
          { action: OperationType.Delete, objectId: globalId, parentId }
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      const cIndex = model.customers.list.findIndex(c => c.entries.globalId == event.operations[0].parentId);
      if (cIndex == -1) {
        // conflict/out of order event
        return;
      }
      const eIndex = model.customers.list[cIndex].entries.list.findIndex(e => e.globalId == event.operations[0].objectId);
      if (eIndex == -1) {
        // conflict/out of order event
        return;
      }
      model.customers.list[cIndex].entries.list.splice(eIndex, 1);
    }
  },
  "UpdateCustomerType": {
    get: ({ parentId, globalId, value }: IdentifiedValueUpdate<string>): Evt => {
      return businessModelEventStore.createEvent(() => ({
        type: "UpdateCustomerType",
        operations: [
          { action: OperationType.Set, objectId: globalId, parentId, value }
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      const cIndex = model.customers.list.findIndex(c => c.globalId == event.operations[0].parentId);
      if (cIndex == -1) {
        // conflict/out of order event
        return;
      }
      model.customers.list[cIndex].type.value = event.operations[0].value;
    }
  },
  "UpdateCustomerName": {
    get: ({ parentId, globalId, value }: IdentifiedValueUpdate<string>): Evt => {
      return businessModelEventStore.createEvent(() => ({
        type: "UpdateCustomerName",
        operations: [
          { action: OperationType.Set, objectId: globalId, parentId, value }
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      const cIndex = model.customers.list.findIndex(c => c.globalId == event.operations[0].parentId);
      if (cIndex == -1) {
        // conflict/out of order event
        return;
      }
      model.customers.list[cIndex].name.value = event.operations[0].value;
    }
  },
  "AddValuePropEntry": {
    get: ({ parentId, value }: { parentId: string, value: string }): Evt => {
      return businessModelEventStore.createEvent((actor, seqNo) => ({
        type: "AddValuePropEntry",
        operations: [
          { action: OperationType.Set, objectId: `${seqNo}@${actor}`, parentId, value, insert: true },
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      model.valueProposition.entries.list.push({
        globalId: event.operations[0].objectId,
        parentId: event.operations[0].parentId,
        value: event.operations[0].value,
        field: event.operations[0].field
      });
    }
  },
  "UpdateValuePropEntry": {
    get: ({ parentId, globalId, value }: IdentifiedValueUpdate<string>): Evt => {
      return businessModelEventStore.createEvent(() => ({
        type: "UpdateValuePropEntry",
        operations: [
          { action: OperationType.Set, objectId: globalId, parentId, value }
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      const eIndex = model.valueProposition.entries.list.findIndex(e => e.globalId == event.operations[0].objectId);
      if (eIndex == -1) {
        // conflict/out of order event
        return;
      }
      model.valueProposition.entries.list[eIndex].value = event.operations[0].value;
    }
  },
  "DeleteValuePropEntry": {
    get: ({ parentId, globalId }: Identified): Evt => {
      return businessModelEventStore.createEvent(() => ({
        type: "DeleteValuePropEntry",
        operations: [
          { action: OperationType.Delete, objectId: globalId, parentId }
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      const eIndex = model.valueProposition.entries.list.findIndex(e => e.globalId == event.operations[0].objectId);
      if (eIndex == -1) {
        // conflict/out of order event
        return;
      }
      model.valueProposition.entries.list.splice(eIndex, 1);
    }
  },
  "AddValuePropGenre": {
    get: ({ parentId, value }: { parentId: string, value: string }): Evt => {
      return businessModelEventStore.createEvent((actor, seqNo) => ({
        type: "AddValuePropGenre",
        operations: [
          { action: OperationType.Set, objectId: `${seqNo}@${actor}`, parentId, value, insert: true },
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      model.valueProposition.genres.list.push({
        globalId: event.operations[0].objectId,
        parentId: event.operations[0].parentId,
        value: event.operations[0].value,
        field: event.operations[0].field
      });
    }
  },
  "DeleteValuePropGenre": {
    get: ({ parentId, globalId }: Identified): Evt => {
      return businessModelEventStore.createEvent(() => ({
        type: "DeleteValuePropGenre",
        operations: [
          { action: OperationType.Delete, objectId: globalId, parentId }
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      const eIndex = model.valueProposition.genres.list.findIndex(e => e.globalId == event.operations[0].objectId);
      if (eIndex == -1) {
        // conflict/out of order event
        return;
      }
      model.valueProposition.genres.list.splice(eIndex, 1);
    }
  },
  "AddValuePropPlatform": {
    get: ({ parentId, value }: { parentId: string, value: string }): Evt => {
      return businessModelEventStore.createEvent((actor, seqNo) => ({
        type: "AddValuePropPlatform",
        operations: [
          { action: OperationType.Set, objectId: `${seqNo}@${actor}`, parentId, value, insert: true },
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      model.valueProposition.platforms.list.push({
        globalId: event.operations[0].objectId,
        parentId: event.operations[0].parentId,
        value: event.operations[0].value,
        field: event.operations[0].field
      });
    }
  },
  "DeleteValuePropPlatform": {
    get: ({ parentId, globalId }: Identified): Evt => {
      return businessModelEventStore.createEvent(() => ({
        type: "DeleteValuePropPlatform",
        operations: [
          { action: OperationType.Delete, objectId: globalId, parentId }
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): void => {
      const eIndex = model.valueProposition.platforms.list.findIndex(e => e.globalId == event.operations[0].objectId);
      if (eIndex == -1) {
        // conflict/out of order event
        return;
      }
      model.valueProposition.platforms.list.splice(eIndex, 1);
    }
  },
};

export const events = {
  "AddNewCustomer": businessModelEvents.AddNewCustomer.get,
  "DeleteCustomer": businessModelEvents.DeleteCustomer.get,
  "AddCustomerEntry": businessModelEvents.AddCustomerEntry.get,
  "UpdateCustomerEntry": businessModelEvents.UpdateCustomerEntry.get,
  "DeleteCustomerEntry": businessModelEvents.DeleteCustomerEntry.get,
  "UpdateCustomerType": businessModelEvents.UpdateCustomerType.get,
  "UpdateCustomerName": businessModelEvents.UpdateCustomerName.get,
  "AddValuePropGenre": businessModelEvents.AddValuePropGenre.get,
  "DeleteValuePropGenre": businessModelEvents.DeleteValuePropGenre.get,
  "AddValuePropPlatform": businessModelEvents.AddValuePropPlatform.get,
  "DeleteValuePropPlatform": businessModelEvents.DeleteValuePropPlatform.get,
  "AddValuePropEntry": businessModelEvents.AddValuePropEntry.get,
  "UpdateValuePropEntry": businessModelEvents.UpdateValuePropEntry.get,
  "DeleteValuePropEntry": businessModelEvents.DeleteValuePropEntry.get,
};

export const eventApplier: IEventApplier<IBusinessModel> = createImmutableEventApplier(Object.keys(businessModelEvents).reduce((result, key) => {
  result[key] = businessModelEvents[key].apply;
  return result;
}, {}));
export const businessModelEventStore = createEventStore(api, eventApplier);
export const businessModelLocalStore = createLocalStore(businessModelEventStore, eventApplier);

