<script lang="ts">
  export let isValid = false;
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";
  .gdb-validation-error {
    position: absolute;
    right: -1%;
    bottom: -210%;
    color: $cs-red-4;
    border: 1px solid $cs-red-4;
    background-color: $color-background-white;
    font-size: $font-size-small;
    opacity: 0.9;
    padding: $space-s;
    z-index: 10;
    box-shadow: $shadow-main;

    & > .gdb-validation-message,
    & > .gdb-validation-note {
      text-align: center;
      white-space: nowrap;
    }

    & > .gdb-validation-note {
      opacity: 0.9;
    }
  }
</style>

{#if !isValid}
  <div class="gdb-validation-error">
    <div class="gdb-validation-message">
      <slot name="message" />
    </div>
    <div class="gdb-validation-note">
      <slot name="note" />
    </div>
  </div>
{/if}
