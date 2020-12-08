<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { PredefinedIcons } from "../../../../../components/buttons/PredefinedIcons";
  import type { IBusinessModel } from "../_types/businessModel";
  import IconTextButton from "../../../../../components/buttons/IconTextButton.svelte";
  import IconButton from "../../../../../components/buttons/IconButton.svelte";
  import CustomersSectionSummary from "./sections/CustomersSectionSummary.svelte";
  import ValuePropositionSectionSummary from "./sections/ValuePropositionSectionSummary.svelte";
  import { getNextSection } from "../_types/businessModelUsage";

  export let isLoading: boolean = false;
  export let businessModel: IBusinessModel | null;
  export let isMiniMap: boolean = false;
  export let highlight: string | null = null;

  const dispatch = createEventDispatcher();

  $: editable = {
    valueProposition:
      !isLoading &&
      businessModel &&
      (businessModel.valueProposition.genres.list.length > 0 ||
        businessModel.valueProposition.platforms.list.length > 0 ||
        businessModel.valueProposition.entries.list.length > 0),
    customers:
      !isLoading && businessModel && businessModel.customers.list.length > 0,
    channels: false,
    customerRelationships: false,
    revenue: false,
    keyResources: false,
    keyActivities: false,
    keyPartners: false,
    costStructure: false,
  };

  let nextIs = null;
  $: {
    if (isLoading || !businessModel) {
      nextIs = null;
    } else {
      nextIs = getNextSection(businessModel);
    }
  }

  function onMouseEnter() {
    highlight = isLoading ? null : nextIs;
  }
  function onMouseLeave() {
    highlight = null;
  }
</script>

<style type="text/scss">
  @import "../../../../../styles/_variables.scss";
  @import "../../../../../styles/mixins/_loadingPulse.scss";

  .gdb-board {
    &.highlight {
      border-color: $cs-grey-2;
      transition: border 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    &.highlight > .gdb-board-section {
      opacity: 0.5;
      transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    &.highlight > .gdb-board-section.doNotDemphasize {
      border: 6px solid $cs-grey-4;
      margin: -3px;
      opacity: 1;
      z-index: 9;
    }
    &.highlight > .gdb-board-section.emphasize {
      border: 6px solid $color-accent-1;
      margin: -3px;
      opacity: 1;
      z-index: 10;
    }
  }

  .gdb-board-section {
    &.highlight {
      background-color: $color-accent-1-lightest;
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

  .gdb-button-edit-panel {
    position: absolute;
    right: 0px;
    top: 0px;
    display: flex;
    flex-direction: column;
    padding: 3px $space-s;
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
  <div
    class="gdb-board-section gdb-board-valueProposition"
    class:emphasize={nextIs === 'valueProposition' && highlight}
    class:doNotDemphasize={editable.valueProposition && highlight}
    class:highlight={highlight && (editable.valueProposition || nextIs === 'valueProposition')}>
    {#if !isMiniMap && editable.valueProposition}
      <div class="gdb-button-edit-panel">
        <IconButton
          icon={PredefinedIcons.Edit}
          buttonStyle="bm-edit-charm"
          on:click={() => dispatch('sectionChange', {
              section: 'valueProposition',
            })} />
      </div>
    {/if}
    <h3 class:isLoading>Value Proposition</h3>
    {#if isLoading}
      <ul class="gdb-loading-block">
        <li />
        <li />
        <li />
      </ul>
    {:else if !isMiniMap && nextIs === 'valueProposition'}
      <div class="gdb-board-button-panel">
        <IconTextButton
          value="Continue Here"
          icon={PredefinedIcons.Plus}
          on:click={() => dispatch('sectionChange', {
              section: 'valueProposition',
            })} />
      </div>
    {:else}
      <ValuePropositionSectionSummary {businessModel} />
    {/if}
  </div>
  <div class="gdb-board-section gdb-board-customerRelationships">
    <h3 class:isLoading>Customer Relationships</h3>
  </div>
  <div class="gdb-board-section gdb-board-channels">
    <h3 class:isLoading>Channels</h3>
  </div>
  <div
    class="gdb-board-section gdb-board-customers"
    class:emphasize={nextIs === 'customer' && highlight}
    class:doNotDemphasize={editable.customers && highlight}
    class:highlight={highlight && (editable.customers || nextIs === 'customer')}>
    {#if !isMiniMap && editable.customers}
      <div class="gdb-button-edit-panel">
        <IconButton
          icon={PredefinedIcons.Edit}
          buttonStyle="bm-edit-charm"
          on:click={() => dispatch('sectionChange', { section: 'customer' })} />
      </div>
    {/if}
    <h3 class:isLoading>Customer / Players</h3>

    {#if isLoading}
      <ul class="gdb-loading-block">
        <li />
        <li />
        <li />
      </ul>
    {:else if !isMiniMap && nextIs === 'customer'}
      <div class="gdb-board-button-panel">
        <IconTextButton
          value="Start Here"
          icon={PredefinedIcons.Plus}
          on:click={() => dispatch('sectionChange', { section: 'customer' })} />
      </div>
    {:else}
      <CustomersSectionSummary {businessModel} />
    {/if}
  </div>
  <div class="gdb-board-section gdb-board-costStructure">
    <h3 class:isLoading>Cost Structure</h3>
  </div>
  <div class="gdb-board-section gdb-board-revenue">
    <h3 class:isLoading>Revenue</h3>
  </div>
</div>
