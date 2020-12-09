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
    businessModel.customerRelationships.entries.list.length > 0;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";
</style>

<InputPanel
  title="Customer Relationships"
  canUndo={false}
  canRedo={false}
  canNext={hasMinimumInfo}
  canFullscreen={true}
  on:clickFullscreen
  on:clickNext>
  <Row>
    <EntryList
      entries={businessModel.customerRelationships.entries}
      on:create={({ detail }) => publish(events.AddCustomerRelationshipsEntry(detail))}
      on:update={({ detail }) => publish(events.UpdateCustomerRelationshipsEntry(detail))}
      on:delete={({ detail }) => publish(events.DeleteCustomerRelationshipsEntry(detail))} />
  </Row>
</InputPanel>
