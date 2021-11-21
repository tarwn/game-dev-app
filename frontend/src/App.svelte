<script>
  import { Router } from "@sveltech/routify";
  import Modal from "svelte-simple-modal";
  import { routes } from "@sveltech/routify/tmp/routes";
  import ErrorReporter from "./ErrorReporter.svelte";
  import { studioStore } from "./pages/_stores/studioStore";
  import { gamesStore } from "./pages/_stores/gamesStore";
  import { profileStore } from "./pages/_stores/profileStore";
  import WebSocketManager from "./pages/_communications/WebSocketManager.svelte";
  import WebSocketChannel from "./pages/_communications/WebSocketChannel.svelte";
  import { UpdateScope } from "./pages/_communications/UpdateScope";

  function reloadApp() {
    console.log("reload from error");
    window.location.reload();
  }

  studioStore.load();
  gamesStore.load();
  profileStore.load();
</script>

<style type="text/scss" global>
  // @import "normalize.css";
  @import "./styles/base.scss";
  @import "./styles/app.scss";
</style>

<Modal>
  <Router {routes} />
</Modal>
<ErrorReporter on:dismiss={reloadApp} />
<WebSocketManager />
<WebSocketChannel scope={UpdateScope.StudioRecord} on:receive={() => studioStore.load()} />
<WebSocketChannel scope={UpdateScope.StudioGameList} on:receive={() => gamesStore.load()} />
<WebSocketChannel scope={UpdateScope.CurrentUserRecord} on:receive={() => profileStore.load()} />
