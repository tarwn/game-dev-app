import { writable } from 'svelte/store';
import { log } from '../../../utilities/logger';
import type { Versioned, IEvent, IEventApplier, ReadableEventStore, ReadableLocalStore } from './types';

export function createLocalStore<T extends Versioned>(eventStore: ReadableEventStore<T>, eventApplier: IEventApplier<T>): ReadableLocalStore<T> {
  let latestLocalState = null as T | null;
  let latestFinalStateVersion = null as number | null;
  let nextEventInQueue = null as IEvent<T> | null;
  let lastEventInQueue = null as IEvent<T> | null;
  const { subscribe, update } = writable(latestLocalState);
  eventStore.subscribe(es => {
    // todo add locking or promise chain
    if (es.finalState != null && latestFinalStateVersion != es.finalState.versionNumber) {
      latestFinalStateVersion = es.finalState.versionNumber;
      nextEventInQueue = es.pendingEvents.length > 0 ? es.pendingEvents[0] : null;
      lastEventInQueue = es.pendingEvents.length > 0 ? es.pendingEvents.slice(-1)[0] : null;
      let tempState = { ...es.finalState };
      es.pendingEvents.forEach(event => tempState = eventApplier.apply(tempState, event));
      latestLocalState = tempState;
      log("localStore.FinalStateUpdate", { localStateAction: "rebuild all", latestLocalState });
      update(() => latestLocalState);
    }
    else if (es.finalState != null && !eventQueueStillMatches(es.pendingEvents, nextEventInQueue, lastEventInQueue)) {
      nextEventInQueue = es.pendingEvents.length > 0 ? es.pendingEvents[0] : null;
      lastEventInQueue = es.pendingEvents.length > 0 ? es.pendingEvents.slice(-1)[0] : null;
      let tempState = { ...es.finalState };
      es.pendingEvents.forEach(event => tempState = eventApplier.apply(tempState, event));
      latestLocalState = tempState;
      update(() => latestLocalState);
      log("localStore.EventQueueUpdate", { localStateAction: "rebuild events", latestLocalState });
    }
    else if (es.finalState == null) {
      log("localStore.reset", null);
      latestLocalState = null;
      latestFinalStateVersion = null;
      nextEventInQueue = null;
      lastEventInQueue = null;
      update(() => null);
    }
    else {
      log("localStore.????", {
        localStateAction: "skip rebuild",
        esFinalStateIsSet: (es.finalState != null),
        esFinalStateVersion: es.finalState?.versionNumber,
        latestFinalStateVersion,
        latestLocalState,

      });
    }
  });

  return {
    subscribe
  };
}

function eventQueueStillMatches<T extends Versioned>(queue: IEvent<T>[], previousNextEvent: IEvent<T> | null, lastEventInQueue: IEvent<T> | null): boolean {
  if (previousNextEvent == null) {
    return queue.length == 0;
  }

  return queue[0] == previousNextEvent && queue[queue.length - 1] == lastEventInQueue;
}
