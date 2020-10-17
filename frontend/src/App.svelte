<script lang="ts">
  import { Router } from "@sveltech/routify";
  import { routes } from "@sveltech/routify/tmp/routes";

  import ErrorReporter from "./ErrorReporter.svelte";

  function reloadApp() {
    console.log("reload from error");
    window.location.reload();
  }
</script>

<style type="text/scss">
  @import "./styles/_variables.scss";

  h1 {
    color: $color-primary;
  }
</style>

<ErrorReporter on:dismiss={reloadApp} />

<Router {routes} />
