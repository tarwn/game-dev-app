<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import LabeledInput from "../../../../../../../components/inputs/LabeledInput.svelte";
  import IconButton from "../../../../../../../components/buttons/IconButton.svelte";
  import { PredefinedIcons } from "../../../../../../../components/buttons/PredefinedIcons";
  import type { IIdentifiedList, IIdentifiedPrimitive } from "../../../../../../_stores/eventStore/types";

  export let entries: IIdentifiedList<IIdentifiedPrimitive<string>>;
  export let label: string;
  export let placeholder: string | null = null;

  const dispatch = createEventDispatcher();

  // based lightly on https://github.com/agustinl/svelte-tags-input/blob/master/src/Tags.svelte

  let newTagEntry = "";
  $: newTagEntryId = `${entries.globalId}-new`;

  function handleDelete(entry: IIdentifiedPrimitive<string>) {
    dispatch("delete", {
      parentId: entry.parentId,
      globalId: entry.globalId,
    });
  }

  async function handleNewValue(e: any) {
    e.preventDefault();
    if (newTagEntry === "") return;

    const isDupe = entries.list.findIndex((e) => e.value == newTagEntry) > -1;

    if (!isDupe) {
      dispatch("create", {
        parentId: entries.globalId,
        value: newTagEntry,
      });
    }
    newTagEntry = "";
    setTimeout(() => document.getElementById(newTagEntryId).focus(), 1);
  }
</script>

<style lang="scss">
  @import "../../../../../../../styles/_variables.scss";

  .gdb-entry-list {
    margin: 0;
    padding: 0;
    list-style-type: none;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;

    margin-left: 4rem; // matches label min-size padding
    padding-left: $space-s; // matches label.text min-size padding
  }

  .gdb-entry-list-item {
    display: flex;
    flex-direction: row;
    flex: 0 0;
    align-items: center;
    background-color: $cs-grey-0;
    border: 1px solid $cs-grey-1;
    margin: $space-xs;
    padding-left: $space-s;
    border-radius: $border-radius-tag;
  }

  .gdb-entry-tag-text {
    flex: 1 0;
    font-size: $font-size-small;
    white-space: nowrap;
  }

  .gdb-entry-tag-button {
    flex: 0 0;
    margin: -0.25rem -0.5rem;
  }

  .gdb-entry-list-item-new {
    display: inner-block;
    flex: 1 0;
    margin: $space-xs;
  }
</style>

<LabeledInput {label} forId={newTagEntryId} />
<ul class="gdb-entry-list">
  {#each entries.list as entry (entry.globalId)}
    <li class="gdb-entry-list-item">
      <span class="gdb-entry-tag-text">{entry.value}</span>
      <span class="gdb-entry-tag-button">
        <IconButton
          buttonStyle="icon-only"
          icon={PredefinedIcons.Delete}
          label="Remove"
          disabled={false}
          size="small"
          on:click={() => handleDelete(entry)} />
      </span>
    </li>
  {/each}
  <li class="gdb-entry-list-item-new">
    <input
      type="text"
      class="gdb-entry-list-item-newInput"
      {placeholder}
      id={newTagEntryId}
      bind:value={newTagEntry}
      on:blur={handleNewValue} />
  </li>
</ul>
