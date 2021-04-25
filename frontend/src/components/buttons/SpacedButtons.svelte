<script lang="ts">
  export let align: string = "";
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";
  .gdb-page-bm-buttons {
    display: flex;
    align-items: center;

    & > :global(.gdb-button) {
      margin: 0 $space-s 0 0;
    }
  }

  .gdb-page-bm-buttons.right {
    text-align: right;

    & > :global(.gdb-button) {
      margin: 0 0 0 $space-s;
    }
  }
</style>

<div class="gdb-page-bm-buttons" class:right={align == "right"}>
  <slot />
</div>
