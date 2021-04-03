import produce from 'immer';
import { writable } from 'svelte/store';
import { gamesApi } from './gamesApi';
import type { Game } from './gamesApi';

function createGamesStore() {
  const { subscribe, set } = writable(null);
  let games = [] as Game[];

  const load = () => {
    return gamesApi.getGames()
      .then(loadedGames => {
        games = produce(games, () => loadedGames);
        set(games);
      });
  };

  return {
    subscribe,
    load
  };
}

export const gamesStore = createGamesStore();
