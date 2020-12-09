import type { IBusinessModel } from "./businessModel";


export const getNextSection = (businessModel: IBusinessModel): string | null => {
  if (businessModel.customers.list.length === 0) {
    return "customers";
  }
  else if (businessModel.valueProposition.genres.list.length === 0 &&
    businessModel.valueProposition.platforms.list.length === 0 &&
    businessModel.valueProposition.entries.list.length === 0) {
    return "valueProposition";
  }
  else if (businessModel.channels.awareness.list.length === 0 &&
    businessModel.channels.consideration.list.length === 0 &&
    businessModel.channels.purchase.list.length === 0 &&
    businessModel.channels.postPurchase.list.length === 0) {
    return "channels";
  }
  return null;
};

export const getNextSectionInLine = (currentSection: string): string | null => {
  switch (currentSection) {
    case "customers":
      return "valueProposition";
    case "valueProposition":
      return "channels";
    case "channels":
      return "customRelationships";
    default:
      return null;
  }
};

export type SectionStatus = {
  customers: boolean;
  valueProposition: boolean;
  channels: boolean;
  customerRelationships: boolean;
  revenue: boolean;
  keyResources: boolean;
  keyActivities: boolean;
  keyPartners: boolean;
  costStructure: boolean;
  nextNonStartedSection: string | null;
};

export const getSectionStatus = (businessModel: IBusinessModel | null): SectionStatus => {
  const status = {
    nextNonStartedSection: null,
    customers:
      businessModel && businessModel.customers.list.length > 0,
    valueProposition:
      businessModel &&
      (businessModel.valueProposition.genres.list.length > 0 ||
        businessModel.valueProposition.platforms.list.length > 0 ||
        businessModel.valueProposition.entries.list.length > 0),
    channels:
      businessModel &&
      (businessModel.channels.awareness.list.length > 0 ||
        businessModel.channels.consideration.list.length > 0 ||
        businessModel.channels.purchase.list.length > 0 ||
        businessModel.channels.postPurchase.list.length > 0),
    customerRelationships:
      businessModel && (businessModel.customerRelationships.entries.list.length > 0),
    revenue: false,
    keyResources: false,
    keyActivities: false,
    keyPartners: false,
    costStructure: false,
  };
  status.nextNonStartedSection = getNextNonStarted(status);
  return status;
};

const order = ['customers', 'valueProposition', 'channels', 'customerRelationships', 'revenue', 'keyResources', 'keyActivities', 'keyPartners', 'costStructure'];
const getNextNonStarted = (status: SectionStatus): string | null => {
  return order.find(s => !status[s]) ?? null;
};

