<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { init } from "@sentry/browser";
  import { getConfig } from "./config";

  const config = getConfig();
  let anErrorHasOccurred = false;

  const dispatch = createEventDispatcher();

  init({
    dsn: config.sentry.dsn,
    release: "frontend@" + config.version,
    environment: config.environment,
    beforeSend: (event) => {
      anErrorHasOccurred = true;
      dispatch("error", { event });
      if (config.sentry.enabled) {
        return event;
      } else {
        return null;
      }
    },
  });

  function dismissError() {
    dispatch("dismiss");
    anErrorHasOccurred = false;
  }
</script>

<style>
  .gdb-error-reporter {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }
  .gdb-error-reporter-bg {
    background-color: white;
    opacity: 0.8;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
  }
  .gdb-error-reporting-dialog {
    position: relative;
    max-width: 400px;
    margin: 200px auto;
    z-index: 3;
  }
</style>

{#if anErrorHasOccurred}
  <div class="gdb-error-reporter">
    <div class="gdb-error-reporter-bg" />
    <div class="gdb-error-reporting-dialog">
      This is an error dialog!
      <input type="button" value="Dismiss" on:click={dismissError} />
    </div>
  </div>
{/if}
