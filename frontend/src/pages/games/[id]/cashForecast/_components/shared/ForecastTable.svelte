<script lang="ts">
  import { getUtcDate } from "../../../../../../utilities/date";
  import { SubTotalType } from "../../_stores/calculator/types";
  import type { IProjectedCashFlowData } from "../../_stores/calculator/types";
  import type { ICashForecast } from "../../_types/cashForecast";
  import GroupRow from "./table/GroupRow.svelte";
  import ChildSubTotalRow from "./table/ChildSubTotalRow.svelte";
  import ChildDetailRows from "./table/ChildDetailRows.svelte";
  import SubGroupRow from "./table/SubGroupRow.svelte";

  export let cashForecast: ICashForecast;
  export let projection: IProjectedCashFlowData;
  export let startMode: StartMode;

  enum StartMode {
    TableView,
    SummaryView,
  }

  $: dates = cashForecast
    ? Array.from(new Array(cashForecast.forecastMonthCount.value).keys()).map((i) => ({
        i,
        date: getUtcDate(
          cashForecast.forecastStartDate.value.getUTCFullYear(),
          cashForecast.forecastStartDate.value.getUTCMonth() + i,
          1
        ),
      }))
    : [];

  const isNegativeShaded = (i: number) => {
    return projection.EndingCash[i].amount < 0 || projection.BeginningCash[i].amount < 0;
  };

  const hasValues = (groups: SubTotalType[]) => {
    return groups.some((g) => projection.hasSubTotals.has(g));
  };
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-cf-wrapper {
    position: relative;
    overflow: auto;
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

    $defPadding: $space-s;
    $toggle: $space-m + $space-s;
    $indent: $space-s;

    // top level group: $defPadding + $toggle

    // indented member of top group
    &.isIndented {
      padding-left: $defPadding + $toggle + $indent;
    }

    // subtotal of top group
    &.isSubTotalValue {
      // lines up with first row
      padding-left: $defPadding + $toggle;
    }

    // indented group of top group
    &.isIndented.isGroup {
      padding-left: $defPadding + $toggle + $indent + $toggle;
    }
    &.isIndented.isGroup.hasToggle {
      padding-left: $defPadding + $toggle + $indent;
    }

    // indented child (double indented)
    &.isDoubleIndented {
      padding-left: $defPadding + $toggle + $indent + $toggle + $indent;
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

<div class="gdb-cf-wrapper">
  <table class="gdb-cf-summaryTable">
    <thead>
      <tr class="gdb-cf-headRow">
        <th class="isSticky" />
        {#each dates as date (date.i)}
          <th class:isNegativeShaded={isNegativeShaded(date.i)} class:isPositiveShaded={!isNegativeShaded(date.i)}
            >{date.date.toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone: "UTC" })}</th>
        {/each}
      </tr>
    </thead>
    {#if cashForecast && projection}
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

        <GroupRow
          {projection}
          {dates}
          label="Other Cash"
          group="OtherCash"
          startExpanded={startMode === StartMode.TableView}>
          <SubGroupRow
            {projection}
            {dates}
            label="Loans"
            group="OtherCash_LoanIn"
            canExpand={hasValues([SubTotalType.OtherCash_LoanIn, SubTotalType.OtherCash_LoanOut])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows {projection} {dates} suffix="(in)" group={SubTotalType.OtherCash_LoanIn} level={2} />
            <ChildDetailRows
              {projection}
              {dates}
              suffix="(out)"
              group={SubTotalType.OtherCash_LoanOut}
              isPositive={false}
              level={2} />
          </SubGroupRow>
          <SubGroupRow
            {projection}
            {dates}
            label="Funding"
            group="OtherCash_FundingIn"
            canExpand={hasValues([SubTotalType.OtherCash_FundingIn])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows {projection} {dates} suffix="(in)" group={SubTotalType.OtherCash_FundingIn} level={2} />
          </SubGroupRow>
        </GroupRow>

        <GroupRow
          {projection}
          {dates}
          label="Gross Revenue"
          group="GrossRevenue"
          startExpanded={startMode === StartMode.TableView}>
          <SubGroupRow
            {projection}
            {dates}
            label="Sales Revenue"
            group="GrossRevenue_SalesRevenue"
            canExpand={hasValues([SubTotalType.GrossRevenue_SalesRevenue])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows {projection} {dates} group={SubTotalType.GrossRevenue_SalesRevenue} level={2} />
          </SubGroupRow>
          <SubGroupRow
            {projection}
            {dates}
            label="Platform Rev. Share"
            group="GrossRevenue_PlatformShares"
            canExpand={hasValues([SubTotalType.GrossRevenue_PlatformShares])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows
              {projection}
              {dates}
              suffix="(platform %)"
              group={SubTotalType.GrossRevenue_PlatformShares}
              level={2} />
          </SubGroupRow>
          <SubGroupRow
            {projection}
            {dates}
            label="Dist. Rev. Shares"
            group="GrossRevenue_DistributionShares"
            canExpand={hasValues([SubTotalType.GrossRevenue_DistributionShares])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows
              {projection}
              {dates}
              suffix="(dist. %)"
              group={SubTotalType.GrossRevenue_DistributionShares}
              level={2} />
          </SubGroupRow>
          <SubGroupRow
            {projection}
            {dates}
            label="Publisher Rev. Shares"
            group="GrossRevenue_PublisherShares"
            canExpand={hasValues([SubTotalType.GrossRevenue_PublisherShares])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows
              {projection}
              {dates}
              suffix="(pub. %)"
              group={SubTotalType.GrossRevenue_PublisherShares}
              level={2} />
          </SubGroupRow>
        </GroupRow>

        <GroupRow {projection} {dates} label="Gross Profit" group="GrossProfit">
          <SubGroupRow
            {projection}
            {dates}
            label="Direct Employees"
            group="GrossProfit_DirectEmployees"
            isPositive={false}
            canExpand={hasValues([SubTotalType.GrossProfit_DirectEmployees])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows
              {projection}
              {dates}
              group={SubTotalType.GrossProfit_DirectEmployees}
              isPositive={false}
              level={2} />
          </SubGroupRow>
          <SubGroupRow
            {projection}
            {dates}
            label="Direct Contractors"
            group="GrossProfit_DirectContractors"
            isPositive={false}
            canExpand={hasValues([SubTotalType.GrossProfit_DirectContractors])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows
              {projection}
              {dates}
              group={SubTotalType.GrossProfit_DirectContractors}
              isPositive={false}
              level={2} />
          </SubGroupRow>
          <SubGroupRow
            {projection}
            {dates}
            label="Direct Expenses"
            group="GrossProfit_DirectExpenses"
            isPositive={false}
            canExpand={hasValues([SubTotalType.GrossProfit_DirectExpenses])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows
              {projection}
              {dates}
              group={SubTotalType.GrossProfit_DirectExpenses}
              isPositive={false}
              level={2} />
          </SubGroupRow>
        </GroupRow>

        <GroupRow {projection} {dates} label="Net Profit" group="NetProfit">
          <SubGroupRow
            {projection}
            {dates}
            label="Indirect Employees"
            group="NetProfit_IndirectEmployees"
            isPositive={false}
            canExpand={hasValues([SubTotalType.NetProfit_IndirectEmployees])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows
              {projection}
              {dates}
              group={SubTotalType.NetProfit_IndirectEmployees}
              isPositive={false}
              level={2} />
          </SubGroupRow>
          <SubGroupRow
            {projection}
            {dates}
            label="Indirect Contractors"
            group="NetProfit_IndirectContractors"
            isPositive={false}
            canExpand={hasValues([SubTotalType.NetProfit_IndirectContractors])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows
              {projection}
              {dates}
              group={SubTotalType.NetProfit_IndirectContractors}
              isPositive={false}
              level={2} />
          </SubGroupRow>
          <SubGroupRow
            {projection}
            {dates}
            label="Indirect Expenses"
            group="NetProfit_IndirectExpenses"
            isPositive={false}
            canExpand={hasValues([SubTotalType.NetProfit_IndirectExpenses])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows
              {projection}
              {dates}
              group={SubTotalType.NetProfit_IndirectExpenses}
              isPositive={false}
              level={2} />
          </SubGroupRow>
        </GroupRow>

        <GroupRow {projection} {dates} label="Tax & Profit Share" group="TaxesAndProfitSharing">
          <SubGroupRow
            {projection}
            {dates}
            label="Taxes"
            group="TaxesAndProfitSharing_Taxes"
            isPositive={false}
            canExpand={hasValues([SubTotalType.TaxesAndProfitSharing_Taxes])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows
              {projection}
              {dates}
              group={SubTotalType.TaxesAndProfitSharing_Taxes}
              isPositive={false}
              level={2} />
          </SubGroupRow>
          <SubGroupRow
            {projection}
            {dates}
            label="Profit Sharing"
            group="TaxesAndProfitSharing_ProfitSharing"
            isPositive={false}
            canExpand={hasValues([SubTotalType.TaxesAndProfitSharing_ProfitSharing])}
            startExpanded={startMode === StartMode.TableView}>
            <ChildDetailRows
              {projection}
              {dates}
              group={SubTotalType.TaxesAndProfitSharing_ProfitSharing}
              isPositive={false}
              level={2} />
          </SubGroupRow>
        </GroupRow>

        <GroupRow {projection} {dates} label="Ending Cash" group="EndingCash" isTotal={true} canExpand={false} />
      </tbody>
    {/if}
  </table>
</div>
