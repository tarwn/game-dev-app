<script lang="ts">
  import { onDestroy, createEventDispatcher } from "svelte";
  import * as signalR from "@microsoft/signalr";
  import { log } from "./logger";
  import type { AppliedEvent } from "./eventSystem/types";
  import Portal from "svelte-portal/src/Portal.svelte";

  export let updateChannelId: string;
  export let updateUpdateType: string = "businessModelUpdate";

  const dispatch = createEventDispatcher();

  let connected = false;
  let connectedChannelId = null;

  function setConnected(isConnected) {
    connected = true;
    dispatch(connected ? "connected" : "disconnected");
  }

  const connection = new signalR.HubConnectionBuilder()
    .withAutomaticReconnect()
    .withUrl("/api/fe/hub")
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.on(updateUpdateType, (args: AppliedEvent<any>) => {
    log(`SignalR.${updateUpdateType}`, { args });
    dispatch("receiveUpdate", args);
  });

  connection
    .start()
    .then(() => {
      connected = true;
    })
    .catch((err) => document.write(err));
  connection.onreconnecting(() => setConnected(false));
  connection.onreconnected(() => setConnected(true));

  $: {
    if (connected && connectedChannelId != updateChannelId) {
      connection.send("joinGroup", updateChannelId).then(() => {
        connectedChannelId = updateChannelId;
        dispatch("channelConnect", connectedChannelId);
      });
    }
  }

  onDestroy(async () => {
    await connection.stop().then(() => {
      setConnected(false);
    });
  });
</script>

<Portal target="body">
  {#if !connected}
    <div>Not connected... :(</div>
  {/if}
</Portal>
