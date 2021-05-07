<script lang="ts">
  import Button from "../../../../components/buttons/Button.svelte";
  import IconTextButton from "../../../../components/buttons/IconTextButton.svelte";
  import LinkAsButton from "../../../../components/buttons/LinkAsButton.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
  import SpacedButtons from "../../../../components/buttons/SpacedButtons.svelte";
  import ContactMe from "../../../../components/ContactMe.svelte";
  import type { DetailedTask } from "../../../_stores/tasksApi";
  import { TaskType, tasksApi } from "../../../_stores/tasksApi";
  import { getModuleImageHref } from "../../../_types/modules";
  import BusinessModelTaskDialog from "./taskDialogContent/BusinessModelTaskDialog.svelte";
  import ComparablesTaskDialog from "./taskDialogContent/ComparablesTaskDialog.svelte";
  import ConceptTaskDialog from "./taskDialogContent/ConceptTaskDialog.svelte";
  import CostForecastDialog from "./taskDialogContent/CostForecastDialog.svelte";
  import GoalsTaskDialog from "./taskDialogContent/GoalsTaskDialog.svelte";
  import GroundworkTaskDialog from "./taskDialogContent/GroundworkTaskDialog.svelte";
  import MarketingPlanDialog from "./taskDialogContent/MarketingPlanDialog.svelte";
  import ProfitForecastDialog from "./taskDialogContent/ProfitForecastDialog.svelte";
  import ProjectPlanDialog from "./taskDialogContent/ProjectPlanDialog.svelte";
  import RiskAnalysisDialog from "./taskDialogContent/RiskAnalysisDialog.svelte";

  export let task: DetailedTask;
  export let isAssignedTask: boolean;

  $: moduleImageHref = getModuleImageHref(task.moduleType);

  $: futureIsAssignedTask = isAssignedTask;
  $: isSaving = futureIsAssignedTask != isAssignedTask;
  function pinTask() {
    futureIsAssignedTask = true;
    tasksApi.assignTask(task.gameId, task.id);
  }

  function unpinTask() {
    futureIsAssignedTask = false;
    tasksApi.unassignTask(task.gameId, task.id);
  }
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
          spinIcon={isSaving}
          value="Unpin as active task"
          buttonStyle="primary-outline"
          on:click={unpinTask} />
      {:else}
        <IconTextButton
          icon={PredefinedIcons.Pin}
          spinIcon={isSaving}
          value="Pin as active task"
          buttonStyle="primary-outline"
          on:click={pinTask} />
      {/if}
      <LinkAsButton
        value={`Go to ${task.moduleName}`}
        buttonStyle="primary"
        title={`Go to ${task.moduleName}`}
        href={task.moduleHref}
        on:click />
    </SpacedButtons>
  </div>
  <div class="gdb-dialog-instructions">
    <img class="gdb-dialog-image" src={moduleImageHref} alt={task.moduleName} />
    {#if task.taskType == TaskType.Concept}
      <ConceptTaskDialog />
    {:else if task.taskType == TaskType.Goals}
      <GoalsTaskDialog />
    {:else if task.taskType == TaskType.Groundwork}
      <GroundworkTaskDialog />
    {:else if task.taskType == TaskType.BusinessModel}
      <BusinessModelTaskDialog />
    {:else if task.taskType == TaskType.RiskAnalysis}
      <RiskAnalysisDialog />
    {:else if task.taskType == TaskType.ProjectPlan}
      <ProjectPlanDialog />
    {:else if task.taskType == TaskType.CostForecast}
      <CostForecastDialog />
    {:else if task.taskType == TaskType.Comparables}
      <ComparablesTaskDialog />
    {:else if task.taskType == TaskType.ProfitForecast}
      <ProfitForecastDialog />
    {:else if task.taskType == TaskType.MarketingStrategy}
      <MarketingPlanDialog />
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
