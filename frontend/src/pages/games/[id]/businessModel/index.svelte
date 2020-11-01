<script lang="ts">
  import { scale, crossfade } from "svelte/transition";
  import { fade } from "svelte/transition";
  // import { params } from "@sveltech/routify";
  import SaveMessage from "../../../../components/SaveMessage.svelte";
  import IconTextButton from "../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
  import BusinessModelCanvasLarge from "./_components/BusinessModelCanvasLarge.svelte";
  import InputPanel from "./_components/InputPanel.svelte";
  // $: id = $params.id;

  let displaySection = null;
  let displaySectionCommit = null;
  $: businessModel = {
    customer: {
      customers: [],
    },
  };

  function handleChangeSection(event) {
    displaySection = event.detail.section;
  }

  function handleSectionChangeCommit() {
    displaySectionCommit = displaySection;
  }

  const [send, receive] = crossfade({ duration: 250, fallback: scale });
</script>

<style type="text/scss">
  @import "../../../../styles/_variables.scss";

  .gdb-page-bm-container {
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

  .gdb-page-bm-buttons {
    & > button {
      margin-left: $space-s;
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
  }
</style>

<div class="gdb-page-bm-header">
  <h1>Business Model</h1>
  <div class="gdb-page-bm-buttons">
    <SaveMessage />
    <IconTextButton
      icon={PredefinedIcons.Expand}
      value="Full View"
      buttonStyle="primary-outline"
      on:click={() => handleChangeSection({ detail: { section: null } })} />
    {#if displaySection == null}
      <IconTextButton
        icon={PredefinedIcons.Next}
        value="Start"
        buttonStyle="primary"
        on:click={() => handleChangeSection({
            detail: { section: 'customer' },
          })} />
    {:else}
      <IconTextButton
        icon={PredefinedIcons.Next}
        value="Next"
        buttonStyle="primary" />
    {/if}
  </div>
</div>
<div class="gdb-page-bm-container">
  {#if displaySection == null}
    {#each [businessModel] as b}
      <div
        in:receive={{ key: 123 }}
        out:send={{ key: 123 }}
        class="gdb-bm-fullSize"
        class:transitioning={displaySection != null}>
        <BusinessModelCanvasLarge
          bind:model={b}
          isMiniMap={false}
          on:sectionChange={handleChangeSection} />
      </div>
    {/each}
  {:else}
    {#each [businessModel] as b}
      <div
        in:receive={{ key: 123 }}
        out:send={{ key: 123 }}
        on:introend={handleSectionChangeCommit}
        class="gdb-bm-minimap"
        class:transitioning={displaySection == null}>
        <BusinessModelCanvasLarge
          bind:model={b}
          isMiniMap={true}
          highlight={displaySection}
          on:sectionChange={handleChangeSection} />
      </div>
      <div class="gdb-bm-panel-instructions" in:fade={{ duration: 500 }}>
        Instructions
      </div>
      <div class="gdb-bm-panel-input" in:fade={{ duration: 500 }}>
        <InputPanel title="Customer">Questions</InputPanel>
      </div>
    {/each}
  {/if}
</div>
