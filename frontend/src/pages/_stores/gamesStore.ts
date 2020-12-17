import { writable } from 'svelte/store';
import { jsonOrThrow } from '../_communications/responseHandler';

export type Game = {
  globalId: string;
  name: string;
}

function createGamesStore() {
  const { subscribe, set } = writable(null);

  const load = () => {
    return fetch(`/api/fe/games`)
      .then(jsonOrThrow)
      .then((data) => {
        set(data as Game[]);
      });
  };

  return {
    subscribe,
    load
  };
}

export const gamesStore = createGamesStore();
