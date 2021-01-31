<script lang="ts">
  export let isShort: boolean = false;
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  td.gdb-faux-label,
  td.gdb-faux-label-short {
    line-height: 1.5rem;
    text-align: right;
    color: $text-color-light;
    font-size: $font-size-small;
  }
  td.gdb-faux-label {
    padding-top: 1.6rem;
  }
</style>

<td class={isShort ? "gdb-faux-label-short" : "gdb-faux-label"}><slot /></td>
