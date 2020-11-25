import { writable } from 'svelte/store';
import { log } from '../logger';
import type { Versioned, IEvent, IEventApplier, IEventStateApi, IEventStore } from './types';


export function createEventStore<T extends Versioned>(api: IEventStateApi<T>, eventApplier: IEventApplier<T>): IEventStore<T> {
  // api args and id to skip stale API calls coming back
  const initState = {
    id: null,
    apiArgs: null
  };
  const pendingEvents = [] as IEvent<T>[];
  let finalState = null as T | null;
  const { subscribe, update } = writable({ pendingEvents, finalState });

  let currentSending = null;
  let nextSafetySend = null;

  function initialize(id: any, apiArgs?: any) {
    initState.id = id;
    log("eventStore.initialize", { id, apiArgs });
    initState.apiArgs = apiArgs;
  }

  function addEvent(event: IEvent<T>) {
    log("addEvent", { event });
    pendingEvents.push(event);
    update(state => ({ ...state, pendingEvents }));
    sendEvent();
  }

  function scheduleNextSafetySendEvent() {
    nextSafetySend = setTimeout(sendEvent, 30000);
  }

  function sendEvent(retryCounter = 0) {
    if (nextSafetySend) {
      clearTimeout(nextSafetySend);
    }

    if (currentSending || pendingEvents.length == 0 || pendingEvents[0].versionNumber) {
      scheduleNextSafetySendEvent();
      return;
    }
    currentSending = pendingEvents[0];

    const thisId = initState.id;
    api.update(initState.id, currentSending, initState.apiArgs)
      .then(response => {
        if (thisId != initState.id) return;

        // todo: apply event to prior state
        currentSending.versionNumber = response.versionNumber;
        currentSending.previousVersionNumber = response.previousVersionNumber;
        if (finalState && finalState.versionNumber == response.previousVersionNumber) {
          finalState = eventApplier.apply(finalState, currentSending);
          pendingEvents.pop();
          update(() => ({ finalState, pendingEvents }));
        }
        else {
          loadSinceEvents(finalState.versionNumber);
        }
        currentSending = null;
        sendEvent();
      })
      .catch(err => {
        // report error
        //  todo
        console.error(err);

        // offline? toggle and schedule retry
        //  todo

        // try again
        currentSending = null;
        if (retryCounter < 3) {
          sendEvent(++retryCounter);
        }
        else {
          scheduleNextSafetySendEvent();
        }
      });
  }

  function loadFullState() {
    const thisId = initState.id;
    api.get(initState.id, initState.apiArgs)
      .then(response => {
        if (thisId != initState.id) return;

        // todo: model processing?
        finalState = response.payload;
        clearStalePendingEvents();
        update(() => ({ finalState, pendingEvents }));
      })
      .catch(err => {
        throw (err);
      });
  }

  function loadSinceEvents(versionNumber: number) {
    const thisId = initState.apiArgs;
    api.getSince(initState.id, versionNumber, initState.apiArgs)
      .then(response => {
        if (thisId != initState.id) return;

        if (!finalState) {
          throw new Error("Cannot apply since events before final state is defined");
        }

        // apply since events to the final state
        //  assumes they are in order
        response.events.forEach(event => {
          // skip early events if already present/applied
          if (event.versionNumber > finalState.versionNumber) {
            finalState = eventApplier.apply(finalState, event);
          }
        });
        clearStalePendingEvents();
        update(() => ({ finalState, pendingEvents }));
      })
      .catch(err => {
        throw (err);
      });
  }

  function clearStalePendingEvents() {
    // clear out relevant pending events still in queue
    while (pendingEvents.length > 0 && pendingEvents[0].versionNumber != null && pendingEvents[0].versionNumber < finalState.versionNumber) {
      pendingEvents.pop();
    }
  }

  return {
    initialize,
    subscribe,
    loadFullState,
    addEvent
  };
}
