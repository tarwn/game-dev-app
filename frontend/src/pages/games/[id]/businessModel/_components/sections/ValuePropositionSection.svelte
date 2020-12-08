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

  export let businessModel: IBusinessModel;

  const dispatch = createEventDispatcher();

  $: hasMinimumInfo =
    businessModel.valueProposition.genres.list.length > 0 ||
    businessModel.valueProposition.platforms.list.length > 0 ||
    businessModel.valueProposition.entries.list.length > 0;

  function handleEntryCreate(evt) {
    businessModelEventStore.addEvent(events.AddValuePropEntry(evt.detail));
  }
  function handleEntryUpdate(evt) {
    businessModelEventStore.addEvent(events.UpdateValuePropEntry(evt.detail));
  }
  function handleEntryDelete(evt) {
    businessModelEventStore.addEvent(events.DeleteValuePropEntry(evt.detail));
  }

  // YOU ARE HERE -
  //  * Ditto back-end
  //  * Add TagEntryList component for genres
  //  * Add events, applies, tests to frontend
  //  * Ditto back-end
  //  * Add TagEntryList component for platforms
  //  * Add events, applies, tests to frontend
  //  * Ditto back-end
  //  * Update instructions
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
    <LabeledInput label="Genres">
      {#each businessModel.valueProposition.genres.list as genre (genre.globalId)}
        <span>{genre.value}</span>
      {/each}
      <input type="text" on:change={() => console.log} />
    </LabeledInput>
    <LabeledInput label="Platforms" />
    <Row>
      <EntryList
        label="Unique Proposition"
        entries={businessModel.valueProposition.entries}
        on:create={handleEntryCreate}
        on:update={handleEntryUpdate}
        on:delete={handleEntryDelete} />
    </Row>
  </Row>
</InputPanel>
