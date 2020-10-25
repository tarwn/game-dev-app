<script lang="ts">
  import { params } from "@sveltech/routify";
  $: id = $params.id;
</script>

<style type="text/scss">
  @import "../../../styles/_variables.scss";
</style>

<div class="gdp-page-game">
  <div class="gdb-page-header">
    <div>game: {id}</div>
    <div>breadcrumbs</div>
    <div>buttons</div>
  </div>
  <div class="gdb-page-content">
    <slot />
  </div>
</div>
