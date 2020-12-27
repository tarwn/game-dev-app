import { createFakeStore, TestModel } from "../../../../testUtils/testEventStore";
import { IEventStoreState, ReceiveDecision } from "../types";

describe("eventStore", () => {
  describe("initialize", () => {
    it("initializes state and queue", () => {
      const store = createFakeStore();
      let testState = null as null | IEventStoreState<TestModel>;
      const unsubscribe = store.testEventStore.subscribe((state) => testState = state);
      expect(testState).not.toBeNull();
      // add an event before initialize just to prove initialize clears things
      store.testEventStore.addEvent(store.events.onChange({ parentId: 'abc', globalId: '123', value: 'zyx' }));
      expect(testState.pendingEvents.length).toBe(1);

      // initialize shold start as over
      store.testEventStore.initialize("", "");
      expect(testState.pendingEvents.length).toBe(0);

      unsubscribe();
    });
  });

  describe("addEvent", () => {
    it("does not send event if full state is not set yet", () => {
      const store = createFakeStore();
      let testState = null as null | IEventStoreState<TestModel>;
      const unsubscribe = store.testEventStore.subscribe((state) => testState = state);
      store.testEventStore.initialize("actor", "id");

      store.testEventStore.addEvent(store.events.onChange({ parentId: 'abc', globalId: '123', value: 'zyx' }));

      expect(testState.pendingEvents.length).toBe(1);
      unsubscribe();
    });

    it("sends event if initialized and full state present already", async () => {
      const store = createFakeStore();
      let testState = null as null | IEventStoreState<TestModel>;
      const unsubscribe = store.testEventStore.subscribe((state) => testState = state);
      store.testEventStore.initialize("actor", "id");
      await store.testEventStore.loadFullState();

      await store.testEventStore.addEvent(store.events.onChange({ parentId: 'abc', globalId: '123', value: 'zyx' }));

      expect(testState.pendingEvents.length).toBe(0);
      unsubscribe();
    });

    it("applies event to fullstate, advancing version number too", async () => {
      const store = createFakeStore();
      let testState = null as null | IEventStoreState<TestModel>;
      const unsubscribe = store.testEventStore.subscribe((state) => testState = state);
      store.testEventStore.initialize("actor", "id");
      await store.testEventStore.loadFullState();
      const initialVersionNumber = testState.finalState.versionNumber;

      await store.testEventStore.addEvent(store.events.onChange({ parentId: 'abc', globalId: '123', value: 'zyx' }));

      expect(testState.finalState.versionNumber).toBe(initialVersionNumber + 1);
      unsubscribe();
    });
  });

  describe("receiveEvent", () => {
    it("processes event if versionNumber dependencies are ok and not more than 1 apart", async () => {

      const store = createFakeStore();
      let testState = null as null | IEventStoreState<TestModel>;
      const unsubscribe = store.testEventStore.subscribe((state) => testState = state);
      store.testEventStore.initialize("primary-actor", "id");
      await store.testEventStore.loadFullState();
      const initialVersionNumber = testState.finalState.versionNumber;

      const receiveEvent = store.events.onChange({ parentId: 'abc', globalId: '123', value: 'zyx' });
      receiveEvent.actor = "another-actor";
      receiveEvent.versionNumber = initialVersionNumber + 1;
      const result = store.testEventStore.receiveEvent(testState.finalState.parentId, receiveEvent);

      expect(testState.finalState.versionNumber).toBe(receiveEvent.versionNumber);
      expect(result).toBe(ReceiveDecision.Applied);
      unsubscribe();
    });

    it("retrieves more events via getSince if there is a version number gap", async () => {

      const store = createFakeStore();
      let testState = null as null | IEventStoreState<TestModel>;
      const unsubscribe = store.testEventStore.subscribe((state) => testState = state);
      store.testEventStore.initialize("primary-actor", "id");
      await store.testEventStore.loadFullState();
      const initialVersionNumber = testState.finalState.versionNumber;

      const receiveEvent = store.events.onChange({ parentId: 'abc', globalId: '123', value: 'zyx' });
      receiveEvent.actor = "another-actor";
      receiveEvent.versionNumber = initialVersionNumber + 2;
      expect(() => store.testEventStore.receiveEvent(testState.finalState.parentId, receiveEvent))
        .toThrowError("getSince is not implemented in test store");

      expect(testState.finalState.versionNumber).toBe(initialVersionNumber);
      unsubscribe();
    });

    it("skips event if it originated with this actor", async () => {
      const store = createFakeStore();
      let testState = null as null | IEventStoreState<TestModel>;
      const unsubscribe = store.testEventStore.subscribe((state) => testState = state);
      store.testEventStore.initialize("primary-actor", "id");
      await store.testEventStore.loadFullState();

      const receiveEvent = store.events.onChange({ parentId: 'abc', globalId: '123', value: 'zyx' });
      await store.testEventStore.addEvent(receiveEvent);
      const result = store.testEventStore.receiveEvent(testState.finalState.parentId, receiveEvent);

      expect(result).toBe(ReceiveDecision.MatchedActor);
      unsubscribe();
    });
  });
});
