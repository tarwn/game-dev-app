import type { Readable } from "svelte/store";

// Types

export type Versioned = {
  versionNumber: number;
};

export type Identified = {
  globalId: string;
  parentId: string;
}

export interface IIdentifiedObject extends Identified {
  field?: string;
}

export interface IIdentifiedPrimitive<T> extends Identified {
  field?: string;
  value: T;
}

export interface IIdentifiedList<T extends Identified> extends Identified {
  field?: string;
  list: T[];
}

// Event Types

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  "$type": ValueType;
}

export enum OperationType {
  Set = 1,
  Delete = 2,
  MakeList = 3,
  MakeObject = 4
}

export enum ValueType {
  string = "string",
  date = "date",
  time = "time",
  decimal = "decimal",
  integer = "integer",
  list = "list",
  object = "object",
  boolean = "boolean"
}

export interface AppliedEvent<T extends IEvent<T>> {
  gameId: string;
  versionNumber: number | null;
  previousVersionNumber: number;
  event: IEvent<T>;
}

// Mechanics: Applier + API

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

export type ReadableEventStore<T extends Versioned> = Readable<IEventStoreState<T>>;
export type ReadableLocalStore<T extends Versioned> = Readable<T>;

export type VersionEventArgs = (actor: string, seqNo: number) => { type: string, operations: IEventOperation[] };

export enum ReceiveDecision {
  MismatchedParentIds,
  MatchedActor,
  AlreadyAppliedVersion,
  GapDetectedLoadSince,
  Applied
}

export interface IEventStore<T extends Versioned> extends ReadableEventStore<T> {
  initialize: (actor: string, id: any, apiArgs?: any) => Promise<any>;
  loadFullState: () => void;
  createEvent: (builder: VersionEventArgs) => IEvent<T>;
  addEvent: (event: IEvent<T>) => void;
  receiveEvent: (parentId: string, event: IEvent<T>) => ReceiveDecision;
}
