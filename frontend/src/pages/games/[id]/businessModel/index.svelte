<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { scale, crossfade, fade } from "svelte/transition";
  import { params } from "@sveltech/routify";
  import type { IBusinessModel } from "./_types/businessModel";
  // import { businessModelStore } from "./_stores/businessModelStore";
  import SaveMessage from "../../../../components/SaveMessage.svelte";
  import IconTextButton from "../../../../components/buttons/IconTextButton.svelte";
  import SpacedButtons from "../../../../components/buttons/SpacedButtons.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
  import BusinessModelCanvasLarge from "./_components/BusinessModelCanvasLarge.svelte";
  import InputPanel from "./_components/InputPanel.svelte";
  import CustomersSectionInstructions from "./_components/sections/CustomersSectionInstructions.svelte";
  import CustomersSection from "./_components/sections/CustomersSection.svelte";
  import {
    businessModelEventStore,
    businessModelLocalStore,
  } from "./_stores/newBusinessModelStore";
  import { getConfig } from "../../../../config";

  const { actorId } = getConfig();
  let displaySection = null;
  let displaySectionCommit = null;
  $: id = $params.id;
  let businessModel = null as IBusinessModel | null;

  // section change
  const [send, receive] = crossfade({ duration: 500, fallback: scale });

  function handleChangeSection(event) {
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
    if (isLoading) {
      isLoading = false;
    }
  });

  onDestroy(unsubscribe);
</script>

<style type="text/scss">
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

  .gdb-page-bm-header {
    display: flex;
    align-items: center;
    & > h1 {
      flex-grow: 2;
    }
  }

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

<div class="gdb-page-bm-header">
  <h1>Business Model</h1>
  <SpacedButtons>
    <SaveMessage />
    <IconTextButton
      icon={PredefinedIcons.Expand}
      value="Full View"
      buttonStyle="primary-outline"
      on:click={handleOnFullScreen}
      disabled={isLoading || displaySectionCommit == null} />
    {#if displaySection == null}
      <IconTextButton
        icon={PredefinedIcons.Next}
        value="Start"
        buttonStyle="primary"
        on:click={() => handleChangeSection({
            detail: { section: 'customer' },
          })}
        disabled={isLoading} />
    {:else}
      <IconTextButton
        icon={PredefinedIcons.Next}
        value="Next"
        buttonStyle="primary"
        disabled={isLoading || businessModel.customers.length == 0} />
    {/if}
  </SpacedButtons>
</div>
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
          highlight={displaySection}
          on:sectionChange={handleChangeSection} />
      {/each}
    </div>
  {/if}
  {#if !isLoading && displaySectionCommit}
    <div class="gdb-bm-panel-instructions" in:fade={{ duration: 250 }}>
      <CustomersSectionInstructions />
    </div>
    <div class="gdb-bm-panel-input" in:fade={{ duration: 250 }}>
      <CustomersSection
        {businessModel}
        on:clickFullscreen={handleOnFullScreen} />
    </div>
  {/if}
</div>
