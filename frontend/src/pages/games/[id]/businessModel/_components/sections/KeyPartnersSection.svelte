<script lang="ts">
  import type { IBusinessModel } from "../../_types/businessModel";
  import InputPanel from "../InputPanel.svelte";
  import Row from "../../../../../../components/inputs/Row.svelte";
  import EntryList from "./components/EntryList.svelte";
  import { businessModelEventStore, events } from "../../_stores/businessModelStore";

  export let businessModel: IBusinessModel;

  const publish = businessModelEventStore.addEvent;

  $: hasMinimumInfo = businessModel.keyPartners.entries.list.length > 0;
</script>

<style lang="scss">
  @import "../../../../../../styles/_variables.scss";
</style>

<InputPanel
  title="Key Partners"
  canUndo={false}
  canRedo={false}
  canNext={hasMinimumInfo}
  canFullscreen={true}
  on:clickFullscreen
  on:clickNext>
  <p>What or who are the key partners we identified in earlier sections to make this game successful?</p>
  <Row>
    <EntryList
      entries={businessModel.keyPartners.entries}
      on:create={({ detail }) => publish(events.AddKeyPartnersEntry(detail))}
      on:update={({ detail }) => publish(events.UpdateKeyPartnersEntry(detail))}
      on:delete={({ detail }) => publish(events.DeleteKeyPartnersEntry(detail))} />
  </Row>
</InputPanel>
