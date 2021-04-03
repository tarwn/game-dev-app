<script lang="ts">
  import type * as signalR from "@microsoft/signalr";
  import { onDestroy, createEventDispatcher } from "svelte";
  import { log } from "../../utilities/logger";
  import type { UpdateScope } from "./UpdateScope";
  // import { log } from "./logger";

  export let updateScope: UpdateScope;
  export let gameId: string = "";
  let connectedEventType = null;
  let connectedScope: string = "";
  const instance = Math.floor(Math.random() * 100000);

  const dispatch = createEventDispatcher();

  function getConnection() {
    return (window as any).ws as signalR.HubConnection;
  }

  function attemptConnection(updateScope: UpdateScope, gameId: string, attempt: number = 0) {
    // log("SignalR: attempting connection", { channelId, attempt, instance });
    const connection = getConnection();
    if (attempt >= 10) {
      throw new Error("Unable to connect to signalR socket, aborting connection attempts.");
    }

    if (connection.state != "Connected") {
      const nextAttempt = attempt + 1;
      setTimeout(() => attemptConnection(updateScope, gameId, nextAttempt), 500 * attempt);
      return;
    }

    getConnection()
      .invoke("registerForUpdates", updateScope, gameId)
      .then((updateTypeFromServer) => {
        connectedEventType = updateTypeFromServer;
        connectedScope = `${updateScope}/${gameId}`;
        log("SignalR: connected", { connectedEventType, connectedScope, attempt, instance });

        // bind to messages coming back to that update type name
        getConnection().on(connectedEventType, (args: any) => {
          // log("SignalR: receive", { connectedEventType, args });
          dispatch("receive", args);
        });

        dispatch("connect", connectedScope);
      });
  }

  $: {
    if (connectedScope != `${updateScope}/${gameId}`) {
      // remove old connect if non-empty
      if (connectedEventType != "") {
        getConnection().off(connectedEventType);
        connectedEventType = "";
      }
      // now connect w/ those values
      attemptConnection(updateScope, gameId);
    }
  }

  onDestroy(async () => {
    getConnection()
      .send("unregisterForUpdates", updateScope, gameId)
      .then(() => {
        dispatch("disconnect", connectedScope);
        connectedScope = "";
      });
  });
</script>
