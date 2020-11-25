<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { init } from "@sentry/browser";
  import { CaptureConsole } from "@sentry/integrations";
  import { getConfig } from "./config";
  import { log } from "./pages/games/[id]/businessModel/_stores/logger";

  const config = getConfig();
  let anErrorHasOccurred = false;

  const dispatch = createEventDispatcher();
  init({
    dsn: config.sentry.dsn,
    release: "frontend@" + config.version,
    environment: config.environment,
    debug: config.environment == "Development",
    beforeSend: (event) => {
      anErrorHasOccurred = true;
      dispatch("error", { event });
      if (config.sentry.enabled) {
        return event;
      } else {
        return null;
      }
    },
    integrations: [
      new CaptureConsole({
        levels: ["error"],
      }),
    ],
  });

  function dismissError() {
    dispatch("dismiss");
    anErrorHasOccurred = false;
  }
</script>

<style type="text/scss" global>
  @import "./styles/_variables.scss";
  .gdb-error-reporter {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
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
    background-color: white;
    padding: $space-s;
    box-shadow: $shadow-main;

    & > h3 {
      padding: 0 $space-m;
    }

    & > p {
      padding: $space-m;
    }
  }

  .gdb-right {
    text-align: right;
  }
</style>

{#if anErrorHasOccurred}
  <div class="gdb-error-reporter">
    <div class="gdb-error-reporter-bg" />
    <div class="gdb-error-reporting-dialog">
      <h3>An Error Occurred</h3>
      <p>
        Sorry, we ran into an error. It's been reported so we can fix it, but in
        the meantime you can continue, which will refresh the browser.
      </p>
      <div class="gdb-right">
        <button
          class="gdb-button gdb-bs-primary"
          on:click={dismissError}>Dismiss</button>
      </div>
    </div>
  </div>
{/if}
