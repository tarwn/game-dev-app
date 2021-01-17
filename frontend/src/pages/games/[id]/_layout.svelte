<script lang="ts">
  import { params } from "@sveltech/routify";
  import { onDestroy } from "svelte";
  import { gamesStore } from "../../_stores/gamesStore";
  import TopBar from "./_components/TopBar.svelte";

  $: id = $params.id;

  let games = [];
  const unsubscribe = gamesStore.subscribe((g) => (games = g ?? []));

  $: game = {
    icon: "true-Videogames_controller_joystick_games_video_console",
    ...games.find((g) => g.globalId == id),
  };

  onDestroy(unsubscribe);
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
    margin: $space-s $space-xl $space-s $space-xl;
  }
</style>

{#if game}
  <div class="gdp-page">
    <div class="gdb-page-head">
      <TopBar id={game.globalId} {...game} />
    </div>
    <div class="gdb-page-content">
      <slot />
    </div>
  </div>
{/if}
