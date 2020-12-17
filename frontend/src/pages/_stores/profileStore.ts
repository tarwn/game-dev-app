import { writable } from 'svelte/store';
import { jsonOrThrow } from '../_communications/responseHandler';

export type UserProfile = {
  displayName: string;
}

function createProfileStore() {
  const { subscribe, set } = writable(null);

  const load = () => {
    return fetch(`/api/fe/userProfile`)
      .then(jsonOrThrow)
      .then((data) => {
        set(data as UserProfile);
      });
  };

  return {
    subscribe,
    load
  };
}

export const profileStore = createProfileStore();
