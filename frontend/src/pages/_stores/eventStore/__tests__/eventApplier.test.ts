import { produce } from "immer";
import { createIdentifiedPrimitive, createObjectList } from "../../../../testUtils/dataModel";
import { getUtcDate } from "../../../../utilities/date";
import { createImmutableAutomaticEventApplier, search } from "../eventApplier";
import { createAutomaticEventFactory, opsFactory } from "../eventFactory";
import { createEventStore } from "../eventStore";
import { IEventApplier, IEventStateApi, IEventStore, IIdentifiedList, IIdentifiedObject, IIdentifiedPrimitive, OperationType, ValueType, Versioned } from "../types";

// fake store with lots of diferent types to experiment on
export type FakeModel = Versioned & {
  globalId: string,
  parentId: string,
  stringProp: IIdentifiedPrimitive<string>;
  dateProp: IIdentifiedPrimitive<Date>;
  timeProp: IIdentifiedPrimitive<Date>;
  integerProp: IIdentifiedPrimitive<number>;
  decimalProp: IIdentifiedPrimitive<number>;
  numericEnumProp: IIdentifiedPrimitive<number>;
  stringEnumProp: IIdentifiedPrimitive<string>;
  booleanProp: IIdentifiedPrimitive<boolean>;
  stringList: IIdentifiedList<IIdentifiedPrimitive<string>>;
  object: IIdentifiedObject;
  objectList: IIdentifiedList<IIdentifiedObject>;
};

enum FakeNumericEnum {
  Thing = 1,
  Thing2 = 2
}

enum FakeStringEnum {
  Thing = "Thing",
  Thing2 = "Thing2"
}


const getFakeModel = (fakeServerVersionNumber: number): FakeModel => ({
  globalId: 'ut',
  parentId: 'ROOT',
  versionNumber: fakeServerVersionNumber,
  stringProp: createIdentifiedPrimitive<string>("ut", "ut-sp", "initialValue", "stringProp"),
  dateProp: createIdentifiedPrimitive<Date>("ut", "ut-date", getUtcDate(2025, 3, 4), "dateProp"),
  timeProp: createIdentifiedPrimitive<Date>("ut", "ut-time", new Date(), "timeProp"),
  integerProp: createIdentifiedPrimitive<number>("ut", "ut-int", 123, "integerProp"),
  decimalProp: createIdentifiedPrimitive<number>("ut", "ut-dec", 123, "decimalProp"),
  numericEnumProp: createIdentifiedPrimitive<number>("ut", "ut-enum-num", FakeNumericEnum.Thing, "numericEnumProp"),
  stringEnumProp: createIdentifiedPrimitive<string>("ut", "ut-enum-str", FakeStringEnum.Thing, "stringEnumProp"),
  booleanProp: createIdentifiedPrimitive<boolean>("ut", "ut-enum-bool", true, "booleanProp"),
  stringList: createObjectList<IIdentifiedPrimitive<string>>("ut", "ut-sl", "stringList"),
  object: { parentId: 'ut', globalId: 'ut-obj', field: 'object' },
  objectList: createObjectList<IIdentifiedObject>("ut", "ut-ol", "objectList"),
});
// event applier defined for all events
const eventApplier: IEventApplier<FakeModel> = createImmutableAutomaticEventApplier();

export const createFakeStore = (startingSeqNo: number): IEventStore<FakeModel> => {
  let fakeServerVersionNumber = 1;

  // minimalist fake API
  const api: IEventStateApi<FakeModel> = {
    getActorSeqNo: (actor) => Promise.resolve({ actor, seqNo: startingSeqNo }),
    get: () => {
      return Promise.resolve({
        payload: getFakeModel(fakeServerVersionNumber)
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
  describe("search", () => {
    const model = getFakeModel(100);
    model.stringList.list.push(createIdentifiedPrimitive(model.stringList.globalId, 'abc-123', "something"));

    test.each`
      parentId                                       | globalId
      ${model.parentId}                         | ${model.globalId}
      ${model.stringProp.parentId}              | ${model.stringProp.globalId}
      ${model.stringList.parentId}              | ${model.stringList.globalId}
      ${model.stringList.list[0].parentId}      | ${model.stringList.list[0].globalId}
      ${model.integerProp.parentId}             | ${model.integerProp.globalId}
    `("search(..., { $parentId, $globalId })", ({ parentId, globalId }) => {
      const found = search(model, { parentId, globalId });
      expect(found).not.toBeNull();
    });
  });

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
      describe("types", () => {
        const testTime = new Date();
        testTime.setHours(6);
        testTime.setFullYear(2001);

        test.each`
          type               | propName                | newValue
          ${"string"}        | ${"stringProp"}         | ${"new value"}
          ${"date"}          | ${"dateProp"}           | ${getUtcDate(2050, 5, 4)}
          ${"time"}          | ${"timeProp"}           | ${testTime}
          ${"integer"}       | ${"integerProp"}        | ${123456789}
          ${"decimal"}       | ${"decimalProp"}        | ${1234.56}
          ${"numericEnum"}   | ${"numericEnumProp"}    | ${FakeNumericEnum.Thing2}
          ${"numericEnum"}   | ${"numericEnumProp"}    | ${2}
          ${"stringEnum"}    | ${"stringEnumProp"}     | ${FakeStringEnum.Thing2}
          ${"stringEnum"}    | ${"stringEnumProp"}     | ${"Thing2"}
          ${"boolean"}       | ${"booleanProp"}        | ${false}
        `("applies $type to field $propName", ({ type, propName, newValue }) => {
          const originalValue = model[propName].value;
          const events = {
            string: eventFactory.createPropUpdate("unittest.updateProp<string>", ValueType.string),
            date: eventFactory.createPropUpdate("unittest.updateProp<date>", ValueType.date),
            time: eventFactory.createPropUpdate("unittest.updateProp<time>", ValueType.time),
            integer: eventFactory.createPropUpdate("unittest.updateProp<integer>", ValueType.integer),
            decimal: eventFactory.createPropUpdate("unittest.updateProp<decimal>", ValueType.decimal),
            numericEnum: eventFactory.createPropUpdate("unittest.updateProp<numericEnum>", ValueType.integer),
            stringEnum: eventFactory.createPropUpdate("unittest.updateProp<stringEnum>", ValueType.string),
            boolean: eventFactory.createPropUpdate("unittest.updateProp<boolean>", ValueType.boolean)
          };
          const event = events[type](model[propName], newValue);
          const applied = eventApplier.apply(model, event);
          expect(applied[propName].value).toEqual(newValue);
          expect(model[propName].value).toBe(originalValue);
        });

        test.each`
          type               | propName                | newValue                   | result
          ${"string"}        | ${"stringProp"}         | ${"new value"}             | ${"new value"}
          ${"date"}          | ${"dateProp"}           | ${getUtcDate(2050, 5, 4)}  | ${getUtcDate(2050, 5, 4)}
          ${"time"}          | ${"timeProp"}           | ${testTime}                | ${testTime}
          ${"integer"}       | ${"integerProp"}        | ${123456789}               | ${123456789}
          ${"decimal"}       | ${"decimalProp"}        | ${1234.56}                 | ${1234.56}
          ${"numericEnum"}   | ${"numericEnumProp"}    | ${2}                       | ${2}
          ${"numericEnum"}   | ${"numericEnumProp"}    | ${2}                       | ${FakeNumericEnum.Thing2}
          ${"stringEnum"}    | ${"stringEnumProp"}     | ${"Thing2"}                | ${FakeStringEnum.Thing2}
          ${"boolean"}       | ${"booleanProp"}        | ${false}                   | ${false}
        `("takes JSON value + applies PARSED $type to field $propName", ({ type, propName, newValue, result }) => {
          const originalValue = model[propName].value;
          const events = {
            string: eventFactory.createPropUpdate("unittest.updateProp<string>", ValueType.string),
            date: eventFactory.createPropUpdate("unittest.updateProp<date>", ValueType.date),
            time: eventFactory.createPropUpdate("unittest.updateProp<time>", ValueType.time),
            integer: eventFactory.createPropUpdate("unittest.updateProp<integer>", ValueType.integer),
            decimal: eventFactory.createPropUpdate("unittest.updateProp<decimal>", ValueType.decimal),
            numericEnum: eventFactory.createPropUpdate("unittest.updateProp<numericEnum>", ValueType.integer),
            stringEnum: eventFactory.createPropUpdate("unittest.updateProp<stringEnum>", ValueType.string),
            boolean: eventFactory.createPropUpdate("unittest.updateProp<boolean>", ValueType.boolean)
          };
          const event = events[type](model[propName], newValue);
          const applied = eventApplier.apply(model, event);
          expect(applied[propName].value).toEqual(result);
          expect(model[propName].value).toBe(originalValue);
        });
      });

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
          insertStringProp: eventFactory.createPropInsert("unittest", ValueType.string, "newField")
        };
        const event = events.insertStringProp(model.globalId, "new value");
        const applied = eventApplier.apply(model, event);
        expect(applied["newField"]).not.toBeUndefined();
        expect(applied["newField"].value).toBe("new value");
        expect(model["newField"]).toBeUndefined();
      });

      it("throws error if field not provided", () => {
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest", ValueType.string, undefined)
        };
        const event = events.insertStringProp(model.globalId, "new value");
        expect(() => {
          eventApplier.apply(model, event);
        }).toThrowError();
      });

      it("skips apply when field provided, parent found, + field already present w/ different id", () => {
        const originalValue = model.stringProp.value;
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest", ValueType.string, "stringProp")
        };
        const event = events.insertStringProp(model.globalId, "new value");
        const applied = eventApplier.apply(model, event);
        expect(applied.stringProp.value).toBe(originalValue);
        expect(model.stringProp.value).toBe(originalValue);
      });

      it("applies when field provided, parent found, + field already present w/ matching id", () => {
        const originalValue = model.stringProp.value;
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest", ValueType.string, "stringProp")
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
          insertStringProp: eventFactory.createPropInsert("unittest", ValueType.string, "newField")
        };
        const event = events.insertStringProp(model.globalId + 'zzzz', "new value");
        const applied = eventApplier.apply(model, event);
        expect(applied.stringProp.value).toBe(originalValue);
        expect(model.stringProp.value).toBe(originalValue);
      });

      it("throws error if parent is a primitive", () => {
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest", ValueType.string, "newField")
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
          insertStringProp: eventFactory.createPropInsert("unittest", ValueType.string)
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
          insertStringProp: eventFactory.createPropInsert("unittest", ValueType.string)
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
          insertStringProp: eventFactory.createPropInsert("unittest", ValueType.string)
        };
        const event = events.insertStringProp(model.stringList.globalId + "XYX", "new value");
        const applied = eventApplier.apply(model, event);
        expect(applied.stringList.list.length).toBe(originalSize);
        expect(model.stringList.list.length).toBe(originalSize);
      });

      it("throws error if parent is a primitive", () => {
        const events = {
          insertStringProp: eventFactory.createPropInsert("unittest", ValueType.string)
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
          deleteProp: eventFactory.createDelete("unittest", ValueType.string, "stringProp")
        };
        const event = events.deleteProp(model.stringProp);
        const applied = eventApplier.apply(model, event);
        expect(applied.stringProp).toBeUndefined();
        expect(model.stringProp).not.toBeUndefined();
      });

      it("does nothing when parent not found", () => {
        const events = {
          deleteProp: eventFactory.createDelete("unittest", ValueType.string, "stringProp")
        };
        const event = events.deleteProp({ parentId: 'whatever', globalId: model.stringProp.globalId });
        const applied = eventApplier.apply(model, event);
        expect(applied).toBe(model);
      });

      it("does nothing when parent found and target is not present", () => {
        const events = {
          insertStringProp: eventFactory.createDelete("unittest", ValueType.string, "whatever")
        };
        const event = events.insertStringProp({ parentId: model.globalId, globalId: "whatever" });
        const applied = eventApplier.apply(model, event);
        expect(applied).toBe(model);
      });

      it("throws an error if deleting from an object without a field name", () => {
        const events = {
          deleteProp: eventFactory.createDelete("unittest", ValueType.string)
        };
        const event = events.deleteProp({ parentId: model.globalId, globalId: "whatever" });
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot delete a field without identifying the field in the operation");
      });

      it("throws error if parent is a primitive", () => {
        const events = {
          deleteProp: eventFactory.createDelete("unittest", ValueType.string, "whatever")
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
          deleteProp: eventFactory.createDelete("unittest", ValueType.string)
        };
        const event = events.deleteProp(localModel.stringList.list[0]);
        const applied = eventApplier.apply(localModel, event);
        expect(applied.stringList.list.length).toBe(originalLen - 1);
        expect(localModel.stringList.list.length).toBe(originalLen);
      });

      it("does nothing item when parent found and target is not present", () => {
        const events = {
          deleteProp: eventFactory.createDelete("unittest", ValueType.string)
        };
        const event = events.deleteProp({ parentId: localModel.stringList.globalId, globalId: "abc123" });
        const applied = eventApplier.apply(localModel, event);
        expect(applied).toBe(localModel);
      });

      it("does nothing item when parent not found", () => {
        const events = {
          deleteProp: eventFactory.createDelete("unittest", ValueType.string)
        };
        const event = events.deleteProp({ parentId: "xyz321", globalId: "abc123" });
        const applied = eventApplier.apply(localModel, event);
        expect(applied).toBe(localModel);
      });
    });

    describe("(6)(7) delete list and object from object (duplicative of prop tests)", () => {
      it("deletes list when parent found and target is a list", () => {
        const events = {
          deleteList: eventFactory.createDelete("unittest", ValueType.string, "stringList")
        };
        const event = events.deleteList(model.stringList);
        const applied = eventApplier.apply(model, event);
        expect(applied.stringList).toBeUndefined();
        expect(model.stringList).not.toBeUndefined();
      });

      it("deletes object when parent found and target is an object", () => {
        const events = {
          deleteList: eventFactory.createDelete("unittest", ValueType.string, "stringList")
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
          addList: eventFactory.createListInsert("unittest", "stringList2")
        };
        const event = events.addList(model.globalId);
        const applied = eventApplier.apply(model, event);
        expect(applied["stringList2"]).not.toBeUndefined();
        expect(model["stringList2"]).toBeUndefined();
      });

      it("does nothing if parent not found", () => {
        const events = {
          addList: eventFactory.createListInsert("unittest", "stringList2")
        };
        const event = events.addList(model.globalId + "XYZ");
        const applied = eventApplier.apply(model, event);
        expect(applied).toBe(model);
      });

      it("throws error if parent is an array", () => {
        const events = {
          addList: eventFactory.createListInsert("unittest", "stringList2")
        };
        const event = events.addList(model.stringList.globalId);
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot extend arrays with 'MakeList'");
      });

      it("throws error if parent is a primitive", () => {
        const events = {
          addList: eventFactory.createListInsert("unittest", "stringList2")
        };
        const event = events.addList(model.stringProp.globalId);
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot extend primitives");
      });

      it("throws error if field name not included", () => {
        const events = {
          addList: eventFactory.createListInsert("unittest", undefined)
        };
        const event = events.addList(model.globalId);
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot 'MakeList' without identifying the field in the operation");
      });

      it("does nothing if the list is already present", () => {
        const events = {
          addList: eventFactory.createListInsert("unittest", "stringList")
        };
        const event = events.addList(model.globalId);
        const applied = eventApplier.apply(model, event);
        expect(applied).toBe(model);
      });
    });

    describe("(9) create object on an object", () => {
      it("creates basic object when target parent object found and target is not present yet", () => {
        const events = {
          addBasicObject: eventFactory.createObjectInsert("unittest", "basicObject")
        };
        const event = events.addBasicObject(model.globalId);
        const applied = eventApplier.apply(model, event);
        expect(applied["basicObject"]).not.toBeUndefined();
        expect(applied["basicObject"].globalId).not.toBeUndefined();
        expect(applied["basicObject"].parentId).not.toBeUndefined();
        expect(model["basicObject"]).toBeUndefined();
      });

      it("does nothing when target parent object found and target is present already", () => {
        const events = {
          addBasicObject: eventFactory.createObjectInsert("unittest", "object")
        };
        const event = events.addBasicObject(model.globalId);
        event.operations[0].objectId = model.object.globalId;
        const applied = eventApplier.apply(model, event);
        expect(applied).toBe(model);
      });

      it("creates basic object when target parent list found and target is not present yet", () => {
        const originalSize = model.objectList.list.length;
        const events = {
          addBasicObject: eventFactory.createObjectInsert("unittest", "basicObject")
        };
        const event = events.addBasicObject(model.objectList.globalId);
        const applied = eventApplier.apply(model, event);
        expect(applied.objectList.list.length).toBe(originalSize + 1);
        expect(model.objectList.list.length).toBe(originalSize);
      });

      it("does nothing when target parent list found and target is present already", () => {
        const localModel = produce(model, draft => {
          draft.objectList.list.push({ parentId: draft.objectList.globalId, globalId: 'abc123' });
        });
        const events = {
          addBasicObject: eventFactory.createObjectInsert("unittest")
        };
        const event = events.addBasicObject(localModel.objectList.globalId);
        event.operations[0].objectId = localModel.objectList.list[0].globalId;
        const applied = eventApplier.apply(localModel, event);
        expect(applied).toBe(localModel);
      });

      it("throws error if parent is a primitive", () => {
        const events = {
          addBasicObject: eventFactory.createObjectInsert("unittest", "basicObject")
        };
        const event = events.addBasicObject(model.stringProp.globalId);
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot extend primitives");
      });

      it("throws error if field name not included", () => {
        const events = {
          addBasicObject: eventFactory.createObjectInsert("unittest", undefined)
        };
        const event = events.addBasicObject(model.globalId);
        expect(() =>
          eventApplier.apply(model, event)
        ).toThrowError("Cannot 'MakeObject' on an object without identifying the field in the operation:");
      });

      describe("complex object definition", () => {
        it("creates a multi-property object correctly", () => {
          const events = {
            addObj: eventFactory.createObjectInsert("unittest", "newThing", [
              (ids, nextId) => ({ action: OperationType.Set, parentId: ids[0], objectId: nextId, value: "123", $type: ValueType.string, field: "stuff1", insert: true }),
              (ids, nextId) => ({ action: OperationType.Set, parentId: ids[0], objectId: nextId, value: 123, $type: ValueType.integer, field: "stuff2", insert: true }),
              (ids, nextId) => ({ action: OperationType.Set, parentId: ids[0], objectId: nextId, value: true, $type: ValueType.boolean, field: "stuff3", insert: true }),
              (ids, nextId) => ({ action: OperationType.Set, parentId: ids[0], objectId: nextId, value: FakeNumericEnum.Thing2, $type: ValueType.integer, field: "stuff4", insert: true }),
            ])
          };
          const event = events.addObj(model.globalId);
          const applied = eventApplier.apply(model, event);
          expect(applied["newThing"]).not.toBeUndefined();
          expect(model["newThing"]).toBeUndefined();
          expect(applied["newThing"].stuff1.value).toBe("123");
          expect(applied["newThing"].stuff1.parentId).toBe(applied["newThing"].globalId);
          expect(applied["newThing"].stuff2.value).toBe(123);
          expect(applied["newThing"].stuff2.parentId).toBe(applied["newThing"].globalId);
          expect(applied["newThing"].stuff3.value).toBe(true);
          expect(applied["newThing"].stuff3.parentId).toBe(applied["newThing"].globalId);
          expect(applied["newThing"].stuff4.value).toBe(FakeNumericEnum.Thing2);
          expect(applied["newThing"].stuff4.parentId).toBe(applied["newThing"].globalId);
          expect(applied["newThing"].stuff1.globalId).not.toBe(applied["newThing"].globalId);
          expect(applied["newThing"].stuff1.globalId).not.toBe(applied["newThing"].stuff2.globalId);
          expect(applied["newThing"].stuff1.globalId).not.toBe(applied["newThing"].stuff3.globalId);
          expect(applied["newThing"].stuff1.globalId).not.toBe(applied["newThing"].stuff4.globalId);
        });

        it("creates a multi-nested object correctly", () => {
          const events = {
            addObj: eventFactory.createObjectInsert("unittest", "newThing", [
              (ids, nextId) => opsFactory.insertObject(ids[0], nextId, "obj1"),
              (ids, nextId) => opsFactory.insertObject(ids[1], nextId, "obj2"),
              (ids, nextId) => opsFactory.insertObject(ids[2], nextId, "obj3"),
              (ids, nextId) => opsFactory.insertObject(ids[3], nextId, "obj4")
            ])
          };
          const event = events.addObj(model.globalId);
          const applied = eventApplier.apply(model, event);
          expect(applied["newThing"]).not.toBeUndefined();
          expect(model["newThing"]).toBeUndefined();
          expect(applied["newThing"].obj1).not.toBeUndefined();
          expect(applied["newThing"].obj1.obj2).not.toBeUndefined();
          expect(applied["newThing"].obj1.obj2.obj3).not.toBeUndefined();
          expect(applied["newThing"].obj1.obj2.obj3.obj4).not.toBeUndefined();
        });

        it("creates a nested lists and objects correctly", () => {
          const events = {
            addObj: eventFactory.createObjectInsert("unittest", "newThing", [
              (ids, nextId) => opsFactory.insertObject(ids[0], nextId, "obj1"),
              (ids, nextId) => opsFactory.insertList(ids[1], nextId, "list2"),
              (ids, nextId) => opsFactory.insertObject(ids[2], nextId, "obj3"),
              (ids, nextId) => opsFactory.insertObject(ids[2], nextId, "obj4"),
              (ids, nextId) => opsFactory.insertList(ids[3], nextId, "list5"),
              (ids, nextId) => opsFactory.insertObject(ids[5], nextId, "obj6"),
              (ids, nextId) => opsFactory.insertObject(ids[5], nextId, "obj7"),
            ])
          };
          const event = events.addObj(model.globalId);
          const applied = eventApplier.apply(model, event);
          expect(applied["newThing"]).not.toBeUndefined();
          expect(model["newThing"]).toBeUndefined();
          expect(applied["newThing"].obj1).not.toBeUndefined();
          expect(applied["newThing"].obj1.list2).not.toBeUndefined();
          expect(applied["newThing"].obj1.list2.list.length).toBe(2);
          expect(applied["newThing"].obj1.list2.list[0]).not.toBeUndefined();
          expect(applied["newThing"].obj1.list2.list[1]).not.toBeUndefined();
          expect(applied["newThing"].obj1.list2.list[0].list5).not.toBeUndefined();
          expect(applied["newThing"].obj1.list2.list[0].list5.list[0]).not.toBeUndefined();
          expect(applied["newThing"].obj1.list2.list[0].list5.list[1]).not.toBeUndefined();
        });
      });
    });

    afterAll(() => {
      unsubscribe();
    });
  });
});
