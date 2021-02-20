<script lang="ts">
  import { SubTotalType } from "../../../_stores/calculator/types";
  import type { IProjectedCashFlowData } from "../../../_stores/calculator/types";

  export let projection: IProjectedCashFlowData;
  export let subTotalGroup: SubTotalType;
  export let label: string;
  export let dates: Array<{ i: number } & any>;

  const currencyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // currencySign: "accounting",
  });
  function formatUSD(val: number) {
    return currencyFormat.format(val);
  }
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  .whatever {
    color: $text-color-light;
  }
</style>

{#each Array.from(projection.details.get(subTotalGroup).keys()) as entry (entry)}
  <tr>
    <th class="whatever">{label}</th>
    <th>{entry}</th>
    {#each dates as date (date.i)}
      <td>{formatUSD(projection.details.get(subTotalGroup).get(entry)[date.i].amount)}</td>
    {/each}
  </tr>
{/each}
