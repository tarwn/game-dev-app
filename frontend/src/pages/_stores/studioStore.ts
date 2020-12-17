import { writable } from 'svelte/store';
import { jsonOrThrow } from '../_communications/responseHandler';

export type Studio = {
  name: string;
}

function createStudioStore() {
  const { subscribe, set } = writable(null);

  const load = () => {
    return fetch(`/api/fe/studio`)
      .then(jsonOrThrow)
      .then((data) => {
        set(data as Studio);
      });
  };

  return {
    subscribe,
    load
  };
}

export const studioStore = createStudioStore();
