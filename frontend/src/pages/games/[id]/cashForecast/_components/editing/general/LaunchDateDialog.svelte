<script lang="ts">
  import { getContext } from "svelte";
  import Button from "../../../../../../../components/buttons/Button.svelte";
  import IconTextButton from "../../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../../components/buttons/PredefinedIcons";
  import SpacedButtons from "../../../../../../../components/buttons/SpacedButtons.svelte";

  import DateInput from "../../../../../../../components/inputs/DateInput.svelte";

  import LabeledInput from "../../../../../../../components/inputs/LabeledInput.svelte";
  import { getUtcDate } from "../../../../../../../utilities/date";

  const { close } = getContext("simple-modal");

  export let currentDate: Date;
  export let onOkay: (newValue: Date) => void;

  $: internalDate = currentDate;

  function updateDateSelection(selected: Date) {
    // first of the month for easier math
    // [ch1123] - changes rev delay logic if we change this
    internalDate = getUtcDate(selected.getUTCFullYear(), selected.getUTCMonth(), 1);
  }

  function onClickOkay() {
    onOkay(internalDate);
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
    max-width: 10rem;
  }
  .gdb-dialog-instructions {
    font-size: $font-size-smallest;
    color: $cs-grey-4;
  }
</style>

<div>
  <h2>Set your Target Launch Date</h2>
  <p>
    This is the target launch date used in forecasting. It will assume the start of the month to make the monthly
    calculations easier.
  </p>
  <div class="gdb-dialog-form">
    <div class="gdb-dialog-input">
      <LabeledInput label="Forecast Start" vertical={true}>
        <DateInput value={internalDate} on:change={({ detail }) => updateDateSelection(detail.value)} />
      </LabeledInput>
    </div>
    <i class="gdb-dialog-instructions">Launch date must be the first day of the month.</i>
  </div>
  <SpacedButtons align="right">
    <Button value="Close without Changing" buttonStyle="primary-outline" on:click={onCloseClick} />
    <IconTextButton icon={PredefinedIcons.Next} value="Apply New Date" buttonStyle="primary" on:click={onClickOkay} />
  </SpacedButtons>
</div>
