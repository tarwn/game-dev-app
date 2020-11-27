import { writable } from 'svelte/store';
import { log } from '../logger';
import type { Versioned, IEvent, IEventApplier, ReadableEventStore } from './types';

export function createLocalStore<T extends Versioned>(eventStore: ReadableEventStore<T>, eventApplier: IEventApplier<T>) {
  let latestLocalState = null as T | null;
  let latestFinalStateVersion = null as number | null;
  let nextEventInQueue = null as IEvent<T> | null;
  const { subscribe, update } = writable(latestLocalState);
  eventStore.subscribe(es => {
    // todo add locking or promise chain
    if (es.finalState != null && latestFinalStateVersion != es.finalState.versionNumber) {
      latestFinalStateVersion = es.finalState.versionNumber;
      nextEventInQueue = es.pendingEvents.length > 0 ? es.pendingEvents[0] : null;
      const tempState = { ...es.finalState };
      es.pendingEvents.forEach(event => eventApplier.apply(tempState, event));
      latestLocalState = tempState;
      log("localStore.FinalStateUpdate", { localStateAction: "rebuild all", latestLocalState });
      update(() => latestLocalState);
    }
    else if (es.finalState != null && !nextEventInQueueStillMatches(es.pendingEvents, nextEventInQueue)) {
      nextEventInQueue = es.pendingEvents.length > 0 ? es.pendingEvents[0] : null;
      const tempState = { ...es.finalState };
      es.pendingEvents.forEach(event => eventApplier.apply(tempState, event));
      latestLocalState = tempState;
      update(() => latestLocalState);
      log("eventStore.EventQueueUpdate", { localStateAction: "rebuild events", latestLocalState });
    }
    else {
      log("eventStore.????", { localStateAction: "skip rebuild", latestLocalState });
    }
  });

  return {
    subscribe
  };
}

function nextEventInQueueStillMatches<T extends Versioned>(queue: IEvent<T>[], previousNextEvent: IEvent<T> | null): boolean {
  if (previousNextEvent == null) {
    return queue.length == 0;
  }

  return queue[0] == previousNextEvent;
}
