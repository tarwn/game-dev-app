import { log } from "../../../../../utilities/logger";
import { jsonOrThrow } from "../../../../_communications/responseHandler";
import type { GetActorSeqNoResponse, IEvent, IEventStateApi } from "../../../../_stores/eventStore/types";
import type { ICashForecast } from "../_types/cashForecast";

function readPayload(data: ICashForecast) {
  data.forecastStartDate.value = new Date(data.forecastStartDate.value);
  data.launchDate.value = new Date(data.launchDate.value);
  data.bankBalance.date.value = new Date(data.bankBalance.date.value);
  data.loans.list.forEach(loan => {
    loan.cashIn.list.forEach(ci => {
      ci.date.value = new Date(ci.date.value);
    });
    loan.repaymentTerms?.cashOut.list.forEach(co => {
      co.startDate.value = new Date(co.startDate.value);
    });
  });
  data.funding.list.forEach(f => {
    f.cashIn.list.forEach(ci => {
      ci.date.value = new Date(ci.date.value);
    });
    f.repaymentTerms?.cashOut.list.forEach(co => {
      co.startDate.value = new Date(co.startDate.value);
    });
  });
  data.expenses.list.forEach(e => {
    e.startDate.value = new Date(e.startDate.value);
    e.endDate.value = new Date(e.endDate.value);
  });
  data.employees.list.forEach(e => {
    e.startDate.value = new Date(e.startDate.value);
    e.endDate.value = new Date(e.endDate.value);
    e.additionalPay.list.forEach(ap => {
      ap.date.value = new Date(ap.date.value);
    });
  });
  data.contractors.list.forEach(e => {
    e.payments.list.forEach(p => {
      p.startDate.value = new Date(p.startDate.value);
      p.endDate.value = new Date(p.endDate.value);
    });
  });
  data.taxes.list.forEach(t => {
    t.dueDate.value = new Date(t.dueDate.value);
  });
  data.estimatedRevenue.platforms.list.forEach(p => {
    p.startDate.value = new Date(p.startDate.value);
  });
  return data;
}

export const api: IEventStateApi<ICashForecast> = {
  get: (id: any, apiArgs?: any) => {
    log("CashforecastAPI.get(): started", { apiArgs });
    return fetch(`/api/fe/cashForecasts/${id}?skipCreate=${!!apiArgs?.skipCreate}`)
      .then(jsonOrThrow)
      .then((data: any) => {
        log("CashforecastAPI.get():JSON data received", {});
        if (data) {
          return { payload: readPayload(data) };
        }
        else {
          return { payload: null };
        }
      });
  },
  getSince: (id: any, versionNumber: number) => {
    return fetch(`/api/fe/cashForecasts/${id}/since/${versionNumber}`)
      .then(jsonOrThrow)
      .then((data: any) => {
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
      .then((data: any) => {
        return {
          versionNumber: data.versionNumber,
          previousVersionNumber: data.previousVersionNumber
        };
      });
  },
  getActorSeqNo: (actor: string) => {
    return fetch(`/api/fe/actors/${actor}/latestSeqNo`)
      .then(jsonOrThrow)
      .then((data: any) => {
        return data as GetActorSeqNoResponse;
      });
  }
};
