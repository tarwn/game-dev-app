<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { ICashForecast } from "../../_types/cashForecast";
  import { ExpenseCategory } from "../../_types/cashForecast";

  import AssetTab from "./AssetTab.svelte";
  import EmptyTab from "./EmptyTab.svelte";
  import ExpenseTab from "./ExpenseTab.svelte";
  import { tabs, TabType } from "./tabList";

  export let cashForecast: ICashForecast;
  export let isLoading: boolean;

  const dispatch = createEventDispatcher();

  let selectedTab = TabType.AssetsAndFunding;
  $: currentTab = tabs.find((t) => t.id === selectedTab);

  onMount(() => {
    selectTab(TabType.AssetsAndFunding);
  });

  function selectTab(id: TabType) {
    selectedTab = id;
    dispatch("selection", selectedTab);
  }

  function selectTabFromKeyPress(e: any) {
    const currentIndex = tabs.findIndex((t) => t.id === selectedTab);
    let newIndex = undefined;
    let handled = false;

    if (e.keyCode !== undefined) {
      if (e.keyCode === 37) {
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        handled = true;
      } else if (e.keyCode === 39) {
        newIndex = (currentIndex + 1) % tabs.length;
        handled = true;
      }
    } else if (e.key !== undefined) {
      if (e.key === "ArrowLeft") {
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        handled = true;
      } else if (e.key === "ArrowRight") {
        newIndex = (currentIndex + 1) % tabs.length;
        handled = true;
      }
    }

    if (handled) {
      e.preventDefault();
      selectTab(tabs[newIndex].id);
      const button = document.getElementsByClassName("gdb-tab")[newIndex] as HTMLButtonElement;
      button?.focus();
    }
  }
</script>

<style type="text/scss">
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
  }

  .gdb-input-date {
    display: inline-block;
    min-width: 6rem;
    text-align: right;
  }
</style>

<section class="gdb-tabArea">
  <ul aria-hidden="true" class="gdb-tablist-shadow">
    {#each tabs as tab (tab.id)}
      <li role="presentation" class="gdb-tab-shadow">{tab.text}</li>
    {/each}
  </ul>
  <ul role="tablist" class="gdb-tablist">
    {#each tabs as tab (tab.id)}
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
    {:else if selectedTab == TabType.DirectExpenses}
      <ExpenseTab {cashForecast} expenseCategory={ExpenseCategory.DirectExpenses} tableLabel={"Direct Expenses"} />
    {:else if selectedTab == TabType.MarketingAndSales}
      <ExpenseTab
        {cashForecast}
        expenseCategory={ExpenseCategory.MarketingAndSales}
        tableLabel={"Marketing & Sales Expenses"} />
    {:else if selectedTab == TabType.GeneralExpenses}
      <ExpenseTab
        {cashForecast}
        expenseCategory={ExpenseCategory.General}
        tableLabel={"General & Administrative Expenses"} />
    {:else}
      <EmptyTab />
    {/if}
  </div>
</section>
