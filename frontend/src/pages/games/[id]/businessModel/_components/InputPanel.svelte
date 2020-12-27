<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IconButton from "../../../../../components/buttons/IconButton.svelte";
  import IconTextButton from "../../../../../components/buttons/IconTextButton.svelte";
  import SpacedButtons from "../../../../../components/buttons/SpacedButtons.svelte";
  import { PredefinedIcons } from "../../../../../components/buttons/PredefinedIcons";

  // props
  export let title: string = "";
  export let canUndo: boolean = false;
  export let canRedo: boolean = false;
  export let canFullscreen: boolean = false;
  export let canNext: boolean = false;

  const dispatch = createEventDispatcher();
  const onClickFullscreen = () => dispatch("clickFullscreen");
  const onClickNext = () => dispatch("clickNext");
</script>

<style type="text/scss">
  @import "../../../../../styles/_variables.scss";

  .gdb-bm-inputPanel {
    border: 1px solid $cs-grey-1;
    background-color: white;
    box-shadow: $shadow-main;
    border-radius: 8px;
    max-width: 60rem;
    display: flex;
    flex-direction: column;
    min-height: 600px;
  }

  .gdb-bm-inputPanel-head {
    flex-grow: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: $space-m;

    & > h3 {
      flex-grow: 2;
    }
  }

  .gdb-bm-inputPanel-content {
    flex-grow: 1;
    margin: 0 $space-m;
  }

  .gdb-bm-inputPanel-footer {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin: $space-m;
  }
</style>

<div class="gdb-bm-inputPanel">
  <div class="gdb-bm-inputPanel-head">
    <h3>{title}</h3>
    <!-- <IconButton
      icon={PredefinedIcons.Undo}
      disabled={!canUndo}
      buttonStyle="primary" />
    <IconButton
      icon={PredefinedIcons.Redo}
      disabled={!canRedo}
      buttonStyle="primary" /> -->
  </div>
  <div class="gdb-bm-inputPanel-content">
    <slot />
  </div>
  <div class="gdb-bm-inputPanel-footer">
    <SpacedButtons>
      <IconTextButton
        icon={PredefinedIcons.Expand}
        value="Full View"
        disabled={!canFullscreen}
        buttonStyle="primary-outline"
        on:click={onClickFullscreen} />
      <IconTextButton
        icon={PredefinedIcons.Next}
        value="Next"
        disabled={!canNext}
        buttonStyle="primary-outline"
        on:click={onClickNext} />
    </SpacedButtons>
  </div>
</div>
