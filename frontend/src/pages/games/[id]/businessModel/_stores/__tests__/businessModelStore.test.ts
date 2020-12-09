import { createEmptyBusinessModel } from "../../../../../../testUtils/dataModel";
import { businessModelEventStore, eventApplier, events } from "../businessModelStore";

businessModelEventStore.initialize("unit-test", "1", { testMode: true });

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

    // Mass Tests: Value Prop, Channels

    describe.each`
      event                               | section                    | list
      ${"AddValuePropEntry"}              | ${"valueProposition"}      | ${"entries"}
      ${"AddValuePropPlatform"}           | ${"valueProposition"}      | ${"platforms"}
      ${"AddValuePropGenre"}              | ${"valueProposition"}      | ${"genres"}
      ${"AddChannelsAwarenessEntry"}      | ${"channels"}              | ${"awareness"}
      ${"AddChannelsConsiderationEntry"}  | ${"channels"}              | ${"consideration"}
      ${"AddChannelsPurchaseEntry"}       | ${"channels"}              | ${"purchase"}
      ${"AddChannelsPostPurchaseEntry"}   | ${"channels"}              | ${"postPurchase"}
      ${"AddCustomerRelationshipsEntry"}  | ${"customerRelationships"} | ${"entries"}
    `("$event", ({ event, section, list }) => {
      it(`adds a new entry to the ${section} '${list}'`, () => {
        const initialModel = createEmptyBusinessModel();

        const addEntryEvent = events[event]({
          parentId: initialModel[section][list].globalId,
          value: "test"
        });
        const nextModel = eventApplier.apply(initialModel, addEntryEvent);

        // original model is unchanged
        expect(initialModel[section][list].list).toEqual([]);
        // now with the new entry
        expect(nextModel[section][list].list).not.toEqual([]);
        expect(nextModel[section][list].list.length).toEqual(1);
        expect(nextModel[section][list].list[0].parentId).toEqual(nextModel[section][list].globalId);
        expect(nextModel[section][list].list[0].value).toEqual("test");
      });
    });

    describe.each`
      event                                  | section                    | list
      ${"UpdateValuePropEntry"}              | ${"valueProposition"}      | ${"entries"}
      ${"UpdateChannelsAwarenessEntry"}      | ${"channels"}              | ${"awareness"}
      ${"UpdateChannelsConsiderationEntry"}  | ${"channels"}              | ${"consideration"}
      ${"UpdateChannelsPurchaseEntry"}       | ${"channels"}              | ${"purchase"}
      ${"UpdateChannelsPostPurchaseEntry"}   | ${"channels"}              | ${"postPurchase"}
      ${"UpdateCustomerRelationshipsEntry"}  | ${"customerRelationships"} | ${"entries"}
    `("$event", ({ event, section, list }) => {
      const addEvent = event.replace("Update", "Add");
      const deleteEvent = event.replace("Update", "Delete");

      it(`updates an existing entry on the ${section} '${list}'`, () => {
        let initialModel = createEmptyBusinessModel();
        const addEntryEvent = events[addEvent]({
          parentId: initialModel[section][list].globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);

        const updateEntryEvent = events[event]({
          parentId: initialModel[section][list].globalId,
          globalId: initialModel[section][list].list[0].globalId,
          value: "test 2"
        });
        const nextModel = eventApplier.apply(initialModel, updateEntryEvent);

        // original model is unchanged
        expect(initialModel[section][list].list[0].value).toEqual("test");
        // new model is updated
        expect(nextModel[section][list].list[0].value).toEqual("test 2");
      });

      it(`[conflict] skips updating a deleted ${section} '${list}'`, () => {
        let initialModel = createEmptyBusinessModel();
        const addEntryEvent = events[addEvent]({
          parentId: initialModel[section][list].globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);
        const entry = initialModel[section][list].list[0];
        const preDeleteEntry = events[deleteEvent]({ parentId: entry.parentId, globalId: entry.globalId });
        initialModel = eventApplier.apply(initialModel, preDeleteEntry);

        const updateEntryEvent = events[event]({
          parentId: entry.parentId,
          globalId: entry.globalId,
          value: "test 2"
        });
        const nextModel = eventApplier.apply(initialModel, updateEntryEvent);

        // original model is unchanged
        expect(initialModel[section][list].list).toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });
    });

    describe.each`
      event                                  | section                    | list
      ${"DeleteValuePropEntry"}              | ${"valueProposition"}      | ${"entries"}
      ${"DeleteValuePropPlatform"}           | ${"valueProposition"}      | ${"platforms"}
      ${"DeleteValuePropGenre"}              | ${"valueProposition"}      | ${"genres"}
      ${"DeleteChannelsAwarenessEntry"}      | ${"channels"}              | ${"awareness"}
      ${"DeleteChannelsConsiderationEntry"}  | ${"channels"}              | ${"consideration"}
      ${"DeleteChannelsPurchaseEntry"}       | ${"channels"}              | ${"purchase"}
      ${"DeleteChannelsPostPurchaseEntry"}   | ${"channels"}              | ${"postPurchase"}
      ${"DeleteCustomerRelationshipsEntry"}  | ${"customerRelationships"} | ${"entries"}
    `("$event", ({ event, section, list }) => {
      const addEvent = event.replace("Delete", "Add");

      it(`deletes an existing entry on the ${section} '${list}'`, () => {
        let initialModel = createEmptyBusinessModel();
        const addEntryEvent = events[addEvent]({
          parentId: initialModel[section][list].globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);

        const deleteEvent = events[event]({
          parentId: initialModel[section][list].list[0].parentId,
          globalId: initialModel[section][list].list[0].globalId
        });
        const nextModel = eventApplier.apply(initialModel, deleteEvent);

        // original model is unchanged
        expect(initialModel[section][list].list[0].value).toEqual("test");
        // new model is updated
        expect(nextModel[section][list].list).toEqual([]);
      });

      it("[conflict] skips deleting an already deleted or non-existent entry", () => {
        let initialModel = createEmptyBusinessModel();
        const addEntryEvent = events[addEvent]({
          parentId: initialModel[section][list].globalId,
          value: "test"
        });
        initialModel = eventApplier.apply(initialModel, addEntryEvent);
        const entry = initialModel[section][list].list[0];
        const preDeleteEntry = events[event]({ parentId: entry.parentId, globalId: entry.globalId });
        initialModel = eventApplier.apply(initialModel, preDeleteEntry);

        const deleteEntryEvent = events[event]({
          parentId: entry.parentId,
          globalId: entry.globalId
        });
        const nextModel = eventApplier.apply(initialModel, deleteEntryEvent);

        // original model is unchanged
        expect(initialModel[section][list].list).toEqual([]);
        // the initial model is completely unchanged by this event
        expect(nextModel).toEqual(initialModel);
      });
    });
  });
});
