<script lang="ts">
  import Icon from "../../../../components/buttons/Icon.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
  import DateSpan from "../../../../components/inputs/DateSpan.svelte";
  export let title: string;
  export let href: string;
  export let imgHref: string;
  export let status: "Done" | "In Progress" | "None" | null;
  export let lastUpdated: Date | null;
</script>

<style lang="scss">
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

  $badge-size: 80px;

  .gdb-tile-status {
    position: absolute;
    bottom: 15px;
    right: -10px;
    z-index: 5;

    border-radius: 50%;
    width: $badge-size;
    height: $badge-size;
    line-height: $badge-size;
    text-align: center;
    background-color: $cs-grey-2;
    color: $cs-grey-5;

    font-size: 40px;

    opacity: 0.8;

    &.gdb-tile-status-done {
      border: 2px solid $cs-green-3;
      background-color: $cs-green-1;
      color: $cs-green-4;
      opacity: 0.9;
    }

    &.gdb-tile-status-inProgress {
      border: 2px solid $cs_blue;
      background-color: $cs_lightblue;
      color: $cs_blue;
      opacity: 0.9;
    }

    &.gdb-tile-status-none {
      // border: 2px solid $cs_blue;
      // background-color: $cs_lightblue;
      color: $cs_lightblue;
      opacity: 0.9;
    }

    .gdb-tile:hover & {
      opacity: 0.5;
    }
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
  <a class="gdb-tile" class:notStarted={status == null || status == "None"} {href}>
    <img class="gdb-tile-image" src={imgHref} alt={title} />
    {#if status == "Done"}
      <div class="gdb-tile-status gdb-tile-status-done">
        <Icon icon={PredefinedIcons.Check} />
      </div>
    {:else if status == "In Progress"}
      <div class="gdb-tile-status gdb-tile-status-inProgress">
        <Icon icon={PredefinedIcons.InProgress} />
      </div>
    {:else}
      <div class="gdb-tile-status gdb-tile-status-none">
        <Icon icon={PredefinedIcons.Pencil} />
      </div>
    {/if}
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
