<script lang="ts">
  import { metatags, params } from "@sveltech/routify";
  import { scale, crossfade, fade } from "svelte/transition";
  import { onDestroy } from "svelte";
  import IconTextButton from "../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
  import ScreenTitle from "../../../../components/layout/ScreenTitle.svelte";
  import { getConfig } from "../../../../config";
  import { log } from "../../../../utilities/logger";
  import WebSocketChannel from "../../../_communications/WebSocketChannel.svelte";
  import { cashForecastEventStore, cashForecastLocalStore } from "./_stores/cashForecastStore";
  import { projectedCashFlowStore } from "./_stores/projectedCashForecasetStore";
  import type { IProjectedCashFlowData } from "./_stores/calculator/types";
  import type { ICashForecast } from "./_types/cashForecast";
  import TabbedEditor from "./_components/editing/TabbedEditor.svelte";
  import { tabs, TabType } from "./_components/editing/tabList";
  import AssetInstructions from "./_components/editing/assetTab/AssetInstructions.svelte";
  import DirectExpensesInstructions from "./_components/editing/expenseTab/DirectExpensesInstructions.svelte";
  import MktgAndSalesExpensesInstructions from "./_components/editing/expenseTab/MktgAndSalesExpensesInstructions.svelte";
  import GeneralExpensesInstructions from "./_components/editing/expenseTab/GeneralExpensesInstructions.svelte";
  import PeopleInstructions from "./_components/editing/peopleTab/PeopleInstructions.svelte";
  import TaxInstructions from "./_components/editing/taxesTab/TaxInstructions.svelte";
  import TableInstructions from "./_components/editing/tableTab/tableInstructions.svelte";
  import ForecastChart from "./_components/ForecastChart.svelte";
  import ForecastTable from "./_components/shared/ForecastTable.svelte";
  import { getUtcDate } from "../../../../utilities/date";
  import GeneralInstructions from "./_components/editing/general/GeneralInstructions.svelte";
  import SaveMessage from "../../../../components/SaveMessage.svelte";
  import { UpdateScope } from "../../../_communications/UpdateScope";
  import EstUnitSalesInstructions from "./_components/editing/estUnitSalesTab/EstUnitSalesInstructions.svelte";
  import LinkAsButton from "../../../../components/buttons/LinkAsButton.svelte";
  import { profileStore } from "../../../_stores/profileStore";
  import { AutomaticPopup } from "../../../_stores/profileApi";
  import type { UserProfile } from "../../../_stores/profileApi";
  import ButtonWithPopup from "../../../../components/buttons/ButtonWithPopup.svelte";
  import CashForecastWitp from "./_components/CashForecastWITP.svelte";

  // page title
  metatags.title = "[LR] Cash Forecast";

  // params
  const { actorId } = getConfig();
  $: id = $params.id;
  let view: "edit" | "summary" = "summary";
  let selectedTab: TabType | undefined = undefined;
  let editViewAvailable = false;
  let isLoading = true;
  let cashForecast = null as null | ICashForecast;
  let projectedCashForecast = null as null | IProjectedCashFlowData;

  // initialize section view if query present
  if ($params.view === "edit") {
    view = "edit";
    editViewAvailable = true;
  }
  if ($params.tab != null) {
    selectedTab = tabs.find((t) => t.url == $params.tab)?.id;
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
  function updateSelectedTab(tab: TabType) {
    if (tab != null) {
      const urlName = tabs.find((t) => t.id == tab)?.url;
      history.replaceState({}, "", `/games/${id}/cashForecast?view=edit&tab=${urlName}`);
      selectedTab = tab;
    }
  }

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
    if (cashForecast == null && update != null) {
      log("Cash Forecast Screen: Cash forecast loaded", {});
    }
    cashForecast = update;
    projectedCashFlowStore.updateForecast(update);
    if (cashForecast && isLoading) {
      isLoading = false;
      if (cashForecast == null && update != null) {
        log("Cash Forecast Screen: screen loaded", {});
      }
    }
  });
  let hasUnsaved = false;
  let lastSaved = new Date();
  const unsubscribe2 = cashForecastEventStore.subscribe((update) => {
    if (hasUnsaved && update.pendingEvents.length == 0) {
      lastSaved = new Date();
    }
    hasUnsaved = update.pendingEvents.length > 0;
  });
  const unsubscribe3 = projectedCashFlowStore.subscribe((update) => {
    projectedCashForecast = update;
  });
  let latestProfile: null | UserProfile = null;
  var unsubscribe4 = profileStore.subscribe((p) => {
    if (p != null) latestProfile = p;
  });

  onDestroy(() => {
    // -- end signalR close
    unsubscribe();
    unsubscribe2();
    unsubscribe3();
    unsubscribe4();
  });

  // misc
  function displayStartDate() {
    if (!cashForecast || !projectedCashForecast) return "";
    const forecastDate = cashForecast.forecastStartDate.value;
    return forecastDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      timeZone: "UTC",
    });
  }
  function displayProjectionEndDate() {
    if (!cashForecast || !projectedCashForecast) return "";

    const forecastDate = cashForecast.forecastStartDate.value;
    const endDate = getUtcDate(
      forecastDate.getUTCFullYear(),
      forecastDate.getUTCMonth() + cashForecast.forecastMonthCount.value,
      1
    );
    return endDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      timeZone: "UTC",
    });
  }
</script>

<style lang="scss">
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
    max-width: 1280px;
  }

  .gdb-table-area {
    margin: $space-l;
    max-width: 1280px;
  }

  .gbd-table-wrapper {
    box-shadow: inset -7px 0 9px -7px $cs-grey-0;
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
  <SaveMessage {hasUnsaved} {lastSaved} />
  <!-- <IconTextButton
    icon={PredefinedIcons.ConstructionAlert}
    value="'What If' Comparison"
    buttonStyle="primary-outline"
    on:click={switchToEditView}
    disabled={true} /> -->
  <IconTextButton
    icon={PredefinedIcons.Download}
    value="Export"
    buttonStyle="primary-outline"
    on:click={switchToEditView}
    disabled={true} />
  <LinkAsButton value="Exit" buttonStyle="primary-outline" href={`/games/${id}`} disabled={isLoading} />
  {#if view == "summary"}
    <IconTextButton
      icon={PredefinedIcons.NextRound}
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
  {#if latestProfile}
    <ButtonWithPopup
      buttonStyle="primary-outline-circle"
      label="?"
      buttonTitle="Help: How to use this screen"
      ariaLabel="Help: How to use this screen"
      forceOpen={(latestProfile.hasSeenPopup & AutomaticPopup.CashForecast) !== AutomaticPopup.CashForecast}
      on:close={() => profileStore.markPopupSeen(AutomaticPopup.CashForecast)}>
      <CashForecastWitp />
    </ButtonWithPopup>
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
          {#if cashForecast}
            <span>Projected cashflow, from {displayStartDate()} through {displayProjectionEndDate()}.</span>
          {/if}
          <!-- <IconTextButton icon={PredefinedIcons.Expand} value="Expand Details" buttonStyle="primary-outline" /> -->
        </div>
        <div class="gbd-table-wrapper">
          <ForecastTable {cashForecast} projection={projectedCashForecast} />
        </div>
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
    {#if editViewAvailable && cashForecast != null}
      <div in:fade={{ duration: 250 }} class="gdb-page-cf-instructions">
        {#if selectedTab === TabType.General}
          <GeneralInstructions stage={cashForecast.stage.value} />
        {:else if selectedTab === TabType.AssetsAndFunding}
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
        {:else if selectedTab === TabType.EstUnitSales}
          <EstUnitSalesInstructions stage={cashForecast.stage.value} />
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
            {selectedTab}
            on:selection={({ detail }) => updateSelectedTab(detail)} />
        {/if}
      </div>
    {/if}
  {/if}
</div>

<WebSocketChannel
  scope={UpdateScope.GameCashforecast}
  gameId={id}
  on:receive={({ detail }) => {
    log("WebSocketChannel.on:receiveUpdate", detail);
    cashForecastEventStore.receiveEvent(detail.gameId, detail.event);
  }} />
