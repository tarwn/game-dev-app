<script lang="ts">
  export let isRecord: boolean;
  export let isTop: boolean;
  export let isBottom: boolean;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  $border-color: $cs-grey-1;
  $border-radius: 8px;

  // first non-indented cell, top left, bottom left
  .gdb-cf-table-row.isRecord > .gdb-cf-table-indent + :global(td) {
    border-left: 1px solid $border-color;
  }

  .gdb-cf-table-row.isRecord.isTop > .gdb-cf-table-indent + :global(td) {
    border-top-left-radius: $border-radius;
  }

  .gdb-cf-table-row.isRecord.isBottom > .gdb-cf-table-indent + :global(td) {
    border-bottom-left-radius: $border-radius;
  }

  // last non-indented cell, top right, bottom right
  .gdb-cf-table-row.isRecord > :global(td:last-of-type) {
    border-right: 1px solid $border-color;
  }

  .gdb-cf-table-row.isRecord.isTop > :global(td:last-of-type) {
    border-top-right-radius: $border-radius;
  }

  .gdb-cf-table-row.isRecord.isBottom > :global(td:last-of-type) {
    border-bottom-right-radius: $border-radius;
  }

  // top + bottom borders
  .gdb-cf-table-row.isRecord.isTop > :global(td) {
    border-top: 1px solid $border-color;
  }
  .gdb-cf-table-row.isRecord.isTop > .gdb-cf-table-indent {
    border-top: 0;
  }

  .gdb-cf-table-row.isRecord.isBottom > :global(td) {
    border-bottom: 1px solid $border-color;
  }
  .gdb-cf-table-row.isRecord.isBottom > .gdb-cf-table-indent {
    border-bottom: 0;
  }

  // bottom padding for maximum confusion later
  .gdb-cf-table-row.isRecord.isBottom > :global(td) {
    padding-bottom: $space-s;
  }

  // indent
  .gdb-cf-table-indent {
    width: 1rem;
  }
</style>

<tr class="gdb-cf-table-row" class:isRecord class:isTop class:isBottom>
  <td class="gdb-cf-table-indent" />
  <slot />
</tr>
