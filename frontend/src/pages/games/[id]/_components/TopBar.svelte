<script lang="ts">
  import { isActive } from "@sveltech/routify";
  import PageTop from "../../../../components/layout/PageTop.svelte";
  import type { Task } from "../../../_stores/tasksApi";
  export let icon: string;
  export let id: string;
  export let name: string;
  export let assignedTask: Task | null;

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
      Not empty
    {/if}
  </div>
</PageTop>
