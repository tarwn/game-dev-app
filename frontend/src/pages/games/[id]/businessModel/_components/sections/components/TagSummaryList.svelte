<script lang="ts">
  import type { IIdentifiedList, IIdentifiedPrimitive } from "../../../../../../_stores/eventStore/types";

  export let entries: IIdentifiedList<IIdentifiedPrimitive<string>>;
</script>

<style lang="scss">
  @import "../../../../../../../styles/_variables.scss";

  .gdb-summary-list {
    margin: 0.5em 0 0em 0em;
    padding: 0 0 0 0em;
    list-style-position: outside;

    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .gdb-summary-list-li {
    display: flex;
    flex-direction: row;
    flex: 0 0;
    align-items: center;
    background-color: $cs-grey-0;
    border: 1px solid $cs-grey-1;
    margin: 0.25em;
    padding: 0.25em 0.25em;
    border-radius: $border-radius-tag;
  }

  .gdb-summary-tag-text {
    flex: 1 0;
    font-size: 0.85em;
    white-space: nowrap;
  }
</style>

<ul class="gdb-summary-list">
  {#each entries.list as entry (entry.globalId)}
    <li class="gdb-summary-list-li">
      <span class="gdb-summary-tag-text">{entry.value}</span>
    </li>
  {/each}
</ul>
