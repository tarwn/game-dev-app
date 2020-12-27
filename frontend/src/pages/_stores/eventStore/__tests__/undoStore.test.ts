import { createFakeStore, TestModel } from "../../../../testUtils/testEventStore";
import type { Versioned } from "../types";
import { createUndoStore } from "../undoStore";

type TestState = Versioned & {
  change: number;
};

// wire into test event store
const basicEventStore = createFakeStore();
let testState = null as TestModel | null;
basicEventStore.testEventStore.subscribe(state => testState = state.finalState);
basicEventStore.testEventStore.initialize('ut-abc', '123');
basicEventStore.testEventStore.loadFullState();

function getEvent(value: string) {
  return basicEventStore.events.onChange({ parentId: testState.change.parentId, globalId: testState.change.globalId, value });
}

describe("undoStore", () => {
  it("does not support undo/redo when there are no events", () => {
    const store = createUndoStore<TestState>();
    let lastState = null;
    const unsubscribe = store.subscribe((state) => lastState = state);

    expect(lastState).not.toBeNull();
    expect(lastState.canUndo).toBe(false);
    expect(lastState.canRedo).toBe(false);
    unsubscribe();
  });

  describe("addEvent", () => {
    it("adds event to the queue to be undo-able", () => {
      const store = createUndoStore<TestState>();

      store.addEvent(() => getEvent('1'), () => getEvent('0'));

      const internals = store.getTest();
      expect(internals.queue.length).toBe(1);
      expect(internals.queueIndex).toBe(0);
    });

    it("supports undo right after adding an event", () => {
      const store = createUndoStore<TestState>();
      let lastState = null;
      const unsubscribe = store.subscribe((state) => lastState = state);

      store.addEvent(() => getEvent('1'), () => getEvent('0'));

      expect(lastState).not.toBeNull();
      expect(lastState.canUndo).toBe(true);
      expect(lastState.canRedo).toBe(false);
      unsubscribe();
    });

    it("replaces future portion of event queue if add event after undos", () => {
      const store = createUndoStore<TestState>();

      store.addEvent(() => getEvent('1'), () => getEvent('0'));
      store.addEvent(() => getEvent('2'), () => getEvent('1'));
      store.addEvent(() => getEvent('3'), () => getEvent('2'));
      store.undo();
      store.undo();
      // this assumes we were running the events and correctly had applied the undos to get cur state to 1
      store.addEvent(() => getEvent('4'), () => getEvent('1'));

      const internals = store.getTest();
      expect(internals.queue.length).toBe(2);
      expect(internals.queueIndex).toBe(1);
    });
  });

  describe("undoEvent", () => {
    it("does not perform undo when there are no events", () => {
      const store = createUndoStore<TestState>();
      const undoEvent = store.undo();

      expect(undoEvent).toBeNull();
    });

    it("returns event's undo when undoing an event", () => {
      const store = createUndoStore<TestState>();

      store.addEvent(() => getEvent('1'), () => getEvent('0'));
      const undoEvent = store.undo();

      expect(undoEvent.operations[0].value).toBe("0");
      const internals = store.getTest();
      expect(internals.queue.length).toBe(1);
      expect(internals.queueIndex).toBe(-1);
    });

    it("applies newer seqNo to events when undoing", () => {
      const store = createUndoStore<TestState>();

      const origEvent = store.addEvent(() => getEvent('1'), () => getEvent('0'));
      const undoEvent = store.undo();

      expect(undoEvent.seqNo).toBe(origEvent.seqNo + 1);
    });
  });

  describe("redoEvent", () => {
    it("does not perform redo when there are no events", () => {
      const store = createUndoStore<TestState>();
      const undoEvent = store.redo();

      expect(undoEvent).toBeNull();
    });

    it("returns the correct state when redoing an undo", () => {
      const store = createUndoStore<TestState>();

      const origEvent = store.addEvent(() => getEvent('1'), () => getEvent('0'));
      const undoEvent = store.undo();
      const redoEvent = store.redo();

      expect(origEvent.operations[0].value).toBe("1");
      expect(undoEvent.operations[0].value).toBe("0");
      expect(redoEvent.operations[0].value).toBe("1");
      const internals = store.getTest();
      expect(internals.queue.length).toBe(1);
      expect(internals.queueIndex).toBe(0);
    });

    it("applies newer seqNo to events when redoing", () => {
      const store = createUndoStore<TestState>();

      const origEvent = store.addEvent(() => getEvent('1'), () => getEvent('0'));
      const undoEvent = store.undo();
      const redoEvent = store.redo();

      expect(undoEvent.seqNo).toBe(origEvent.seqNo + 1);
      expect(redoEvent.seqNo).toBe(origEvent.seqNo + 2);
    });

    it("returns event's redo when redoing an event", () => {
      const store = createUndoStore<TestState>();

      store.addEvent(() => getEvent('1'), () => getEvent('0'));
      store.addEvent(() => getEvent('2'), () => getEvent('1'));
      store.addEvent(() => getEvent('3'), () => getEvent('2'));
      store.addEvent(() => getEvent('4'), () => getEvent('3'));
      // 3 undos
      store.undo();
      store.undo();
      store.undo();
      // 2 redos - should be at #3
      store.redo();
      const finalRedo = store.redo();

      expect(finalRedo.operations[0].value).toBe("3");
      const internals = store.getTest();
      expect(internals.queue.length).toBe(4);
      expect(internals.queueIndex).toBe(2);
    });

  });
});
