import type { GetActorSeqNoResponse, IEvent, IEventStateApi } from "../../../../_stores/eventStore/types";
import type { ICashForecast } from "../_types/cashForecast";

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

export const api: IEventStateApi<ICashForecast> = {
  get: (id: any) => {
    return fetch(`/api/fe/cashForecasts/${id}`)
      .then(jsonOrThrow)
      .then((data) => {
        return { payload: data as ICashForecast };
      });
  },
  getSince: (id: any, versionNumber: number) => {
    return fetch(`/api/fe/cashForecasts/${id}/since/${versionNumber}`)
      .then(jsonOrThrow)
      .then((data) => {
        return data as { events: IEvent<ICashForecast>[] };
      });
  },
  update: (id: any, event: IEvent<ICashForecast>) => {
    return fetch(`/api/fe/cashForecasts/${id}`, {
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
