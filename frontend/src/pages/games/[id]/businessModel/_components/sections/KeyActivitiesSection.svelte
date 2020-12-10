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

  $: hasMinimumInfo = businessModel.keyActivities.entries.list.length > 0;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";
</style>

<InputPanel
  title="Key Activities"
  canUndo={false}
  canRedo={false}
  canNext={hasMinimumInfo}
  canFullscreen={true}
  on:clickFullscreen
  on:clickNext>
  <p>What activities do we need to perform to build and launch the game?</p>
  <Row>
    <EntryList
      entries={businessModel.keyActivities.entries}
      on:create={({ detail }) => publish(events.AddKeyActivitiesEntry(detail))}
      on:update={({ detail }) => publish(events.UpdateKeyActivitiesEntry(detail))}
      on:delete={({ detail }) => publish(events.DeleteKeyActivitiesEntry(detail))} />
  </Row>
</InputPanel>
