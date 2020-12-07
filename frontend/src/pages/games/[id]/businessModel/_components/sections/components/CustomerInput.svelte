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

  export let customer: IBusinessModelCustomer;

  let hackyNewValue = "";

  function init(el) {
    el.focus();
  }

  $: hasPlayerType =
    customer.type.value == "both" || customer.type.value == "player";
  $: hasCustomerType =
    customer.type.value == "both" || customer.type.value == "customer";

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

  function handleOnNewCharacteristic(e: any) {
    businessModelEventStore.addEvent(
      events.AddCustomerEntry({
        parentId: customer.entries.globalId,
        value: e.target?.value,
      })
    );
    hackyNewValue = "";
  }

  function handleCharacteristicUpdate(customerEntry: Identified, e: any) {
    if (e.target?.value.length > 0) {
      businessModelEventStore.addEvent(
        events.UpdateCustomerEntry({
          parentId: customerEntry.parentId,
          globalId: customerEntry.globalId,
          value: e.target?.value,
        })
      );
    } else {
      businessModelEventStore.addEvent(
        events.DeleteCustomerEntry({
          parentId: customerEntry.parentId,
          globalId: customerEntry.globalId,
        })
      );
    }
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

  input + label + input {
    margin-left: $space-m;
  }

  .gdb-entry-list {
    margin: 0;
    list-style-type: disc;
    margin-left: 4rem; // matches label min-size padding
    padding-left: $space-s; // matches label.text min-size padding
  }
  .gdb-entry-list-item-new,
  .gdb-entry-list-item {
    line-height: $line-height-base; // matches label
    margin: $space-s 0; // matches Row
  }

  .gdb-entry-list-item-new {
    list-style-type: none;

    &:focus-within::before {
      content: "\2022"; /* Add content: \2022 is the CSS Code/unicode for a bullet */
      color: $cs_blue;
      font-weight: bold;
      font-size: $font-size-larger;
      display: inline-block;
      width: 15px;
      margin-left: -15px;
    }
  }

  .gdb-entry-input-new,
  .gdb-entry-input {
    width: 26rem;
  }

  .gdb-entry-input-new {
    border-style: dashed;

    &:active,
    &:focus {
      border-style: solid;
    }
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
    <LabeledInput
      label="Key Characteristics"
      forId={`${customer.entries.globalId}-newEntry`} />
    <ul class="gdb-entry-list">
      {#each customer.entries.list as customerEntry (customerEntry.globalId)}
        <li class="gdb-entry-list-item">
          <input
            type="text"
            class="gdb-entry-input"
            value={customerEntry.value}
            use:init
            on:change|stopPropagation={(e) => handleCharacteristicUpdate(customerEntry, e)} />
        </li>
      {/each}
      <li class="gdb-entry-list-item-new">
        <input
          type="text"
          class="gdb-entry-input-new"
          placeholder={customer.entries.list.length == 0 ? 'Enter a key characteristic' : 'Enter another key characteristic'}
          id={`${customer.entries.globalId}-newEntry`}
          bind:value={hackyNewValue}
          on:input|stopPropagation={handleOnNewCharacteristic} />
      </li>
    </ul>
  </Row>
</div>
