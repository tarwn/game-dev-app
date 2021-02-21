<script lang="ts">
  import DateOutput from "../../../../../../components/inputs/DateOutput.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import { getUtcDate } from "../../../../../../utilities/date";
  import { SubTotalType } from "../../_stores/calculator/types";
  import type { IProjectedCashFlowData } from "../../_stores/calculator/types";
  import type { ICashForecast } from "../../_types/cashForecast";
  import GroupRow from "./tableTab/GroupRow.svelte";
  import ChildSubTotalRow from "./tableTab/ChildSubTotalRow.svelte";
  import ChildDetailRows from "./tableTab/ChildDetailRows.svelte";

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
    // fix-ish missing borders on cells (causes issues w/ top border fixed specifically in GroupRow)
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
    <tbody>
      <GroupRow
        {projection}
        {dates}
        label="Beginning Cash"
        group="BeginningCash"
        isBeginning={true}
        canExpand={true}
        startExpanded={false}>
        <ChildSubTotalRow
          {projection}
          {dates}
          label="Prev. End Balance"
          group="BeginningCash_YesterdayEnding"
          isBeginning={true} />
        <ChildDetailRows {projection} {dates} group={SubTotalType.BeginningCash_Balances} isBeginning={true} />
      </GroupRow>

      <GroupRow {projection} {dates} label="Other Cash" group="OtherCash">
        <GroupRow {projection} {dates} label="Loans" group="OtherCash_LoanIn">
          <ChildDetailRows {projection} {dates} suffix="(in)" group={SubTotalType.OtherCash_LoanIn} />
          <ChildDetailRows
            {projection}
            {dates}
            suffix="(out)"
            group={SubTotalType.OtherCash_LoanOut}
            isPositive={false} />
        </GroupRow>
        <GroupRow {projection} {dates} label="Funding" group="OtherCash_FundingIn">
          <ChildDetailRows {projection} {dates} suffix="(in)" group={SubTotalType.OtherCash_FundingIn} />
        </GroupRow>
      </GroupRow>

      <GroupRow {projection} {dates} label="Gross Revenue" group="GrossRevenue">
        <GroupRow {projection} {dates} label="Sales Revenue" group="GrossRevenue_SalesRevenue">
          <ChildDetailRows {projection} {dates} group={SubTotalType.GrossRevenue_SalesRevenue} />
        </GroupRow>
        <GroupRow {projection} {dates} label="Platform Rev. Share" group="GrossRevenue_PlatformShares">
          <ChildDetailRows
            {projection}
            {dates}
            suffix="(platform %)"
            group={SubTotalType.GrossRevenue_PlatformShares} />
        </GroupRow>
        <GroupRow {projection} {dates} label="Dist. Rev. Shares" group="GrossRevenue_DistributionShares">
          <ChildDetailRows
            {projection}
            {dates}
            suffix="(dist. %)"
            group={SubTotalType.GrossRevenue_DistributionShares} />
        </GroupRow>
        <GroupRow {projection} {dates} label="Publisher Rev. Shares" group="GrossRevenue_PublisherShares">
          <ChildDetailRows {projection} {dates} suffix="(pub. %)" group={SubTotalType.GrossRevenue_PublisherShares} />
        </GroupRow>
      </GroupRow>

      <GroupRow {projection} {dates} label="Gross Profit" group="GrossProfit">
        <GroupRow {projection} {dates} label="Direct Employees" group="GrossProfit_DirectEmployees" isPositive={false}>
          <ChildDetailRows {projection} {dates} group={SubTotalType.GrossProfit_DirectEmployees} isPositive={false} />
        </GroupRow>
        <GroupRow
          {projection}
          {dates}
          label="Direct Contractors"
          group="GrossProfit_DirectContractors"
          isPositive={false}>
          <ChildDetailRows {projection} {dates} group={SubTotalType.GrossProfit_DirectContractors} isPositive={false} />
        </GroupRow>
        <GroupRow {projection} {dates} label="Direct Expenses" group="GrossProfit_DirectExpenses" isPositive={false}>
          <ChildDetailRows {projection} {dates} group={SubTotalType.GrossProfit_DirectExpenses} isPositive={false} />
        </GroupRow>
      </GroupRow>

      <GroupRow {projection} {dates} label="Net Profit" group="NetProfit">
        <GroupRow
          {projection}
          {dates}
          label="Indirect Employees"
          group="NetProfit_IndirectEmployees"
          isPositive={false}>
          <ChildDetailRows {projection} {dates} group={SubTotalType.NetProfit_IndirectEmployees} isPositive={false} />
        </GroupRow>
        <GroupRow
          {projection}
          {dates}
          label="Indirect Contractors"
          group="NetProfit_IndirectContractors"
          isPositive={false}>
          <ChildDetailRows {projection} {dates} group={SubTotalType.NetProfit_IndirectContractors} isPositive={false} />
        </GroupRow>
        <GroupRow {projection} {dates} label="Indirect Expenses" group="NetProfit_IndirectExpenses" isPositive={false}>
          <ChildDetailRows {projection} {dates} group={SubTotalType.NetProfit_IndirectExpenses} isPositive={false} />
        </GroupRow>
      </GroupRow>

      <GroupRow {projection} {dates} label="Tax & Profit Share" group="TaxesAndProfitSharing">
        <GroupRow {projection} {dates} label="Taxes" group="TaxesAndProfitSharing_Taxes" isPositive={false}>
          <ChildDetailRows {projection} {dates} group={SubTotalType.TaxesAndProfitSharing_Taxes} isPositive={false} />
        </GroupRow>
        <GroupRow
          {projection}
          {dates}
          label="Profit Sharing"
          group="TaxesAndProfitSharing_ProfitSharing"
          isPositive={false}>
          <ChildDetailRows
            {projection}
            {dates}
            group={SubTotalType.TaxesAndProfitSharing_ProfitSharing}
            isPositive={false} />
        </GroupRow>
      </GroupRow>

      <GroupRow {projection} {dates} label="Ending Cash" group="EndingCash" isTotal={true} canExpand={false} />
    </tbody>
  </table>
</div>
