<script lang="ts">
  import { onDestroy } from "svelte";

  import AnythingWithPopup from "../../../../components/buttons/AnythingWithPopup.svelte";
  import Icon from "../../../../components/buttons/Icon.svelte";

  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";

  import DateSpan from "../../../../components/inputs/DateSpan.svelte";
  import type { DetailedTask } from "../../../_stores/tasksApi";
  import TaskTileDialog from "./TaskTileDialog.svelte";

  export let task: DetailedTask;
  export let disabled: boolean = false;
  export let isAssignedTask: boolean = false;
  export let force: boolean = false;

  // manage dialog popup
  let isOpen = false || force;
  let ariaLabel = "More details about this todo item";
  let buttonElem: any;

  function open() {
    isOpen = true;
  }

  function close() {
    isOpen = false;
    // aria - set the focus to the button they clicked to open the modal
    buttonElem.focus();
  }

  onDestroy(() => {
    close();
  });
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
    cursor: pointer;
    padding: 0px;
    border-width: 0 1px 0 0;

    &:hover {
      box-shadow: $shadow-main-hover;
    }
    &:active {
      box-shadow: $shadow-main;
    }

    &:focus-within {
      outline: dotted $cs_orange;
    }

    &.disabled {
      opacity: 0.8;
      box-shadow: none;
      background-color: $cs-grey-0;

      &:hover {
        box-shadow: none;
      }
      &:active {
        box-shadow: none;
      }
    }
  }

  .gdb-tile-container + :global(.gdb-tile-container),
  .gdb-tile-container + :global(.gdb-popup-placeholder) {
    margin-left: $space-xl;
  }

  // .gdb-tile-image {
  //   flex: 1 0 0;
  //   max-width: 200px;
  //   max-height: 166px;
  // }

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

    &.gdb-tile-status-ready {
      border: 2px solid $cs_blue;
      background-color: $cs_lightblue;
      color: $cs_blue;
      opacity: 0.9;
      opacity: 0.9;
    }

    &.gdb-tile-status-selected {
      border: 2px solid $cs-green-3;
      background-color: $cs-green-1;
      color: $cs-green-4;
    }

    &.gdb-tile-status-overdue {
      border: 2px solid $cs-red;
      background-color: $cs-red-1;
      color: $cs-red;
      opacity: 0.9;
    }

    // &.gdb-tile-status-none {
    //   // border: 2px solid $cs_blue;
    //   // background-color: $cs_lightblue;
    //   color: $cs_lightblue;
    //   opacity: 0.9;
    // }

    .gdb-tile:hover & {
      opacity: 0.5;
    }

    .gdb-tile.disabled:hover & {
      opacity: 0.9;
    }
  }
</style>

<AnythingWithPopup {ariaLabel} {isOpen} on:close={close} borderStyle="task">
  <div class="gdb-tile-container" slot="button">
    <button class="gdb-tile" {disabled} class:disabled on:click={open} bind:this={buttonElem}>
      <!-- <img class="gdb-tile-image" src={imgHref} alt={title} /> -->
      <div class="gdb-tile-content">
        <div class="gdb-tile-title">{task.title}</div>
        <div class="gdb-tile-description">
          <div class="gdb-tile-cutout" />
          <div class="gdb-tile-description-text">
            {task.shortDescription}
          </div>
        </div>
      </div>
      {#if isAssignedTask}
        <div class="gdb-tile-status gdb-tile-status-selected">
          <Icon icon={PredefinedIcons.Star} />
        </div>
      {:else if task.isOverdue}
        <div class="gdb-tile-status gdb-tile-status-overdue">
          <Icon icon={PredefinedIcons.InProgress} />
        </div>
      {:else}
        <div class="gdb-tile-status gdb-tile-status-ready">
          <Icon icon={PredefinedIcons.Plus} />
        </div>
      {/if}
      <div class="gdb-tile-module">{task.moduleName}</div>
    </button>
    <div class="gdb-due-date">
      {#if task.dueDate != null}
        Due by <DateSpan date={task.dueDate} style="long date" />
      {/if}
    </div>
  </div>
  <TaskTileDialog {task} {isAssignedTask} />
</AnythingWithPopup>
