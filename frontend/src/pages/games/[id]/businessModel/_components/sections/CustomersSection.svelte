<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { IBusinessModel } from "../../_types/businessModel";
  // import { businessModelStore } from "../../_stores/businessModelStore";
  import InputPanel from "../InputPanel.svelte";
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import {
    businessModelEventStore,
    events,
  } from "../../_stores/newBusinessModelStore";
  import CustomerInput from "./components/CustomerInput.svelte";

  export let businessModel: IBusinessModel;

  const dispatch = createEventDispatcher();
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

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
        on:click={() => businessModelEventStore.addEvent(events.AddNewCustomer({
              parentId: businessModel.customers.globalId,
            }))} />
    </div>
  {:else}
    {#each businessModel.customers.list as customer (customer.globalId)}
      <CustomerInput {customer} />
    {/each}
    <div class="gdb-customer-new-section-small">
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value="Add another Customer"
        buttonStyle="primary"
        on:click={() => businessModelEventStore.addEvent(events.AddNewCustomer({
              parentId: businessModel.customers.globalId,
            }))} />
    </div>
  {/if}
</InputPanel>
