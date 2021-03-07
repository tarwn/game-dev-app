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
  $: {
    console.log({
      currentDate,
      internalDate,
    });
  }

  function updateDateSelection(selected: Date) {
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
  <h2>Advance the Forecast Start Date</h2>
  <p>
    This is the starting date the forecasts are displayed from in charts and tables. It does not affect dates used in
    expense and revenue items.
  </p>
  <div class="gdb-dialog-form">
    <div class="gdb-dialog-input">
      <LabeledInput label="Forecast Start" vertical={true}>
        <DateInput value={internalDate} on:change={({ detail }) => updateDateSelection(detail.value)} />
      </LabeledInput>
    </div>
    <i class="gdb-dialog-instructions">Forecast date must be the first day of the month.</i>
  </div>
  <p>
    <i
      >In the future, advancing this to a future date will snapshot the current forecast (in case you want to look back
      it later) and ask for updated bank balances, revenue shared so far for partners, and sales.</i>
  </p>
  <SpacedButtons align="right">
    <Button value="Close without Changing" buttonStyle="primary-outline" on:click={onCloseClick} />
    <IconTextButton icon={PredefinedIcons.Next} value="Apply New Date" buttonStyle="primary" on:click={onClickOkay} />
  </SpacedButtons>
</div>
