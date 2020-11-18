<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { PredefinedIcons } from "../../../../../components/buttons/PredefinedIcons";
  import type { IBusinessModel } from "../_types/businessModel";
  import IconTextButton from "../../../../../components/buttons/IconTextButton.svelte";

  export let isLoading: boolean = false;
  export let model: IBusinessModel | null;
  export let isMiniMap: boolean = false;
  export let highlight: string | null = null;

  $: nextIsCustomer = !isLoading && model && model.customers.length == 0;
  const dispatch = createEventDispatcher();

  function onMouseEnter() {
    highlight = isLoading ? null : "customer";
  }
  function onMouseLeave() {
    highlight = null;
  }
</script>

<style type="text/scss">
  @import "../../../../../styles/_variables.scss";
  @import "../../../../../styles/mixins/_loadingPulse.scss";

  .gdb-board {
    display: grid;
    grid-template-columns: [e0] 20% [e1] 20% [e2] 10% [e2-5] 10% [e3] 20% [e4] 20% [e5];
    grid-template-rows: [r0] 40% [r1] 40% [r2] 20% [r3];
    align-items: stretch;
    min-width: 1024px;
    min-height: 768px;
    max-width: 1280;
    max-height: 1024px;
    border: 3px solid $cs-grey-4;

    &.isMiniMap {
      min-width: 360px;
      min-height: 240px;
      max-width: 360px;
      max-height: 240px;
      font-size: 4px;
      border-width: 1px;
      // transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

      & > .gdb-board-section {
        padding: 4px;
        border-width: 1px;
      }

      & > .gdb-board-section > h3 {
        margin-top: 4px;
        font-size: 4px;
        white-space: nowrap;
      }

      & .gdb-board-button-panel {
        display: none;
      }
    }

    &.highlight {
      border-color: $cs-grey-2;
      transition: border 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    &.highlight > .gdb-board-section {
      opacity: 0.5;
      transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    &.highlight > .gdb-board-section.emphasize {
      border: 6px solid $color-accent-1;
      margin: -3px;
      opacity: 1;
      z-index: 10;
    }
  }

  .gdb-board-keyPartners {
    grid-column-start: e0;
    grid-column-end: e1;
    grid-row-start: r0;
    grid-row-end: r2;
  }

  .gdb-board-keyActivities {
    grid-column-start: e1;
    grid-column-end: e2;
    grid-row-start: r0;
    grid-row-end: r1;
  }

  .gdb-board-keyResources {
    grid-column-start: e1;
    grid-column-end: e2;
    grid-row-start: r1;
    grid-row-end: r2;
  }

  .gdb-board-valueProposition {
    grid-column-start: e2;
    grid-column-end: e3;
    grid-row-start: r0;
    grid-row-end: r2;
  }

  .gdb-board-customerRelationships {
    grid-column-start: e3;
    grid-column-end: e4;
    grid-row-start: r0;
    grid-row-end: r1;
  }

  .gdb-board-channels {
    grid-column-start: e3;
    grid-column-end: e4;
    grid-row-start: r1;
    grid-row-end: r2;
  }

  .gdb-board-customers {
    grid-column-start: e4;
    grid-column-end: e5;
    grid-row-start: r0;
    grid-row-end: r2;
  }

  .gdb-board-costStructure {
    grid-column-start: e0;
    grid-column-end: e2-5;
    grid-row-start: r2;
    grid-row-end: r3;
  }

  .gdb-board-revenue {
    grid-column-start: e2-5;
    grid-column-end: e5;
    grid-row-start: r2;
    grid-row-end: r3;
  }

  .gdb-board-section {
    border: 3px solid $cs-grey-4;
    padding: $space-s;
    display: flex;
    flex-direction: column;

    &.highlight {
      background-color: $color-accent-1-lightest;
    }

    & > h3 {
      margin-top: $space-s;
      flex-grow: 0;
      flex-shrink: 0;

      &.isLoading {
        @include loading-pulse;
        max-width: 10rem;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }

  .gdb-loading-block {
    list-style-type: none;
    padding: 0;
    margin: 0;

    & > li {
      @include loading-pulse;
      display: inline-block;
      width: 70%;
      height: $space-m;
      margin: $space-s $space-m;

      & + li {
        width: 80%;
      }

      & + li + li {
        width: 50%;
      }
    }
  }

  .gdb-board-button-panel {
    flex-grow: 1;
    display: flex;
    align-items: center;
    margin-bottom: $space-xl;
    justify-content: center;
  }
</style>

<div
  class="gdb-board"
  class:highlight={highlight != null && !isMiniMap}
  class:isMiniMap
  on:mouseenter={onMouseEnter}
  on:mouseleave={onMouseLeave}>
  <div class="gdb-board-section gdb-board-keyPartners">
    <h3 class:isLoading>Key Partners</h3>
  </div>
  <div class="gdb-board-section gdb-board-keyActivities">
    <h3 class:isLoading>Key Activities</h3>
  </div>
  <div class="gdb-board-section gdb-board-keyResources">
    <h3 class:isLoading>Key Resources</h3>
  </div>
  <div class="gdb-board-section gdb-board-valueProposition">
    <h3 class:isLoading>Value Proposition</h3>
  </div>
  <div class="gdb-board-section gdb-board-customerRelationships">
    <h3 class:isLoading>Customer Relationships</h3>
  </div>
  <div class="gdb-board-section gdb-board-channels">
    <h3 class:isLoading>Channels</h3>
  </div>
  <div
    class="gdb-board-section gdb-board-customers"
    class:emphasize={nextIsCustomer && highlight}
    class:highlight>
    <h3 class:isLoading>Customer / Players</h3>
    {#if isLoading}
      <ul class="gdb-loading-block">
        <li />
        <li />
        <li />
      </ul>
    {:else if nextIsCustomer}
      <div class="gdb-board-button-panel">
        <IconTextButton
          value="Start Here"
          icon={PredefinedIcons.Plus}
          on:click={() => dispatch('sectionChange', { section: 'customer' })} />
      </div>
    {:else}not empty{/if}
  </div>
  <div class="gdb-board-section gdb-board-costStructure">
    <h3 class:isLoading>Cost Structure</h3>
  </div>
  <div class="gdb-board-section gdb-board-revenue">
    <h3 class:isLoading>Revenue</h3>
  </div>
</div>
