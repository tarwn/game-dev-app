import { writable } from 'svelte/store';

function createWebSocketStore() {
  const { subscribe, set } = writable(null);

  const disconnect = () => {
    set(false);
  };

  const connect = () => {
    set(true);
  };

  return {
    subscribe,
    connect,
    disconnect
  };
}

export const webSocketStore = createWebSocketStore();
