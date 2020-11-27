import type { Readable } from "svelte/store";

export type Versioned = {
  versionNumber: number;
};

export interface IEvent<T extends Versioned> {
  actor: string;
  seqNo: number;
  type: string;
  versionNumber: number | null;
  previousVersionNumber: number;
  operations: IEventOperation[];
}

export interface IEventOperation {
  action: OperationType;
  objectId: string;
  parentId: string;
  value?: any;
  insert?: boolean;
  field?: string;
}

export enum OperationType {
  Set = 1,
  Delete = 2,
  MakeList = 3,
  MakeObject = 4
}

export interface IEventApplier<T extends Versioned> {
  apply(model: T, event: IEvent<T>): T;
}

export type FinalStateResponse<T extends Versioned> = {
  payload: T
};

export type SinceResponse<T extends Versioned> = {
  events: IEvent<T>[]
};

export type EventUpdateResponse = {
  versionNumber: number;
  previousVersionNumber: number;
};

export type GetActorSeqNoResponse = {
  actor: string;
  seqNo: number;
};
export interface IEventStateApi<T extends Versioned> {
  get: (id: any, apiArgs?: any) => Promise<FinalStateResponse<T>>;
  getSince: (id: any, versionNumber: number, apiArgs?: any) => Promise<SinceResponse<T>>;
  update: (id: any, event: IEvent<T>, apiArgs?: any) => Promise<EventUpdateResponse>;
  getActorSeqNo: (actor: string) => Promise<GetActorSeqNoResponse>
}

export type IEventStoreState<T extends Versioned> = {
  pendingEvents: IEvent<T>[],
  finalState: T
};

export type ReadableEventStore<T extends Versioned> = Readable<IEventStoreState<T>>

export type VersionEventArgs = (actor: string, seqNo: number) => IEvent<T>;

export interface IEventStore<T extends Versioned> extends ReadableEventStore<T> {
  initialize: (actor: string, id: any, apiArgs?: any) => Promise<any>;
  getVersionNumber: () => number;
  versionEvent: (builder: VersionEventArgs) => IEvent<T>;
  loadFullState: () => void;
  addEvent: (event: IEvent<T>) => void;
}
