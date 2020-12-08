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
