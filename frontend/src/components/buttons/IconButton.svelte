<script lang="ts">
  export let icon: string;
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  .gdb-button-icon {
    border: 0px;
    background: none;
    font-size: 32px;
    min-width: 32px;
    min-height: 32px;
    line-height: 32px;
    color: $cs-grey-2;
    cursor: pointer;

    &:hover {
      color: $color-accent-1;
    }
  }
</style>

<button on:click|preventDefault|stopPropagation class="gdb-button-icon"><i
    class={icon} /></button>
