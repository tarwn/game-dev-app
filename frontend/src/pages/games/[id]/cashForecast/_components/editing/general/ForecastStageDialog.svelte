<script lang="ts">
  import { getContext } from "svelte";
  import Button from "../../../../../../../components/buttons/Button.svelte";
  import IconTextButton from "../../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../../components/buttons/PredefinedIcons";
  import SpacedButtons from "../../../../../../../components/buttons/SpacedButtons.svelte";
  import Dropdown from "../../../../../../../components/inputs/Dropdown.svelte";
  import LabeledInput from "../../../../../../../components/inputs/LabeledInput.svelte";
  import { ForecastStage, ForecastStages } from "../../../_types/cashForecast";

  const { close } = getContext("simple-modal");

  export let currentStage: ForecastStage;
  export let onOkay: (newValue: ForecastStage) => void;

  $: internalStage = currentStage;
  $: forecastStageText = ForecastStages.find((f) => f.id == currentStage)?.name;

  function onClickOkay() {
    onOkay(internalStage);
    close();
  }

  function onCloseClick() {
    close();
  }
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  h2 {
    font-weight: bold;
    margin-right: 2rem;
  }

  .gdb-dialog-form {
    margin: $space-m 0;
  }
  .gdb-dialog-input {
    max-width: 16rem;
  }
</style>

<div>
  <h2>Advance the Forecast Stage</h2>
  <p>Select the stage you want to advance to.</p>
  <div class="gdb-dialog-form">
    <div class="gdb-dialog-input">
      <p>Current Stage: <b>{forecastStageText}</b></p>
      <LabeledInput label="Forecast Stage" vertical={true}>
        <Dropdown
          options={ForecastStages}
          value={internalStage}
          on:change={({ detail }) => (internalStage = detail.value)} />
      </LabeledInput>
    </div>
  </div>
  <p>There are four forecast stages:</p>
  <ol>
    <li>Viability (Cost) - Can I afford to build this?</li>
    <li>Viability (Sales) - Can it reach my goals?</li>
    <li>Execution - Building the project (and seeking funding, optionally)</li>
    <li>Post Launch - Supporting and growing the game after launch</li>
  </ol>
  <p>You will not lose any data by changing stage, but some instructions and tabs will update to reflect the stage.</p>

  <SpacedButtons align="right">
    <Button value="Close without Changing" buttonStyle="primary-outline" on:click={onCloseClick} />
    <IconTextButton icon={PredefinedIcons.Next} value="Apply New Date" buttonStyle="primary" on:click={onClickOkay} />
  </SpacedButtons>
</div>
