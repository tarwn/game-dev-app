import { writable } from 'svelte/store';
import { log } from '../logger';
import type { Versioned, IEvent, IEventApplier, ReadableEventStore } from './types';

export function createLocalStore<T extends Versioned>(eventStore: ReadableEventStore<T>, eventApplier: IEventApplier<T>) {
  let latestLocalState = null as T | null;
  let latestFinalState = null as T | null;
  let latestEventQueue = [] as IEvent<T>[];
  const { subscribe, update } = writable(latestLocalState);
  eventStore.subscribe(es => {
    // todo add locking or promise chain
    if (latestFinalState != es.finalState) {
      log("Final State Updated", { localStateAction: "rebuild all" });
      latestFinalState = es.finalState;
      latestEventQueue = es.pendingEvents;
      const tempState = { ...latestFinalState };
      latestEventQueue.forEach(event => eventApplier.apply(tempState, event));
      latestLocalState = tempState;
      update(() => latestLocalState);
    }
    else if (latestEventQueue != es.pendingEvents) {
      log("Event Queue Updated", { localStateAction: "rebuild events" });
      latestEventQueue = es.pendingEvents;
      const tempState = { ...latestFinalState };
      latestEventQueue.forEach(event => eventApplier.apply(tempState, event));
      latestLocalState = tempState;
      update(() => latestLocalState);
    }
  });

  return {
    subscribe
  };
}
