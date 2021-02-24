<script lang="ts">
  import { metatags, params } from "@sveltech/routify";
  import { scale, crossfade, fade } from "svelte/transition";
  import IconTextButton from "../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
  import ScreenTitle from "../../../../components/layout/ScreenTitle.svelte";
  import { getConfig } from "../../../../config";
  import { log } from "../../../../utilities/logger";
  import WebSocketChannel from "../../../_communications/WebSocketChannel.svelte";
  import ForecastTable from "./_components/ForecastTable.svelte";
  import { cashForecastEventStore, cashForecastLocalStore } from "./_stores/cashForecastStore";
  import type { ICashForecast } from "./_types/cashForecast";
  import { onDestroy } from "svelte";
  import TabbedEditor from "./_components/editing/TabbedEditor.svelte";
  import { TabType } from "./_components/editing/tabList";
  import AssetInstructions from "./_components/editing/assetTab/AssetInstructions.svelte";
  import DirectExpensesInstructions from "./_components/editing/expenseTab/DirectExpensesInstructions.svelte";
  import MktgAndSalesExpensesInstructions from "./_components/editing/expenseTab/MktgAndSalesExpensesInstructions.svelte";
  import GeneralExpensesInstructions from "./_components/editing/expenseTab/GeneralExpensesInstructions.svelte";
  import PeopleInstructions from "./_components/editing/peopleTab/PeopleInstructions.svelte";
  import TaxInstructions from "./_components/editing/taxesTab/TaxInstructions.svelte";
  import { projectedCashFlowStore } from "./_stores/projectedCashForecasetStore";
  import type { IProjectedCashFlowData } from "./_stores/calculator/types";
  import TableInstructions from "./_components/editing/tableTab/tableInstructions.svelte";
  import ForecastChart from "./_components/ForecastChart.svelte";

  // page title
  metatags.title = "[LR] Cash Forecast";

  // params
  const { actorId } = getConfig();
  $: id = $params.id;
  let view: "edit" | "summary" = "summary";
  let editViewAvailable = false;
  let isLoading = true;
  let cashForecast = null as null | ICashForecast;
  let projectedCashForecast = null as null | IProjectedCashFlowData;

  // initialize section view if query present
  if ($params.view === "edit") {
    view = "edit";
    editViewAvailable = true;
  }

  // section change
  const [send, receive] = crossfade({ duration: 500, fallback: scale });
  function switchToEditView() {
    view = "edit";
    editViewAvailable = false;
  }
  function completeSwitchToEditView() {
    history.pushState({}, "", `/games/${id}/cashForecast?view=edit`);
    editViewAvailable = true;
  }
  function switchToSummaryView() {
    history.pushState({}, "", `/games/${id}/cashForecast`);
    view = "summary";
    editViewAvailable = false;
  }

  // selected tab in edit
  let selectedTab: TabType | null = null;

  // data management
  let initializedId = null;
  $: {
    if (id != null && id != initializedId) {
      initializedId = id;
      cashForecastEventStore.initialize(actorId, id).then((initdId) => {
        if (initdId != id) return;
        return cashForecastEventStore.loadFullState();
      });
    }
  }
  const unsubscribe = cashForecastLocalStore.subscribe((update) => {
    cashForecast = update;
    projectedCashFlowStore.updateForecast(update);
    if (cashForecast && isLoading) {
      isLoading = false;
    }
  });
  let hasUnsaved = false;
  // let lastSaved = new Date();
  const unsubscribe2 = cashForecastEventStore.subscribe((update) => {
    if (hasUnsaved && update.pendingEvents.length == 0) {
      // lastSaved = new Date();
    }
    hasUnsaved = update.pendingEvents.length > 0;
  });
  const unsubscribe3 = projectedCashFlowStore.subscribe((update) => {
    projectedCashForecast = update;
  });

  onDestroy(() => {
    // -- end signalR close
    unsubscribe();
    unsubscribe2();
    unsubscribe3();
  });
</script>

<style type="text/scss">
  @import "../../../../styles/_variables.scss";

  .gdb-page-cf-container {
    // position: absolute;
    // top: 4rem;
    // bottom: 0;
    // left: 0;
    // right: 0;
    display: grid;
    grid-template-columns: [start] 420px [center] auto [end];
    grid-template-rows: [top] 280px [mid] auto [bottom];
    // align-items: stretch;
  }

  .gdb-page-cf-fullView {
    grid-column-start: start;
    grid-column-end: end;
    grid-row-start: top;
    grid-row-end: bottom;
  }

  // duplicate of section in ../index
  //  what are the screen constraints going to be (and how to implement constraint)
  section {
    border-radius: 4px;
    margin: $space-m 0;
    background: $color-background-white;
    box-shadow: $shadow-main;
    padding: $space-m 0;
  }

  .gdb-chart-placeholder {
    margin: $space-l;
    padding: $space-m;
    border: 1px solid $cs-grey-0;
  }

  .gdb-table-area {
    margin: $space-l;
  }

  .gdb-title-sub-description {
    color: $text-color-light;
    margin-bottom: $space-m;

    display: flex;
    & > span {
      display: inline-block;
      flex: 1 1;
      line-height: 2rem;
    }
  }

  .gdb-page-cf-miniChart {
    display: flex;
    flex-direction: column;
    width: 400px;
    height: 240px;
    padding: $space-m;
    box-sizing: border-box;
    border-radius: 4px;
    margin: $space-m 0;
    background: $color-background-white;
    box-shadow: $shadow-main;

    & > h3 {
      font-size: $font-size-normal;
      margin: $space-xs 0 $space-s 0;
      color: $text-color-light;
      font-weight: normal;
    }
  }

  .gdb-page-cf-miniChart-wrapper {
    padding-top: $space-m;
  }

  .gdb-page-cf-instructions {
    grid-column-start: center;
    grid-column-end: end;
    grid-row-start: top;
    grid-row-end: mid;
    padding: $space-l;
  }

  .gdb-page-cf-tabbedArea {
    grid-column-start: start;
    grid-column-end: end;
    grid-row-start: mid;
    grid-row-end: bottom;
  }
</style>

<ScreenTitle title="Cash Forecast">
  {#if view == "summary"}
    <IconTextButton
      icon={PredefinedIcons.Next}
      value="Edit"
      buttonStyle="primary"
      on:click={switchToEditView}
      disabled={isLoading} />
  {:else}
    <IconTextButton
      icon={PredefinedIcons.Expand}
      value="Return to Summary"
      buttonStyle="primary"
      on:click={switchToSummaryView}
      disabled={isLoading} />
  {/if}
</ScreenTitle>

<div class="gdb-page-cf-container">
  {#if view == "summary"}
    <section in:receive|local={{ key: 123 }} out:send|local={{ key: 123 }} class="gdb-page-cf-fullView">
      <div class="gdb-chart-placeholder">
        <ForecastChart width={1280} height={300} {cashForecast} {projectedCashForecast} />
      </div>

      <div class="gdb-table-area">
        <h2>Cashflow Details</h2>
        <div class="gdb-title-sub-description">
          <span> Detailed in- and out-flows of cash each month.</span>
          <IconTextButton icon={PredefinedIcons.Expand} value="Expand Details" buttonStyle="primary-outline" />
        </div>
        <ForecastTable />
      </div>
    </section>
  {:else}
    <div class="gdb-page-cf-fullView">
      <div
        in:receive|local={{ key: 123 }}
        out:send|local={{ key: 123 }}
        on:introend={completeSwitchToEditView}
        class="gdb-page-cf-miniChart">
        <h3>Cashflow Summary</h3>
        <div class="gdb-page-cf-miniChart-wrapper">
          <ForecastChart width={400} height={180} {cashForecast} {projectedCashForecast} />
        </div>
      </div>
    </div>
    {#if editViewAvailable}
      <div in:fade={{ duration: 250 }} class="gdb-page-cf-instructions">
        {#if selectedTab === TabType.AssetsAndFunding}
          <AssetInstructions />
        {:else if selectedTab === TabType.People}
          <PeopleInstructions />
        {:else if selectedTab === TabType.DirectExpenses}
          <DirectExpensesInstructions />
        {:else if selectedTab === TabType.MarketingAndSales}
          <MktgAndSalesExpensesInstructions />
        {:else if selectedTab === TabType.GeneralExpenses}
          <GeneralExpensesInstructions />
        {:else if selectedTab === TabType.Taxes}
          <TaxInstructions />
        {:else if selectedTab === TabType.TableView}
          <TableInstructions />
        {/if}
      </div>
      <div in:fade={{ duration: 250 }} class="gdb-page-cf-tabbedArea">
        {#if cashForecast != null}
          <TabbedEditor
            {isLoading}
            {cashForecast}
            projection={projectedCashForecast}
            on:selection={({ detail }) => (selectedTab = detail)} />
        {/if}
      </div>
    {/if}
  {/if}
</div>

<WebSocketChannel
  channelId={id}
  updateType="cashForecastUpdate"
  on:receive={({ detail }) => {
    log("WebSocketChannel.on:receiveUpdate", detail);
    cashForecastEventStore.receiveEvent(detail.gameId, detail.event);
  }}
  on:connect={({ detail }) =>
    log("WebSocketChannel.on:channelConnected", {
      channel: detail,
    })}
  on:disconnect={({ detail }) =>
    log("WebSocketChannel.on:channelDisconnected", {
      channel: detail,
    })} />
