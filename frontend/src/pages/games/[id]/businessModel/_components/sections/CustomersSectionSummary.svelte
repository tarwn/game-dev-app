<script type="ts">
  import type { IBusinessModel } from "../../_types/businessModel";

  export let businessModel: IBusinessModel | null;

  function summarizeType(customerType: string) {
    switch (customerType) {
      case "both":
        return "Customer / Player";
      case "player":
        return "Player";
      case "customer":
        return "Customer";
      default:
        "Unknown";
    }
  }
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  // IMPORTANT: these styles are in `em` because we change the font size drastically
  //            for mini-map

  .gdb-customer-section-summary {
    margin: 1em 0;
  }

  .gdb-summary-name {
    font-weight: bold;
    margin: 0.5em 0;
  }

  .gdb-customer-summary-li {
    color: $text-color-default;
    margin: 0.5em 0;
  }

  .gdb-customer-summary {
    margin: 0.5em 0 2em 2em;
    padding: 0 0 0 0em;
    list-style-position: outside;
    color: $cs-grey-3;
  }
</style>

{#if businessModel != null}
  <div>
    {#each businessModel.customers.list as customer (customer.globalId)}
      <div class="gdb-customer-section-summary">
        <div class="gdb-summary-name">
          {customer.name.value || 'Unnamed Customer'}
        </div>
        <ul class="gdb-customer-summary">
          <li class="gdb-customer-summary-li">
            {summarizeType(customer.type.value)}
          </li>
          {#if customer.entries.list.length == 0}
            <li class="gdb-customer-summary-li">No details yet</li>
          {:else}
            {#each customer.entries.list as entry (entry.globalId)}
              <li class="gdb-customer-summary-li">{entry.value}</li>
            {/each}
          {/if}
        </ul>
      </div>
    {/each}
  </div>
{/if}
