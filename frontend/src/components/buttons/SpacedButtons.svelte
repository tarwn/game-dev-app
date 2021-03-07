<script lang="ts">
  export let align: string = "";
</script>

<style>
  @import "../../styles/_variables.scss";
  .gdb-page-bm-buttons.right {
    text-align: right;
  }
</style>

<div class="gdb-page-bm-buttons" class:right={align == "right"}>
  <slot />
</div>
