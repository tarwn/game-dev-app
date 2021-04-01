<script lang="ts">
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  td.gdb-cell-label {
    line-height: 1.5rem;
    text-align: left;
    color: $text-color-light;
    font-size: $font-size-small;
    padding-left: $space-m;
  }
</style>

<td class="gdb-cell-label"><slot /></td>
