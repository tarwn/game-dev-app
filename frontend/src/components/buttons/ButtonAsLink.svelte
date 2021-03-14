<script lang="ts">
  export let value: string;
  export let disabled: boolean = false;
  export let small: boolean = false;
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  .gdb-button-as-link {
    cursor: pointer;
    color: $color-accent-1;
    text-decoration: underline;
    padding: 0 $space-s;

    // undo button L&F
    background-color: transparent;
    border: 0px solid transparent;
    font-size: $font-size-normal;

    &.small {
      font-size: $font-size-smallest;
    }

    &:active {
      border: 0px solid transparent;
    }

    &:hover {
      cursor: pointer;
      color: $color-accent-1-darker;
      text-decoration: none;
    }

    &.disabled {
      cursor: pointer;
      color: $cs-grey-3;
      text-decoration: none;
      pointer-events: none;
    }
  }
</style>

<button on:click|preventDefault|stopPropagation class="gdb-button-as-link" class:disabled class:small>
  <span class="gdb-button-text">{value}</span>
</button>
