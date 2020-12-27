<script lang="ts">
  import type {
    IBusinessModel,
    IBusinessModelCost,
  } from "../../_types/businessModel";
  import InputPanel from "../InputPanel.svelte";
  import Row from "../../../../../../components/inputs/Row.svelte";
  import {
    businessModelEventStore,
    events,
  } from "../../_stores/businessModelStore";
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import type { Identified } from "../../../../../_stores/eventStore/types";

  export let businessModel: IBusinessModel;

  $: hasMinimumInfo = businessModel.costStructure.list.length > 0;

  function handleCostDelete(cost: Identified) {
    businessModelEventStore.addEvent(
      events.DeleteCost({
        parentId: cost.parentId,
        globalId: cost.globalId,
      })
    );
  }

  function handleTypeChange(cost: IBusinessModelCost, e: any) {
    businessModelEventStore.addEvent(
      events.UpdateCostType({
        parentId: cost.type.parentId,
        globalId: cost.type.globalId,
        value: e.target?.value,
      })
    );
  }

  function handleSummaryChange(cost: IBusinessModelCost, e: any) {
    businessModelEventStore.addEvent(
      events.UpdateCostSummary({
        parentId: cost.summary.parentId,
        globalId: cost.summary.globalId,
        value: e.target?.value,
      })
    );
  }

  function handlePreLaunchChange(cost: IBusinessModelCost, e: any) {
    businessModelEventStore.addEvent(
      events.UpdateCostIsPreLaunch({
        parentId: cost.summary.parentId,
        globalId: cost.summary.globalId,
        value: e.target?.checked,
      })
    );
  }

  function handlePostLaunchChange(cost: IBusinessModelCost, e: any) {
    businessModelEventStore.addEvent(
      events.UpdateCostIsPostLaunch({
        parentId: cost.summary.parentId,
        globalId: cost.summary.globalId,
        value: e.target?.checked,
      })
    );
  }
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-cost-list {
    margin: 0;
    list-style-type: disc;
    margin-left: 4rem; // matches label min-size padding
    padding-left: $space-s; // matches label.text min-size padding
  }
  .gdb-cost-list-item {
    line-height: $line-height-base; // matches label
    margin: $space-s 0; // matches Row
  }

  .gdb-cost-list {
    margin: 0;
    padding-left: $space-m;
    list-style: none;
  }

  .gdb-cost-input-set {
    margin-left: $space-s;

    // & + button {
    //   margin-left: $space-m;
    // }
  }
</style>

<InputPanel
  title="Cost Structure"
  canUndo={false}
  canRedo={false}
  canNext={hasMinimumInfo}
  canFullscreen={true}
  on:clickFullscreen
  on:clickNext>
  <Row>
    <p>
      What are the key costs required before launch and that apply once the game
      is live?
    </p>
  </Row>
  <Row>
    <ul class="gdb-cost-list">
      {#each businessModel.costStructure.list as cost (cost.globalId)}
        <li class="gdb-cost-list-item">
          <!-- svelte-ignore a11y-no-onchange -->
          <select
            value={cost.type.value}
            on:change={(e) => handleTypeChange(cost, e)}>
            <option value="onetime">One Time</option>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
            <option value="percent">Percent of Revenue</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            class="gdb-cost-summary-input"
            value={cost.summary.value}
            id={`${cost.summary.globalId}`}
            on:change={(e) => handleSummaryChange(cost, e)} />
          <span class="gdb-cost-input-set">
            <input
              type="checkbox"
              class="gdb-cost-check-input"
              checked={cost.isPreLaunch.value}
              id={`${cost.isPreLaunch.globalId}`}
              on:change={(e) => handlePreLaunchChange(cost, e)} />
            <label for={cost.isPreLaunch.globalId}>Pre-Launch</label>
          </span>
          <span class="gdb-cost-input-set">
            <input
              type="checkbox"
              class="gdb-cost-check-input"
              checked={cost.isPostLaunch.value}
              id={`${cost.isPostLaunch.globalId}`}
              on:change={(e) => handlePostLaunchChange(cost, e)} />
            <label for={cost.isPostLaunch.globalId}>Post-Launch</label>
          </span>
          <IconTextButton
            icon={PredefinedIcons.Delete}
            value="Delete"
            buttonStyle="secondary-negative"
            on:click={() => handleCostDelete(cost)} />
        </li>
      {/each}
      <li class="gdb-entry-list-item-new">
        <IconTextButton
          icon={PredefinedIcons.Plus}
          value={businessModel.costStructure.list.length > 0 ? 'Add another Cost' : 'Add a Cost'}
          buttonStyle="primary"
          on:click={() => businessModelEventStore.addEvent(events.AddCost({
                parentId: businessModel.customers.globalId,
              }))} />
      </li>
    </ul>
  </Row>
</InputPanel>
