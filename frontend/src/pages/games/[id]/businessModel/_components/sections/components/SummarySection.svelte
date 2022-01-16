<script lang="ts">
  export let label: string = "";
</script>

<style lang="scss">
  @import "../../../../../../../styles/_variables.scss";

  .gdb-section-summary {
    margin: 1em 0;
    background-color: white;
    padding: 0.5em;
    margin: 0.5em 0;
    box-shadow: $shadow-smallest;
  }

  .gdb-section-summary-name {
    font-weight: bold;
    margin: 0.5em 0;
  }
</style>

<div class="gdb-section-summary">
  {#if label !== ""}
    <div class="gdb-section-summary-name">{label}</div>
  {/if}
  <slot />
</div>
