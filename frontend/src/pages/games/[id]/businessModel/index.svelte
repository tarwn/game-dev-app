<script lang="ts">
  import { onDestroy } from "svelte";
  import { scale, crossfade, fade } from "svelte/transition";
  import { metatags, params } from "@sveltech/routify";
  import type { IBusinessModel } from "./_types/businessModel";
  import SaveMessage from "../../../../components/SaveMessage.svelte";
  import IconTextButton from "../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
  import { businessModelEventStore, businessModelLocalStore } from "./_stores/businessModelStore";
  import { getConfig } from "../../../../config";
  import { log } from "../../../../utilities/logger";
  import { getNextSectionInLine, getSectionStatus } from "./_types/businessModelUsage";
  import BusinessModelCanvasLarge from "./_components/BusinessModelCanvasLarge.svelte";
  import CustomersSectionInstructions from "./_components/sections/CustomersSectionInstructions.svelte";
  import CustomersSection from "./_components/sections/CustomersSection.svelte";
  import ValuePropositionInstructions from "./_components/sections/ValuePropositionInstructions.svelte";
  import ValuePropositionSection from "./_components/sections/ValuePropositionSection.svelte";
  import ChannelsInstructions from "./_components/sections/ChannelsInstructions.svelte";
  import ChannelsSection from "./_components/sections/ChannelsSection.svelte";
  import CustomerRelationshipsInstructions from "./_components/sections/CustomerRelationshipsInstructions.svelte";
  import CustomerRelationshipsSection from "./_components/sections/CustomerRelationshipsSection.svelte";
  import KeyResourcesInstructions from "./_components/sections/KeyResourcesInstructions.svelte";
  import KeyResourcesSection from "./_components/sections/KeyResourcesSection.svelte";
  import RevenueInstructions from "./_components/sections/RevenueInstructions.svelte";
  import RevenueSection from "./_components/sections/RevenueSection.svelte";
  import KeyActivitiesInstructions from "./_components/sections/KeyActivitiesInstructions.svelte";
  import KeyActivitiesSection from "./_components/sections/KeyActivitiesSection.svelte";
  import KeyPartnersSection from "./_components/sections/KeyPartnersSection.svelte";
  import KeyPartnersInstructions from "./_components/sections/KeyPartnersInstructions.svelte";
  import CostStructureSection from "./_components/sections/CostStructureSection.svelte";
  import CostStructureInstructions from "./_components/sections/CostStructureInstructions.svelte";
  import WebSocketChannel from "../../../_communications/WebSocketChannel.svelte";
  import ScreenTitle from "../../../../components/layout/ScreenTitle.svelte";
  import { UpdateScope } from "../../../_communications/UpdateScope";
  import LinkAsButton from "../../../../components/buttons/LinkAsButton.svelte";
  import { AutomaticPopup } from "../../../_stores/profileApi";
  import type { UserProfile } from "../../../_stores/profileApi";
  import { profileStore } from "../../../_stores/profileStore";
  import ButtonWithPopup from "../../../../components/buttons/ButtonWithPopup.svelte";
  import BusinessModelWitp from "./_components/BusinessModelWITP.svelte";

  metatags.title = "[LR] Business Model";

  const { actorId } = getConfig();
  let displaySection = null;
  let displaySectionCommit = null;
  $: id = $params.id;
  let businessModel = null as IBusinessModel | null;

  // section change
  const [send, receive] = crossfade({ duration: 500, fallback: scale });

  function handleChangeSection(event: any) {
    displaySection = event.detail.section;
    if (event.detail.section == null) {
      displaySectionCommit = null;
    }
  }

  function handleSectionChangeCommit() {
    displaySectionCommit = displaySection;
  }

  function handleOnFullScreen() {
    handleChangeSection({ detail: { section: null } });
  }

  function handleOnNextScreen(section: string | null) {
    handleChangeSection({ detail: { section } });
  }

  // data management
  let isLoading = true;
  let initializedId = null;
  $: {
    if (id != null && id != initializedId) {
      initializedId = id;
      businessModelEventStore.initialize(actorId, id).then((initdId) => {
        if (initdId != id) return;
        return businessModelEventStore.loadFullState();
      });
    }
  }
  const unsubscribe = businessModelLocalStore.subscribe((update) => {
    businessModel = update;
    if (businessModel && isLoading) {
      isLoading = false;
    }
  });
  let hasUnsaved = false;
  let lastSaved = new Date();
  const unsubscribe2 = businessModelEventStore.subscribe((update) => {
    if (hasUnsaved && update.pendingEvents.length == 0) {
      lastSaved = new Date();
    }
    hasUnsaved = update.pendingEvents.length > 0;
  });
  let latestProfile: null | UserProfile = null;
  var unsubscribe3 = profileStore.subscribe((p) => {
    if (p != null) latestProfile = p;
  });

  onDestroy(() => {
    // -- end signalR close
    unsubscribe();
    unsubscribe2();
    unsubscribe3();
  });

  // overall state for screen
  // Overall: is it loading, is it minimap, are we mouse-overed
  // Sections: is it started, is it next non-started, is it currently selected

  // isLoading;
  // hardcoded below  $: isMiniMap = displaySection != null;
  $: sectionStatus = getSectionStatus(businessModel);
  // current section is in displaySection
</script>

<style lang="scss">
  @import "../../../../styles/_variables.scss";

  .gdb-page-bm-container {
    position: absolute;
    top: 4rem;
    bottom: 0;
    left: 0;
    right: 0;
    display: grid;
    grid-template-columns: [start] 420px [center] auto [end];
    grid-template-rows: [top] 280px [mid] auto [bottom];
    // align-items: stretch;
  }

  // overall screen layout
  .gdb-bm-fullSize {
    grid-column-start: start;
    grid-column-end: end;
    grid-row-start: top;
    grid-row-end: bottom;
  }
  .gdb-bm-minimap {
    grid-column-start: start;
    grid-column-end: center;
    grid-row-start: top;
    grid-row-end: mid;
  }
  .gdb-bm-panel-instructions {
    grid-column-start: start;
    grid-column-end: center;
    grid-row-start: mid;
    grid-row-end: bottom;
  }

  .gdb-bm-panel-input {
    grid-column-start: center;
    grid-column-end: end;
    grid-row-start: top;
    grid-row-end: bottom;
    padding: 0 0 0 $space-l;
  }
</style>

<WebSocketChannel
  scope={UpdateScope.GameBusinessModel}
  gameId={id}
  on:receive={({ detail }) => {
    log("WebSocketChannel.on:receiveUpdate", detail);
    businessModelEventStore.receiveEvent(detail.gameId, detail.event);
  }} />

<ScreenTitle title="Business Model">
  <SaveMessage {hasUnsaved} {lastSaved} />
  <LinkAsButton value="Exit" buttonStyle="primary-outline" href={`/games/${id}`} disabled={isLoading} />
  <IconTextButton
    icon={PredefinedIcons.Expand}
    value="Full View"
    buttonStyle="primary-outline"
    on:click={handleOnFullScreen}
    disabled={isLoading || displaySectionCommit == null} />
  {#if displaySection == null}
    <IconTextButton
      icon={PredefinedIcons.NextRound}
      value="Start"
      buttonStyle="primary"
      on:click={() => handleChangeSection({ detail: { section: "customers" } })}
      disabled={isLoading} />
  {:else}
    <IconTextButton
      icon={PredefinedIcons.NextRound}
      value="Next"
      buttonStyle="primary"
      on:click={() =>
        handleChangeSection({
          detail: { section: getNextSectionInLine(displaySection) },
        })}
      disabled={isLoading || businessModel.customers.list.length == 0} />
  {/if}
  {#if latestProfile}
    <ButtonWithPopup
      buttonStyle="primary-outline-circle"
      label="?"
      buttonTitle="Help: How to use this screen"
      ariaLabel="Help: How to use this screen"
      forceOpen={(latestProfile.hasSeenPopup & AutomaticPopup.BusinessModel) !== AutomaticPopup.BusinessModel}
      on:close={() => profileStore.markPopupSeen(AutomaticPopup.BusinessModel)}>
      <BusinessModelWitp />
    </ButtonWithPopup>
  {/if}
</ScreenTitle>
<div class="gdb-page-bm-container">
  {#if displaySection == null}
    <div
      in:receive|local={{ key: 123 }}
      out:send|local={{ key: 123 }}
      class="gdb-bm-fullSize"
      class:transitioning={displaySection != null}>
      {#each [businessModel] as b}
        <BusinessModelCanvasLarge
          {isLoading}
          businessModel={b}
          isMiniMap={false}
          selectedSection={null}
          sectionStatuses={sectionStatus}
          on:sectionChange={handleChangeSection} />
      {/each}
    </div>
  {:else}
    <div
      in:receive|local={{ key: 123 }}
      out:send|local={{ key: 123 }}
      on:introend={handleSectionChangeCommit}
      class="gdb-bm-minimap"
      class:transitioning={displaySection == null}>
      {#each [businessModel] as b}
        <BusinessModelCanvasLarge
          businessModel={b}
          isMiniMap={true}
          selectedSection={displaySection}
          sectionStatuses={sectionStatus}
          on:sectionChange={handleChangeSection} />
      {/each}
    </div>
  {/if}
  {#if !isLoading && displaySectionCommit}
    {#if displaySection === "customers"}
      <div class="gdb-bm-panel-instructions" in:fade={{ duration: 250 }}>
        <CustomersSectionInstructions />
      </div>
      <div class="gdb-bm-panel-input" in:fade={{ duration: 250 }}>
        <CustomersSection
          {businessModel}
          on:clickFullscreen={handleOnFullScreen}
          on:clickNext={() => handleOnNextScreen("valueProposition")} />
      </div>
    {:else if displaySection === "valueProposition"}
      <div class="gdb-bm-panel-instructions" in:fade={{ duration: 250 }}>
        <ValuePropositionInstructions />
      </div>
      <div class="gdb-bm-panel-input" in:fade={{ duration: 250 }}>
        <ValuePropositionSection
          {businessModel}
          on:clickFullscreen={handleOnFullScreen}
          on:clickNext={() => handleOnNextScreen("channels")} />
      </div>
    {:else if displaySection === "channels"}
      <div class="gdb-bm-panel-instructions" in:fade={{ duration: 250 }}>
        <ChannelsInstructions />
      </div>
      <div class="gdb-bm-panel-input" in:fade={{ duration: 250 }}>
        <ChannelsSection
          {businessModel}
          on:clickFullscreen={handleOnFullScreen}
          on:clickNext={() => handleOnNextScreen("customerRelationships")} />
      </div>
    {:else if displaySection === "customerRelationships"}
      <div class="gdb-bm-panel-instructions" in:fade={{ duration: 250 }}>
        <CustomerRelationshipsInstructions />
      </div>
      <div class="gdb-bm-panel-input" in:fade={{ duration: 250 }}>
        <CustomerRelationshipsSection
          {businessModel}
          on:clickFullscreen={handleOnFullScreen}
          on:clickNext={() => handleOnNextScreen("revenue")} />
      </div>
    {:else if displaySection === "revenue"}
      <div class="gdb-bm-panel-instructions" in:fade={{ duration: 250 }}>
        <RevenueInstructions />
      </div>
      <div class="gdb-bm-panel-input" in:fade={{ duration: 250 }}>
        <RevenueSection
          {businessModel}
          on:clickFullscreen={handleOnFullScreen}
          on:clickNext={() => handleOnNextScreen("keyResources")} />
      </div>
    {:else if displaySection === "keyResources"}
      <div class="gdb-bm-panel-instructions" in:fade={{ duration: 250 }}>
        <KeyResourcesInstructions />
      </div>
      <div class="gdb-bm-panel-input" in:fade={{ duration: 250 }}>
        <KeyResourcesSection
          {businessModel}
          on:clickFullscreen={handleOnFullScreen}
          on:clickNext={() => handleOnNextScreen("keyActivities")} />
      </div>
    {:else if displaySection === "keyActivities"}
      <div class="gdb-bm-panel-instructions" in:fade={{ duration: 250 }}>
        <KeyActivitiesInstructions />
      </div>
      <div class="gdb-bm-panel-input" in:fade={{ duration: 250 }}>
        <KeyActivitiesSection
          {businessModel}
          on:clickFullscreen={handleOnFullScreen}
          on:clickNext={() => handleOnNextScreen("keyPartners")} />
      </div>
    {:else if displaySection === "keyPartners"}
      <div class="gdb-bm-panel-instructions" in:fade={{ duration: 250 }}>
        <KeyPartnersInstructions />
      </div>
      <div class="gdb-bm-panel-input" in:fade={{ duration: 250 }}>
        <KeyPartnersSection
          {businessModel}
          on:clickFullscreen={handleOnFullScreen}
          on:clickNext={() => handleOnNextScreen("costStructure")} />
      </div>
    {:else if displaySection === "costStructure"}
      <div class="gdb-bm-panel-instructions" in:fade={{ duration: 250 }}>
        <CostStructureInstructions />
      </div>
      <div class="gdb-bm-panel-input" in:fade={{ duration: 250 }}>
        <CostStructureSection
          {businessModel}
          on:clickFullscreen={handleOnFullScreen}
          on:clickNext={() => handleOnNextScreen(null)} />
      </div>
    {/if}
  {/if}
</div>
