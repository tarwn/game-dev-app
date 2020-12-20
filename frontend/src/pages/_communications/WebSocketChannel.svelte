<script lang="ts">
  import type * as signalR from "@microsoft/signalr";
  import { onDestroy, createEventDispatcher } from "svelte";
  // import { log } from "./logger";

  export let channelId: string;
  export let updateType: string;
  let connectedChannelId: string = "";

  const dispatch = createEventDispatcher();

  function getConnection() {
    return (window as any).ws as signalR.HubConnection;
  }

  getConnection().on(updateType, (args: any) => {
    console.log({ signalr: args, channelId, updateType });
    dispatch("receive", args);
  });

  function attemptConnection(channelId: string, attempt: number = 0) {
    const connection = getConnection();
    if (attempt >= 10) {
      throw new Error(
        "Unable to connect to signalR socket, aborting connection attempts."
      );
    }

    if (connection.state != "Connected") {
      setTimeout(() => attemptConnection(channelId, attempt++), 11 * attempt);
      return;
    }

    getConnection()
      .send("registerForUpdates", channelId)
      .then(() => {
        connectedChannelId = channelId;
        dispatch("connect", connectedChannelId);
      });
  }

  $: {
    if (connectedChannelId != channelId) {
      attemptConnection(channelId);
    }
  }

  onDestroy(async () => {
    getConnection()
      .send("unregisterForUpdates", channelId)
      .then(() => {
        dispatch("disconnect", channelId);
        connectedChannelId = "";
      });
  });
</script>
