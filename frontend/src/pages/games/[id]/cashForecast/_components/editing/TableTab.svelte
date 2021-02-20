<script lang="ts">
  import DateOutput from "../../../../../../components/inputs/DateOutput.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import { getUtcDate } from "../../../../../../utilities/date";
  import { SubTotalType } from "../../_stores/calculator/types";
  import type { IProjectedCashFlowData } from "../../_stores/calculator/types";
  import type { ICashForecast } from "../../_types/cashForecast";
  import ProjectionGroupRow from "./tableTab/ProjectionGroupRow.svelte";
  import ProjectionChildRow from "./tableTab/ProjectionChildRow.svelte";

  export let cashForecast: ICashForecast;
  export let projection: IProjectedCashFlowData;
  const forecastDate = cashForecast.forecastStartDate.value;
  const launchDate = cashForecast.launchDate.value;

  $: dates = Array.from(new Array(cashForecast.forecastMonthCount.value).keys()).map((i) => ({
    i,
    date: getUtcDate(forecastDate.getUTCFullYear(), forecastDate.getUTCMonth() + i, 1),
  }));
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-cf-forecast-row {
    padding-left: 0.1rem; // needs some indent
  }

  table :global(td) {
    padding: $space-xs $space-s;
  }

  table tbody :global(th) {
    text-align: left;
    white-space: nowrap;
  }
</style>

<div class="gdb-cf-forecast-row">
  <LabeledInput label="Forecast Start Date">
    <DateOutput date={forecastDate} />
  </LabeledInput>
</div>
<div>
  <table>
    <thead>
      <tr>
        <th />
        <th />
        {#each dates as date (date.i)}
          <th>{date.date.toLocaleDateString("en-US", { year: "numeric", month: "short" })}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      <ProjectionGroupRow {projection} {dates} label="Beginning Cash" subTotalGroup="BeginningCash" />
      <!-- <ProjectionChildRow {projection} {dates} label="Balance" subTotalGroup={SubTotalType.BeginningCash_Balances} /> -->
      <ProjectionGroupRow {projection} {dates} label="Other Cash" subTotalGroup="OtherCash" />
      <ProjectionGroupRow {projection} {dates} label="Gross Revenue" subTotalGroup="GrossRevenue" />
      <ProjectionGroupRow {projection} {dates} label="Gross Profit" subTotalGroup="GrossProfit" />
      <ProjectionGroupRow {projection} {dates} label="Net Profit" subTotalGroup="NetProfit" />
      <ProjectionGroupRow {projection} {dates} label="Tax & Profit Share" subTotalGroup="TaxesAndProfitSharing" />
      <ProjectionGroupRow {projection} {dates} label="Ending Cash" subTotalGroup="EndingCash" />
    </tbody>
  </table>
</div>
