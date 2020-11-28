<script lang="ts">
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import type { IBusinessModel } from "../../_types/businessModel";
  // import { businessModelStore } from "../../_stores/businessModelStore";
  import InputPanel from "../InputPanel.svelte";
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import CustomersSectionInstructions from "./CustomersSectionInstructions.svelte";
  import {
    businessModelEventStore,
    businessModelEvents,
  } from "../../_stores/newBusinessModelStore";

  export let businessModel: IBusinessModel;

  let hackyNewValue = "";
  const dispatch = createEventDispatcher();

  function init(el) {
    el.focus();
  }
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

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

  .gdb-customer-new-section {
    border: 3px dashed $color-accent-1-lighter;
    border-radius: 8px;
    margin: $space-m 0;
    padding: $space-m;
    text-align: center;
    & > p {
      text-align: left;
    }
  }

  .gdb-customer-new-section-small {
    border: 3px dashed $cs-grey-1;
    border-radius: 8px;
    margin: $space-m 0;
    padding: $space-s;
    text-align: center;
  }
</style>

<InputPanel
  title="Identifying players & customers"
  canUndo={false}
  canRedo={false}
  canNext={businessModel.customers.list.length > 0}
  canFullscreen={true}
  on:clickFullscreen>
  {#if businessModel.customers.list.length == 0}
    <div class="gdb-customer-new-section">
      <p>
        Who are the people that will love this game? Are they the sames ones
        that buy it? Let's add the first Player/Customer:
      </p>
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value="Add a Customer"
        buttonStyle="primary"
        on:click={() => businessModelEventStore.addEvent(businessModelEvents.AddNewCustomer.get(
              { parentId: businessModel.customers.globalId }
            ))} />
    </div>
  {:else}
    {#each businessModel.customers.list as customer (customer.globalId)}
      <div class="gdb-customer-section" in:fade={{ duration: 250 }}>
        <div class="gdb-customer-head">
          <h3>Customer/Player</h3>
          <IconTextButton
            icon={PredefinedIcons.Delete}
            value="Delete"
            buttonStyle="secondary-negative"
            on:click={() => businessModelEventStore.addEvent(businessModelEvents.DeleteCustomer.get(
                  {
                    parentId: businessModel.customers.globalId,
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
    {/each}
    <div class="gdb-customer-new-section-small">
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value="Add another Customer"
        buttonStyle="primary"
        on:click={() => businessModelEventStore.addEvent(businessModelEvents.AddNewCustomer.get(
              { parentId: businessModel.customers.globalId }
            ))} />
    </div>
  {/if}
</InputPanel>
