import { log } from "../../../utilities/logger";
import type { IEvent, Versioned } from "./types";
import { Readable, writable } from 'svelte/store';

export type UndoState = { canUndo: boolean; canRedo: boolean; }
export type ReadableUndoStore = Readable<UndoState>

export type UndoRedoItem<T extends Versioned> = {
  event: () => IEvent<T>;
  undo: () => IEvent<T>;
};

interface IUndoStore<T extends Versioned> extends ReadableUndoStore {
  addEvent: (event: () => IEvent<T>, undo: () => IEvent<T>) => IEvent<T>;
  undo: () => IEvent<T>;
  redo: () => IEvent<T>;
}

interface ITestableUndoStore<T extends Versioned> {
  getTest: () => {
    queue: Array<UndoRedoItem<T>>;
    queueIndex: number | null;
  };
}

export function createUndoStore<T extends Versioned>(): IUndoStore<T> & ITestableUndoStore<T> {
  let queue = new Array<UndoRedoItem<T>>();
  let queueIndex = -1;
  let canUndo = false;
  const canRedo = false;

  const { subscribe, update } = writable({ canUndo, canRedo });

  function addEvent(event: () => IEvent<T>, undo: () => IEvent<T>): IEvent<T> {
    log("undoStore.addEvent", { event, undo });
    if (queueIndex < queue.length - 1) {
      queue = queue.slice(0, queueIndex + 1);
    }
    queue.push({ event, undo });
    queueIndex = queue.length - 1;
    canUndo = queueIndex != null;
    update(() => ({ canUndo, canRedo }));
    return event();
  }

  function undo(): IEvent<T> | null {
    let event = null;
    if (queueIndex > -1) {
      event = queue[queueIndex].undo();
      queueIndex--;
    }
    log("undoStore.undo", { event });
    return event;
  }

  function redo(): IEvent<T> | null {
    let event = null;
    if (queueIndex < queue.length - 1) {
      queueIndex++;
      event = queue[queueIndex].event();
    }
    log("undoStore.redo", { event });
    return event;
  }

  return {
    addEvent,
    undo,
    redo,
    subscribe,
    getTest: () => ({
      queue,
      queueIndex
    })
  };
}
