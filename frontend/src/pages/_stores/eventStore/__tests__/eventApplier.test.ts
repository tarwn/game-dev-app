import { produce } from "immer";
import { createIdentifiedPrimitive, createObjectList } from "../../../../testUtils/dataModel";
import { createImmutableAutomaticEventApplier } from "../eventApplier";
import { createAutomaticEventFactory } from "../eventFactory";
import { createEventStore } from "../eventStore";
import { IEventApplier, IEventStateApi, IEventStore, IIdentifiedList, IIdentifiedPrimitive, ValueType, Versioned } from "../types";

// fake store with lots of diferent types to experiment on
export type FakeModel = Versioned & {
  globalId: string,
  parentId: string,
  stringProp: IIdentifiedPrimitive<string>;
  stringList: IIdentifiedList<IIdentifiedPrimitive<string>>;
};


// event applier defined for all events
const eventApplier: IEventApplier<FakeModel> = createImmutableAutomaticEventApplier();

export const createFakeStore = (startingSeqNo: number): IEventStore<FakeModel> => {
  let fakeServerVersionNumber = 1;

  // minimalist fake API
  const api: IEventStateApi<FakeModel> = {
    getActorSeqNo: (actor) => Promise.resolve({ actor, seqNo: startingSeqNo }),
    get: () => {
      return Promise.resolve({
        payload: {
          globalId: 'ut',
          parentId: 'ROOT',
          versionNumber: fakeServerVersionNumber,
          stringProp: createIdentifiedPrimitive<string>("ut", "ut-sp", "initialValue", "stringProp"),
          stringList: createObjectList<IIdentifiedPrimitive<string>>("ut", "ut-sl", "stringList")
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

  // create the store
  return createEventStore(api, eventApplier);
};
// ----

describe("event mechanics", () => {
  // describe("search", () => {
  //   const premodel = createEmptyCashForecast();
  //   const event = events.AddLoan({
  //     parentId: premodel.loans.globalId,
  //     date: getUtcDate(2022, 0, 1)
  //   });
  //   const model = eventApplier.apply(premodel, event);

  //   test.each`
  //     parentId                                       | globalId
  //     ${model.parentId}                         | ${model.globalId}
  //     ${model.forecastStartDate.parentId}       | ${model.forecastStartDate.globalId}
  //     ${model.loans.parentId}                   | ${model.loans.globalId}
  //     ${model.loans.list[0].parentId}           | ${model.loans.list[0].globalId}
  //     ${model.bankBalance.name.parentId}        | ${model.bankBalance.name.globalId}
  //   `("search(..., { $parentId, $globalId })", ({ parentId, globalId }) => {
  //     const found = search(model, { parentId, globalId });
  //     expect(found).not.toBeNull();
  //   });
  // });

  describe("Apply Events", () => {
    let model = null as FakeModel;
    const store = createFakeStore(100);
    const unsubscribe = store.subscribe((state) => model = state.finalState);
    const eventFactory = createAutomaticEventFactory(store);

    beforeAll(async () => {
      await store.initialize("ABC", "1");
      await store.loadFullState();
    });

    describe("(1) apply set to existing prop", () => {
      it("applies when field found on object", () => {
        const originalValue = model.stringProp.value;
        const events = {
          updateStringProp: eventFactory.createPropUpdate("unittest.updateProp<string>", ValueType.string)
        };
        const event = events.updateStringProp(model.stringProp, "new value");
        const applied = eventApplier.apply(model, event);
        expect(applied.stringProp.value).toBe("new value");
        expect(model.stringProp.value).toBe(originalValue);
      });

      it("applies when field found in list", () => {
        const originalValue = "abc123";
        const localModel = {
          ...model,
          stringList: {
            ...model.stringList,
            list: [
              createIdentifiedPrimitive<string>(model.stringList.globalId, "fakeId", originalValue)
            ]
          }
        };
        const events = {
          updateStringProp: eventFactory.createPropUpdate("unittest.updateProp<string>", ValueType.string)
        };
        const event = events.updateStringProp(localModel.stringList.list[0], "new value");
        const applied = eventApplier.apply(localModel, event);
        expect(applied.stringList.list[0].value).toBe("new value");
        expect(localModel.stringList.list[0].value).toBe(originalValue);
      });

      it("skips apply if field not found", () => {
        const events = {
          updateStringProp: eventFactory.createPropUpdate("unittest.updateProp<string>", ValueType.string)
        };
        const event = events.updateStringProp({ parentId: model.stringProp.parentId, globalId: 'whatever' }, "new value");
        const applied = eventApplier.apply(model, event);
        expect(applied).toBe(model);
      });


      it("throws error if parent is a list", () => {
        const events = {
          updateStringProp: eventFactory.createPropUpdate("unittest.updateProp<string>", ValueType.string)
        };
        const event = events.updateStringProp(model.stringList, "new value");
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot update a list/object as a primitive");
      });

      it("throws error if parent is an object", () => {
        const events = {
          updateStringProp: eventFactory.createPropUpdate("unittest.updateProp<string>", ValueType.string)
        };
        const event = events.updateStringProp(model, "new value");
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot update a list/object as a primitive");
      });
    });

    describe("(2) insert prop to object", () => {
      it("applies when field provided, parent found, + field not present yet", () => {
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest.insertProp<string>", ValueType.string, "newField")
        };
        const event = events.insertStringProp(model.globalId, "new value");
        const applied = eventApplier.apply(model, event);
        expect(applied["newField"]).not.toBeUndefined();
        expect(applied["newField"].value).toBe("new value");
        expect(model["newField"]).toBeUndefined();
      });

      it("throws error if field not provided", () => {
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest.insertProp<string>", ValueType.string, undefined)
        };
        const event = events.insertStringProp(model.globalId, "new value");
        expect(() => {
          eventApplier.apply(model, event);
        }).toThrowError();
      });

      it("skips apply when field provided, parent found, + field already present w/ different id", () => {
        const originalValue = model.stringProp.value;
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest.insertProp<string>", ValueType.string, "stringProp")
        };
        const event = events.insertStringProp(model.globalId, "new value");
        const applied = eventApplier.apply(model, event);
        expect(applied.stringProp.value).toBe(originalValue);
        expect(model.stringProp.value).toBe(originalValue);
      });

      it("applies when field provided, parent found, + field already present w/ matching id", () => {
        const originalValue = model.stringProp.value;
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest.insertProp<string>", ValueType.string, "stringProp")
        };
        const event = events.insertStringProp(model.globalId, "new value");
        event.operations[0].objectId = model.stringProp.globalId;
        const applied = eventApplier.apply(model, event);
        expect(applied.stringProp.value).toBe("new value");
        expect(model.stringProp.value).toBe(originalValue);
      });

      it("skips apply if parent not found", () => {
        const originalValue = model.stringProp.value;
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest.insertProp<string>", ValueType.string, "newField")
        };
        const event = events.insertStringProp(model.globalId + 'zzzz', "new value");
        const applied = eventApplier.apply(model, event);
        expect(applied.stringProp.value).toBe(originalValue);
        expect(model.stringProp.value).toBe(originalValue);
      });

      it("throws error if parent is a primitive", () => {
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest.insertProp<string>", ValueType.string, "newField")
        };
        const event = events.insertStringProp(model.stringProp.globalId, "new value");
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot insert onto a primitive");
      });
    });


    describe("(3) insert prop to array", () => {
      it("inserts item when parent list found and not present yet", () => {
        const originalSize = model.stringList.list.length;
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest.insertProp<string>", ValueType.string)
        };
        const event = events.insertStringProp(model.stringList.globalId, "new value");
        const applied = eventApplier.apply(model, event);
        expect(applied.stringList.list.length).toBe(originalSize + 1);
        expect(applied.stringList.list[applied.stringList.list.length - 1].globalId).toBe(event.operations[0].objectId);
        expect(applied.stringList.list[applied.stringList.list.length - 1].globalId).toBe(event.operations[0].objectId);
        expect(model.stringList.list.length).toBe(originalSize);
      });

      it("updates item when parent list found and it's already present", () => {
        const originalSize = model.stringList.list.length;
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest.insertProp<string>", ValueType.string)
        };
        const event = events.insertStringProp(model.stringList.globalId, "new value");
        const applied = eventApplier.apply(model, event);
        expect(applied.stringList.list.length).toBe(originalSize + 1);
        expect(applied.stringList.list[applied.stringList.list.length - 1].globalId).toBe(event.operations[0].objectId);
        expect(applied.stringList.list[applied.stringList.list.length - 1].globalId).toBe(event.operations[0].objectId);
        expect(model.stringList.list.length).toBe(originalSize);
      });

      it("no changes when it can't find parent", () => {
        const originalSize = model.stringList.list.length;
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest.insertProp<string>", ValueType.string)
        };
        const event = events.insertStringProp(model.stringList.globalId + "XYX", "new value");
        const applied = eventApplier.apply(model, event);
        expect(applied.stringList.list.length).toBe(originalSize);
        expect(model.stringList.list.length).toBe(originalSize);
      });

      it("throws error if parent is a primitive", () => {
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest.insertProp<string>", ValueType.string)
        };
        const event = events.insertStringProp(model.stringProp.globalId, "new value");
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot insert onto a primitive");
      });
    });

    describe("(4) delete prop from object", () => {
      it("deletes item when parent found and target is present", () => {
        const events = {
          deleteProp: eventFactory.createDelete("unittest.insertProp<string>", ValueType.string, "stringProp")
        };
        const event = events.deleteProp(model.stringProp);
        const applied = eventApplier.apply(model, event);
        expect(applied.stringProp).toBeUndefined();
        expect(model.stringProp).not.toBeUndefined();
      });

      it("does nothing when parent not found", () => {
        const events = {
          deleteProp: eventFactory.createDelete("unittest.insertProp<string>", ValueType.string, "stringProp")
        };
        const event = events.deleteProp({ parentId: 'whatever', globalId: model.stringProp.globalId });
        const applied = eventApplier.apply(model, event);
        expect(applied).toBe(model);
      });

      it("does nothing when parent found and target is not present", () => {
        const events = {
          insertStringProp: eventFactory.createDelete("unittest.insertProp<string>", ValueType.string, "whatever")
        };
        const event = events.insertStringProp({ parentId: model.globalId, globalId: "whatever" });
        const applied = eventApplier.apply(model, event);
        expect(applied).toBe(model);
      });

      it("throws an error if deleting from an object without a field name", () => {
        const events = {
          deleteProp: eventFactory.createDelete("unittest.insertProp<string>", ValueType.string)
        };
        const event = events.deleteProp({ parentId: model.globalId, globalId: "whatever" });
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot delete a field without identifying the field in the operation");
      });

      it("throws error if parent is a primitive", () => {
        const events = {
          deleteProp: eventFactory.createDelete("unittest.insertProp<string>", ValueType.string, "whatever")
        };
        const event = events.deleteProp({ parentId: model.stringProp.globalId, globalId: "whatever" });
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot delete from a primitive");
      });

    });


    describe("(5) delete prop from array", () => {
      let localModel = model;
      beforeAll(() => {
        localModel = produce(model, draft => {
          draft.stringList.list.push(createIdentifiedPrimitive<string>(draft.stringList.globalId, "fakeId", "abc123"));
        });
      });

      it("deletes item when parent found and target is present", () => {
        const originalLen = localModel.stringList.list.length;
        const events = {
          deleteProp: eventFactory.createDelete("unittest.insertProp<string>", ValueType.string)
        };
        const event = events.deleteProp(localModel.stringList.list[0]);
        const applied = eventApplier.apply(localModel, event);
        expect(applied.stringList.list.length).toBe(originalLen - 1);
        expect(localModel.stringList.list.length).toBe(originalLen);
      });

      it("does nothing item when parent found and target is not present", () => {
        const events = {
          deleteProp: eventFactory.createDelete("unittest.insertProp<string>", ValueType.string)
        };
        const event = events.deleteProp({ parentId: localModel.stringList.globalId, globalId: "abc123" });
        const applied = eventApplier.apply(localModel, event);
        expect(applied).toBe(localModel);
      });

      it("does nothing item when parent not found", () => {
        const events = {
          deleteProp: eventFactory.createDelete("unittest.insertProp<string>", ValueType.string)
        };
        const event = events.deleteProp({ parentId: "xyz321", globalId: "abc123" });
        const applied = eventApplier.apply(localModel, event);
        expect(applied).toBe(localModel);
      });
    });

    describe("(6)(7) delete list and object from object (duplicative of prop tests)", () => {
      it("deletes list when parent found and target is a list", () => {
        const events = {
          deleteList: eventFactory.createDelete("unittest.insertProp<string>", ValueType.string, "stringList")
        };
        const event = events.deleteList(model.stringList);
        const applied = eventApplier.apply(model, event);
        expect(applied.stringList).toBeUndefined();
        expect(model.stringList).not.toBeUndefined();
      });

      it("deletes object when parent found and target is an object", () => {
        const events = {
          deleteList: eventFactory.createDelete("unittest.insertProp<string>", ValueType.string, "stringList")
        };
        const event = events.deleteList(model.stringList);
        const applied = eventApplier.apply(model, event);
        expect(applied.stringList).toBeUndefined();
        expect(model.stringList).not.toBeUndefined();
      });
    });


    describe("(8) create list on an object", () => {
      it("creates list when target parent found and target is not present yet", () => {
        const events = {
          addList: eventFactory.createListInsert("unittest.insertProp<string>", "stringList2")
        };
        const event = events.addList(model.globalId);
        const applied = eventApplier.apply(model, event);
        expect(applied["stringList2"]).not.toBeUndefined();
        expect(model["stringList2"]).toBeUndefined();
      });

      it("does nothing if parent not found", () => {
        const events = {
          addList: eventFactory.createListInsert("unittest.insertProp<string>", "stringList2")
        };
        const event = events.addList(model.globalId + "XYZ");
        const applied = eventApplier.apply(model, event);
        expect(applied).toBe(model);
      });

      it("throws error if parent is an array", () => {
        const events = {
          addList: eventFactory.createListInsert("unittest.insertProp<string>", "stringList2")
        };
        const event = events.addList(model.stringList.globalId);
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot extend arrays with 'MakeList'");
      });

      it("throws error if parent is a primitive", () => {
        const events = {
          addList: eventFactory.createListInsert("unittest.insertProp<string>", "stringList2")
        };
        const event = events.addList(model.stringProp.globalId);
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot extend primitives");
      });

      it("throws error if field name not included", () => {
        const events = {
          addList: eventFactory.createListInsert("unittest.insertProp<string>", undefined)
        };
        const event = events.addList(model.globalId);
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot 'MakeList' without identifying the field in the operation");
      });

      it("does nothing if the list is already present", () => {
        const events = {
          addList: eventFactory.createListInsert("unittest.insertProp<string>", "stringList")
        };
        const event = events.addList(model.globalId);
        const applied = eventApplier.apply(model, event);
        expect(applied).toBe(model);
      });
    });

    afterAll(() => {
      unsubscribe();
    });
  });
});
