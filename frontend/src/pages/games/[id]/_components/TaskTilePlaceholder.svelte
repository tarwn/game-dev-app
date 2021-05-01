<script lang="ts">
  import Icon from "../../../../components/buttons/Icon.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
</script>

<style type="text/scss">
  @import "../../../../styles/_variables.scss";

  .gdb-tile {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    width: 200px;
    height: 200px;
    background-color: transparent;
    text-decoration: none;
    margin-bottom: $space-m;

    overflow: hidden;

    // thee styles are similarly reflected in TopBar for the empty todo item
    border-radius: 4px;
    border: 4px dashed $cs-grey-1;
    opacity: 0.6;

    justify-content: center;

    // extend slightly outside normal tile height
    margin-top: -$space-xs;
  }

  .gdb-placeholder-icon {
    display: inline-block;
    padding: $space-s $space-l;
    font-size: 36px;
    color: $cs-grey-1;
    text-align: center;
  }

  .gdb-placeholder-text {
    padding: $space-s $space-l;
    text-align: center;
    color: $cs-grey-3;
  }

  .gdb-tile-container + :global(.gdb-tile-container) {
    margin-left: $space-xl;
  }
</style>

<div class="gdb-tile-container">
  <div class="gdb-tile">
    <div class="gdb-placeholder-icon"><Icon icon={PredefinedIcons.Check} /></div>
    <div class="gdb-placeholder-text">More will load once all items to the left are complete.</div>
  </div>
  <div class="gdb-due-date" />
</div>
