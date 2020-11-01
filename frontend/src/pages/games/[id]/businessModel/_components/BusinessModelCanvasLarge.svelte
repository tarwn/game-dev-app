<script lang="ts">
  import { PredefinedIcons } from "../../../../../components/buttons/PredefinedIcons";

  import type { IBusinessModel } from "../_types/businessModel";
  import IconTextButton from "../../../../../components/buttons/IconTextButton.svelte";
  export let model: IBusinessModel;
  let highlight: string | null = null;

  $: nextIsCustomer = model.customer.customers.length == 0;

  function onMouseEnter() {
    highlight = "customer";
  }
  function onMouseLeave() {
    highlight = null;
  }
</script>

<style type="text/scss">
  @import "../../../../../styles/_variables.scss";

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
      background-color: $color-accent-1-lightest;
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

    & > h3 {
      margin-top: $space-s;
      flex-grow: 0;
      flex-shrink: 0;
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
  class:highlight
  on:mouseenter={onMouseEnter}
  on:mouseleave={onMouseLeave}>
  <div class="gdb-board-section gdb-board-keyPartners">
    <h3>Key Partners</h3>
  </div>
  <div class="gdb-board-section gdb-board-keyActivities">
    <h3>Key Activities</h3>
  </div>
  <div class="gdb-board-section gdb-board-keyResources">
    <h3>Key Resources</h3>
  </div>
  <div class="gdb-board-section gdb-board-valueProposition">
    <h3>Value Proposition</h3>
  </div>
  <div class="gdb-board-section gdb-board-customerRelationships">
    <h3>Customer Relationships</h3>
  </div>
  <div class="gdb-board-section gdb-board-channels">
    <h3>Channels</h3>
  </div>
  <div
    class="gdb-board-section gdb-board-customers"
    class:emphasize={nextIsCustomer && highlight}>
    <h3>Customer / Players</h3>
    {#if nextIsCustomer}
      <div class="gdb-board-button-panel">
        <IconTextButton value="Start Here" icon={PredefinedIcons.plus} />
      </div>
    {:else}not empty{/if}
  </div>
  <div class="gdb-board-section gdb-board-costStructure">
    <h3>Cost Structure</h3>
  </div>
  <div class="gdb-board-section gdb-board-revenue">
    <h3>Revenue</h3>
  </div>
</div>
