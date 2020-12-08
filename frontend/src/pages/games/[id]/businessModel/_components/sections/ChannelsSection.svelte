<script lang="ts">
  import type { IBusinessModel } from "../../_types/businessModel";
  import InputPanel from "../InputPanel.svelte";
  import Row from "../../../../../../components/inputs/Row.svelte";
  import EntryList from "./components/EntryList.svelte";
  import {
    businessModelEventStore,
    events,
  } from "../../_stores/businessModelStore";

  export let businessModel: IBusinessModel;

  const publish = businessModelEventStore.addEvent;

  $: hasMinimumInfo =
    businessModel.channels.awareness.list.length > 0 ||
    businessModel.channels.consideration.list.length > 0 ||
    businessModel.channels.purchase.list.length > 0 ||
    businessModel.channels.postPurchase.list.length > 0;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";
</style>

<InputPanel
  title="Channels"
  canUndo={false}
  canRedo={false}
  canNext={hasMinimumInfo}
  canFullscreen={true}
  on:clickFullscreen
  on:clickNext>
  <Row>
    <EntryList
      label="Awareness"
      entries={businessModel.channels.awareness}
      on:create={({ detail }) => publish(events.AddChannelsAwarenessEntry(detail))}
      on:update={({ detail }) => publish(events.UpdateChannelsAwarenessEntry(detail))}
      on:delete={({ detail }) => publish(events.DeleteChannelsAwarenessEntry(detail))} />
  </Row>
  <Row>
    <EntryList
      label="Consideration"
      entries={businessModel.channels.consideration}
      on:create={({ detail }) => publish(events.AddChannelsConsiderationEntry(detail))}
      on:update={({ detail }) => publish(events.UpdateChannelsConsiderationEntry(detail))}
      on:delete={({ detail }) => publish(events.DeleteChannelsConsiderationEntry(detail))} />
  </Row>
  <Row>
    <EntryList
      label="Purchase"
      entries={businessModel.channels.purchase}
      on:create={({ detail }) => publish(events.AddChannelsPurchaseEntry(detail))}
      on:update={({ detail }) => publish(events.UpdateChannelsPurchaseEntry(detail))}
      on:delete={({ detail }) => publish(events.DeleteChannelsPurchaseEntry(detail))} />
  </Row>
  <Row>
    <EntryList
      label="Post-Purchase"
      entries={businessModel.channels.postPurchase}
      on:create={({ detail }) => publish(events.AddChannelsPostPurchaseEntry(detail))}
      on:update={({ detail }) => publish(events.UpdateChannelsPostPurchaseEntry(detail))}
      on:delete={({ detail }) => publish(events.DeleteChannelsPostPurchaseEntry(detail))} />
  </Row>
</InputPanel>
