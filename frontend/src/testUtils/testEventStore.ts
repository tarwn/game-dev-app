import { createImmutableEventApplier } from "../pages/_stores/eventStore/eventApplier";
import { createEventStore } from "../pages/_stores/eventStore/eventStore";
import { primitiveEventFactory } from "../pages/_stores/eventStore/operationsFactory";
import { IEventApplier, IEventStateApi, IEventStore, IIdentifiedPrimitive, ValueType, Versioned } from "../pages/_stores/eventStore/types";

export type TestModel = Versioned & {
  globalId: string,
  parentId: string,
  change: IIdentifiedPrimitive<number>;
};

type FakeStore = {
  testEventStore: IEventStore<TestModel>,
  events: any
};

export const createFakeStore = (): FakeStore => {
  let fakeServerVersionNumber = 1;

  // minimalist fake API
  const api: IEventStateApi<TestModel> = {
    getActorSeqNo: (actor) => Promise.resolve({ actor, seqNo: 10 }),
    get: () => {
      return Promise.resolve({
        payload: {
          globalId: 'unit-test-model',
          parentId: 'ROOT',
          versionNumber: fakeServerVersionNumber,
          change: {
            globalId: 'ut-change',
            parentId: 'unit-test-model',
            field: 'change',
            value: 0
          }
        }
      });
    },
    getSince: () => {
      throw new Error("getSince is not implemented in test store");
    },
    update: () => {
      fakeServerVersionNumber++;
      return Promise.resolve({ versionNumber: fakeServerVersionNumber, previousVersionNumber: fakeServerVersionNumber - 1 });
    }
  };

  // event applier defined for all events
  const eventApplier: IEventApplier<TestModel> = createImmutableEventApplier({
    onChange: primitiveEventFactory.update.makeApply<TestModel, number>((model) => {
      return model.change;
    })
  });
  // create the store
  const testEventStore = createEventStore(api, eventApplier);
  // create the event getters for easy binding
  const events = {
    onChange: primitiveEventFactory.update.makeGet<TestModel>("onChange", ValueType.object, testEventStore)
  };

  return {
    testEventStore,
    events
  };
};
