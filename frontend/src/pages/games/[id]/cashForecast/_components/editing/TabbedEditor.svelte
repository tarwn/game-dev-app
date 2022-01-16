<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { log } from "../../../../../../utilities/logger";
  import type { IProjectedCashFlowData } from "../../_stores/calculator/types";
  import type { ICashForecast } from "../../_types/cashForecast";
  import { ExpenseCategory } from "../../_types/cashForecast";
  import AlternativesTab from "./AlternativesTab.svelte";

  import AssetTab from "./AssetTab.svelte";
  import EmptyTab from "./EmptyTab.svelte";
  import EstUnitSalesTab from "./EstUnitSalesTab.svelte";
  import ExpenseTab from "./ExpenseTab.svelte";
  import GeneralTab from "./GeneralTab.svelte";
  import PeopleTab from "./PeopleTab.svelte";
  import TableTab from "./TableTab.svelte";
  import { tabs, TabType } from "./tabList";
  import TaxesTab from "./TaxesTab.svelte";

  export let cashForecast: ICashForecast;
  export let projection: IProjectedCashFlowData;
  export let isLoading: boolean;
  export let selectedTab: TabType = TabType.General;

  const dispatch = createEventDispatcher();

  $: currentTab = tabs.find((t) => t.id === selectedTab);
  $: availableTabs = tabs.filter((t) => t.isVisible(cashForecast.stage.value));

  onMount(() => {
    // if the selected tab is not visible for this forecast stage, default to general
    // if it's not set, default to general
    if (selectedTab == null || !availableTabs.find((t) => t.id == selectedTab)) {
      selectedTab = TabType.GeneralExpenses;
    }

    log("Tabbed Editor: mounting", { selectedTab });
    selectTab(selectedTab);
  });

  function selectTab(id: TabType) {
    selectedTab = id;
    dispatch("selection", selectedTab);
  }

  function selectTabFromKeyPress(e: any) {
    const currentIndex = availableTabs.findIndex((t) => t.id === selectedTab);
    let newIndex = undefined;
    let handled = false;

    if (e.keyCode !== undefined) {
      if (e.keyCode === 37) {
        newIndex = (currentIndex - 1 + availableTabs.length) % availableTabs.length;
        handled = true;
      } else if (e.keyCode === 39) {
        newIndex = (currentIndex + 1) % availableTabs.length;
        handled = true;
      }
    } else if (e.key !== undefined) {
      if (e.key === "ArrowLeft") {
        newIndex = (currentIndex - 1 + availableTabs.length) % availableTabs.length;
        handled = true;
      } else if (e.key === "ArrowRight") {
        newIndex = (currentIndex + 1) % availableTabs.length;
        handled = true;
      }
    }

    if (handled) {
      e.preventDefault();
      selectTab(availableTabs[newIndex].id);
      const button = document.getElementsByClassName("gdb-tab")[newIndex] as HTMLButtonElement;
      button?.focus();
    }
  }
</script>

<style lang="scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-tabArea {
    margin: $space-m 0;
  }

  .gdb-tablist,
  .gdb-tablist-shadow {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    padding: 0;
    margin: 0;
    z-index: 3; // above shadow tabs + panel
  }

  .gdb-tablist-shadow {
    position: absolute;
    z-index: 1; // below panel + real tabs
    // margin-top: -32px; // debug purposes
  }

  .gdb-tab-container,
  .gdb-tab-shadow {
    display: inline-block;
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 0 0;
    white-space: nowrap;
  }

  .gdb-tab-shadow {
    // matches tab below to sit under it
    padding: $space-s $space-m;
    margin-right: $space-xs;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    box-shadow: $shadow-main;
    color: transparent;
  }

  .gdb-tab {
    padding: $space-s $space-m;
    border: 0;
    margin-right: $space-xs;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    cursor: pointer;
    box-shadow: $shadow-main-inset-bottom;
    &.selectedTab,
    &.selectedTab:hover,
    &.selectedTab:active {
      background: $color-background-white;
      cursor: default;
      box-shadow: none;
    }

    &:active,
    &:hover {
      background-color: $cs-blue-0;
    }

    background-color: $cs-blue-1;
  }

  .gdb-tabpanel {
    position: relative;
    border-radius: 4px;
    border-top-left-radius: 0;
    background: $color-background-white;
    box-shadow: $shadow-main;
    padding: $space-m $space-l;
    z-index: 2; // above shadow tabs, below actual tabs

    // super hacky constraint for the CF table width
    max-width: calc(100vw - 28.1rem);
  }

  .gdb-input-date {
    display: inline-block;
    min-width: 6rem;
    text-align: right;
  }
</style>

<section class="gdb-tabArea">
  <ul aria-hidden="true" class="gdb-tablist-shadow">
    {#each availableTabs as tab (tab.id)}
      <li role="presentation" class="gdb-tab-shadow">{tab.text}</li>
    {/each}
  </ul>
  <ul role="tablist" class="gdb-tablist">
    {#each availableTabs as tab (tab.id)}
      <li role="presentation" class="gdb-tab-container">
        <button
          role="tab"
          class={`gdb-tab gdb-tab-group-${tab.group}`}
          class:selectedTab={selectedTab === tab.id}
          aria-selected={selectedTab === tab.id}
          tabindex={selectedTab === tab.id ? 0 : -1}
          on:click={() => selectTab(tab.id)}
          on:keydown={(e) => selectTabFromKeyPress(e)}>{tab.text}</button>
      </li>
    {/each}
  </ul>
  <div role="tabpanel" class="gdb-tabpanel">
    <h3 tabindex={0}>{currentTab.text}</h3>
    {#if isLoading}
      Loading...
    {:else if selectedTab == TabType.AssetsAndFunding}
      <AssetTab {cashForecast} />
    {:else if selectedTab == TabType.General}
      <GeneralTab {cashForecast} />
    {:else if selectedTab == TabType.People}
      <PeopleTab {cashForecast} />
    {:else if selectedTab == TabType.DirectExpenses}
      <ExpenseTab {cashForecast} expenseCategory={ExpenseCategory.DirectExpenses} />
    {:else if selectedTab == TabType.MarketingAndSales}
      <ExpenseTab {cashForecast} expenseCategory={ExpenseCategory.MarketingAndSales} />
    {:else if selectedTab == TabType.GeneralExpenses}
      <ExpenseTab {cashForecast} expenseCategory={ExpenseCategory.General} />
    {:else if selectedTab == TabType.Taxes}
      <TaxesTab {cashForecast} />
    {:else if selectedTab == TabType.EstUnitSales}
      <EstUnitSalesTab {cashForecast} />
    {:else if selectedTab == TabType.Alternates}
      <AlternativesTab {cashForecast} />
    {:else if selectedTab == TabType.TableView}
      <TableTab {cashForecast} {projection} />
    {:else}
      <EmptyTab {cashForecast} />
    {/if}
  </div>
</section>
