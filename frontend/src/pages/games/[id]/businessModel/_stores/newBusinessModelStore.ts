import { createEventStore } from "./eventSystem/eventStore";
import { GetActorSeqNoResponse, IEvent, IEventApplier, IEventStateApi, OperationType } from "./eventSystem/types";
import type { IBusinessModel } from "../_types/businessModel";
import { log } from "./logger";
import { createLocalStore } from "./eventSystem/localStore";

const api: IEventStateApi<IBusinessModel> = {
  get: (id: any) => {
    return fetch(`/api/fe/businessModels/${id}`)
      .then((r) => r.json())
      .then((data) => {
        return { payload: data as IBusinessModel };
      });
  },
  getSince: (id: any, versionNumber: number) => {
    return fetch(`/api/fe/businessModels/${id}/since/${versionNumber}`)
      .then((r) => r.json())
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
      .then((r) => r.json())
      .then((data) => {
        return {
          versionNumber: data.versionNumber,
          previousVersionNumber: data.previousVersionNumber
        };
      });
  },
  getActorSeqNo: (actor: string) => {
    return fetch(`/api/fe/actors/${actor}/latestSeqNo`)
      .then((r) => r.json())
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
    get: (): Evt => {
      const event = businessModelEventStore.versionEvent((actor, seqNo) => ({
        actor,
        seqNo,
        type: "AddNewCustomer",
        versionNumber: null,
        previousVersionNumber: businessModelEventStore.getVersionNumber(),
        operations: [
          { action: OperationType.MakeObject, objectId: `${seqNo}@${actor}`, parentId: "customers" },
          { action: OperationType.Set, objectId: `${seqNo + 1}@${actor}`, parentId: `${seqNo}@${actor}`, field: "name", value: "" },
          { action: OperationType.MakeList, objectId: `${seqNo + 2}@${actor}`, parentId: `${seqNo}@${actor}`, field: "entries" },
        ]
      }));
      log("businessModelEvents.Generated", event as any);
      return event;
    },
    apply: (model: IBusinessModel, event: Evt): IBusinessModel => ({
      ...model,
      customers: [
        ...model.customers,
        {
          globalId: event.operations[0].objectId,
          name: event.operations[1].value,
          entries: []
        }
      ]
    })
  },
  "AddCustomerEntry": {
    get: ({ parentId, entry }: { parentId: string, entry: string }): Evt => {
      const event = businessModelEventStore.versionEvent((actor, seqNo) => ({
        actor,
        seqNo,
        type: "AddCustomerEntry",
        versionNumber: null,
        previousVersionNumber: businessModelEventStore.getVersionNumber(),
        operations: [
          { action: OperationType.Set, objectId: `${seqNo}@${actor}`, parentId, value: entry, insert: true }
        ]
      }));
      log("businessModelEvents.Generated", event as any);
      return event;
    },
    apply: (model: IBusinessModel, event: Evt): IBusinessModel => {
      const index = model.customers.findIndex(c => c.globalId == event.operations[0].parentId);
      return {
        ...model,
        customers: [
          ...model.customers.splice(0, index),
          {
            ...model.customers[index],
            entries: [
              ...model.customers[index].entries,
              { globalId: event.operations[0].objectId, entry: event.operations[0].value }
            ]
          }
        ]
      };
    }
  }
};
