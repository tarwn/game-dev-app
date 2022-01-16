<script lang="ts">
  import type { IBusinessModel } from "../../_types/businessModel";
  import InputPanel from "../InputPanel.svelte";
  import Row from "../../../../../../components/inputs/Row.svelte";
  import EntryList from "./components/EntryList.svelte";
  import { businessModelEventStore, events } from "../../_stores/businessModelStore";

  export let businessModel: IBusinessModel;

  const publish = businessModelEventStore.addEvent;

  $: hasMinimumInfo = businessModel.revenue.entries.list.length > 0;
</script>

<style lang="scss">
  @import "../../../../../../styles/_variables.scss";
</style>

<InputPanel
  title="Revenue"
  canUndo={false}
  canRedo={false}
  canNext={hasMinimumInfo}
  canFullscreen={true}
  on:clickFullscreen
  on:clickNext>
  <p>What are the revenue streams for the game? When/where will we receive money?</p>
  <Row>
    <EntryList
      entries={businessModel.revenue.entries}
      on:create={({ detail }) => publish(events.AddRevenueEntry(detail))}
      on:update={({ detail }) => publish(events.UpdateRevenueEntry(detail))}
      on:delete={({ detail }) => publish(events.DeleteRevenueEntry(detail))} />
  </Row>
</InputPanel>
