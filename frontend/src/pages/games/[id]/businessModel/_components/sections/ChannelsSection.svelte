<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { IBusinessModel } from "../../_types/businessModel";
  import InputPanel from "../InputPanel.svelte";
  import Row from "../../../../../../components/inputs/Row.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import EntryList from "./components/EntryList.svelte";
  import {
    businessModelEventStore,
    events,
  } from "../../_stores/businessModelStore";
  import TagEntryList from "./components/TagEntryList.svelte";

  export let businessModel: IBusinessModel;

  const publish = businessModelEventStore.addEvent;

  $: hasMinimumInfo =
    businessModel.channels.awareness.list.length > 0 ||
    businessModel.channels.consideration.list.length > 0 ||
    businessModel.channels.purchase.list.length > 0 ||
    businessModel.channels.postPurchase.list.length > 0;

  // YOU ARE HERE -
  //  * Update instructions
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
</InputPanel>
