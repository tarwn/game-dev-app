<script lang="ts">
  export let title: string;
</script>

<style lang="scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-equation-abbr {
    display: inline-block;
    padding: $space-xs;
    border-radius: 4px;
    background-color: $cs-green-1;
    border-bottom: 1px solid $cs-green-2;
    font-size: $font-size-small;
    font-family: $font-family;
  }
</style>

<abbr class="gdb-equation-abbr" {title}><slot /></abbr>
