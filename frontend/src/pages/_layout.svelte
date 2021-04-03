<script lang="ts">
  import { onDestroy } from "svelte";
  import MenuItemGame from "../components/layout/MenuItemGame.svelte";
  import MenuItemLink from "../components/layout/MenuItemLink.svelte";
  import Logo from "../components/layout/Logo.svelte";
  import { gamesStore } from "./_stores/gamesStore";
  import type { Game } from "./_stores/gamesApi";
  import { PredefinedIcons } from "../components/buttons/PredefinedIcons";

  let games = [] as Game[];
  $: activeGames = games.filter((g) => g.isFavorite);
  const unsubscribe = gamesStore.subscribe((g) => (games = g ?? []));
  onDestroy(unsubscribe);
</script>

<style type="text/scss">
  @import "../styles/_variables.scss";

  .gdb-screen {
    display: grid;
    grid-template-columns: [start] 15rem [start-content] auto [end];
    grid-template-rows: [top] 3rem [top-content] auto [bottom];
    height: 100vh;
    width: 100vw;
  }
  .gdb-sidebar {
    display: block;
    grid-column-start: start;
    grid-column-end: start-content;
    grid-row-start: top;
    grid-row-end: bottom;
    background-color: $color-background-white;
    color: $text-color-default;
    border-right: 1px solid $cs-grey-1;
    z-index: 10;
    box-shadow: $shadow-main;
  }
  .gdb-content {
    display: block;
    grid-column-start: start-content;
    grid-column-end: end;
    grid-row-start: top;
    grid-row-end: bottom;
    background-color: $color-background-light;
    position: relative;
  }

  .gdb-nav-header {
    text-transform: uppercase;
    font-size: $font-size-smallest;
    color: $cs-grey-3;
    margin-left: 1rem;
    margin-top: 4rem;
    margin-bottom: 0.75rem;
  }

  .gdb-nav-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>

<div class="gdb-screen">
  <div class="gdb-sidebar">
    <Logo />
    <nav>
      <div class="gdb-nav-header">Active Games</div>
      <ul class="gdb-nav-list">
        {#each activeGames as game (game.globalId)}
          <li>
            <MenuItemGame id={game.globalId} name={game.name} />
          </li>
        {/each}
        <MenuItemLink path="./settings/games" name="Add a Game" icon={PredefinedIcons.Plus} demphasize={true} />
      </ul>
      <div class="gdb-nav-header">Settings</div>
      <ul class="gdb-nav-list">
        <li>
          <MenuItemLink path="./settings/games" name="Games" icon={PredefinedIcons.Gear} />
        </li>
        <li>
          <MenuItemLink path="./settings/studio" name="Studio & Users" icon={PredefinedIcons.Gear} />
        </li>
        <li>
          <MenuItemLink path="./settings/profile" name="Your Profile" icon={PredefinedIcons.UserConfig} />
        </li>
      </ul>
    </nav>
  </div>
  <div class="gdb-content">
    <slot />
  </div>
</div>
