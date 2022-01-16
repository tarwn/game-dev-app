<script lang="ts">
  export let value: string;
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";

  .gdb-faux-input {
    position: relative;
    display: flex;
    // width: 100%; remove because it was overflowin parent after other fixes
    box-sizing: border-box;
    background-color: $cs-grey-0;
  }

  .gdb-faux-input > .gdb-input {
    flex: 1 1 auto;
    padding: 0;
    border: 0;
    outline: 0;
    min-width: 0; // overrides default browser width so flex can size as expected
    background-color: transparent;
  }
</style>

<div class="gdb-input gdb-faux-input">
  <span class="gdb-input gdb-input-noneditable">{value}</span>
</div>
