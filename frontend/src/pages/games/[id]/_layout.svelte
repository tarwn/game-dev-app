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

  .gdb-page-content {
    margin: $space-l $space-xl;
  }
</style>

<div class="gdp-page-game">
  <TopBar {...gameSummary} />
  <div class="gdb-page-content">
    <slot />
  </div>
</div>
