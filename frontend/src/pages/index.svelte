<script>
  import { onDestroy } from "svelte";
  import { goto, metatags } from "@sveltech/routify";
  import { gamesStore } from "./_stores/gamesStore";
  import ScreenTitle from "../components/layout/ScreenTitle.svelte";
  import ButtonWithPopup from "../components/buttons/ButtonWithPopup.svelte";

  metatags.title = "[LR] Dashboard";
  metatags.description = "Your LaunchReady Dashboard: Select a game, add a new game, or manage the studio.";

  let redirected = false;
  let isNew = false;
  const unsubscribe = gamesStore.subscribe((games) => {
    if (games != null && games.length > 0 && !redirected) {
      // console.log({ games });
      const game = games.find((g) => g.isFavorite) ?? games[0];
      redirected = true;
      $goto("../games/:id", { id: game.globalId });
    } else if (games != null && games.length == 0) {
      isNew = true;
    }
  });

  onDestroy(unsubscribe);
</script>

<style lang="scss">
  @import "../styles/_variables.scss";

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

  h2 {
    margin-top: $space-l;
  }

  .gdb-welcome-msg {
    max-width: 800px;
  }
</style>

{#if isNew}
  <div class="gdp-page">
    <div class="gdb-page-head" />
    <div class="gdb-page-content">
      <ScreenTitle title="Welcome!" />
      <div class="gdb-welcome-msg">
        <p>Thanks for logging in, just a couple quick items before we get started.</p>
        <h2>Where do I start?</h2>
        <p>The next time you log in, you'll start on the dashboard for the first game in your list.</p>
        <p>
          As you visit screens for the first time, you'll be greeted with a popup and more details on the screen. That
          info (and more) is accessible from buttons like this one:
        </p>
        <ButtonWithPopup buttonStyle="primary-outline-circle" label="?">
          Yep, just like that! (but next time more useful)
        </ButtonWithPopup>
        <h2>Alright, let's get started</h2>
        <p>
          To get started, you need to add a game. Once added, it will be available in the side menu to the left. Ready?
        </p>
        <p>
          Head over to the <a href="/settings/games">Game Settings</a>, click "Add Game", fill in the details, then
          click it in the side menu.
        </p>
      </div>
    </div>
  </div>
{/if}
