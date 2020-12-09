import { createEventStore } from "./eventSystem/eventStore";
import { Identified, IEvent, IEventApplier, IIdentifiedList, IIdentifiedPrimitive, OperationType } from "./eventSystem/types";
import type { IBusinessModel } from "../_types/businessModel";
import { createLocalStore } from "./eventSystem/localStore";
import { createImmutableEventApplier } from "./eventSystem/eventApplier";
import { api } from "./businessModelApi";

type Evt = IEvent<IBusinessModel>;
type IdentifiedValueUpdate<T> = Identified & { value: T };

const primitiveFactory = {
  makeUpdate: <T>(type: string, getPrimitive: (IBusinessModel, Evt) => IIdentifiedPrimitive<T>) => {
    return {
      get: ({ parentId, globalId, value }: IdentifiedValueUpdate<string>): Evt => {
        return businessModelEventStore.createEvent(() => ({
          type,
          operations: [
            { action: OperationType.Set, objectId: globalId, parentId, value }
          ]
        }));
      },
      apply: (model: IBusinessModel, event: Evt): void => {
        const primitive = getPrimitive(model, event);
        if (primitive == null) return;
        primitive.value = event.operations[0].value;
      }
    };
  }
};

const basicListFactory = {
  makeAdd: (type: string, getParent: (IBusinessModel, Evt) => IIdentifiedList<IIdentifiedPrimitive<string>>) => {
    return {
      get: ({ parentId, value }: { parentId: string, value: string }): Evt => {
        return businessModelEventStore.createEvent((actor, seqNo) => ({
          type,
          operations: [
            { action: OperationType.Set, objectId: `${seqNo}@${actor}`, parentId, value, insert: true },
          ]
        }));
      },
      apply: (model: IBusinessModel, event: Evt): void => {
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
  makeUpdate: (type: string, getParent: (IBusinessModel, Evt) => IIdentifiedList<IIdentifiedPrimitive<string>>) => {
    return {
      get: ({ parentId, globalId, value }: IdentifiedValueUpdate<string>): Evt => {
        return businessModelEventStore.createEvent(() => ({
          type,
          operations: [
            { action: OperationType.Set, objectId: globalId, parentId, value }
          ]
        }));
      },
      apply: (model: IBusinessModel, event: Evt): void => {
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
  makeDelete: (type: string, getParent: (IBusinessModel, Evt) => IIdentifiedList<IIdentifiedPrimitive<string>>) => {
    return {
      get: ({ parentId, globalId }: Identified): Evt => {
        return businessModelEventStore.createEvent(() => ({
          type,
          operations: [
            { action: OperationType.Delete, objectId: globalId, parentId }
          ]
        }));
      },
      apply: (model: IBusinessModel, event: Evt): void => {
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
  "DeleteCustomer": basicListFactory.makeDelete("DeleteCustomer", (model) => model.customers),
  "AddCustomerEntry": basicListFactory.makeAdd("AddCustomerEntry", (model, event) => {
    const cIndex = model.customers.list.findIndex(c => c.entries.globalId == event.operations[0].parentId);
    if (cIndex == -1) {
      // conflict/out of order event
      return;
    }
    return model.customers.list[cIndex].entries;
  }),
  "UpdateCustomerEntry": basicListFactory.makeUpdate("UpdateCustomerEntry", (model, event) => {
    const cIndex = model.customers.list.findIndex(c => c.entries.globalId == event.operations[0].parentId);
    if (cIndex == -1) {
      // conflict/out of order event
      return;
    }
    return model.customers.list[cIndex].entries;
  }),
  "DeleteCustomerEntry": basicListFactory.makeDelete("DeleteCustomerEntry", (model, event) => {
    const cIndex = model.customers.list.findIndex(c => c.entries.globalId == event.operations[0].parentId);
    if (cIndex == -1) {
      // conflict/out of order event
      return;
    }
    return model.customers.list[cIndex].entries;
  }),
  "UpdateCustomerType": primitiveFactory.makeUpdate("UpdateCustomerType", (model, event) => {
    const cIndex = model.customers.list.findIndex(c => c.globalId == event.operations[0].parentId);
    if (cIndex == -1) {
      // conflict/out of order event
      return;
    }
    return model.customers.list[cIndex].type;
  }),
  "UpdateCustomerName": primitiveFactory.makeUpdate("UpdateCustomerName", (model, event) => {
    const cIndex = model.customers.list.findIndex(c => c.globalId == event.operations[0].parentId);
    if (cIndex == -1) {
      // conflict/out of order event
      return;
    }
    return model.customers.list[cIndex].name;
  }),
  "AddValuePropEntry": basicListFactory.makeAdd("AddValuePropEntry", (model) => model.valueProposition.entries),
  "UpdateValuePropEntry": basicListFactory.makeUpdate("UpdateValuePropEntry", (model) => model.valueProposition.entries),
  "DeleteValuePropEntry": basicListFactory.makeDelete("DeleteValuePropEntry", (model) => model.valueProposition.entries),
  "AddValuePropGenre": basicListFactory.makeAdd("AddValuePropGenre", (model) => model.valueProposition.genres),
  "DeleteValuePropGenre": basicListFactory.makeDelete("DeleteValuePropGenre", (model) => model.valueProposition.genres),
  "AddValuePropPlatform": basicListFactory.makeAdd("AddValuePropPlatform", (model) => model.valueProposition.platforms),
  "DeleteValuePropPlatform": basicListFactory.makeDelete("DeleteValuePropPlatform", (model) => model.valueProposition.platforms),
  "AddChannelsAwarenessEntry": basicListFactory.makeAdd("AddChannelsAwarenessEntry", (model) => model.channels.awareness),
  "UpdateChannelsAwarenessEntry": basicListFactory.makeUpdate("UpdateChannelsAwarenessEntry", (model) => model.channels.awareness),
  "DeleteChannelsAwarenessEntry": basicListFactory.makeDelete("DeleteChannelsAwarenessEntry", (model) => model.channels.awareness),
  "AddChannelsConsiderationEntry": basicListFactory.makeAdd("AddChannelsConsiderationEntry", (model) => model.channels.consideration),
  "UpdateChannelsConsiderationEntry": basicListFactory.makeUpdate("UpdateChannelsConsiderationEntry", (model) => model.channels.consideration),
  "DeleteChannelsConsiderationEntry": basicListFactory.makeDelete("DeleteChannelsConsiderationEntry", (model) => model.channels.consideration),
  "AddChannelsPurchaseEntry": basicListFactory.makeAdd("AddChannelsPurchaseEntry", (model) => model.channels.purchase),
  "UpdateChannelsPurchaseEntry": basicListFactory.makeUpdate("UpdateChannelsPurchaseEntry", (model) => model.channels.purchase),
  "DeleteChannelsPurchaseEntry": basicListFactory.makeDelete("DeleteChannelsPurchaseEntry", (model) => model.channels.purchase),
  "AddChannelsPostPurchaseEntry": basicListFactory.makeAdd("AddChannelsPostPurchaseEntry", (model) => model.channels.postPurchase),
  "UpdateChannelsPostPurchaseEntry": basicListFactory.makeUpdate("UpdateChannelsPostPurchaseEntry", (model) => model.channels.postPurchase),
  "DeleteChannelsPostPurchaseEntry": basicListFactory.makeDelete("DeleteChannelsPostPurchaseEntry", (model) => model.channels.postPurchase),
  "AddCustomerRelationshipsEntry": basicListFactory.makeAdd("AddCustomerRelationshipsEntry", (model) => model.customerRelationships.entries),
  "UpdateCustomerRelationshipsEntry": basicListFactory.makeUpdate("UpdateCustomerRelationshipsEntry", (model) => model.customerRelationships.entries),
  "DeleteCustomerRelationshipsEntry": basicListFactory.makeDelete("DeleteCustomerRelationshipsEntry", (model) => model.customerRelationships.entries),
  "AddKeyResourcesEntry": basicListFactory.makeAdd("AddKeyResourcesEntry", (model) => model.keyResources.entries),
  "UpdateKeyResourcesEntry": basicListFactory.makeUpdate("UpdateKeyResourcesEntry", (model) => model.keyResources.entries),
  "DeleteKeyResourcesEntry": basicListFactory.makeDelete("DeleteKeyResourcesEntry", (model) => model.keyResources.entries),
  "AddRevenueEntry": basicListFactory.makeAdd("AddRevenueEntry", (model) => model.revenue.entries),
  "UpdateRevenueEntry": basicListFactory.makeUpdate("UpdateRevenueEntry", (model) => model.revenue.entries),
  "DeleteRevenueEntry": basicListFactory.makeDelete("DeleteRevenueEntry", (model) => model.revenue.entries),
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
  "AddChannelsAwarenessEntry": businessModelEvents.AddChannelsAwarenessEntry.get,
  "UpdateChannelsAwarenessEntry": businessModelEvents.UpdateChannelsAwarenessEntry.get,
  "DeleteChannelsAwarenessEntry": businessModelEvents.DeleteChannelsAwarenessEntry.get,
  "AddChannelsConsiderationEntry": businessModelEvents.AddChannelsConsiderationEntry.get,
  "UpdateChannelsConsiderationEntry": businessModelEvents.UpdateChannelsConsiderationEntry.get,
  "DeleteChannelsConsiderationEntry": businessModelEvents.DeleteChannelsConsiderationEntry.get,
  "AddChannelsPurchaseEntry": businessModelEvents.AddChannelsPurchaseEntry.get,
  "UpdateChannelsPurchaseEntry": businessModelEvents.UpdateChannelsPurchaseEntry.get,
  "DeleteChannelsPurchaseEntry": businessModelEvents.DeleteChannelsPurchaseEntry.get,
  "AddChannelsPostPurchaseEntry": businessModelEvents.AddChannelsPostPurchaseEntry.get,
  "UpdateChannelsPostPurchaseEntry": businessModelEvents.UpdateChannelsPostPurchaseEntry.get,
  "DeleteChannelsPostPurchaseEntry": businessModelEvents.DeleteChannelsPostPurchaseEntry.get,
  "AddCustomerRelationshipsEntry": businessModelEvents.AddCustomerRelationshipsEntry.get,
  "UpdateCustomerRelationshipsEntry": businessModelEvents.UpdateCustomerRelationshipsEntry.get,
  "DeleteCustomerRelationshipsEntry": businessModelEvents.DeleteCustomerRelationshipsEntry.get,
  "AddKeyResourcesEntry": businessModelEvents.AddKeyResourcesEntry.get,
  "UpdateKeyResourcesEntry": businessModelEvents.UpdateKeyResourcesEntry.get,
  "DeleteKeyResourcesEntry": businessModelEvents.DeleteKeyResourcesEntry.get,
  "AddRevenueEntry": businessModelEvents.AddRevenueEntry.get,
  "UpdateRevenueEntry": businessModelEvents.UpdateRevenueEntry.get,
  "DeleteRevenueEntry": businessModelEvents.DeleteRevenueEntry.get,
};

export const eventApplier: IEventApplier<IBusinessModel> = createImmutableEventApplier(Object.keys(businessModelEvents).reduce((result, key) => {
  result[key] = businessModelEvents[key].apply;
  return result;
}, {}));
export const businessModelEventStore = createEventStore(api, eventApplier);
export const businessModelLocalStore = createLocalStore(businessModelEventStore, eventApplier);

