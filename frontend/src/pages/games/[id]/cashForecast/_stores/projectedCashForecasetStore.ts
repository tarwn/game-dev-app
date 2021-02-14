import { writable } from 'svelte/store';
import type { ICashForecast } from '../_types/cashForecast';



function createProjectedCashFlowStore() {
  const { subscribe, set } = writable(null);

  const update = (cashForecast: ICashForecast) => {
    // do the heavy lifting
    // call set
    // return fetch(`/api/fe/games`)
    //   .then(jsonOrThrow)
    //   .then((data: any[]) => {
    //     const games = data.map(d => ({
    //       ...d,
    //       lastModified: new Date(d.lastModified)
    //     })) as Game[];
    //     set(games);
    //   });
  };

  return {
    subscribe,
    update
  };
}

export const gamesStore = createProjectedCashFlowStore();
