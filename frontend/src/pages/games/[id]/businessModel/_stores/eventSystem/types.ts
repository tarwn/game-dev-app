import type { Readable } from "svelte/store";

export type Versioned = {
  versionNumber: number;
};

export interface IEvent<T extends Versioned> {
  type: string;
  versionNumber: number | null;
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

export interface IEventStateApi<T extends Versioned> {
  get: (id: any, apiArgs?: any) => Promise<FinalStateResponse<T>>;
  getSince: (id: any, versionNumber: number, apiArgs?: any) => Promise<SinceResponse<T>>;
  update: (id: any, event: IEvent<T>, apiArgs?: any) => Promise<EventUpdateResponse>;
}

export type IEventStoreState<T extends Versioned> = {
  pendingEvents: IEvent<T>[],
  finalState: T
};

export type ReadableEventStore<T extends Versioned> = Readable<IEventStoreState<T>>

export interface IEventStore<T extends Versioned> extends ReadableEventStore<T> {
  initialize: (id: any, apiArgs?: any) => void;
  loadFullState: () => void;
  addEvent: (event: IEvent<T>) => void;
}
