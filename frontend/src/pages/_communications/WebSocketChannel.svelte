<script lang="ts">
  import type * as signalR from "@microsoft/signalr";
  import { onDestroy, createEventDispatcher } from "svelte";
  import { log } from "../../utilities/logger";
  // import { log } from "./logger";

  export let channelId: string;
  export let updateType: string;
  let connectedChannelId: string = "";
  const instance = Math.floor(Math.random() * 100000);

  const dispatch = createEventDispatcher();

  function getConnection() {
    return (window as any).ws as signalR.HubConnection;
  }

  getConnection().on(updateType, (args: any) => {
    dispatch("receive", args);
  });

  function attemptConnection(channelId: string, attempt: number = 0) {
    // log("SignalR: attempting connection", { channelId, attempt, instance });
    const connection = getConnection();
    if (attempt >= 10) {
      throw new Error("Unable to connect to signalR socket, aborting connection attempts.");
    }

    if (connection.state != "Connected") {
      const nextAttempt = attempt + 1;
      setTimeout(() => attemptConnection(channelId, nextAttempt), 500 * attempt);
      return;
    }

    getConnection()
      .send("registerForUpdates", channelId)
      .then(() => {
        log("SignalR: connected", { channelId, attempt, instance });
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
