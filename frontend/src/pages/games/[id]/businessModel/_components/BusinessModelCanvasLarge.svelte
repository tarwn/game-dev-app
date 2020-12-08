<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { IBusinessModel } from "../_types/businessModel";
  import { getNextSection } from "../_types/businessModelUsage";
  import BusinessModelCanvasSection from "./BusinessModelCanvasSection.svelte";
  import CustomersSectionSummary from "./sections/CustomersSectionSummary.svelte";
  import ValuePropositionSectionSummary from "./sections/ValuePropositionSectionSummary.svelte";
  import ChannelsSectionSummary from "./sections/ChannelsSectionSummary.svelte";

  export let isLoading: boolean = false;
  export let businessModel: IBusinessModel | null;
  export let isMiniMap: boolean = false;
  export let highlight: string | null = null;

  const dispatch = createEventDispatcher();

  $: editable = {
    customers:
      !isLoading && businessModel && businessModel.customers.list.length > 0,
    valueProposition:
      !isLoading &&
      businessModel &&
      (businessModel.valueProposition.genres.list.length > 0 ||
        businessModel.valueProposition.platforms.list.length > 0 ||
        businessModel.valueProposition.entries.list.length > 0),
    channels:
      !isLoading &&
      businessModel &&
      (businessModel.channels.awareness.list.length > 0 ||
        businessModel.channels.consideration.list.length > 0 ||
        businessModel.channels.purchase.list.length > 0 ||
        businessModel.channels.postPurchase.list.length > 0),
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

<style type="text/scss" global>
  @import "../../../../../styles/_variables.scss";
  @import "../../../../../styles/mixins/_loadingPulse.scss";
  @import "../../../../../styles/mixins/_scrollbar.scss";

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

  .gdb-board {
    border: 3px solid $cs-grey-4;

    &.isMiniMap {
      border-width: 1px;
      // transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

      & > .gdb-board-section {
        border-width: 1px;
      }

      & > .gdb-board-section > h3 {
        font-size: 4px;
        white-space: nowrap;
      }

      & .gdb-board-button-panel {
        display: none;
      }
    }
  }

  .gdb-board-section {
    border: 3px solid $cs-grey-4;
    position: relative;
    display: flex;
    flex-direction: column;

    & > h3 {
      padding: 0.5em;
    }
    & > .gdb-board-section-content {
      padding: 0 0.5em;
    }

    & > h3 {
      margin-top: 0.5em;
      margin-bottom: 0em;
      flex-grow: 0;
      flex-shrink: 0;

      &.isLoading {
        @include loading-pulse;
        max-width: 10rem;
        overflow: hidden;
        white-space: nowrap;
      }
    }
    &.highlight {
      background-color: $color-accent-1-lightest;
    }
  }

  .gdb-board-section-content {
    overflow-y: auto;
    overflow-x: hidden;
    @include scrollbar;

    .isMiniMap & {
      overflow-y: hidden;
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
      height: 1em;
      margin: 0.5em 1em;

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
    margin-top: $space-xl;
    justify-content: center;
  }

  .gdb-button-edit-panel {
    position: absolute;
    right: -$space-xs;
    top: -$space-xs;
    display: flex;
    flex-direction: column;
    overflow: visible;
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
    <div class="gdb-board-section-content" />
  </div>

  <div class="gdb-board-section gdb-board-keyActivities">
    <h3 class:isLoading>Key Activities</h3>
  </div>

  <div class="gdb-board-section gdb-board-keyResources">
    <h3 class:isLoading>Key Resources</h3>
    <div class="gdb-board-section-content" />
  </div>

  <BusinessModelCanvasSection
    className="gdb-board-section gdb-board-valueProposition"
    label="Value Proposition"
    {isLoading}
    highlightAsNext={highlight == 'valueProposition'}
    isEditable={editable.valueProposition}
    {isMiniMap}
    section="valueProposition"
    {nextIs}
    on:showMe={() => dispatch('sectionChange', {
        section: 'valueProposition',
      })}>
    <ValuePropositionSectionSummary {businessModel} />
  </BusinessModelCanvasSection>

  <div class="gdb-board-section gdb-board-customerRelationships">
    <h3 class:isLoading>Customer Relationships</h3>
    <div class="gdb-board-section-content" />
  </div>

  <BusinessModelCanvasSection
    className="gdb-board-section gdb-board-channels"
    label="Channels"
    {isLoading}
    highlightAsNext={highlight == 'channels'}
    isEditable={editable.channels}
    {isMiniMap}
    section="channels"
    {nextIs}
    on:showMe={() => dispatch('sectionChange', { section: 'channels' })}>
    <ChannelsSectionSummary {businessModel} />
  </BusinessModelCanvasSection>

  <BusinessModelCanvasSection
    className="gdb-board-section gdb-board-customers"
    label="Customers / Players"
    {isLoading}
    highlightAsNext={highlight == 'customers'}
    isEditable={editable.customers}
    {isMiniMap}
    section="customers"
    {nextIs}
    emptyButtonText="Start Here"
    on:showMe={() => dispatch('sectionChange', { section: 'customers' })}>
    <CustomersSectionSummary {businessModel} />
  </BusinessModelCanvasSection>

  <div class="gdb-board-section gdb-board-costStructure">
    <h3 class:isLoading>Cost Structure</h3>
    <div class="gdb-board-section-content" />
  </div>

  <div class="gdb-board-section gdb-board-revenue">
    <h3 class:isLoading>Revenue</h3>
    <div class="gdb-board-section-content" />
  </div>
</div>
