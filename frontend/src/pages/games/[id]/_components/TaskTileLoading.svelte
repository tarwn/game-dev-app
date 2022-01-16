<script lang="ts">
</script>

<style lang="scss">
  @import "../../../../styles/_variables.scss";
  @import "../../../../styles/mixins/_loadingPulse.scss";

  // specific to loading version
  .gdb-tile-container {
    opacity: 0.6;
  }

  .gdb-tile-container,
  .gdb-tile {
    display: inline-block;
  }

  .gdb-tile-title {
    @include loading-pulse;
    margin-bottom: $space-m;
  }

  .gdb-tile-description {
    display: flex;
    flex-direction: column;
  }

  .gdb-tile-description-line {
    @include loading-pulse;
    display: inline-block;
    width: 90%;
    height: 1em;
    margin-bottom: $space-m;

    & + .gdb-tile-description-line {
      width: 90%;
    }

    & + .gdb-tile-description-line + .gdb-tile-description-line {
      width: 50%;
    }
  }

  // selectively copied from tile
  .gdb-tile {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    width: 200px;
    height: 200px;
    background-color: white;
    border-right: 1px solid $cs-grey-1;
    text-decoration: none;

    border-radius: 4px;
    margin-bottom: $space-s;
    background: $color-background-white;
    box-shadow: $shadow-main;

    overflow: hidden;

    opacity: 0.8;
    box-shadow: none;
  }

  .gdb-tile-container + :global(.gdb-tile-container),
  .gdb-tile-container + :global(.gdb-popup-placeholder) {
    margin-left: $space-xl;
  }

  $badge-size: 75px;

  .gdb-tile-content {
    display: flex;
    flex-direction: column;
    flex: 1 0 0;
    max-width: 200px;
    max-height: 166px;

    padding: $space-m;
  }

  .gdb-tile-module {
    flex: 0 0 0;
    background-color: $cs-grey-5;
    color: $text-color-inverse;
    text-transform: uppercase;
    text-align: center;
    padding: $space-s;
    z-index: 6;
  }
</style>

<div class="gdb-tile-container">
  <div class="gdb-tile">
    <div class="gdb-tile-content">
      <div class="gdb-tile-title">Loading...</div>
      <div class="gdb-tile-description">
        <div class="gdb-tile-description-line" />
        <div class="gdb-tile-description-line" />
        <div class="gdb-tile-description-line" />
      </div>
    </div>
    <div class="gdb-tile-module">Loading...</div>
  </div>
  <div class="gdb-due-date">&nbsp;</div>
</div>
