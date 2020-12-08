import type { IBusinessModel } from "./businessModel";


export const getNextSection = (businessModel: IBusinessModel) => {
  if (businessModel.customers.list.length === 0) {
    return "customer";
  }
  else if (businessModel.valueProposition.genres.list.length === 0 &&
    businessModel.valueProposition.platforms.list.length === 0 &&
    businessModel.valueProposition.entries.list.length === 0) {
    return "valueProposition";
  }
  return null;
};

export const getNextSectionInLine = (currentSection: string) => {
  switch (currentSection) {
    case "customer":
      return "valueProposition";
    case "valueProposition":
      return "channels";
    default:
      return null;
  }
};
