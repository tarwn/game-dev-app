<script lang="ts">
  import { params } from "@sveltech/routify";
  import TopBar from "./_components/TopBar.svelte";

  $: id = $params.id;

  // todo: load game summary?
  $: gameSummary = {
    id,
    name: id == "demo" ? "Demo Game" : "Unknown Game",
    icon: "true-Videogames_controller_joystick_games_video_console",
  };
</script>

<style type="text/scss">
  @import "../../../styles/_variables.scss";

  .gdp-page {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: grid;
    grid-template-columns: [start] auto [end];
    grid-template-rows: [top] 3.5rem [mid] auto [bottom];
    overflow: auto;
  }

  .gdb-page-head {
    grid-column-start: start;
    grid-column-end: end;
    grid-row-start: top;
    grid-row-end: mid;
  }

  .gdb-page-content {
    position: relative;
    grid-column-start: start;
    grid-column-end: end;
    grid-row-start: mid;
    grid-row-end: bottom;
    margin: $space-l $space-xl $space-s $space-xl;
  }
</style>

<div class="gdp-page">
  <div class="gdb-page-head">
    <TopBar {...gameSummary} />
  </div>
  <div class="gdb-page-content">
    <slot />
  </div>
</div>
