import produce from "immer";
import { log } from "../logger";
import type { IEvent, IEventApplier, Versioned } from "./types";

type MutableEventReducer<T extends Versioned> = (model: T, event: IEvent<T>) => void;

export function createImmutableEventApplier<T extends Versioned>(eventHandlers: { [key: string]: MutableEventReducer<T> }): IEventApplier<T> {
  return {
    apply: (model: T, event: IEvent<T>) => {
      log(`Apply(${event.type}):Before`, { event, model });
      if (!eventHandlers[event.type]) {
        throw new Error(`IEventApplier<T>: Unrecognized event type ${event.type}, cannot continue`);
      }
      const nextState = produce(model, draftState => {
        eventHandlers[event.type](draftState as T, event);
        draftState.versionNumber = event.versionNumber || model.versionNumber;
      });
      // log(`Apply(${event.type}):After`, { nextState });
      return nextState;
    }
  };
}
