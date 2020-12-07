import { init } from "svelte/internal";
import type { IBusinessModel, IBusinessModelCustomer } from "../../_types/businessModel";
import { eventApplier, events } from "../businessModelStore";
import type { Identified, IIdentifiedList } from "../eventSystem/types";


function createEmptyModel(): IBusinessModel {
  return {
    globalId: "unit-test-bm",
    parentId: "unit-test",
    versionNumber: 1,
    customers: createObjectList<IBusinessModelCustomer>("unit-test-bm-c", "unit-test-bm", "customers")
  };
}

function createObjectList<T extends Identified>(globalId: string, parentId: string, field?: string): IIdentifiedList<T> {
  return {
    globalId,
    parentId,
    field,
    list: []
  };
}

describe("businessModelStore", () => {
  describe("eventApplier", () => {
    describe("AddCustomer", () => {
      it("adds a new customer with structural fields correct", () => {
        const emptyModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: emptyModel.customers.globalId });
        const nextModel = eventApplier.apply(emptyModel, event);

        // original model is unchanged
        expect(emptyModel.customers.list).toEqual([]);
        // structural fields
        expect(nextModel.customers.list.length).toEqual(1);
        expect(nextModel.customers.list[0].parentId).toEqual(nextModel.customers.globalId);
        expect(nextModel.customers.list[0].field).toBeUndefined();
        expect(nextModel.customers.list[0].globalId).not.toBeUndefined();
        expect(nextModel.customers.list[0].globalId).not.toEqual(nextModel.customers.globalId);
        ["name", "type", "entries"].forEach((field) => {
          expect(nextModel.customers.list[0][field]).not.toBeUndefined();
          expect(nextModel.customers.list[0][field].parentId).toEqual(nextModel.customers.list[0].globalId);
          expect(nextModel.customers.list[0][field].field).toEqual(field);
        });
      });

      it("adds a new customer with default values", () => {
        const emptyModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: emptyModel.customers.globalId });
        const nextModel = eventApplier.apply(emptyModel, event);

        // original model is unchanged
        expect(emptyModel.customers.list).toEqual([]);
        // new model has defaults set
        expect(nextModel.customers.list.length).toEqual(1);
        expect(nextModel.customers.list[0].name.value).toEqual("");
        expect(nextModel.customers.list[0].entries.list).toEqual([]);
        expect(nextModel.customers.list[0].type.value).toEqual("both");
      });
    });

    describe("DeleteCustomer", () => {
      it("removes specified customer with matching globalId", () => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);

        const deleteEvent = events.DeleteCustomer({
          parentId: initialModel.customers.list[0].parentId,
          globalId: initialModel.customers.list[0].globalId
        });
        const nextModel = eventApplier.apply(initialModel, deleteEvent);

        // original model is unchanged
        expect(initialModel.customers.list).not.toEqual([]);
        // new model has removed the specified customer
        expect(nextModel.customers.list).toEqual([]);
      });

      it("[conflict] skips removal of customer if the globalId is not found", () => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);

        const deleteEvent = events.DeleteCustomer({
          parentId: initialModel.customers.list[0].parentId,
          globalId: initialModel.customers.list[0].globalId + "123"
        });
        const nextModel = eventApplier.apply(initialModel, deleteEvent);

        // original model is unchanged
        expect(initialModel.customers.list).not.toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });
    });

    describe("AddCustomerEntry", () => {
      it("adds a new entry to the customer", () => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);

        const addEntryEvent = events.AddCustomerEntry({
          parentId: initialModel.customers.list[0].entries.globalId,
          value: "test"
        });
        const nextModel = eventApplier.apply(initialModel, addEntryEvent);

        // original model is unchanged
        expect(initialModel.customers.list[0].entries.list).toEqual([]);
        // now with the new entry
        expect(nextModel.customers.list[0].entries.list).not.toEqual([]);
        expect(nextModel.customers.list[0].entries.list.length).toEqual(1);
        expect(nextModel.customers.list[0].entries.list[0].parentId).toEqual(nextModel.customers.list[0].entries.globalId);
        expect(nextModel.customers.list[0].entries.list[0].value).toEqual("test");
      });

      it("[conflict] skips adding an event for a deleted customer", () => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);

        const addEntryEvent = events.AddCustomerEntry({
          parentId: initialModel.customers.list[0].entries.globalId,
          value: "test"
        });
        const customer = initialModel.customers.list[0];
        const deleteEvent = events.DeleteCustomer({ parentId: customer.parentId, globalId: customer.globalId });
        initialModel = eventApplier.apply(initialModel, deleteEvent);
        const nextModel = eventApplier.apply(initialModel, addEntryEvent);

        // original model is unchanged
        expect(initialModel.customers.list).toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });
    });

    describe("UpdateCustomerEntry", () => {
      it("updates an existing entry on the customer", () => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);
        const addEntryEvent = events.AddCustomerEntry({
          parentId: initialModel.customers.list[0].entries.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);

        const updateEntryEvent = events.UpdateCustomerEntry({
          parentId: initialModel.customers.list[0].entries.globalId,
          globalId: initialModel.customers.list[0].entries.list[0].globalId,
          value: "test 2"
        });
        const nextModel = eventApplier.apply(initialModel, updateEntryEvent);

        // original model is unchanged
        expect(initialModel.customers.list[0].entries.list[0].value).toEqual("test");
        // new model is updated
        expect(nextModel.customers.list[0].entries.list[0].value).toEqual("test 2");
      });

      it("[conflict] skips updating an entry for a deleted customer", () => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);
        const addEntryEvent = events.AddCustomerEntry({
          parentId: initialModel.customers.list[0].entries.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);
        const entry = initialModel.customers.list[0].entries.list[0];
        const customer = initialModel.customers.list[0];
        const deleteEvent = events.DeleteCustomer({ parentId: customer.parentId, globalId: customer.globalId });
        initialModel = eventApplier.apply(initialModel, deleteEvent);

        const updateEntryEvent = events.UpdateCustomerEntry({
          parentId: entry.parentId,
          globalId: entry.globalId,
          value: "test 2"
        });
        const nextModel = eventApplier.apply(initialModel, updateEntryEvent);

        // original model is unchanged
        expect(initialModel.customers.list).toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });

      it("[conflict] skips updating a deleted entry", () => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);
        const addEntryEvent = events.AddCustomerEntry({
          parentId: initialModel.customers.list[0].entries.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);
        const entry = initialModel.customers.list[0].entries.list[0];
        const preDeleteEntry = events.DeleteCustomerEntry({ parentId: entry.parentId, globalId: entry.globalId });
        initialModel = eventApplier.apply(initialModel, preDeleteEntry);

        const updateEntryEvent = events.UpdateCustomerEntry({
          parentId: entry.parentId,
          globalId: entry.globalId,
          value: "test 2"
        });
        const nextModel = eventApplier.apply(initialModel, updateEntryEvent);

        // original model is unchanged
        expect(initialModel.customers.list[0].entries.list).toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });
    });


    describe("DeleteCustomerEntry", () => {
      it("deletes an existing entry on the customer", () => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);
        const addEntryEvent = events.AddCustomerEntry({
          parentId: initialModel.customers.list[0].entries.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);

        const deleteEvent = events.DeleteCustomerEntry({
          parentId: initialModel.customers.list[0].entries.list[0].parentId,
          globalId: initialModel.customers.list[0].entries.list[0].globalId
        });
        const nextModel = eventApplier.apply(initialModel, deleteEvent);

        // original model is unchanged
        expect(initialModel.customers.list[0].entries.list[0].value).toEqual("test");
        // new model is updated
        expect(nextModel.customers.list[0].entries.list).toEqual([]);
      });

      it("[conflict] skips deleting an already deleted or non-existent entry", () => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);
        const addEntryEvent = events.AddCustomerEntry({
          parentId: initialModel.customers.list[0].entries.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);
        const entry = initialModel.customers.list[0].entries.list[0];
        const preDeleteEntry = events.DeleteCustomerEntry({ parentId: entry.parentId, globalId: entry.globalId });
        initialModel = eventApplier.apply(initialModel, preDeleteEntry);

        const deleteEntryEvent = events.DeleteCustomerEntry({
          parentId: entry.parentId,
          globalId: entry.globalId
        });
        const nextModel = eventApplier.apply(initialModel, deleteEntryEvent);

        // original model is unchanged
        expect(initialModel.customers.list[0].entries.list).toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });

      it("[conflict] skips deleting on an already deleted customer", () => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);
        const addEntryEvent = events.AddCustomerEntry({
          parentId: initialModel.customers.list[0].entries.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);
        const entry = initialModel.customers.list[0].entries.list[0];
        const customer = initialModel.customers.list[0];
        const deleteEvent = events.DeleteCustomer({ parentId: customer.parentId, globalId: customer.globalId });
        initialModel = eventApplier.apply(initialModel, deleteEvent);

        const deleteEntryEvent = events.DeleteCustomerEntry({
          parentId: entry.parentId,
          globalId: entry.globalId
        });
        const nextModel = eventApplier.apply(initialModel, deleteEntryEvent);

        // original model is unchanged
        expect(initialModel.customers.list).toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });
    });

    describe("UpdateCustomerType", () => {

      it.each`
        oldState        | newState
        ${"customer"}   | ${"both"}
        ${"both"}       | ${"player"}
        ${"both"}       | ${"customer"}
      `('updates type to $newState from old value of $oldState', ({ newState, oldState }) => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);
        const preUpdateTypeEvent = events.UpdateCustomerType({
          parentId: initialModel.customers.list[0].type.parentId,
          globalId: initialModel.customers.list[0].type.globalId,
          value: oldState
        });
        initialModel = eventApplier.apply(initialModel, preUpdateTypeEvent);

        const updateTypeEvent = events.UpdateCustomerType({
          parentId: initialModel.customers.list[0].type.parentId,
          globalId: initialModel.customers.list[0].type.globalId,
          value: newState
        });
        const nextModel = eventApplier.apply(initialModel, updateTypeEvent);

        // original model is unchanged
        expect(initialModel.customers.list[0].type.value).toEqual(oldState);
        // new model is updated
        expect(nextModel.customers.list[0].type.value).toEqual(newState);
      });

      it("[conflict] skips updating the type for a deleted customer", () => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);
        const addEntryEvent = events.AddCustomerEntry({
          parentId: initialModel.customers.list[0].entries.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);
        const customer = initialModel.customers.list[0];
        const deleteEvent = events.DeleteCustomer({ parentId: customer.parentId, globalId: customer.globalId });
        initialModel = eventApplier.apply(initialModel, deleteEvent);

        const updateTypeEvent = events.UpdateCustomerType({
          parentId: customer.type.parentId,
          globalId: customer.type.globalId,
          value: "both"
        });
        const nextModel = eventApplier.apply(initialModel, updateTypeEvent);

        // original model is unchanged
        expect(initialModel.customers.list).toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });
    });

    describe("UpdateCustomerName", () => {

      it('updates name on the customer', () => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);

        const updateNameEvent = events.UpdateCustomerName({
          parentId: initialModel.customers.list[0].name.parentId,
          globalId: initialModel.customers.list[0].name.globalId,
          value: "the new name"
        });
        const nextModel = eventApplier.apply(initialModel, updateNameEvent);

        // original model is unchanged
        expect(initialModel.customers.list[0].name.value).toEqual("");
        // new model is updated
        expect(nextModel.customers.list[0].name.value).toEqual("the new name");
      });

      it("[conflict] skips updating the type for a deleted customer", () => {
        let initialModel = createEmptyModel();
        const event = events.AddNewCustomer({ parentId: initialModel.customers.globalId });
        initialModel = eventApplier.apply(initialModel, event);
        const customer = initialModel.customers.list[0];
        const deleteEvent = events.DeleteCustomer({ parentId: customer.parentId, globalId: customer.globalId });
        initialModel = eventApplier.apply(initialModel, deleteEvent);

        const updateNameEvent = events.UpdateCustomerName({
          parentId: customer.name.parentId,
          globalId: customer.name.globalId,
          value: "the new name"
        });
        const nextModel = eventApplier.apply(initialModel, updateNameEvent);

        // original model is unchanged
        expect(initialModel.customers.list).toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });
    });

  });
});
