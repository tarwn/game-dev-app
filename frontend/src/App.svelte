<script>
  import { Router } from "@sveltech/routify";
  import { routes } from "@sveltech/routify/tmp/routes";
  import ErrorReporter from "./ErrorReporter.svelte";
  import { studioStore } from "./pages/_stores/studioStore";
  import { gamesStore } from "./pages/_stores/gamesStore";
  import { profileStore } from "./pages/_stores/profileStore";
  import WebSocketManager from "./pages/_communications/WebSocketManager.svelte";
  import WebSocketChannel from "./pages/_communications/WebSocketChannel.svelte";

  function reloadApp() {
    console.log("reload from error");
    window.location.reload();
  }

  studioStore.load();
  gamesStore.load();
  profileStore.load();
</script>

<style type="text/scss" global>
  @import "normalize.css";
  @import "./styles/base.scss";
  @import "./styles/app.scss";
</style>

<Router {routes} />
<ErrorReporter on:dismiss={reloadApp} />
<WebSocketManager />
<WebSocketChannel
  channelId="studio"
  updateType="studioUpdated"
  on:receive={() => studioStore.load()} />
<WebSocketChannel
  channelId="games"
  updateType="gamesUpdated"
  on:receive={() => gamesStore.load()} />
<WebSocketChannel
  channelId="profile"
  updateType="profileUpdated"
  on:receive={() => profileStore.load()} />
