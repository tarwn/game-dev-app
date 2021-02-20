<script lang="ts">
  import type { IProjectedCashFlowData, SubTotalType } from "../../../_stores/calculator/types";

  export let projection: IProjectedCashFlowData;
  export let subTotalGroup: string;
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
</style>

<tr>
  <th colspan="2">{label}</th>
  {#each dates as date (date.i)}
    <td>
      {formatUSD(projection[subTotalGroup][date.i].amount)}
    </td>
  {/each}
</tr>
