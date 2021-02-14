import { writable } from 'svelte/store';
import { jsonOrThrow } from '../_communications/responseHandler';
import type { GameStatus } from './types';

export type Game = {
  globalId: string;
  name: string;
  status: GameStatus;
  lastModified: Date;
};

function createGamesStore() {
  const { subscribe, set } = writable(null);

  const load = () => {
    return fetch(`/api/fe/games`)
      .then(jsonOrThrow)
      .then((data: any[]) => {
        const games = data.map(d => ({
          ...d,
          lastModified: new Date(d.lastModified)
        })) as Game[];
        set(games);
      });
  };

  return {
    subscribe,
    load
  };
}

export const gamesStore = createGamesStore();
