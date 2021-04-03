import produce from 'immer';
import { writable } from 'svelte/store';
import { usersApi } from './usersApi';

function createUsersStore() {
  const { subscribe, set } = writable(null);
  let users = null;

  const load = () => {
    usersApi.getAll()
      .then((u) => {
        users = produce(users, () => u);
        set(users);
      });
  };

  return {
    subscribe,
    load
  };
}

export const usersStore = createUsersStore();
