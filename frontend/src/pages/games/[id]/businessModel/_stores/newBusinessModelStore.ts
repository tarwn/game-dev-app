import { createEventStore } from "./eventSystem/eventStore";
import { GetActorSeqNoResponse, Identified, IEvent, IEventApplier, IEventStateApi, OperationType } from "./eventSystem/types";
import type { IBusinessModel } from "../_types/businessModel";
import { log } from "./logger";
import { createLocalStore } from "./eventSystem/localStore";

const jsonOrThrow = (r: Response) => {
  if (r.status <= 299) {
    return r.json();
  }
  else {
    throw Error(`HTTP response error, ${r.status}: ${r.statusText}`);
  }
};

const api: IEventStateApi<IBusinessModel> = {
  get: (id: any) => {
    return fetch(`/api/fe/businessModels/${id}`)
      .then(jsonOrThrow)
      .then((data) => {
        return { payload: data as IBusinessModel };
      });
  },
  getSince: (id: any, versionNumber: number) => {
    return fetch(`/api/fe/businessModels/${id}/since/${versionNumber}`)
      .then(jsonOrThrow)
      .then((data) => {
        return data as { events: IEvent<IBusinessModel>[] };
      });
  },
  update: (id: any, event: IEvent<IBusinessModel>) => {
    return fetch(`/api/fe/businessModels/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(event)
    })
      .then(jsonOrThrow)
      .then((data) => {
        return {
          versionNumber: data.versionNumber,
          previousVersionNumber: data.previousVersionNumber
        };
      });
  },
  getActorSeqNo: (actor: string) => {
    return fetch(`/api/fe/actors/${actor}/latestSeqNo`)
      .then(jsonOrThrow)
      .then((data) => {
        return data as GetActorSeqNoResponse;
      });
  }
};

type Evt = IEvent<IBusinessModel>;

export const eventApplier: IEventApplier<IBusinessModel> = {
  apply: (model: IBusinessModel, event: Evt) => {
    log(`Apply(${event.type})`, event as any);
    if (!businessModelEvents[event.type]) {
      throw new Error(`IEventApplier<IBusinessModel>: Unrecognized event type ${event.type}, cannot continue`);
    }
    model = businessModelEvents[event.type].apply(model, event);
    model.versionNumber = event.versionNumber || model.versionNumber;
    return model;
  }
};

type EvtMethod = {
  get: (args?: any) => Evt,
  apply: (model: IBusinessModel, event: Evt) => IBusinessModel
}

export const businessModelEventStore = createEventStore(api, eventApplier);
export const businessModelLocalStore = createLocalStore(businessModelEventStore, eventApplier);

export const businessModelEvents: { [key: string]: EvtMethod } = {
  "AddNewCustomer": {
    get: ({ parentId }: { parentId: string }): Evt => {
      return businessModelEventStore.versionEvent((actor, seqNo) => ({
        actor,
        seqNo,
        type: "AddNewCustomer",
        versionNumber: null,
        previousVersionNumber: businessModelEventStore.getVersionNumber(),
        operations: [
          { action: OperationType.MakeObject, objectId: `${seqNo}@${actor}`, parentId },
          { action: OperationType.Set, objectId: `${seqNo + 1}@${actor}`, parentId: `${seqNo}@${actor}`, field: "name", value: "" },
          { action: OperationType.MakeList, objectId: `${seqNo + 2}@${actor}`, parentId: `${seqNo}@${actor}`, field: "entries" },
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): IBusinessModel => ({
      ...model,
      customers: {
        ...model.customers,
        list: [
          ...model.customers.list,
          {
            globalId: event.operations[0].objectId,
            parentId: event.operations[0].parentId,
            name: { globalId: event.operations[1].objectId, parentId: event.operations[1].parentId, value: event.operations[1].value, field: event.operations[1].field },
            entries: { globalId: event.operations[2].objectId, parentId: event.operations[2].parentId, list: [], field: event.operations[1].field },
          }
        ]
      }
    })
  },
  "DeleteCustomer": {
    get: ({ parentId, globalId }: Identified): Evt => {
      return businessModelEventStore.versionEvent((actor, seqNo) => ({
        actor,
        seqNo,
        type: "DeleteCustomer",
        versionNumber: null,
        previousVersionNumber: businessModelEventStore.getVersionNumber(),
        operations: [
          { action: OperationType.Delete, objectId: globalId, parentId }
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): IBusinessModel => {
      const customerIndex = model.customers.list.findIndex(c => c.globalId == event.operations[0].objectId);
      return {
        ...model,
        customers: {
          ...model.customers,
          list: [
            ...model.customers.list.slice(0, customerIndex),
            ...model.customers.list.slice(customerIndex + 1)
          ]
        }
      };
    }
  },
  "AddCustomerEntry": {
    get: ({ parentId, value }: { parentId: string, value: string }): Evt => {
      return businessModelEventStore.versionEvent((actor, seqNo) => ({
        actor,
        seqNo,
        type: "AddCustomerEntry",
        versionNumber: null,
        previousVersionNumber: businessModelEventStore.getVersionNumber(),
        operations: [
          { action: OperationType.Set, objectId: `${seqNo}@${actor}`, parentId, value, insert: true }
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): IBusinessModel => {
      const index = model.customers.list.findIndex(c => c.entries.globalId == event.operations[0].parentId);
      if (index == -1) {
        // conflict/out of order event
        return model;
      }
      return {
        ...model,
        customers: {
          ...model.customers,
          list: [
            ...model.customers.list.slice(0, index),
            {
              ...model.customers.list[index],
              entries: {
                ...model.customers.list[index].entries,
                list: [
                  ...model.customers.list[index].entries.list,
                  {
                    globalId: event.operations[0].objectId,
                    parentId: event.operations[0].parentId,
                    value: event.operations[0].value,
                    field: event.operations[0].field
                  }
                ]
              }
            },
            ...model.customers.list.slice(index + 1)
          ]
        }
      };
    }
  },
  "UpdateCustomerEntry": {
    get: ({ parentId, globalId, value }: Identified & { value: string }): Evt => {
      return businessModelEventStore.versionEvent((actor, seqNo) => ({
        actor,
        seqNo,
        type: "UpdateCustomerEntry",
        versionNumber: null,
        previousVersionNumber: businessModelEventStore.getVersionNumber(),
        operations: [
          { action: OperationType.Set, objectId: globalId, parentId, value }
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): IBusinessModel => {
      const cIndex = model.customers.list.findIndex(c => c.entries.globalId == event.operations[0].parentId);
      if (cIndex == -1) {
        // conflict/out of order event
        return model;
      }
      const eIndex = model.customers.list[cIndex].entries.list.findIndex(e => e.globalId == event.operations[0].objectId);
      if (eIndex == -1) {
        // conflict/out of order event
        return model;
      }
      return {
        ...model,
        customers: {
          ...model.customers,
          list: [
            ...model.customers.list.slice(0, cIndex),
            {
              ...model.customers.list[cIndex],
              entries: {
                ...model.customers.list[cIndex].entries,
                list: [
                  ...model.customers.list[cIndex].entries.list.slice(0, eIndex),
                  {
                    ...model.customers.list[cIndex].entries.list[eIndex],
                    value: event.operations[0].value
                  },
                  ...model.customers.list[cIndex].entries.list.slice(eIndex + 1)
                ]
              }
            },
            ...model.customers.list.slice(cIndex + 1)
          ]
        }
      };
    }
  },
  "DeleteCustomerEntry": {
    get: ({ parentId, globalId }: Identified): Evt => {
      return businessModelEventStore.versionEvent((actor, seqNo) => ({
        actor,
        seqNo,
        type: "DeleteCustomerEntry",
        versionNumber: null,
        previousVersionNumber: businessModelEventStore.getVersionNumber(),
        operations: [
          { action: OperationType.Delete, objectId: globalId, parentId }
        ]
      }));
    },
    apply: (model: IBusinessModel, event: Evt): IBusinessModel => {
      const cIndex = model.customers.list.findIndex(c => c.entries.globalId == event.operations[0].parentId);
      if (cIndex == -1) {
        // conflict/out of order event
        return model;
      }
      const eIndex = model.customers.list[cIndex].entries.list.findIndex(e => e.globalId == event.operations[0].objectId);
      if (eIndex == -1) {
        // conflict/out of order event
        return model;
      }
      return {
        ...model,
        customers: {
          ...model.customers,
          list: [
            ...model.customers.list.slice(0, cIndex),
            {
              ...model.customers.list[cIndex],
              entries: {
                ...model.customers.list[cIndex].entries,
                list: [
                  ...model.customers.list[cIndex].entries.list.slice(0, eIndex),
                  // delete item at eIndex
                  ...model.customers.list[cIndex].entries.list.slice(eIndex + 1)
                ]
              }
            },
            ...model.customers.list.slice(cIndex + 1)
          ]
        }
      };
    }
  }
};
