<script type="ts">
  import type {
    IBusinessModel,
    IBusinessModelCost,
  } from "../../_types/businessModel";
  import SummarySection from "./components/SummarySection.svelte";

  export let businessModel: IBusinessModel | null;

  function summarizePrePost(cost: IBusinessModelCost) {
    if (cost.isPreLaunch.value && cost.isPostLaunch.value) {
      return "Pre + Post";
    }
    if (cost.isPreLaunch.value) {
      return "Pre-Launch.";
    }
    if (cost.isPostLaunch.value) {
      return "Post-Launch.";
    }
    return "Other";
  }

  function summarizeType(type: string) {
    switch (type) {
      case "onetime":
        return "One Time";
      case "monthly":
        return "Monthly";
      case "annual":
        return "Annually";
      case "percent":
        return "% of Revenue";
      default:
        return "Other";
    }
  }
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  // IMPORTANT: these styles are in `em` because we change the font size drastically
  //            for mini-map

  .gdb-summary-cost-list {
    margin: 0.5em 0 0.5em 2em;
    padding: 0 0 0 0em;
    list-style-position: outside;
    color: $cs-grey-3;
  }

  .gdb-summary-cost-list-li {
    color: $text-color-default;
    margin: 0.5em 0;
    &::marker {
      color: $cs-grey-1;
    }
  }

  .gdb-summary-cost-pp,
  .gdb-summary-cost-type {
    display: inline-block;
    width: 7em;
    margin-right: 0.25em;
    border: 1px solid $cs-grey-1;
    text-align: center;
    color: $text-color-light;
    font-size: 0.9em;
    padding: 0.1em;
  }
</style>

{#if businessModel != null}
  <div>
    {#if businessModel.costStructure.list.length > 0}
      <SummarySection label="">
        <ul class="gdb-summary-cost-list">
          {#each businessModel.costStructure.list as cost (cost.globalId)}
            <li class="gdb-summary-cost-list-li">
              <span class="gdb-summary-cost-pp">{summarizePrePost(cost)}</span>
              <span
                class="gdb-summary-cost-type">{summarizeType(cost.type.value)}</span>
              <span class="gdb-summary-cost-summary">{cost.summary.value}</span>
            </li>
          {/each}
        </ul>
      </SummarySection>
    {/if}
  </div>
{/if}
