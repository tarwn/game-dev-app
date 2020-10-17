<script lang="ts">
  import { Router } from "@sveltech/routify";
  import { routes } from "@sveltech/routify/tmp/routes";

  import ErrorReporter from "./ErrorReporter.svelte";

  function reloadApp() {
    console.log("reload from error");
    window.location.reload();
  }
</script>

<style type="text/scss" global>
  @import "normalize.css";
  @import "./styles/base.scss";
</style>

<ErrorReporter on:dismiss={reloadApp} />

<Router {routes} />
