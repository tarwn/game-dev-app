<script lang="ts">
  import { scale, crossfade } from "svelte/transition";
  import { fade } from "svelte/transition";
  // import { params } from "@sveltech/routify";
  import BusinessModelCanvasLarge from "./_components/BusinessModelCanvasLarge.svelte";
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

  .container {
    display: grid;
    grid-template-columns: [start] 420px [center] auto [end];
    grid-template-rows: [top] 280px [mid] auto [bottom];
    // align-items: stretch;
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
    grid-column-start: center;
    grid-column-end: end;
    grid-row-start: top;
    grid-row-end: bottom;
  }

  .gdb-bm-panel-input {
    grid-column-start: start;
    grid-column-end: center;
    grid-row-start: mid;
    grid-row-end: bottom;
  }
</style>

<h1>Business Model</h1>
<div class="container">
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
          on:sectionChange={handleChangeSection} />
      </div>
      <div
        class="gdb-bm-panel-instructions"
        transition:fade={{ duration: 500 }}>
        Instructions
      </div>
      <div class="gdb-bm-panel-input" transition:fade={{ duration: 500 }}>
        Input panel
      </div>
    {/each}
  {/if}
</div>
