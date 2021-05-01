<script lang="ts">
  import Button from "../../../../components/buttons/Button.svelte";
  import IconTextButton from "../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
  import SpacedButtons from "../../../../components/buttons/SpacedButtons.svelte";
  import ContactMe from "../../../../components/ContactMe.svelte";
  import type { DetailedTask } from "../../../_stores/tasksApi";
  import { TaskType } from "../../../_stores/tasksApi";
  import { getModuleImageHref } from "../../../_types/modules";
  import TaskTile from "./TaskTile.svelte";

  export let task: DetailedTask;
  export let isAssignedTask: boolean;

  $: moduleImageHref = getModuleImageHref(task.moduleType);
</script>

<style type="text/scss">
  @import "../../../../styles/_variables.scss";
  .gdb-dialog-title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .gdb-dialog-image {
    max-width: 240px;
    max-height: 166px;
    float: left;
    margin: $space-m;
  }

  .gdb-dialog-completion {
    clear: both;
    margin-top: $space-m;
    padding: 0 0 $space-m 0;
    border-top: 1px dashed $cs-grey-1;
    border-bottom: 1px dashed $cs-grey-1;
    color: $text-color-light;

    & > p {
      font-style: italic;
    }
  }

  .gdb-dialog-instructions {
    padding-top: $space-m;
    line-height: 1.6rem;
  }
</style>

<div class="gdb-dialog-contents">
  <div class="gdb-dialog-title">
    <h1>{task.title}</h1>
    <SpacedButtons>
      {#if isAssignedTask}
        <IconTextButton
          icon={PredefinedIcons.Unpin}
          value="Unpin as active task"
          buttonStyle="primary-outline"
          on:click={() => {}} />
      {:else}
        <IconTextButton
          icon={PredefinedIcons.Pin}
          value="Pin as active task"
          buttonStyle="primary-outline"
          on:click={() => {}} />
      {/if}
      <Button value={`Go to ${task.moduleName}`} buttonStyle="primary" on:click={() => {}} />
    </SpacedButtons>
  </div>
  <div class="gdb-dialog-instructions">
    <img class="gdb-dialog-image" src={moduleImageHref} alt={task.moduleName} />
    {#if task.taskType == TaskType.Concept}
      <p>The first step for your new game is probably already done: coming up with an idea.</p>

      <p>
        LaunchReady has created initial todo items for setting up your project goals and early business details. This
        one doesn't have any extra work, check out the tips below and then mark it as Complete below.
      </p>

      <h2>Tips</h2>
      <p>Working with todo items after this one:</p>
      <ul>
        <li>You can "pin" an item to the top bar for easy access</li>
        <li>The "Go to" button will take you directly to the appropriate module</li>
        <li>You judge when you have completed a task, use the button below to mark it Complete</li>
        <li>Completing all items will advance your game's planning stage and unlock later items</li>
        <li>Use "View all tasks" on the dashboard to re-open or review any past tasks</li>
        <li>Custom and unique tasks will be available later, as you plan further</li>
      </ul>
      <p />
    {:else if task.taskType == TaskType.Goals}
      <p />
    {:else if task.taskType == TaskType.Groundwork}
      <p />
    {:else if task.taskType == TaskType.BusinessModel}
      <p />
    {:else if task.taskType == TaskType.RiskAnalysis}
      <p />
    {:else if task.taskType == TaskType.ProjectPlan}
      <p />
    {:else if task.taskType == TaskType.CostForecast}
      <p />
    {:else if task.taskType == TaskType.Comparables}
      <p />
    {:else if task.taskType == TaskType.ProfitForecast}
      <p />
    {:else if task.taskType == TaskType.MarketingStrategy}
      <p />
    {:else}
      <p>I'm sorry, you have selected a task that I didn't put details in for yet.</p>
      <p>
        This should have fired an immediate error notification to me, none of your informations, this is purely an
        oversight on my end. Please <ContactMe /> if this is blocking you so I can help out.
      </p>
    {/if}
  </div>
  <div class="gdb-dialog-completion">
    {#if task.taskType == TaskType.Concept}
      <p>Excellent, all done! Go ahead and mark this task as Complete.</p>
    {:else}
      <p>Finished with the planning for this task? Mark it complete here.</p>
    {/if}
    <SpacedButtons>
      <Button value="This Task Is Complete" buttonStyle="primary-outline" disabled={true} on:click={() => {}} />
      <!-- <Button value="Skip (Close without doing)" buttonStyle="primary-outline" disabled={true} on:click={() => {}} /> -->
    </SpacedButtons>
  </div>
</div>
