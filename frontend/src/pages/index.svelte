<script>
  import { goto, metatags } from "@sveltech/routify";
  import { getConfig } from "../config";
  metatags.title = "LaunchReady";
  metatags.description =
    "Your LaunchReady Dashboard: Select a game, add a new game, or manage the studio.";

  const config = getConfig();
  if (!config.isFullUser) {
    $goto("../games/:id", { id: "demo" });
  }
</script>
