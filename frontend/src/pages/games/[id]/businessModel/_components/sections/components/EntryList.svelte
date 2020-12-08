<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type {
    IIdentifiedList,
    IIdentifiedPrimitive,
  } from "../../../_stores/eventSystem/types";
  import LabeledInput from "../../../../../../../components/inputs/LabeledInput.svelte";

  export let entries: IIdentifiedList<IIdentifiedPrimitive<string>>;
  export let label: string;

  const dispatch = createEventDispatcher();

  function init(el) {
    el.focus();
  }

  function handleUpdate(entry: IIdentifiedPrimitive<string>, e: any) {
    if (e.target?.value.length > 0) {
      dispatch("update", {
        parentId: entry.parentId,
        globalId: entry.globalId,
        value: e.target?.value,
      });
    } else {
      dispatch("delete", {
        parentId: entry.parentId,
        globalId: entry.globalId,
      });
    }
  }

  let hackyNewValue = "";
  function handleNewValue(e: any) {
    dispatch("create", {
      parentId: entries.globalId,
      value: e.target?.value,
    });
    hackyNewValue = "";
  }
</script>

<LabeledInput {label} forId={`${entries.globalId}-newEntry`} />
<ul class="gdb-entry-list">
  {#each entries.list as entry (entry.globalId)}
    <li class="gdb-entry-list-item">
      <input
        type="text"
        class="gdb-entry-input"
        value={entry.value}
        use:init
        on:change|stopPropagation={(e) => handleUpdate(entry, e)} />
    </li>
  {/each}
  <li class="gdb-entry-list-item-new">
    <input
      type="text"
      class="gdb-entry-input-new"
      placeholder={entries.list.length == 0 ? 'Enter a key characteristic' : 'Enter another key characteristic'}
      id={`${entries.globalId}-newEntry`}
      bind:value={hackyNewValue}
      on:input|stopPropagation={handleNewValue} />
  </li>
</ul>
