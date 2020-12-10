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

  $: hasMinimumInfo = businessModel.keyResources.entries.list.length > 0;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";
</style>

<InputPanel
  title="Key Resources"
  canUndo={false}
  canRedo={false}
  canNext={hasMinimumInfo}
  canFullscreen={true}
  on:clickFullscreen
  on:clickNext>
  <p>
    What are the critical resources or people we need to build and launch
    successfully?
  </p>
  <Row>
    <EntryList
      entries={businessModel.keyResources.entries}
      on:create={({ detail }) => publish(events.AddKeyResourcesEntry(detail))}
      on:update={({ detail }) => publish(events.UpdateKeyResourcesEntry(detail))}
      on:delete={({ detail }) => publish(events.DeleteKeyResourcesEntry(detail))} />
  </Row>
</InputPanel>
