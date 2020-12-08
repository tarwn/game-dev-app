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
  import { Platform } from "@microsoft/signalr/dist/esm/Utils";

  export let businessModel: IBusinessModel;

  const publish = businessModelEventStore.addEvent;
  // const dispatch = createEventDispatcher();

  $: hasMinimumInfo =
    businessModel.valueProposition.genres.list.length > 0 ||
    businessModel.valueProposition.platforms.list.length > 0 ||
    businessModel.valueProposition.entries.list.length > 0;

  // YOU ARE HERE -
  //  * Add TagEntryList component for platforms
  //  * Add events, applies, tests to frontend
  //  * Ditto back-end
  //  * Update instructions
  //  * style bus mod canvas large
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";
</style>

<InputPanel
  title="Value Proposition"
  canUndo={false}
  canRedo={false}
  canNext={hasMinimumInfo}
  canFullscreen={true}
  on:clickFullscreen
  on:clickNext>
  <Row>
    <TagEntryList
      placeholder="Add a genre"
      label="Genre(s)"
      entries={businessModel.valueProposition.genres}
      on:create={({ detail }) => publish(events.AddValuePropGenre(detail))}
      on:delete={({ detail }) => publish(events.DeleteValuePropGenre(detail))} />
  </Row>
  <Row>
    <TagEntryList
      placeholder="Enter a platform"
      label="Platform(s)"
      entries={businessModel.valueProposition.platforms}
      on:create={({ detail }) => publish(events.AddValuePropPlatform(detail))}
      on:delete={({ detail }) => publish(events.DeleteValuePropPlatform(detail))} />
  </Row>
  <Row>
    <EntryList
      label="Unique Proposition"
      entries={businessModel.valueProposition.entries}
      on:create={({ detail }) => publish(events.AddValuePropEntry(detail))}
      on:update={({ detail }) => publish(events.UpdateValuePropEntry(detail))}
      on:delete={({ detail }) => publish(events.DeleteValuePropEntry(detail))} />
  </Row>
</InputPanel>
