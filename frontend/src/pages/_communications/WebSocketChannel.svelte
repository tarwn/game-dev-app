<script lang="ts">
  import { onDestroy, createEventDispatcher } from "svelte";
  import { log } from "../../utilities/logger";
  import type { UpdateScope } from "./UpdateScope";
  import { webSocketStore } from "./webSocketStore";
  import { webSocketConnectionStore } from "./webSocketConnectionStore";
  import type { WebSocketMessage } from "./webSocketStore";

  export let scope: UpdateScope;
  export let gameId: string = "";
  let registeredScope = null as UpdateScope | null;
  let registeredGameId: string = "";
  let registeredTopic: string | null = null;
  let webSocketIsConnected = false;
  let webSocketIsReconnecting = false;

  const channelId = Math.floor(Math.random() * 100000);

  const dispatch = createEventDispatcher();
  const unsubscribe = webSocketStore.subscribe((msg: WebSocketMessage) => {
    if (msg != null && msg.topic == registeredTopic) {
      log("WebSocketMessage Event Received", msg);
      dispatch("receive", msg.event);
    }
  });
  const unsubscribe2 = webSocketConnectionStore.subscribe((connected) => {
    if (connected == null) return;
    if (!webSocketIsConnected && connected) {
      webSocketIsReconnecting = true;
    }
    webSocketIsConnected = connected;
  });

  $: {
    if (webSocketIsConnected && (scope != registeredScope || gameId != registeredGameId)) {
      if (registeredScope != null) {
        webSocketStore.unregisterForScope(channelId, registeredScope, registeredGameId);
      }
      registeredScope = scope;
      registeredGameId = gameId;
      webSocketStore.registerForScope(channelId, scope, gameId).then((t) => {
        registeredTopic = t;
      });
      webSocketIsReconnecting = false;
    } else if (webSocketIsConnected && webSocketIsReconnecting) {
      webSocketStore.registerForScope(channelId, scope, gameId).then((t) => {
        registeredTopic = t;
      });
      webSocketIsReconnecting = false;
    }
  }

  onDestroy(async () => {
    registeredTopic = null;
    if (webSocketIsConnected && registeredScope != null) {
      webSocketStore.unregisterForScope(channelId, registeredScope, registeredGameId);
    }
    unsubscribe();
    unsubscribe2();
  });
</script>
