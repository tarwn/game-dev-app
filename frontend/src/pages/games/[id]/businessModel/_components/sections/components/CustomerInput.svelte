<script lang="ts">
  import { fade } from "svelte/transition";
  import IconTextButton from "../../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../../components/buttons/PredefinedIcons";
  import {
    businessModelEventStore,
    businessModelEvents,
  } from "../../../_stores/newBusinessModelStore";
  import type { IBusinessModelCustomer } from "../../../_types/businessModel";

  export let customer: IBusinessModelCustomer;

  let hackyNewValue = "";

  function init(el) {
    el.focus();
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
</style>

<svelte:options immutable={true} />

<div class="gdb-customer-section" in:fade={{ duration: 250 }}>
  <div class="gdb-customer-head">
    <h3>Customer/Player</h3>
    <IconTextButton
      icon={PredefinedIcons.Delete}
      value="Delete"
      buttonStyle="secondary-negative"
      on:click={() => businessModelEventStore.addEvent(businessModelEvents.DeleteCustomer.get(
            {
              parentId: customer.parentId,
              globalId: customer.globalId,
            }
          ))} />
  </div>
  <div>
    <label><span>Name:</span><input
        type="text"
        placeholder="Enter a short name..."
        use:init /></label>
  </div>
  <div>
    <label><span>Type:</span>
      <input type="checkbox" value="player" id="player" /><label
        for="player">Player</label>
      <input type="checkbox" value="customer" id="customer" /><label
        for="customer">Customer</label>
    </label>
  </div>
  <div>
    <label for="newCharacteristic">Key Characteristics</label>
    <ul>
      {#each customer.entries.list as customerEntry (customerEntry.globalId)}
        <li>
          <input
            type="text"
            value={customerEntry.value}
            use:init
            on:change|stopPropagation={(e) => (e.target?.value.length > 0 ? businessModelEventStore.addEvent(businessModelEvents.UpdateCustomerEntry.get(
                      {
                        parentId: customerEntry.parentId,
                        globalId: customerEntry.globalId,
                        value: e.target?.value,
                      }
                    )) : businessModelEventStore.addEvent(businessModelEvents.DeleteCustomerEntry.get(
                      {
                        parentId: customerEntry.parentId,
                        globalId: customerEntry.globalId,
                      }
                    )))} />
        </li>
      {/each}
      <li>
        <input
          type="text"
          placeholder="Add another characteristic"
          id="newCharacteristic"
          bind:value={hackyNewValue}
          on:input|stopPropagation={(e) => {
            businessModelEventStore.addEvent(businessModelEvents.AddCustomerEntry.get(
                {
                  parentId: customer.entries.globalId,
                  value: e.target?.value,
                }
              ));
            hackyNewValue = '';
          }} />
      </li>
    </ul>
  </div>
</div>
