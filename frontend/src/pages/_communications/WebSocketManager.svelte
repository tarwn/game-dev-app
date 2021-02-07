<script lang="ts">
  import { onDestroy, createEventDispatcher } from "svelte";
  import * as signalR from "@microsoft/signalr";
  import { portal } from "../../components/Portal.svelte";

  const dispatch = createEventDispatcher();

  let connected = false;
  // let connectedChannelId = null;

  function setConnected(isConnected: boolean) {
    connected = isConnected;
    dispatch(connected ? "connected" : "disconnected");
  }

  const connection = new signalR.HubConnectionBuilder()
    .withAutomaticReconnect()
    .withUrl("/api/fe/hub")
    .configureLogging(signalR.LogLevel.Information)
    .build();

  (window as any).ws = connection;

  connection
    .start()
    .then(() => {
      connected = true;
    })
    .catch((err) => document.write(err));
  connection.onreconnecting(() => setConnected(false));
  connection.onreconnected(() => setConnected(true));
  connection.onclose(() => setConnected(false));

  onDestroy(async () => {
    await connection.stop().then(() => {
      setConnected(false);
    });
  });
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  .gdb-disconnected {
    position: absolute;
    bottom: 1rem;
    right: 2rem;
    padding: 1rem 3rem;
    color: $cs-red-6;
    font-size: $font-size-larger;
    background-color: $cs_red_0;
    border: 2px solid $cs_red_3;
    border-radius: 4px;
    box-shadow: $shadow-main;
    z-index: 1000;
  }
</style>

{#if !connected}
  <div use:portal={"body"} class="gdb-disconnected">Reconnecting...</div>
{/if}
