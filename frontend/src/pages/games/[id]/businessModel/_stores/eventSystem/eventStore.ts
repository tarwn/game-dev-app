import { init } from 'svelte/internal';
import { writable } from 'svelte/store';
import { log } from '../logger';
import type { Versioned, Identified, IEvent, IEventApplier, IEventStateApi, IEventStore, VersionEventArgs } from './types';

export function createEventStore<T extends Versioned & Identified>(api: IEventStateApi<T>, eventApplier: IEventApplier<T>): IEventStore<T> {
  // api args and id to skip stale API calls coming back
  const initState = {
    id: null,
    apiArgs: null,
    seqNo: 1,
    actor: null
  };
  const pendingEvents = [] as IEvent<T>[];
  let finalState = null as T | null;
  const { subscribe, update } = writable({ pendingEvents, finalState });

  let currentSending = null;
  let nextSafetySend = null;

  function initialize(actor: string, id: any, apiArgs?: any) {
    log("eventStore.initialize", { actor, id, apiArgs });
    initState.actor = actor;
    initState.seqNo = 1;
    initState.id = id;
    initState.apiArgs = apiArgs;
    // reset everything
    finalState = null;
    pendingEvents.splice(0);
    update(() => ({ finalState, pendingEvents }));
    // get latest usable seqNo for this actor id
    return api.getActorSeqNo(actor)
      .then(response => {
        if (response.actor == initState.actor) {
          initState.seqNo = response.seqNo + 1;
        }
        return id;
      });
  }

  function createEvent(builder: VersionEventArgs) {
    const evt = {
      actor: initState.actor,
      seqNo: initState.seqNo,
      versionNumber: null,
      previousVersionNumber: finalState?.versionNumber,
      ...builder(initState.actor, initState.seqNo)
    };
    initState.seqNo += Math.max(1, evt.operations.length);
    return evt;
  }

  function addEvent(event: IEvent<T>) {
    log("eventStore.addEvent", { event });
    pendingEvents.push(event);
    update(state => ({ ...state, pendingEvents }));
    sendEvent();
  }

  function receiveEvent(parentId: string, event: IEvent<T>) {
    log("eventStore.receiveEvent", { parentId, event });
    if (finalState.parentId != parentId) {
      console.log(`"Mismatched parentId: ${parentId} vs ${finalState.parentId}`);
      return;
    }

    if (initState.actor == event.actor) {
      console.log(`"Actor matches, I sent this: ${event.actor} vs ${initState.actor}`);
      return;
    }

    if (finalState && finalState.versionNumber >= event.versionNumber) {
      console.log(`Already applied version ${event.versionNumber}, currently on version ${finalState.versionNumber}`);
      return;
    }

    if (finalState && finalState.versionNumber < event.versionNumber - 1) {
      console.log(`Detected gap, calling since instead. Received ${event.versionNumber}, currently on version ${finalState.versionNumber}`);
      loadSinceEvents(finalState.versionNumber);
    }

    console.log(`Applying received event for version ${event.versionNumber}, currently on version ${finalState.versionNumber}`);
    finalState = eventApplier.apply(finalState, event);
    update(() => ({ finalState, pendingEvents }));
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

        currentSending.versionNumber = response.versionNumber;
        if (finalState && finalState.versionNumber == response.versionNumber - 1) {
          // console.log(`Applying sendEvent'd event for version ${currentSending.versionNumber}, currently on version ${finalState.versionNumber}`);
          finalState = eventApplier.apply(finalState, currentSending);
          pendingEvents.pop();
          update(() => ({ finalState, pendingEvents }));
        }
        else if (finalState && finalState.versionNumber < response.versionNumber - 1) {
          // console.log(`Detected gap, calling since instead. Received ${event.versionNumber}, currently on version ${finalState.versionNumber}`);
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
          sendEvent(retryCounter + 1);
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
    const thisId = initState.id;
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
    createEvent,
    subscribe,
    loadFullState,
    addEvent,
    receiveEvent
  };
}
