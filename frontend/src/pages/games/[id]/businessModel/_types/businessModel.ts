import type { IIdentifiedList, IIdentifiedObject, IIdentifiedPrimitive } from "../../../../_stores/eventStore/types";

export type BusinessModelCustomerType = "both" | "player" | "customer";

export interface IBusinessModel extends IIdentifiedObject {
  versionNumber: number;
  customers: IIdentifiedList<IBusinessModelCustomer>;
  valueProposition: IBusinessModelValueProposition;
  channels: IBusinessModelChannels;
  customerRelationships: IBusinessModelCustomerRelationships;
  revenue: IBusinessModelRevenue;
  keyResources: IBusinessModelKeyResources;
  keyActivities: IBusinessModelKeyActivities;
  keyPartners: IBusinessModelKeyPartners;
  costStructure: IBusinessModelCostStructure;
}

export interface IBusinessModelCustomer extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
  entries: IIdentifiedList<IIdentifiedPrimitive<string>>;
  type: IIdentifiedPrimitive<BusinessModelCustomerType>;
}

export interface IBusinessModelValueProposition extends IIdentifiedObject {
  genres: IIdentifiedList<IIdentifiedPrimitive<string>>;
  platforms: IIdentifiedList<IIdentifiedPrimitive<string>>;
  entries: IIdentifiedList<IIdentifiedPrimitive<string>>;
}

export interface IBusinessModelChannels extends IIdentifiedObject {
  awareness: IIdentifiedList<IIdentifiedPrimitive<string>>;
  consideration: IIdentifiedList<IIdentifiedPrimitive<string>>;
  purchase: IIdentifiedList<IIdentifiedPrimitive<string>>;
  postPurchase: IIdentifiedList<IIdentifiedPrimitive<string>>;
}

export interface IBusinessModelCustomerRelationships extends IIdentifiedObject {
  entries: IIdentifiedList<IIdentifiedPrimitive<string>>;
}

export interface IBusinessModelRevenue extends IIdentifiedObject {
  entries: IIdentifiedList<IIdentifiedPrimitive<string>>;
}

export interface IBusinessModelKeyResources extends IIdentifiedObject {
  entries: IIdentifiedList<IIdentifiedPrimitive<string>>;
}

export interface IBusinessModelKeyActivities extends IIdentifiedObject {
  entries: IIdentifiedList<IIdentifiedPrimitive<string>>;
}

export interface IBusinessModelKeyPartners extends IIdentifiedObject {
  entries: IIdentifiedList<IIdentifiedPrimitive<string>>;
}


export type IBusinessModelCostStructure = IIdentifiedList<IBusinessModelCost>

export interface IBusinessModelCost extends IIdentifiedObject {
  type: IIdentifiedPrimitive<string>;
  summary: IIdentifiedPrimitive<string>;
  isPreLaunch: IIdentifiedPrimitive<boolean>;
  isPostLaunch: IIdentifiedPrimitive<boolean>;
}
