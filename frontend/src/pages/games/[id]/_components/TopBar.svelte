<script lang="ts">
  import { isActive } from "@sveltech/routify";
  import { onDestroy } from "svelte";
  import AnythingWithPopup from "../../../../components/buttons/AnythingWithPopup.svelte";
  import Icon from "../../../../components/buttons/Icon.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
  import PageTop from "../../../../components/layout/PageTop.svelte";
  import type { DetailedTask } from "../../../_stores/tasksApi";
  import TaskTileDialog from "./TaskTileDialog.svelte";
  export let icon: string;
  export let id: string;
  export let name: string;
  export let assignedTask: DetailedTask | null;

  let breadcrumbs = [];
  $: {
    const dashboard = { name: "Dashboard", path: `/games/${id}` };
    if ($isActive(`/games/${id}/businessModel`)) {
      breadcrumbs = [
        dashboard,
        {
          name: "Business Plan",
          path: `/games/${id}/businessModel`,
        },
      ];
    } else if ($isActive(`/games/${id}/cashForecast`)) {
      breadcrumbs = [
        dashboard,
        {
          name: "Cash Forecast",
          path: `/games/${id}/cashForecast`,
        },
      ];
    } else {
      breadcrumbs = [dashboard];
    }
  }

  // task popup details
  let isOpen = false;
  let buttonElem: any;

  function open() {
    isOpen = true;
  }

  function close() {
    isOpen = false;
    // aria - set the focus to the button they clicked to open the modal
    if (assignedTask) {
      buttonElem.focus();
    }
  }

  onDestroy(() => {
    close();
  });
</script>

<style type="text/scss">
  @import "../../../../styles/_variables.scss";

  .gdb-breadcrumb {
    margin: 0 $space-s;
  }

  .gdb-assigned-task-area {
    margin-left: 2 * $space-xl;
    display: inline-block;
  }

  .gdb-assigned-task-empty {
    // these styles are similarly reflected from ToDo list in Dashboard for the empty todo item
    border-radius: 4px;
    border: 2px dashed $cs-grey-1;
    opacity: 0.4;
    padding: 0 $space-l 0 $space-l;
  }

  .gdb-pinned-button {
    position: relative;
    display: flex;
    flex-direction: row;
    // padding: 0px;
    overflow: hidden;
    background-color: white;

    border-right: 16px solid $cs-grey-5;
    opacity: 0.9;

    &:hover {
      background-color: $color-accent-1-lightest;
      box-shadow: $shadow-main-hover;
      opacity: 1;

      & > .gdb-task-icon {
        opacity: 0.8;
      }
    }

    &:active {
      background-color: $color-accent-1-lighter;
      box-shadow: $shadow-main;
      opacity: 1;
    }
  }

  .gdb-task-icon {
    position: relative;
    opacity: 0.65;
    width: 32px + 8px + 8px;
    height: 32px + 8px + 8px;
    line-height: 32px + 8px + 8px;
    text-align: center;
    font-size: 24px;
    border: 2px solid $cs-green-3;
    background-color: $cs-green-1;
    color: $cs-green-4;
    border-radius: 50%;
    margin-top: -10px;
    margin-bottom: -10px;
    margin-left: -24px;
    margin-right: $space-m;
  }

  .gdb-task-subtitle {
    padding: 0 $space-s 0 0;
    color: $text-color-light;
    font-size: $font-size-small;
  }
</style>

<PageTop {icon} {name}>
  {#each breadcrumbs as breadcrumb, i}
    /<a href={breadcrumb.path} class:disabled={false && i == breadcrumbs.length - 1} class="gdb-breadcrumb"
      >{breadcrumb.name}</a>
  {/each}
  <div class="gdb-assigned-task-area">
    {#if assignedTask == null}
      <div class="gdb-assigned-task-empty">no pinned todo item yet</div>
    {:else}
      <AnythingWithPopup ariaLabel="View details" {isOpen} on:close={close} borderStyle="task">
        <div slot="button">
          <button on:click={open} bind:this={buttonElem} class="gdb-pinned-button gdb-button">
            <div class="gdb-task-icon"><Icon icon={PredefinedIcons.CommunicationStar} /></div>
            <div class="gdb-task-subtitle">Pinned:</div>
            <div class="gdb-task-title">{assignedTask.title}</div>
          </button>
        </div>
        <TaskTileDialog task={assignedTask} isAssignedTask={true} />
      </AnythingWithPopup>
    {/if}
  </div>
</PageTop>
