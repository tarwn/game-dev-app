<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type {
    IIdentifiedList,
    IIdentifiedPrimitive,
  } from "../../../_stores/eventSystem/types";

  export let entries: IIdentifiedList<IIdentifiedPrimitive<string>>;
  export let includeUl: boolean = true;
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  .gdb-summary-list {
    margin: 0.5em 0 0.5em 2em;
    padding: 0 0 0 0em;
    list-style-position: outside;
    color: $cs-grey-3;
  }

  .gdb-summary-list-li {
    color: $text-color-default;
    margin: 0.5em 0;
  }
</style>

{#if includeUl}
  <ul class="gdb-summary-list">
    {#if entries.list.length == 0}
      <li class="gdb-summary-list-li">No details yet</li>
    {:else}
      {#each entries.list as entry (entry.globalId)}
        <li class="gdb-summary-list-li">{entry.value}</li>
      {/each}
    {/if}
  </ul>
{:else}
  {#if entries.list.length == 0}
    <li class="gdb-summary-list-li">No details yet</li>
  {:else}
    {#each entries.list as entry (entry.globalId)}
      <li class="gdb-summary-list-li">{entry.value}</li>
    {/each}
  {/if}
{/if}
