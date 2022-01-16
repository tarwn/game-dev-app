<script lang="ts">
  import type { IIdentifiedList, IIdentifiedPrimitive } from "../../../../../../_stores/eventStore/types";

  export let entries: IIdentifiedList<IIdentifiedPrimitive<string>>;
  export let includeUl: boolean = true;
</script>

<style lang="scss">
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

    &::marker {
      color: $cs-grey-1;
    }

    &.gdb-summary-list-li-no-details {
      font-style: italic;
      opacity: 0.5;
    }
  }
</style>

{#if includeUl}
  <ul class="gdb-summary-list">
    {#if entries.list.length == 0}
      <li class="gdb-summary-list-li gdb-summary-list-li-no-details">No details yet</li>
    {:else}
      {#each entries.list as entry (entry.globalId)}
        <li class="gdb-summary-list-li">{entry.value}</li>
      {/each}
    {/if}
  </ul>
{:else if entries.list.length == 0}
  <li class="gdb-summary-list-li gdb-summary-list-li-no-details">No details yet</li>
{:else}
  {#each entries.list as entry (entry.globalId)}
    <li class="gdb-summary-list-li">{entry.value}</li>
  {/each}
{/if}
