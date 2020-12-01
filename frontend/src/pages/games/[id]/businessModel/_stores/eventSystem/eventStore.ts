import { writable } from 'svelte/store';
import produce from "immer";
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
  let pendingEvents = [] as IEvent<T>[];
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
    pendingEvents = produce(pendingEvents, (draft) => {
      draft.splice(0);
    });
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
    pendingEvents = produce(pendingEvents, (draft) => {
      draft.push(event);
    });
    update(state => ({ ...state, pendingEvents }));
    sendEvent();
  }

  function receiveEvent(rootParentId: string, event: IEvent<T>) {
    log("eventStore.receiveEvent", { rootParentId, event });
    if (finalState.parentId != rootParentId) {
      console.log(`"Mismatched parentId: ${rootParentId} vs ${finalState.parentId}`);
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
    nextSafetySend = setTimeout(() => sendEvent(), 10000);
  }

  function sendEvent(retryCounter = 0) {
    console.log("sendEvent: " + pendingEvents.length);
    if (nextSafetySend) {
      clearTimeout(nextSafetySend);
    }

    if (currentSending || pendingEvents.length == 0 || pendingEvents[0].versionNumber) {
      scheduleNextSafetySendEvent();
      return;
    }
    currentSending = { ...pendingEvents[0] };
    console.log("About to send event w/ first op id of: " + pendingEvents[0].operations[0].objectId);

    const thisId = initState.id;
    api.update(initState.id, currentSending, initState.apiArgs)
      .then(response => {
        if (thisId != initState.id) return;

        currentSending.versionNumber = response.versionNumber;
        if (finalState && finalState.versionNumber == response.versionNumber - 1) {
          // console.log(`Applying sendEvent'd event for version ${currentSending.versionNumber}, currently on version ${finalState.versionNumber}`);
          finalState = eventApplier.apply(finalState, currentSending);
          pendingEvents = produce(pendingEvents, (draft) => {
            draft.shift();
          });
          update(() => ({ finalState, pendingEvents }));
        }
        else if (finalState && finalState.versionNumber < response.versionNumber - 1) {
          // console.log(`Detected gap, calling since instead. Received ${event.versionNumber}, currently on version ${finalState.versionNumber}`);
          loadSinceEvents(finalState.versionNumber);
        }
        currentSending = null;
        console.log("done sendEvent: " + pendingEvents.length);
        console.log("next pending event has first op id of: " + pendingEvents[0].operations[0].objectId);
        sendEvent();
      })
      .catch(err => {
        currentSending = null;
        if (err.message && err.message.indexOf("HTTP server error") >= 0) {
          if (nextSafetySend) {
            clearTimeout(nextSafetySend);
          }
          throw err;
        }

        console.log(err);
        // assume offline, back off and retry
        if (retryCounter < 1) {
          log("eventStore.sendEvent(retry)", { retryCounter });
          sendEvent(retryCounter + 1);
        }
        else {
          log("eventStore.sendEvent(backoff retry)", { retryCounter });
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
        pendingEvents = clearStalePendingEvents(pendingEvents);
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
        pendingEvents = clearStalePendingEvents(pendingEvents);
        update(() => ({ finalState, pendingEvents }));
      })
      .catch(err => {
        throw (err);
      });
  }

  function clearStalePendingEvents(pendingEvents: IEvent<T>[]): IEvent<T>[] {
    return produce(pendingEvents, (draft) => {
      // clear out relevant pending events still in queue
      while (draft.length > 0 && draft[0].versionNumber != null && draft[0].versionNumber < finalState.versionNumber) {
        draft.pop();
      }
    });
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
