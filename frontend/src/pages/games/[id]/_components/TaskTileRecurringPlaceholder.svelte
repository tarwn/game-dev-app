<script lang="ts">
  import Icon from "../../../../components/buttons/Icon.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";

  export let title: string;
  export let description: string;
  export let moduleName: string;
</script>

<style lang="scss">
  @import "../../../../styles/_variables.scss";

  .gdb-tile {
    opacity: 0.4;
  }

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
    white-space: normal;

    // button specific things
    // cursor: pointer;
    padding: 0px;
    border-width: 0 1px 0 0;
  }

  $badge-size: 75px;

  .gdb-tile-content {
    display: flex;
    flex-direction: column;
    flex: 1 0 0;
    max-width: 200px;
    max-height: 166px;

    padding: $space-m;

    .gdb-tile-title {
      text-align: left;
      font-weight: bold;
      margin: $space-xs 0 $space-s 0;
    }

    .gdb-tile-description {
      flex: 1 0 0;
      text-align: left;
      overflow-y: hidden;
      white-space: normal;
    }

    .gdb-tile-cutout {
      shape-outside: circle(50% at 85% 95%);
      float: right;
      width: $badge-size;
      height: 100%;
      // background-color: red;
      // clip-path: circle(50% at 85% 95%);
    }
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

  .gdb-due-date {
    color: $text-color-light;
    text-align: center;
    font-size: 80%;
    opacity: 0.8;
  }

  .gdb-tile-status {
    position: absolute;
    bottom: 15px;
    right: -10px;
    z-index: 5;

    border-radius: 50%;
    width: $badge-size;
    height: $badge-size;
    line-height: $badge-size;
    text-align: center;
    background-color: $cs-grey-2;
    color: $cs-grey-5;

    font-size: 40px;

    opacity: 0.8;

    &.gdb-tile-status-clock {
      border: 2px solid $cs-grey-2;
      background-color: $cs-grey-1;
      color: $cs-grey-3;
      opacity: 0.9;
      opacity: 0.9;
    }

    // &.gdb-tile-status-ready {
    //   border: 2px solid $cs_blue;
    //   background-color: $cs_lightblue;
    //   color: $cs_blue;
    //   opacity: 0.9;
    //   opacity: 0.9;
    // }

    // &.gdb-tile-status-selected {
    //   border: 2px solid $cs-green-3;
    //   background-color: $cs-green-1;
    //   color: $cs-green-4;
    // }

    // &.gdb-tile-status-overdue {
    //   border: 2px solid $cs-red;
    //   background-color: $cs-red-1;
    //   color: $cs-red;
    //   opacity: 0.9;
    // }

    // &.gdb-tile-status-none {
    //   // border: 2px solid $cs_blue;
    //   // background-color: $cs_lightblue;
    //   color: $cs_lightblue;
    //   opacity: 0.9;
    // }

    // .gdb-tile:hover & {
    //   opacity: 0.5;
    // }

    // .gdb-tile.disabled:hover & {
    //   opacity: 0.9;
    // }
  }
</style>

<div class="gdb-tile-container">
  <div class="gdb-tile">
    <div class="gdb-tile-content">
      <div class="gdb-tile-title">{title}</div>
      <div class="gdb-tile-description">
        <div class="gdb-tile-cutout" />
        <div class="gdb-tile-description-text">
          {description}
        </div>
      </div>
    </div>
    <div class="gdb-tile-status gdb-tile-status-clock"><Icon icon={PredefinedIcons.CommunicationClock} /></div>
    <div class="gdb-tile-module">{moduleName}</div>
  </div>
  <div class="gdb-due-date" />
</div>
