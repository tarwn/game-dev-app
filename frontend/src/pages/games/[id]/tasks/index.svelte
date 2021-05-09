<script lang="ts">
  import { metatags, params } from "@sveltech/routify";
  import { onDestroy } from "svelte";
  import ButtonWithPopup from "../../../../components/buttons/ButtonWithPopup.svelte";
  import ScreenTitle from "../../../../components/layout/ScreenTitle.svelte";
  import { log } from "../../../../utilities/logger";
  import { UpdateScope } from "../../../_communications/UpdateScope";
  import WebSocketChannel from "../../../_communications/WebSocketChannel.svelte";
  import type { UserProfile } from "../../../_stores/profileApi";
  import { profileStore } from "../../../_stores/profileStore";
  import type { DetailedTask, Task } from "../../../_stores/tasksApi";
  import { TaskType } from "../../../_stores/tasksApi";
  import { activeTaskStore, allTasksStore } from "../../../_stores/tasksStore";
  import { GameStatus } from "../../../_stores/types";
  import { isModuleAvailable } from "../../../_types/modules";
  import TaskTile from "../_components/TaskTile.svelte";
  import TaskTileLoading from "../_components/TaskTileLoading.svelte";
  import TaskTileRecurringPlaceholder from "../_components/TaskTileRecurringPlaceholder.svelte";
  import TasksWitp from "./_components/TasksWITP.svelte";

  // page title
  metatags.title = "[LR] Cash Forecast";

  // params
  $: id = $params.id;
  let initializedId = null;

  $: {
    if (id != null && id != initializedId) {
      initializedId = id;
      allTasksStore.load(initializedId);
    }
  }

  // user profile data
  let latestProfile: null | UserProfile = null;
  var unsubscribe2 = profileStore.subscribe((p) => {
    if (p != null) latestProfile = p;
  });

  // all tasks data
  let allTasks: null | DetailedTask[] = null;
  var unsubscribe3 = allTasksStore.subscribe((t) => {
    if (id != t.gameId) return;
    allTasks = t.tasks;
    log("Tasks received", { allTasks });
  });

  $: ideaTasks = allTasks == null ? null : allTasks.filter((t) => t.gameStatus == GameStatus.Idea);
  $: planningTasks = allTasks == null ? null : allTasks.filter((t) => t.gameStatus == GameStatus.Planning);
  $: devTasks = allTasks == null ? null : allTasks.filter((t) => t.gameStatus == GameStatus.Developing);
  $: liveTasks = allTasks == null ? null : allTasks.filter((t) => t.gameStatus == GameStatus.Live);

  // active tasks
  let activeTask: { gameId: string | null; task: Task | null };
  const unsubscribe4 = activeTaskStore.subscribe((t) => (activeTask = t ?? { gameId: null, task: null }));

  onDestroy(() => {
    unsubscribe2();
    unsubscribe3();
    unsubscribe4();
  });
</script>

<style type="text/scss">
  @import "../../../../styles/_variables.scss";

  $tile-width: 200px;

  .gdb-task-timeline {
    display: flex;
    flex-direction: row;

    .gdb-task-column {
      margin-top: $space-m;
      padding: $space-s $space-l;
      display: flex;
      flex-direction: column;

      & > h2 {
        margin-left: $space-m;
        margin-bottom: $space-m;
      }

      & > .row {
        display: grid;
        grid-auto-flow: column;
        grid-template-rows: repeat(4, $tile-width + 16px + 16px);
      }

      & + .gdb-task-column {
        border-left: 2px dashed $cs-blue-1;
      }
    }

    .gdb-task-column-idea {
      width: auto;
      flex: 1 0 auto;
    }

    .gdb-task-column-planning {
      width: auto;
      flex: 2 0 auto;
    }

    .gdb-task-column-dev {
      width: auto;
      flex: 2 0 auto;
    }

    .gdb-task-column-live {
      width: auto;
      flex: 2 0 auto;
    }
  }

  .gdb-task-timeline :global(.gdb-tile-container) {
    margin: $space-m;
  }
</style>

<WebSocketChannel
  updateScope={UpdateScope.GameTasks}
  gameId={id}
  on:receive={(e) => {
    log("WebSocketChannel-GameTasks", e.detail);
    allTasksStore.load(id);
    activeTaskStore.notifyOfUpdate(id, e.detail.taskId);
  }} />

<ScreenTitle title="All Tasks">
  {#if latestProfile}
    <ButtonWithPopup
      buttonStyle="primary-outline-circle"
      label="?"
      buttonTitle="Help: How to use this screen"
      ariaLabel="Help: How to use this screen"
      forceOpen={false}
      on:close={() => null}>
      <TasksWitp />
    </ButtonWithPopup>
  {/if}
</ScreenTitle>

<div class="gdb-task-timeline">
  <div class="gdb-task-column gdb-task-column-idea">
    <h2>Idea</h2>
    {#if allTasks}
      <div class="row">
        {#each ideaTasks as task (task.id)}
          <div>
            <TaskTile
              {task}
              isAssignedTask={task.id == activeTask?.task?.id}
              disabled={!isModuleAvailable(task.moduleType) && task.taskType !== TaskType.Concept} />
          </div>
        {/each}
      </div>
    {:else}
      <TaskTileLoading />
      <TaskTileLoading />
      <TaskTileLoading />
      <TaskTileLoading />
      <TaskTileLoading />
    {/if}
  </div>
  <div class="gdb-task-column gdb-task-column-planning">
    <h2>Planning</h2>
    {#if allTasks}
      <div class="row">
        {#each planningTasks as task (task.id)}
          <div>
            <TaskTile
              {task}
              isAssignedTask={task.id == activeTask?.task?.id}
              disabled={!isModuleAvailable(task.moduleType) && task.taskType !== TaskType.Concept} />
          </div>
        {/each}
      </div>
    {:else}
      <TaskTileLoading />
      <TaskTileLoading />
      <TaskTileLoading />
      <TaskTileLoading />
      <TaskTileLoading />
    {/if}
  </div>
  <div class="gdb-task-column gdb-task-column-dev">
    <h2>Development</h2>
    {#if allTasks}
      {#if devTasks.length > 0}
        <div class="row">
          {#each devTasks as task (task.id)}
            <div>
              <TaskTile
                {task}
                isAssignedTask={task.id == activeTask?.task?.id}
                disabled={!isModuleAvailable(task.moduleType) && task.taskType !== TaskType.Concept} />
            </div>
          {/each}
        </div>
      {/if}
      <div class="row">
        <TaskTileRecurringPlaceholder
          title="Validation Task(s)"
          moduleName="External Task"
          description="Future prototype feedback or player research, TBD." />
        <TaskTileRecurringPlaceholder
          title="Marketing Task"
          moduleName="External Task(s)"
          description="Scheduled and recurring tasks from your marketing plan." />
        <TaskTileRecurringPlaceholder
          title="Budget Update"
          moduleName="Cash Forecast"
          description="Monthly or bi-monthly update of your budget numbers in the Cash Forecast" />
        <TaskTileRecurringPlaceholder
          title="Business Review"
          moduleName="Business Model"
          description="Recurring (1-3mo) review of the business model to update from progress/research" />
      </div>
    {:else}
      <TaskTileLoading />
      <TaskTileLoading />
      <TaskTileLoading />
      <TaskTileLoading />
      <TaskTileLoading />
    {/if}
  </div>
  <div class="gdb-task-column gdb-task-column-live">
    <h2>Released</h2>
    {#if allTasks}
      {#if devTasks.length > 0}
        <div class="row">
          {#each liveTasks as task (task.id)}
            <div>
              <TaskTile
                {task}
                isAssignedTask={task.id == activeTask?.task?.id}
                disabled={!isModuleAvailable(task.moduleType) && task.taskType !== TaskType.Concept} />
            </div>
          {/each}
        </div>
      {/if}
      <div class="row">
        <TaskTileRecurringPlaceholder
          title="Marketing Task(s)"
          moduleName="External Task(s)"
          description="Scheduled and recurring tasks from your marketing plan." />
        <TaskTileRecurringPlaceholder
          title="Budget Update"
          moduleName="Cash Forecast"
          description="Monthly or bi-monthly update of your budget numbers in the Cash Forecast" />
        <TaskTileRecurringPlaceholder
          title="Sales Planning"
          moduleName="External"
          description="Ongoing tasks for planning and tracking store sales" />
      </div>
    {:else}
      <TaskTileLoading />
      <TaskTileLoading />
      <TaskTileLoading />
      <TaskTileLoading />
      <TaskTileLoading />
    {/if}
  </div>
</div>
