import { writable } from 'svelte/store';

function createWebSocketConnectionStore() {
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

export const webSocketConnectionStore = createWebSocketConnectionStore();
