export interface IBusinessModel {
  versionNumber: number;
  customers: IFreeFormCollection[];
}

export interface IFreeFormCollection {
  globalId: string;
  name: string;
  entries: Array<IFreeFormEntry>;
}

export interface IFreeFormEntry {
  globalId: string;
  entry: string;
}
