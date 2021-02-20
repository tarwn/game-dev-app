import { writable } from 'svelte/store';
import { log } from '../../../../../utilities/logger';
import type { ICashForecast } from '../_types/cashForecast';
import { calculate } from './calculator/calculator';
import { getEmptyProjection, IProjectedCashFlowData } from './calculator/types';



function createProjectedCashFlowStore() {
  const { subscribe, set } = writable<IProjectedCashFlowData>(null);
  let latestProjection = getEmptyProjection();

  const updateForecast = (forecast: ICashForecast) => {
    if (forecast) {
      latestProjection = calculate(forecast, latestProjection, forecast.forecastMonthCount.value);
      log("forecastCalculated", {
        elapsed: latestProjection.calculationTime,
        date: latestProjection.lastCalculated
      });
    }
    else {
      latestProjection = getEmptyProjection();
    }
    set(latestProjection);
  };

  return {
    subscribe,
    updateForecast
  };
}

export const projectedCashFlowStore = createProjectedCashFlowStore();
