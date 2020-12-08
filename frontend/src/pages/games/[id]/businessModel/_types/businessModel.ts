import type { IIdentifiedList, IIdentifiedObject, IIdentifiedPrimitive } from "../_stores/eventSystem/types";

export type BusinessModelCustomerType = "both" | "player" | "customer";

export interface IBusinessModel extends IIdentifiedObject {
  versionNumber: number;
  customers: IIdentifiedList<IBusinessModelCustomer>;
  valueProposition: IBusinessModelValueProposition;
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
