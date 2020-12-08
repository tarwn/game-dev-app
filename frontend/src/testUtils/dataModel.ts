import type { Identified, IIdentifiedList, IIdentifiedPrimitive } from "../pages/games/[id]/businessModel/_stores/eventSystem/types";
import type { BusinessModelCustomerType, IBusinessModel, IBusinessModelChannels, IBusinessModelCustomer, IBusinessModelValueProposition } from "../pages/games/[id]/businessModel/_types/businessModel";

export function createEmptyBusinessModel(): IBusinessModel {
  return {
    globalId: "unit-test-bm",
    parentId: "unit-test",
    versionNumber: 1,
    customers: createObjectList<IBusinessModelCustomer>("unit-test-bm", "unit-test-bm-c", "customers"),
    valueProposition: createValueProposition("unit-test-bm", "unit-test-bm-vp", "valueProposition"),
    channels: createChannels("unit-test-bm", "unit-test-bm-channels", "channels")
  };
}

function createObjectList<T extends Identified>(parentId: string, globalId: string, field?: string): IIdentifiedList<T> {
  return {
    globalId,
    parentId,
    field,
    list: []
  };
}

export function createBusinessModelCustomer(businessModel: IBusinessModel): IBusinessModelCustomer {
  const globalId = businessModel.customers.globalId + "[" + businessModel.customers.list.length + "]";
  return {
    parentId: businessModel.customers.globalId,
    globalId,
    name: createIdentifiedPrimitive<string>(globalId, globalId + "-name", "", "name"),
    type: createIdentifiedPrimitive<BusinessModelCustomerType>(globalId, globalId + "-type", "both", "type"),
    entries: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-entries", "entries")
  };
}

function createValueProposition(parentId: string, globalId: string, field?: string): IBusinessModelValueProposition {
  return {
    globalId,
    parentId,
    field,
    genres: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-genres", "genres"),
    platforms: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-platforms", "platforms"),
    entries: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-entries", "entries")
  };
}

function createChannels(parentId: string, globalId: string, field?: string): IBusinessModelChannels {
  return {
    globalId,
    parentId,
    field,
    awareness: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-awareness", "awareness"),
    consideration: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-consideration", "consideration"),
    purchase: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-purchase", "purchase"),
    postPurchase: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-postPurchase", "postPurchase")
  };
}

export function createIdentifiedPrimitive<T>(parentId: string, globalId: string, value: T, field?: string): IIdentifiedPrimitive<T> {
  return {
    parentId,
    globalId,
    value,
    field
  };
}
