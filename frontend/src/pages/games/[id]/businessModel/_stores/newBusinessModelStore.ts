import { createEventStore } from "./eventSystem/eventStore";
import type { IEvent, IEventApplier, IEventStateApi } from "./eventSystem/types";
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
        return { events: data as IEvent<IBusinessModel>[] };
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
  }
};

type Evt = IEvent<IBusinessModel> & any;

const eventApplier: IEventApplier<IBusinessModel> = {
  apply: (model: IBusinessModel, event: Evt) => {
    log(event.type, event as any);
    if (!events.has(event.type)) {
      throw new Error(`IEventApplier<IBusinessModel>: Unrecognized event type ${event.type}, cannot continue`);
    }
    events.get(event.type).apply(model, event);
    model.versionNumber = event.versionNumber ?? model.versionNumber;
    return model;
  }
};

type EvtMethod = {
  get: (args: any) => Evt,
  apply: (model: IBusinessModel, event: Evt) => any
}

export const businessModelEvents = {
  "AddNewCustomer": {
    get: (): Evt => ({ type: "AddNewCustomer", versionNumber: null }),
    apply: (model: IBusinessModel): number => model.customers.push({ globalId: null, name: null, entries: [] })
  },
  "AddCustomerEntry": {
    get: ({ customerIndex, entry }: { customerIndex: number, entry: string }): Evt => ({ type: "AddCustomerEntry", versionNumber: null, customerIndex, entry }),
    apply: (model: IBusinessModel, event: Evt): number => model.customers[event.customerIndex].entries.push({ globalId: null, entry: event.entry })
  }
};
export const businessModelEventStore = createEventStore(api, eventApplier);
export const businessModelLocalStore = createLocalStore(businessModelEventStore, eventApplier);

// Next Steps:
//  * Replace old store with this one
//  * Add missing API endpoints
//    * How to deal w/ version number? Server-side cache of a shared business model for now until user sessions?
