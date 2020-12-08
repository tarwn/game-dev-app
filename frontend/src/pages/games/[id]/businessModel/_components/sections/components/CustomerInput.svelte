<script lang="ts">
  import { fade } from "svelte/transition";
  import IconTextButton from "../../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../../components/buttons/PredefinedIcons";
  import LabeledInput from "../../../../../../../components/inputs/LabeledInput.svelte";
  import Row from "../../../../../../../components/inputs/Row.svelte";
  import {
    businessModelEventStore,
    events,
  } from "../../../_stores/businessModelStore";
  import type { Identified } from "../../../_stores/eventSystem/types";
  import type { IBusinessModelCustomer } from "../../../_types/businessModel";
  import EntryList from "./EntryList.svelte";

  export let customer: IBusinessModelCustomer;

  $: hasPlayerType =
    customer.type.value == "both" || customer.type.value == "player";
  $: hasCustomerType =
    customer.type.value == "both" || customer.type.value == "customer";

  function init(el) {
    el.focus();
  }

  function handleNameChange(e) {
    businessModelEventStore.addEvent(
      events.UpdateCustomerName({
        parentId: customer.name.parentId,
        globalId: customer.name.globalId,
        value: e.target?.value,
      })
    );
  }

  function handlePlayerTypeChange(e) {
    let nextType = "";
    if (hasCustomerType) {
      nextType = e.target?.checked ? "both" : "customer";
    } else {
      nextType = e.target?.checked ? "player" : "customer";
    }

    businessModelEventStore.addEvent(
      events.UpdateCustomerType({
        parentId: customer.type.parentId,
        globalId: customer.type.globalId,
        value: nextType,
      })
    );
  }

  function handleCustomerTypeChange(e) {
    let nextType = "";
    if (hasPlayerType) {
      nextType = e.target?.checked ? "both" : "player";
    } else {
      nextType = e.target?.checked ? "player" : "player";
    }

    businessModelEventStore.addEvent(
      events.UpdateCustomerType({
        parentId: customer.type.parentId,
        globalId: customer.type.globalId,
        value: nextType,
      })
    );
  }

  function handleOnNewCharacteristic(createEventArgs) {
    businessModelEventStore.addEvent(
      events.AddCustomerEntry(createEventArgs.detail)
    );
  }

  function handleCharacteristicUpdate(updateEventArgs) {
    businessModelEventStore.addEvent(
      events.UpdateCustomerEntry(updateEventArgs.detail)
    );
  }

  function handleCharacteristicDelete(deleteEventArgs) {
    businessModelEventStore.addEvent(
      events.DeleteCustomerEntry(deleteEventArgs.detail)
    );
  }

  function handleCustomerDelete(customer: Identified) {
    businessModelEventStore.addEvent(
      events.DeleteCustomer({
        parentId: customer.parentId,
        globalId: customer.globalId,
      })
    );
  }
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  .gdb-customer-section {
    border: 3px solid $cs-grey-0;
    border-radius: 8px;
    margin: $space-m 0;
    padding: $space-s;

    &:focus-within {
      border: 3px solid $color-accent-1-lighter;
      box-shadow: $shadow-smallest;
    }
  }

  .gdb-customer-head {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: $space-s;

    & > h3 {
      flex-grow: 2;
    }
  }

  // hack for checkbox spacing
  input + label + input {
    margin-left: $space-m;
  }
</style>

<svelte:options immutable={true} />

<div class="gdb-customer-section" in:fade={{ duration: 250 }}>
  <div class="gdb-customer-head">
    <h3>Customer/Player</h3>
    <IconTextButton
      icon={PredefinedIcons.Delete}
      value="Delete"
      buttonStyle="secondary-negative"
      on:click={() => handleCustomerDelete(customer)} />
  </div>
  <Row>
    <LabeledInput label="Name">
      <input
        type="text"
        placeholder="Enter a short name..."
        on:change={handleNameChange}
        value={customer.name.value}
        use:init />
    </LabeledInput>
  </Row>
  <Row>
    <LabeledInput label="Type">
      <input
        type="checkbox"
        value="player"
        id={`${customer.type.globalId}-player`}
        checked={hasPlayerType}
        on:change={handlePlayerTypeChange} />
      <label for={`${customer.type.globalId}-player`}>Player</label>
      <input
        type="checkbox"
        value="customer"
        id={`${customer.type.globalId}-customer`}
        checked={hasCustomerType}
        on:change={handleCustomerTypeChange} />
      <label for={`${customer.type.globalId}-customer`}>Customer</label>
    </LabeledInput>
  </Row>
  <Row>
    <EntryList
      label="Key Characteristics"
      entries={customer.entries}
      on:create={handleOnNewCharacteristic}
      on:update={handleCharacteristicUpdate}
      on:delete={handleCharacteristicDelete} />
  </Row>
</div>
