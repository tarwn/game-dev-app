import produce from 'immer';
import { writable } from 'svelte/store';
import { studioApi } from './studioApi';

function createStudioStore() {
  const { subscribe, set } = writable(null);
  let studio = null;

  const load = () => {
    studioApi.get()
      .then((s) => {
        studio = produce(studio, () => s);
        set(studio);
      });
  };

  return {
    subscribe,
    load
  };
}

export const studioStore = createStudioStore();
