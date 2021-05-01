<script lang="ts">
  import DateSpan from "../../../../components/inputs/DateSpan.svelte";
  import { getModuleImageHref, getModuleName, getModuleUrl } from "../../../_types/modules";
  import type { ModuleLinkType } from "../../../_types/modules";

  export let module: ModuleLinkType;
  export let id: string | null;
  export let lastUpdated: Date | null;
  export let disabled: boolean = false;

  const title = getModuleName(module);
  const imgHref = getModuleImageHref(module);
  const path = getModuleUrl(module, id);

  $: actuallyDisabled = disabled || id == null;
</script>

<style type="text/scss">
  @import "../../../../styles/_variables.scss";

  .gdb-tile {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    width: 200px;
    height: 200px;
    background-color: white;
    border-right: 1px solid $cs-grey-1;
    text-decoration: none;

    border-radius: 4px;
    margin-bottom: $space-s;
    background: $color-background-white;
    box-shadow: $shadow-main;

    overflow: hidden;

    &:hover {
      box-shadow: $shadow-main-hover;
    }
    &:active {
      box-shadow: $shadow-main;
    }

    &.disabled {
      opacity: 0.8;
      box-shadow: none;
      background-color: $cs-grey-0;
    }
  }

  .gdb-tile-container {
    margin: $space-l 0;
  }

  .gdb-tile-container + :global(.gdb-tile-container) {
    margin-left: $space-xl;
  }

  .gdb-tile-image {
    flex: 1 0 0;
    max-width: 200px;
    max-height: 166px;
  }

  .gdb-tile-title {
    flex: 0 0 0;
    background-color: $cs-grey-5;
    color: $text-color-inverse;
    text-transform: uppercase;
    text-align: center;
    padding: $space-s;
    z-index: 6;
  }

  .gdb-last-updated {
    color: $text-color-light;
    text-align: center;
    font-size: 80%;
    opacity: 0.8;
  }
</style>

<div class="gdb-tile-container">
  <a class="gdb-tile" href={path} disabled={actuallyDisabled} class:disabled={actuallyDisabled}>
    <img class="gdb-tile-image" src={imgHref} alt={title} />
    <div class="gdb-tile-title">{title}</div>
  </a>
  <div class="gdb-last-updated">
    {#if lastUpdated != null}
      Updated on <DateSpan date={lastUpdated} style="long date" />
    {:else}
      -- not started --
    {/if}
  </div>
</div>
