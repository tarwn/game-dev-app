<script lang="ts">
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";

  .gdb-cf-table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    min-width: 1200px;
    table-layout: fixed;

    :global(td:not(.gdb-faux-label)) {
      padding: $space-xs $space-m;
    }

    :global(select) {
      max-width: 100%;
    }
  }
</style>

<table class="gdb-cf-table">
  <slot />
</table>
