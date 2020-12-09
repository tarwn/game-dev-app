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

  // this auto-focuses on an element but we only want it
  //  to happen after they start entering it
  let canInitYet = false;
  function init(el) {
    if (canInitYet) {
      el.focus();
    }
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
    canInitYet = true;
    dispatch("create", {
      parentId: entries.globalId,
      value: e.target?.value,
    });
    hackyNewValue = "";
  }
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  .gdb-entry-list {
    margin: 0;
    list-style-type: disc;
    margin-left: 4rem; // matches label min-size padding
    padding-left: $space-s; // matches label.text min-size padding
  }
  .gdb-entry-list-item-new,
  .gdb-entry-list-item {
    line-height: $line-height-base; // matches label
    margin: $space-s 0; // matches Row
  }

  .gdb-entry-list-item-new {
    list-style-type: none;

    &:focus-within::before {
      content: "\2022"; /* Add content: \2022 is the CSS Code/unicode for a bullet */
      color: $cs_blue;
      font-weight: bold;
      font-size: $font-size-larger;
      display: inline-block;
      width: 15px;
      margin-left: -15px;
    }
  }

  input.gdb-entry-input-new,
  input.gdb-entry-input {
    width: 26rem;
  }

  input.gdb-entry-input-new {
    border-style: dashed;

    &:active,
    &:focus {
      border-style: solid;
    }
  }
</style>

{#if label}
  <LabeledInput {label} forId={`${entries.globalId}-newEntry`} />
{/if}
<ul class="gdb-entry-list">
  {#each entries.list as entry (entry.globalId)}
    <li class="gdb-entry-list-item">
      <input
        type="text"
        class="gdb-entry-input"
        value={entry.value}
        id={`${entries.globalId}`}
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
