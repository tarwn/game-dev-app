<script lang="ts">
  import { url } from "@sveltech/routify";
</script>

<style type="text/scss">
  @import "../styles/_variables.scss";

  .gdb-screen {
    display: grid;
    grid-template-columns: [start] 15rem [start-content] auto [end];
    grid-template-rows: [top] 3rem [top-content] auto [bottom];
    height: 100vh;
    width: 100vw;
  }
  .gdb-header {
    display: block;
    grid-column-start: start-content;
    grid-column-end: end;
    grid-row-start: top;
    grid-row-end: top-content;
    border: 1px solid #ddd;
  }
  .gdb-top-left {
    display: block;
    grid-column-start: start;
    grid-column-end: start-content;
    grid-row-start: top;
    grid-row-end: top-content;
    background-color: $color-background-dark;
    color: $text-color-inverse;
  }
  .gdb-sidebar {
    display: block;
    grid-column-start: start;
    grid-column-end: start-content;
    grid-row-start: top-content;
    grid-row-end: bottom;
    background-color: $color-background-dark;
    color: $text-color-inverse;
  }
  .gdb-content {
    display: block;
    grid-column-start: start-content;
    grid-column-end: end;
    grid-row-start: top-content;
    grid-row-end: bottom;
  }
</style>

<div class="gdb-screen">
  <div class="gdb-top-left" />
  <div class="gdb-header">
    <div class="gdb-selected-game">Game Name</div>
    <nav class="gdb-header-links">
      <ul>
        <li><a href={$url('/')}>Home</a></li>
        <li><a href={$url('../examples')}>Examples</a></li>
        <li><a href={$url('../examples/:id', { id: 1 })}>Example 1</a></li>
      </ul>
    </nav>
  </div>
  <div class="gdb-sidebar">
    <nav>
      <ul>
        <li><a href={$url('/')}>Home</a></li>
        <li><a href={$url('../examples')}>Examples</a></li>
        <li><a href={$url('../examples/:id', { id: 1 })}>Example 1</a></li>
      </ul>
    </nav>
  </div>
  <div class="gdb-content">
    <slot />
  </div>
</div>
