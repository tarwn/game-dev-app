<script lang="ts">
  export let colspan: number;
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";

  .gdb-cf-table-emptyRow-td {
    height: $space-xs;
    font-size: 1px;
  }
</style>

<tr class="gdb-cf-table-emptyRow">
  <td {colspan} class="gdb-cf-table-emptyRow-td"> &nbsp; </td>
</tr>
