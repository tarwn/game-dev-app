<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { PredefinedIcons } from "../../../../../components/buttons/PredefinedIcons";
  import IconTextButton from "../../../../../components/buttons/IconTextButton.svelte";
  import IconButton from "../../../../../components/buttons/IconButton.svelte";

  export let className: string = "gdb-board-section";
  export let label: string = "";
  export let isLoading: boolean = false;
  export let highlightAsNext: boolean = false;
  export let isEditable: boolean = false;
  export let isMiniMap: boolean = false;
  export let section: string = "";
  export let nextIs: string = "";
  export let emptyButtonText: string = "Continue Here";

  const dispatch = createEventDispatcher();
</script>

<style type="text/scss">
  @import "../../../../../styles/_variables.scss";
  @import "../../../../../styles/mixins/_loadingPulse.scss";
  @import "../../../../../styles/mixins/_scrollbar.scss";
</style>

<div
  class={className}
  class:emphasize={nextIs === section && highlightAsNext}
  class:doNotDemphasize={isEditable && highlightAsNext}
  class:highlight={highlightAsNext && (isEditable || nextIs === section)}>
  {#if !isMiniMap && isEditable}
    <div class="gdb-button-edit-panel">
      <IconButton
        icon={PredefinedIcons.Edit}
        buttonStyle="bm-edit-charm"
        on:click={() => dispatch('showMe')} />
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
    {:else if !isMiniMap && nextIs === section}
      <div class="gdb-board-button-panel">
        <IconTextButton
          value={emptyButtonText}
          icon={PredefinedIcons.Plus}
          on:click={() => dispatch('showMe')} />
      </div>
    {:else if isEditable}
      <slot />
    {/if}
  </div>
</div>
