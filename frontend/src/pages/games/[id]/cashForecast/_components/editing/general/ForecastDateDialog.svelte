<script lang="ts">
  import { getContext } from "svelte";
  import Button from "../../../../../../../components/buttons/Button.svelte";
  import IconTextButton from "../../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../../components/buttons/PredefinedIcons";
  import SpacedButtons from "../../../../../../../components/buttons/SpacedButtons.svelte";
  import CurrencyInput from "../../../../../../../components/inputs/CurrencyInput.svelte";
  import CurrencySpan from "../../../../../../../components/inputs/CurrencySpan.svelte";

  import DateInput from "../../../../../../../components/inputs/DateInput.svelte";
  import DateSpan from "../../../../../../../components/inputs/DateSpan.svelte";

  import LabeledInput from "../../../../../../../components/inputs/LabeledInput.svelte";
  import { getUtcDate } from "../../../../../../../utilities/date";

  const { close } = getContext("simple-modal");

  export let currentDate: Date;
  export let bankBalanceDate: Date;
  export let bankBalanceAmount: number;
  export let onOkay: (newValue: Date, newBalance: number) => void;

  $: internalDate = currentDate;
  $: internalBankBalanceAmount = bankBalanceAmount;

  function updateDateSelection(selected: Date) {
    internalDate = getUtcDate(selected.getUTCFullYear(), selected.getUTCMonth(), 1);
  }

  function updateBankBalance(newAmount: number) {
    internalBankBalanceAmount = newAmount;
  }

  function onClickOkay() {
    onOkay(internalDate, internalBankBalanceAmount);
    close();
  }

  function onCloseClick() {
    close();
  }
</script>

<style lang="scss">
  @import "../../../../../../../styles/_variables.scss";

  h2 {
    font-weight: bold;
    margin-right: 2rem;
  }

  .gdb-dialog-form {
    margin: $space-m 0;
  }
</style>

<div>
  <h2>Advance the Forecast Start Date</h2>
  <p>
    This is the starting date the forecasts are displayed from in charts and tables. It does not affect dates used in
    expense and revenue items.
  </p>
  <div class="gdb-dialog-form">
    <table class="gdb-cf-table">
      <colgroup>
        <col span="1" style="width: 14rem;" />
        <col span="1" style="width: 12rem;" />
        <col span="1" style="" /><!-- soak up excess width -->
      </colgroup>
      <tr>
        <td>
          <LabeledInput label="Forecast Start" vertical={true}>
            <DateInput value={internalDate} on:change={({ detail }) => updateDateSelection(detail.value)} />
          </LabeledInput>
        </td>
        <td>
          <LabeledInput label="Bank Balance" vertical={true}>
            <CurrencyInput
              value={internalBankBalanceAmount}
              min={0}
              on:change={({ detail }) => updateBankBalance(detail.value)} />
          </LabeledInput>
        </td>
      </tr>
    </table>
    <p>
      The current forecast's bank balance is <CurrencySpan value={bankBalanceAmount} /> on <DateSpan
        date={bankBalanceDate} />
    </p>
    <p>Updating the forecast date will re-calculate cash forecasts from this new start date and bank balance.</p>
  </div>

  <SpacedButtons align="right">
    <Button value="Close without Changing" buttonStyle="primary-outline" on:click={onCloseClick} />
    <IconTextButton
      icon={PredefinedIcons.NextRound}
      value="Apply New Date"
      buttonStyle="primary"
      on:click={onClickOkay} />
  </SpacedButtons>
</div>
