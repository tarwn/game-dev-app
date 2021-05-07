<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { PredefinedIcons } from "../../../../../components/buttons/PredefinedIcons";
  import IconTextButton from "../../../../../components/buttons/IconTextButton.svelte";
  import IconButton from "../../../../../components/buttons/IconButton.svelte";

  export let className: string = "gdb-board-section";
  export let label: string = "";
  export let isLoading: boolean = false;
  export let isNextToStart: boolean = false;
  export let isStarted: boolean = false;
  export let isSelected: boolean = false;
  export let isMiniMap: boolean = false;
  export let emptyButtonText: string = "Continue Here";

  const dispatch = createEventDispatcher();

  $: displayEditButton = !isMiniMap && isStarted;
  $: displayAsNextSectionToStart = !isMiniMap && isNextToStart;
</script>

<style type="text/scss">
  @import "../../../../../styles/_variables.scss";
</style>

<div
  class={className}
  class:sectionIsNext={isNextToStart}
  class:sectionIsStarted={isStarted}
  class:sectionIsSelected={isSelected}>
  {#if displayEditButton}
    <div class="gdb-button-edit-panel">
      <IconButton icon={PredefinedIcons.Edit} buttonStyle="bm-edit-charm" on:click={() => dispatch("showMe")} />
    </div>
  {/if}
  <h3 class:isLoading>{label}</h3>
  <div class="gdb-board-section-content">
    {#if isLoading}
      <ul class="gdb-loading-block">
        <li />
        <li />
        <li />
      </ul>
    {:else if displayAsNextSectionToStart}
      <div class="gdb-board-button-panel">
        <IconTextButton value={emptyButtonText} icon={PredefinedIcons.PlusRound} on:click={() => dispatch("showMe")} />
      </div>
    {:else if isStarted}
      <slot />
    {/if}
  </div>
</div>
