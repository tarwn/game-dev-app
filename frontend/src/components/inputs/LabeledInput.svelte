<script lang="ts">
  export let label: string = "";
  export let forId: string | null = null;
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  .gdb-label {
    display: block;
    line-height: $line-height-base;
  }

  .gdb-label-text {
    display: inline-block;
    min-width: 4rem;
    // extra padding to offset border on inputs
    padding: 1px $space-s 1px 0;
  }
</style>

<label class="gdb-label" for={forId}>
  <span class="gdb-label-text">{label}</span>
  <slot />
</label>
