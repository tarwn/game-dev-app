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

function readPayload(data: ICashForecast) {
  data.forecastStartDate.value = new Date(data.forecastStartDate.value);
  data.bankBalance.date.value = new Date(data.bankBalance.date.value);
  data.loans.list.forEach(loan => {
    loan.cashIn.list.forEach(ci => {
      ci.date.value = new Date(ci.date.value);
    });
    loan.repaymentTerms?.cashOut.list.forEach(co => {
      co.startDate.value = new Date(co.startDate.value);
    });
  });
  return data;
}

export const api: IEventStateApi<ICashForecast> = {
  get: (id: any) => {
    return fetch(`/api/fe/cashForecasts/${id}`)
      .then(jsonOrThrow)
      .then((data) => {
        return { payload: readPayload(data) };
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
