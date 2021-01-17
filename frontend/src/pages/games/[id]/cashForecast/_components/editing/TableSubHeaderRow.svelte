<script lang="ts">
  export let colspan: number;
  export let value: string;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-cf-table-subheader > td {
    padding: $space-l 0 $space-m 0;
  }

  .gdb-cf-table-subtitle {
    font-weight: bold;
    margin-right: 2rem;
  }
</style>

<tr class="gdb-cf-table-subheader">
  <td {colspan}>
    <span class="gdb-cf-table-subtitle">{value}</span>
    <slot />
  </td>
</tr>
