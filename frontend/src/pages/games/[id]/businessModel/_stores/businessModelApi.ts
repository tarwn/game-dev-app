import type { GetActorSeqNoResponse, IEvent, IEventStateApi } from "../../../../_stores/eventStore/types";
import type { IBusinessModel } from "../_types/businessModel";

const jsonOrThrow = (r: Response) => {
  if (r.status <= 299) {
    return r.json();
  }
  else if (r.status <= 499) {
    throw Error(`HTTP response error, ${r.status}: ${r.statusText}`);
  }
  else {
    throw Error(`HTTP server error, ${r.status}: ${r.statusText}`);
  }
};

export const api: IEventStateApi<IBusinessModel> = {
  get: (id: any) => {
    return fetch(`/api/fe/businessModels/${id}`)
      .then(jsonOrThrow)
      .then((data) => {
        return { payload: data as IBusinessModel };
      });
  },
  getSince: (id: any, versionNumber: number) => {
    return fetch(`/api/fe/businessModels/${id}/since/${versionNumber}`)
      .then(jsonOrThrow)
      .then((data) => {
        return data as { events: IEvent<IBusinessModel>[] };
      });
  },
  update: (id: any, event: IEvent<IBusinessModel>) => {
    return fetch(`/api/fe/businessModels/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(event)
    })
      .then(jsonOrThrow)
      .then((data) => {
        return {
          versionNumber: data.versionNumber,
          previousVersionNumber: data.previousVersionNumber
        };
      });
  },
  getActorSeqNo: (actor: string) => {
    return fetch(`/api/fe/actors/${actor}/latestSeqNo`)
      .then(jsonOrThrow)
      .then((data) => {
        return data as GetActorSeqNoResponse;
      });
  }
};
