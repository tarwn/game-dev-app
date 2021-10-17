<script lang="ts">
  import { onDestroy, createEventDispatcher } from "svelte";
  import * as signalR from "@microsoft/signalr";
  import { portal } from "svelte-portal";
  import { webSocketStore } from "./webSocketStore";
  import { webSocketConnectionStore } from "./webSocketConnectionStore";

  const dispatch = createEventDispatcher();

  let connected = false;
  function setConnected() {
    connected = true;
    webSocketConnectionStore.connect();
    dispatch("connected");
  }
  function setDisconnected() {
    connected = false;
    webSocketConnectionStore.disconnect();
    dispatch("disconnected");
  }

  // configure the actual connection management
  const connection = new signalR.HubConnectionBuilder()
    .withAutomaticReconnect([0, 500, 2000, 5000, 5000, 5000, 5000, 15000, 15000, 15000, 15000, 30000])
    .withUrl("/api/fe/hub")
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection
    .start()
    .then(() => {
      setConnected();
    })
    .catch((err) => document.write(err));
  connection.onreconnecting(() => setDisconnected());
  connection.onreconnected(() => setConnected());
  connection.onclose(() => setDisconnected());

  // make the connection available
  webSocketStore.initializeConnection(connection);

  // temp - add to window for debugging
  (window as any).ws = connection;

  // close connection on navigation away
  onDestroy(async () => {
    webSocketStore.clearConnection();
    await connection.stop().then(() => {
      setDisconnected();
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
