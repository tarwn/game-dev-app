<script>
  import { onDestroy } from "svelte";
  import { goto, metatags } from "@sveltech/routify";
  import { gamesStore } from "./_stores/gamesStore";

  metatags.title = "LaunchReady";
  metatags.description =
    "Your LaunchReady Dashboard: Select a game, add a new game, or manage the studio.";

  let redirected = false;
  const unsubscribe = gamesStore.subscribe((g) => {
    if (g != null && g.length > 0 && !redirected) {
      redirected = true;
      $goto("../games/:id", { id: g[0].globalId });
    }
  });

  onDestroy(unsubscribe);
</script>
