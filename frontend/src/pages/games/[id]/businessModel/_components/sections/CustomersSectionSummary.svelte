<script type="ts">
  import type { IBusinessModel } from "../../_types/businessModel";

  export let businessModel: IBusinessModel | null;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  // IMPORTANT: these styles are in `em` because we change the font size drastically
  //            for mini-map

  .gdb-customer-section-summary {
    margin: 1em 0;
  }

  ul {
    margin: 0 0 0 2em;
    padding: 0 0 0 0em;
    list-style-position: inside;
  }
</style>

{#if businessModel != null}
  <div>
    {#each businessModel.customers.list as customer (customer.globalId)}
      <div class="gdb-customer-section-summary">
        <div>{customer.name.value || 'Unnamed Customer'}</div>
        <ul>
          {#if customer.entries.list.length == 0}
            <li>No details yet</li>
          {:else}
            {#each customer.entries.list as entry (entry.globalId)}
              <li>{entry.value}</li>
            {/each}
          {/if}
        </ul>
      </div>
    {/each}
  </div>
{/if}
