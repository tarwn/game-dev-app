import { createEmptyBusinessModel } from "../../../../../../testUtils/dataModel";
import { eventApplier, events } from "../businessModelStore";


describe("businessModelStore", () => {
  describe("eventApplier", () => {

    // customer

    describe("AddCustomer", () => {
      it("adds a new customer with structural fields correct", () => {
        const emptyModel = createEmptyBusinessModel();
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
        const emptyModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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
        let initialModel = createEmptyBusinessModel();
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

    // value prop

    describe("AddValuePropGenre", () => {
      it("adds a new genre to the value proposition", () => {
        const initialModel = createEmptyBusinessModel();

        const addEntryEvent = events.AddValuePropGenre({
          parentId: initialModel.valueProposition.genres.globalId,
          value: "test"
        });
        const nextModel = eventApplier.apply(initialModel, addEntryEvent);

        // original model is unchanged
        expect(initialModel.valueProposition.genres.list).toEqual([]);
        // now with the new entry
        expect(nextModel.valueProposition.genres.list).not.toEqual([]);
        expect(nextModel.valueProposition.genres.list.length).toEqual(1);
        expect(nextModel.valueProposition.genres.list[0].parentId).toEqual(nextModel.valueProposition.genres.globalId);
        expect(nextModel.valueProposition.genres.list[0].value).toEqual("test");
      });
    });

    describe("DeleteValuePropGenre", () => {
      it("deletes an existing genre on the value proposition", () => {
        let initialModel = createEmptyBusinessModel();
        const addEntryEvent = events.AddValuePropGenre({
          parentId: initialModel.valueProposition.genres.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);

        const deleteEvent = events.DeleteValuePropGenre({
          parentId: initialModel.valueProposition.genres.list[0].parentId,
          globalId: initialModel.valueProposition.genres.list[0].globalId
        });
        const nextModel = eventApplier.apply(initialModel, deleteEvent);

        // original model is unchanged
        expect(initialModel.valueProposition.genres.list[0].value).toEqual("test");
        // new model is updated
        expect(nextModel.valueProposition.genres.list).toEqual([]);
      });

      it("[conflict] skips deleting an already deleted or non-existent genre", () => {
        let initialModel = createEmptyBusinessModel();
        const addEntryEvent = events.AddValuePropGenre({
          parentId: initialModel.valueProposition.genres.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);
        const entry = initialModel.valueProposition.genres.list[0];
        const preDeleteEntry = events.DeleteValuePropGenre({ parentId: entry.parentId, globalId: entry.globalId });
        initialModel = eventApplier.apply(initialModel, preDeleteEntry);

        const deleteEntryEvent = events.DeleteValuePropGenre({
          parentId: entry.parentId,
          globalId: entry.globalId
        });
        const nextModel = eventApplier.apply(initialModel, deleteEntryEvent);

        // original model is unchanged
        expect(initialModel.valueProposition.genres.list).toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });
    });

    describe("AddValuePropPlatform", () => {
      it("adds a new platform to the value proposition", () => {
        const initialModel = createEmptyBusinessModel();

        const addEntryEvent = events.AddValuePropPlatform({
          parentId: initialModel.valueProposition.platforms.globalId,
          value: "test"
        });
        const nextModel = eventApplier.apply(initialModel, addEntryEvent);

        // original model is unchanged
        expect(initialModel.valueProposition.platforms.list).toEqual([]);
        // now with the new entry
        expect(nextModel.valueProposition.platforms.list).not.toEqual([]);
        expect(nextModel.valueProposition.platforms.list.length).toEqual(1);
        expect(nextModel.valueProposition.platforms.list[0].parentId).toEqual(nextModel.valueProposition.platforms.globalId);
        expect(nextModel.valueProposition.platforms.list[0].value).toEqual("test");
      });
    });

    describe("DeleteValuePropPlatform", () => {
      it("deletes an existing platform on the value proposition", () => {
        let initialModel = createEmptyBusinessModel();
        const addEntryEvent = events.AddValuePropPlatform({
          parentId: initialModel.valueProposition.platforms.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);

        const deleteEvent = events.DeleteValuePropPlatform({
          parentId: initialModel.valueProposition.platforms.list[0].parentId,
          globalId: initialModel.valueProposition.platforms.list[0].globalId
        });
        const nextModel = eventApplier.apply(initialModel, deleteEvent);

        // original model is unchanged
        expect(initialModel.valueProposition.platforms.list[0].value).toEqual("test");
        // new model is updated
        expect(nextModel.valueProposition.platforms.list).toEqual([]);
      });

      it("[conflict] skips deleting an already deleted or non-existent platform", () => {
        let initialModel = createEmptyBusinessModel();
        const addEntryEvent = events.AddValuePropPlatform({
          parentId: initialModel.valueProposition.platforms.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);
        const entry = initialModel.valueProposition.platforms.list[0];
        const preDeleteEntry = events.DeleteValuePropPlatform({ parentId: entry.parentId, globalId: entry.globalId });
        initialModel = eventApplier.apply(initialModel, preDeleteEntry);

        const deleteEntryEvent = events.DeleteValuePropPlatform({
          parentId: entry.parentId,
          globalId: entry.globalId
        });
        const nextModel = eventApplier.apply(initialModel, deleteEntryEvent);

        // original model is unchanged
        expect(initialModel.valueProposition.platforms.list).toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });
    });

    describe("AddValuePropEntry", () => {
      it("adds a new entry to the value proposition", () => {
        const initialModel = createEmptyBusinessModel();

        const addEntryEvent = events.AddValuePropEntry({
          parentId: initialModel.valueProposition.entries.globalId,
          value: "test"
        });
        const nextModel = eventApplier.apply(initialModel, addEntryEvent);

        // original model is unchanged
        expect(initialModel.valueProposition.entries.list).toEqual([]);
        // now with the new entry
        expect(nextModel.valueProposition.entries.list).not.toEqual([]);
        expect(nextModel.valueProposition.entries.list.length).toEqual(1);
        expect(nextModel.valueProposition.entries.list[0].parentId).toEqual(nextModel.valueProposition.entries.globalId);
        expect(nextModel.valueProposition.entries.list[0].value).toEqual("test");
      });
    });

    describe("UpdateValuePropEntry", () => {
      it("updates an existing entry on the value proposition", () => {
        let initialModel = createEmptyBusinessModel();
        const addEntryEvent = events.AddValuePropEntry({
          parentId: initialModel.valueProposition.entries.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);

        const updateEntryEvent = events.UpdateValuePropEntry({
          parentId: initialModel.valueProposition.entries.globalId,
          globalId: initialModel.valueProposition.entries.list[0].globalId,
          value: "test 2"
        });
        const nextModel = eventApplier.apply(initialModel, updateEntryEvent);

        // original model is unchanged
        expect(initialModel.valueProposition.entries.list[0].value).toEqual("test");
        // new model is updated
        expect(nextModel.valueProposition.entries.list[0].value).toEqual("test 2");
      });

      it("[conflict] skips updating a deleted entry", () => {
        let initialModel = createEmptyBusinessModel();
        const addEntryEvent = events.AddValuePropEntry({
          parentId: initialModel.valueProposition.entries.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);
        const entry = initialModel.valueProposition.entries.list[0];
        const preDeleteEntry = events.DeleteValuePropEntry({ parentId: entry.parentId, globalId: entry.globalId });
        initialModel = eventApplier.apply(initialModel, preDeleteEntry);

        const updateEntryEvent = events.UpdateValuePropEntry({
          parentId: entry.parentId,
          globalId: entry.globalId,
          value: "test 2"
        });
        const nextModel = eventApplier.apply(initialModel, updateEntryEvent);

        // original model is unchanged
        expect(initialModel.valueProposition.entries.list).toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });
    });

    describe("DeleteValuePropEntry", () => {
      it("deletes an existing entry on the value proposition", () => {
        let initialModel = createEmptyBusinessModel();
        const addEntryEvent = events.AddValuePropEntry({
          parentId: initialModel.valueProposition.entries.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);

        const deleteEvent = events.DeleteValuePropEntry({
          parentId: initialModel.valueProposition.entries.list[0].parentId,
          globalId: initialModel.valueProposition.entries.list[0].globalId
        });
        const nextModel = eventApplier.apply(initialModel, deleteEvent);

        // original model is unchanged
        expect(initialModel.valueProposition.entries.list[0].value).toEqual("test");
        // new model is updated
        expect(nextModel.valueProposition.entries.list).toEqual([]);
      });

      it("[conflict] skips deleting an already deleted or non-existent entry", () => {
        let initialModel = createEmptyBusinessModel();
        const addEntryEvent = events.AddValuePropEntry({
          parentId: initialModel.valueProposition.entries.globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);
        const entry = initialModel.valueProposition.entries.list[0];
        const preDeleteEntry = events.DeleteValuePropEntry({ parentId: entry.parentId, globalId: entry.globalId });
        initialModel = eventApplier.apply(initialModel, preDeleteEntry);

        const deleteEntryEvent = events.DeleteValuePropEntry({
          parentId: entry.parentId,
          globalId: entry.globalId
        });
        const nextModel = eventApplier.apply(initialModel, deleteEntryEvent);

        // original model is unchanged
        expect(initialModel.valueProposition.entries.list).toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });
    });
  });
});
