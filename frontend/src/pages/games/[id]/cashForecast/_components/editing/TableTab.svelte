<script lang="ts">
  import DateOutput from "../../../../../../components/inputs/DateOutput.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import { getUtcDate } from "../../../../../../utilities/date";
  import { SubTotalType } from "../../_stores/calculator/types";
  import type { IProjectedCashFlowData } from "../../_stores/calculator/types";
  import type { ICashForecast } from "../../_types/cashForecast";
  import ProjectionGroupRow from "./tableTab/ProjectionGroupRow.svelte";
  import ProjectionChildSubTotalRow from "./tableTab/ProjectionChildSubTotalRow.svelte";
  import ProjectionChildDetailRows from "./tableTab/ProjectionChildDetailRows.svelte";

  export let cashForecast: ICashForecast;
  export let projection: IProjectedCashFlowData;
  const forecastDate = cashForecast.forecastStartDate.value;

  $: dates = Array.from(new Array(cashForecast.forecastMonthCount.value).keys()).map((i) => ({
    i,
    date: getUtcDate(forecastDate.getUTCFullYear(), forecastDate.getUTCMonth() + i, 1),
  }));

  const isNegativeShaded = (i: number) => {
    return projection.EndingCash[i].amount < 0 || projection.BeginningCash[i].amount < 0;
  };
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-cf-wrapper {
    position: relative;
    overflow: auto;
  }

  .gdb-cf-forecast-row {
    padding-left: 0.1rem; // needs some indent
  }

  .gdb-cf-summaryTable {
    border-collapse: collapse;

    :global(.isSticky) {
      position: sticky;
      position: -webkit-sticky;
      left: 0;
    }
  }

  .gdb-cf-headRow {
    & > th {
      padding: $space-s $space-s;
      padding-bottom: 4px;
      // background-color: $cs-grey-1;
      border-bottom: 4px solid white;
      &.isPositiveShaded {
        // background-color: $cs-green-1;
        border-bottom: 4px solid $cs-green-1;
        // background-color: white;
      }
      &.isNegativeShaded {
        background-color: $cs-red-1;
        border-bottom: 4px solid $cs-red-1;
      }

      &.isSticky {
        background-color: white;
        // fix border visibility from other col headers under padding backgroun clip
        border-bottom: 2px solid white;
      }
    }
    & > th + th {
      padding: $space-s $space-s;
      border-left: 1px solid $cs-grey-0;
    }
  }

  .gdb-cf-summaryTable :global(tbody th) {
    text-align: left;
    white-space: nowrap;
    font-weight: normal;
    background-color: white;
    padding: $space-xs $space-s;

    &.isIndented {
      padding-left: $space-m + $space-s + $space-s;
    }
  }

  .gdb-cf-summaryTable :global(td) {
    padding: $space-xs $space-s;
    border-left: 1px solid $cs-grey-0;
  }
  // add in right border for the sticky column to offset missing left column when scrolling
  .gdb-cf-summaryTable :global(th.isSticky) {
    // fix-ish missing borders on cells (causes issues w/ top border fixed specifically in ProjectionGroupRow)
    background-clip: padding-box;
    // replace disappearing borders
    &:before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      border-right: 1px solid $cs-grey-0;
      z-index: -1;
    }
  }
</style>

<div class="gdb-cf-forecast-row">
  <LabeledInput label="Forecast Start Date">
    <DateOutput date={forecastDate} />
  </LabeledInput>
</div>
<div class="gdb-cf-wrapper">
  <table class="gdb-cf-summaryTable">
    <thead>
      <tr class="gdb-cf-headRow">
        <th class="isSticky" />
        {#each dates as date (date.i)}
          <th class:isNegativeShaded={isNegativeShaded(date.i)} class:isPositiveShaded={!isNegativeShaded(date.i)}
            >{date.date.toLocaleDateString("en-US", { year: "numeric", month: "short" })}</th>
        {/each}
      </tr>
    </thead>
    <ProjectionGroupRow
      {projection}
      {dates}
      label="Beginning Cash"
      subTotalGroup="BeginningCash"
      isBeginning={true}
      canExpand={true}
      startExpanded={false}>
      <ProjectionChildSubTotalRow
        {projection}
        {dates}
        label="Prev. End Balance"
        subTotalGroup="BeginningCash_YesterdayEnding"
        isBeginning={true} />
      <ProjectionChildDetailRows
        {projection}
        {dates}
        subTotalGroup={SubTotalType.BeginningCash_Balances}
        isBeginning={true} />
    </ProjectionGroupRow>
    <ProjectionGroupRow {projection} {dates} label="Other Cash" subTotalGroup="OtherCash">
      <ProjectionChildDetailRows {projection} {dates} suffix="(in)" subTotalGroup={SubTotalType.OtherCash_LoanIn} />
      <ProjectionChildDetailRows {projection} {dates} suffix="(out)" subTotalGroup={SubTotalType.OtherCash_LoanOut} />
      <ProjectionChildDetailRows {projection} {dates} suffix="(in)" subTotalGroup={SubTotalType.OtherCash_FundingIn} />
    </ProjectionGroupRow>
    <ProjectionGroupRow {projection} {dates} label="Gross Revenue" subTotalGroup="GrossRevenue" />
    <ProjectionGroupRow {projection} {dates} label="Gross Profit" subTotalGroup="GrossProfit" />
    <ProjectionGroupRow {projection} {dates} label="Net Profit" subTotalGroup="NetProfit" />
    <ProjectionGroupRow {projection} {dates} label="Tax & Profit Share" subTotalGroup="TaxesAndProfitSharing" />
    <ProjectionGroupRow
      {projection}
      {dates}
      label="Ending Cash"
      subTotalGroup="EndingCash"
      isTotal={true}
      canExpand={false} />
  </table>
</div>
