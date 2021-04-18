<script lang="ts">
  import type * as signalR from "@microsoft/signalr";
  import { onDestroy, createEventDispatcher } from "svelte";
  import { log } from "../../utilities/logger";
  import type { UpdateScope } from "./UpdateScope";
  import { webSocketStore } from "./webSocketStore";
  // import { log } from "./logger";

  export let updateScope: UpdateScope;
  export let gameId: string = "";
  let connectedEventType = null;
  let connectedScope: string = "";
  let webSocketIsConnected = false;
  const instance = Math.floor(Math.random() * 100000);

  const dispatch = createEventDispatcher();
  const unsubscribe = webSocketStore.subscribe((val) => {
    const wasConnected = webSocketIsConnected;
    if (val == null) return;
    // disconnect if the manager indicates it disconnected (will happen for disconnect + reconnect we we auto-re-register for groups)
    if (val == false && connectedScope) {
      connectedScope = null;
    }
    webSocketIsConnected = val;
    // if changing to connected, start reconnection (subscribe to group)
    if (webSocketIsConnected && !wasConnected) {
      reconnect();
    }
  });

  function getConnection() {
    return (window as any).ws as signalR.HubConnection;
  }

  function reconnect() {
    log("SignalR: reconnect", { updateScope, gameId, instance });
    // remove old connect if non-empty
    if (connectedEventType != "") {
      getConnection().off(connectedEventType);
      connectedEventType = "";
    }
    // now connect w/ those values
    attemptConnection(updateScope, gameId);
  }

  function attemptConnection(updateScope: UpdateScope, gameId: string, attempt: number = 0) {
    if (!webSocketIsConnected) return;

    log("SignalR: attempting connection", { updateScope, gameId, attempt, instance });

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
      reconnect();
    }
  }

  onDestroy(async () => {
    unsubscribe();
    getConnection()
      .send("unregisterForUpdates", updateScope, gameId)
      .then(() => {
        dispatch("disconnect", connectedScope);
        connectedScope = "";
      });
  });
</script>
