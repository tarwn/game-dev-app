<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { IBusinessModel } from "../_types/businessModel";
  import type { SectionStatus } from "../_types/businessModelUsage";
  import BusinessModelCanvasSection from "./BusinessModelCanvasSection.svelte";
  import CustomersSectionSummary from "./sections/CustomersSectionSummary.svelte";
  import ValuePropositionSectionSummary from "./sections/ValuePropositionSectionSummary.svelte";
  import ChannelsSectionSummary from "./sections/ChannelsSectionSummary.svelte";
  import CustomerRelationshipsSectionSummary from "./sections/CustomerRelationshipsSectionSummary.svelte";
  import KeyResourcesSectionSummary from "./sections/KeyResourcesSectionSummary.svelte";
  import RevenueSectionSummary from "./sections/RevenueSectionSummary.svelte";
  import KeyActivitiesSectionSummary from "./sections/KeyActivitiesSectionSummary.svelte";
  import KeyPartnersSectionSummary from "./sections/KeyPartnersSectionSummary.svelte";
  import CostStructureSectionSummary from "./sections/CostStructureSectionSummary.svelte";

  export let isLoading: boolean = false;
  export let businessModel: IBusinessModel | null;
  export let isMiniMap: boolean = false;
  let isHovered: boolean = false;
  export let selectedSection: string | null = null;
  export let sectionStatuses: SectionStatus;

  const dispatch = createEventDispatcher();

  function onMouseEnter() {
    isHovered = true;
  }
  function onMouseLeave() {
    isHovered = false;
  }
</script>

<style lang="scss" global>
  @import "../../../../../styles/_variables.scss";
  @import "../../../../../styles/mixins/_loadingPulse.scss";
  @import "../../../../../styles/mixins/_scrollbar.scss";

  .gdb-businessModelSection {
    border-radius: 4px;
    // margin: $space-s 0;
    background: $color-background-white;
    box-shadow: $shadow-main;
    padding: 1em;

    &.isMiniMap {
      padding: 0.25em;
      max-width: 366px;
    }
  }

  // Board
  $borderColor: $cs-grey-1;
  $borderColorLight: $cs-grey-0;
  $borderColorHighlight: $cs-blue-1;
  .gdb-board {
    border: 3px solid $borderColor;
    &.isMiniMap {
      border-width: 1px;
      margin: 0.5em auto;
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

  // Section
  .gdb-board-section {
    border: 3px solid $borderColor;
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
        margin-left: $space-s;
        max-width: 10rem;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }

  // Section Content
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

  // Highlighting + Interaction
  .gdb-board {
    &.isHover {
      border-color: $borderColorLight;
      transition: border 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    &.isHover > .gdb-board-section {
      opacity: 0.3;
      transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    &.isHover > .gdb-board-section.sectionIsStarted {
      border: 6px solid $borderColor;
      margin: -3px;
      opacity: 1;
      z-index: 9;
    }
    &.isHover > .gdb-board-section.sectionIsNext {
      //border: 6px solid $color-accent-1;
      border: 6px solid $borderColorHighlight;
      margin: -3px;
      opacity: 1;
      z-index: 10;
      background-color: $color-accent-1-lightest;
    }

    // highlight background in minimap if selected
    & > .gdb-board-section.sectionIsSelected {
      background-color: $color-accent-1-lightest;
    }
  }

  // buttons at top of panel
  .gdb-board-button-panel {
    flex-grow: 1;
    display: flex;
    align-items: center;
    margin-top: $space-xl;
    justify-content: center;
  }

  // Edit button on top of section
  .gdb-button-edit-panel {
    position: absolute;
    right: -$space-xs;
    top: -$space-xs;
    display: flex;
    flex-direction: column;
    overflow: visible;
  }
</style>

<section class="gdb-businessModelSection" class:isMiniMap>
  <div
    class="gdb-board"
    class:isHover={!isMiniMap && isHovered}
    class:isMiniMap
    class:isCurrentSelection={isMiniMap && selectedSection}
    on:mouseenter={onMouseEnter}
    on:mouseleave={onMouseLeave}>
    <BusinessModelCanvasSection
      className="gdb-board-section gdb-board-keyPartners"
      label="Key Partners"
      {isLoading}
      isNextToStart={sectionStatuses.nextNonStartedSection == "keyPartners"}
      isStarted={sectionStatuses.keyPartners}
      isSelected={selectedSection == "keyPartners"}
      {isMiniMap}
      on:showMe={() => dispatch("sectionChange", { section: "keyPartners" })}>
      <KeyPartnersSectionSummary {businessModel} />
    </BusinessModelCanvasSection>

    <BusinessModelCanvasSection
      className="gdb-board-section gdb-board-keyActivities"
      label="Key Activities"
      {isLoading}
      isNextToStart={sectionStatuses.nextNonStartedSection == "keyActivities"}
      isStarted={sectionStatuses.keyActivities}
      isSelected={selectedSection == "keyActivities"}
      {isMiniMap}
      on:showMe={() => dispatch("sectionChange", { section: "keyActivities" })}>
      <KeyActivitiesSectionSummary {businessModel} />
    </BusinessModelCanvasSection>

    <BusinessModelCanvasSection
      className="gdb-board-section gdb-board-keyResources"
      label="Key Resources"
      {isLoading}
      isNextToStart={sectionStatuses.nextNonStartedSection == "keyResources"}
      isStarted={sectionStatuses.keyResources}
      isSelected={selectedSection == "keyResources"}
      {isMiniMap}
      on:showMe={() => dispatch("sectionChange", { section: "keyResources" })}>
      <KeyResourcesSectionSummary {businessModel} />
    </BusinessModelCanvasSection>

    <BusinessModelCanvasSection
      className="gdb-board-section gdb-board-valueProposition"
      label="Unique Proposition"
      {isLoading}
      isNextToStart={sectionStatuses.nextNonStartedSection == "valueProposition"}
      isStarted={sectionStatuses.valueProposition}
      isSelected={selectedSection == "valueProposition"}
      {isMiniMap}
      on:showMe={() =>
        dispatch("sectionChange", {
          section: "valueProposition",
        })}>
      <ValuePropositionSectionSummary {businessModel} />
    </BusinessModelCanvasSection>

    <BusinessModelCanvasSection
      className="gdb-board-section gdb-board-customerRelationships"
      label="Customer Relationships"
      {isLoading}
      isNextToStart={sectionStatuses.nextNonStartedSection == "customerRelationships"}
      isStarted={sectionStatuses.customerRelationships}
      isSelected={selectedSection == "customerRelationships"}
      {isMiniMap}
      on:showMe={() =>
        dispatch("sectionChange", {
          section: "customerRelationships",
        })}>
      <CustomerRelationshipsSectionSummary {businessModel} />
    </BusinessModelCanvasSection>

    <BusinessModelCanvasSection
      className="gdb-board-section gdb-board-channels"
      label="Channels"
      {isLoading}
      isNextToStart={sectionStatuses.nextNonStartedSection == "channels"}
      isStarted={sectionStatuses.channels}
      isSelected={selectedSection == "channels"}
      {isMiniMap}
      on:showMe={() => dispatch("sectionChange", { section: "channels" })}>
      <ChannelsSectionSummary {businessModel} />
    </BusinessModelCanvasSection>

    <BusinessModelCanvasSection
      className="gdb-board-section gdb-board-customers"
      label="Audience"
      {isLoading}
      isNextToStart={sectionStatuses.nextNonStartedSection == "customers"}
      isStarted={sectionStatuses.customers}
      isSelected={selectedSection == "customers"}
      {isMiniMap}
      emptyButtonText="Start Here"
      on:showMe={() => dispatch("sectionChange", { section: "customers" })}>
      <CustomersSectionSummary {businessModel} />
    </BusinessModelCanvasSection>

    <BusinessModelCanvasSection
      className="gdb-board-section gdb-board-costStructure"
      label="Cost Structure"
      {isLoading}
      isNextToStart={sectionStatuses.nextNonStartedSection == "costStructure"}
      isStarted={sectionStatuses.costStructure}
      isSelected={selectedSection == "costStructure"}
      {isMiniMap}
      on:showMe={() => dispatch("sectionChange", { section: "costStructure" })}>
      <CostStructureSectionSummary {businessModel} />
    </BusinessModelCanvasSection>

    <BusinessModelCanvasSection
      className="gdb-board-section gdb-board-revenue"
      label="Revenue Streams"
      {isLoading}
      isNextToStart={sectionStatuses.nextNonStartedSection == "revenue"}
      isStarted={sectionStatuses.revenue}
      isSelected={selectedSection == "revenue"}
      {isMiniMap}
      on:showMe={() => dispatch("sectionChange", { section: "revenue" })}>
      <RevenueSectionSummary {businessModel} />
    </BusinessModelCanvasSection>
  </div>
</section>
