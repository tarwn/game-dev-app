import { writable } from 'svelte/store';
import { log } from '../../utilities/logger';
import type { UpdateScope } from './UpdateScope';

// How this works:
//  1. The Socket Manager component is root scoped: manages the connection, displays the toast for connection status
//  2. The Socket Channel is how a page registers that it cares about certain events and gets the message topic/group name, but it reads messages from the general store on filters on that topic
//  3. The Store manages registering and deregistering from the server groups/topics, re-doing this on reconnects, and putting messages in the store for propagation


// Q: Are the ws.on(...) events singular or stackable: singular, it's intended to be an RPC call
// Q: Does every store `set` get sent, or is there a debounce and some will be skipped

// option 1:
//  client controls call this to say "I wanted to listen to events for this scope/game id"
//  it's added to local collection, callback event is added for OnSignalREvent if it's not present in list yet, + event name (fully defined scope string) is sent back somehow (async)
//  On SignalR Event(fqscope, evt): set({ fqscope, evt })
//  client deconstruct calls this "I don't need this scope any more" and we remove it from the local collection, possibly also tell the server we don't need it anymore if no remaning clients interested

// on reconnect: re-register all scopes in list, should not need to rewire anything


function createWebSocketStore() {
  const { subscribe, set } = writable(null);
  let connection = null;

  const registeredScopes = {} as { [key: string]: number[] };
  const getScopeKey = (scope: UpdateScope, gameId?: string) => `${scope}::${gameId}`;

  const initializeConnection = (c: any) => {
    connection = c;
  };

  const clearConnection = () => {
    // clear registered groups - not sure what the deconstruct order is so there may be some hanging on
    connection = null;
  };

  const registerForScope = (channelId: number, scope: UpdateScope, gameId?: string): Promise<string> => {
    if (connection == null) {
      throw new Error("Cannot begin registering for SignalR scopes before the connection is initialized.");
    }

    // ensure this is in the tracking object
    const scopeKey = getScopeKey(scope, gameId);
    if (!registeredScopes[scopeKey]) {
      registeredScopes[scopeKey] = [];
    }

    // register with the server + wire up incoming message handling
    log("SignalR:RegisterForScope", { channelId, scope, gameId });
    return connection.invoke("registerForTopic", scope, gameId)
      .then(topic => {
        registeredScopes[scopeKey].push(channelId);

        connection.on(topic, (args: any) => {
          // log("SignalR: receive", { topic, args });
          set({ scope, topic, event: args });
        });

        return topic;
      });
  };

  const unregisterForScope = (channelId: number, scope: UpdateScope, gameId?: string) => {
    const scopeKey = getScopeKey(scope, gameId);
    if (!registeredScopes[scopeKey]) {
      throw new Error(`Unregistered from SignalR topic prior to registration. Scope=${scope}, GameId=${gameId}, channelId: ${channelId}`);
    }
    // remove this channel from registrations, if none listening to this topic then unsubscribe on the server
    registeredScopes[scopeKey] = registeredScopes[scopeKey].filter(c => c !== channelId);
    if (registeredScopes[scopeKey].length == 0) {
      log("SignalR:UnregisterForScope", { channelId, scope, gameId });
      connection.invoke("unregisterForTopic", scope, gameId);
    }
  };

  return {
    subscribe,
    initializeConnection,
    clearConnection,
    registerForScope,
    unregisterForScope
  };
}

export const webSocketStore = createWebSocketStore();
export type WebSocketMessage = {
  scope: UpdateScope,
  topic: string,
  event: any
};
