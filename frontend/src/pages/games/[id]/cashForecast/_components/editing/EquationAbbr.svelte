<script lang="ts">
  export let title: string;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-equation-abbr {
    display: inline-block;
    padding: $space-xs;
    border-radius: 4px;
    background-color: $cs-green-1;
    border-bottom: 1px solid $cs-green-2;
  }
</style>

<abbr class="gdb-equation-abbr" {title}><slot /></abbr>
