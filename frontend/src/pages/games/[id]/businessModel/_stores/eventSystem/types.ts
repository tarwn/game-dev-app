
export interface IEvent<T> {
  type: string;
  versionNumber: number | null;
}

export interface IEventApplier<T> {
  apply(model: T, event: IEvent<T>): T;
}

export type FinalStateResponse<T> = {
  payload: T
};

export type SinceResponse<T> = {
  events: IEvent<T>[]
};

export type EventUpdateResponse = {
  versionNumber: number;
  previousVersionNumber: number;
};

export interface IEventStateApi<T> {
  get: (id: any, apiArgs?: any) => Promise<FinalStateResponse<T>>;
  getSince: (id: any, versionNumber: number, apiArgs?: any) => Promise<SinceResponse<T>>;
  update: (id: any, event: IEvent<T>, apiArgs?: any) => Promise<EventUpdateResponse>;
}
