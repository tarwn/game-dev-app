<script lang="ts">
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import CurrencyInput from "../../../../../../components/inputs/CurrencyInput.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import NumberInput from "../../../../../../components/inputs/NumberInput.svelte";
  import PercentInput from "../../../../../../components/inputs/PercentInput.svelte";
  import TableRowEmpty from "./TableRowEmpty.svelte";
  import TableRowIndented from "./TableRowIndented.svelte";
  import TableSubHeaderRow from "./TableSubHeaderRow.svelte";

  let bankBalance = 123.45;
  function updateBankBalance(newValue) {
    bankBalance = newValue;
  }

  let percent = 0.123;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-cf-table {
    border-collapse: separate;
    border-spacing: 0;

    td {
      padding: $space-xs $space-m;
    }
  }

  .gdb-cf-forecast-row {
    padding-left: 0.1rem; // needs some indent
  }

  td.gdb-faux-label,
  td.gdb-faux-label-short {
    line-height: 1.5rem;
    text-align: right;
    color: $text-color-light;
    font-size: $font-size-small;
  }
  td.gdb-faux-label {
    padding-top: 1.6rem;
  }
</style>

<div class="gdb-cf-forecast-row">
  <LabeledInput label="Forecast Start Date">
    <span class="gdb-input gdb-input-date"
      >{new Date().toLocaleDateString("en-US")}</span>
  </LabeledInput>
</div>
<table class="gdb-cf-table">
  <TableSubHeaderRow colspan={6} value="Bank Balance" />
  <TableRowIndented isRecord={true} isTop={true} isBottom={true}>
    <td>
      <LabeledInput label="Name" vertical={true}>
        <input type="text" placeholder="enter a name" />
      </LabeledInput>
    </td>
    <td />
    <td>
      <LabeledInput label="Date" vertical={true}>
        <span class="gdb-input gdb-input-date"
          >{new Date().toLocaleDateString("en-US")}</span>
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Amount" vertical={true}>
        <CurrencyInput
          value={bankBalance}
          on:change={(e) => updateBankBalance(e.detail.value)} />
      </LabeledInput>
    </td>
    <td />
  </TableRowIndented>

  <!-- start loans -->
  <TableSubHeaderRow colspan={6} value="Loans & Credit" />
  <TableRowIndented isRecord={true} isTop={true}>
    <td>
      <LabeledInput label="Name" vertical={true}>
        <input type="text" placeholder="enter a name" />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Type" vertical={true}>
        <select>
          <option>One-Time</option>
        </select>
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Date" vertical={true}>
        <input type="date" placeholder="02/01/2019" />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Amount" vertical={true}>
        <CurrencyInput />
      </LabeledInput>
    </td>
    <td />
  </TableRowIndented>
  <TableRowIndented isRecord={true} isBottom={true}>
    <td class="gdb-faux-label"> Repayment Terms: </td>
    <td>
      <LabeledInput label="Frequency" vertical={true}>
        <select>
          <option>Monthly Payment</option>
        </select>
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Start Date" vertical={true}>
        <input type="date" placeholder="02/01/2019" />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Amount" vertical={true}>
        <CurrencyInput />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Number of Months" vertical={true}>
        <NumberInput value={1} />
      </LabeledInput>
    </td>
  </TableRowIndented>
  <TableRowEmpty colspan={6} />
  <!-- add row -->
  <TableRowIndented>
    <td colspan="4">
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value="Add Loan"
        buttonStyle="primary-outline" />
    </td>
  </TableRowIndented>

  <!-- start funding -->
  <TableSubHeaderRow colspan={6} value="Funding" />
  <TableRowIndented isRecord={true} isTop={true}>
    <td>
      <LabeledInput label="Name" vertical={true}>
        <input type="text" placeholder="enter a name" />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Type" vertical={true}>
        <select>
          <option>Multiple</option>
        </select>
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Date" vertical={true}>
        <input type="date" placeholder="02/01/2019" />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Amount" vertical={true}>
        <CurrencyInput />
      </LabeledInput>
    </td>
    <td />
  </TableRowIndented>
  <TableRowIndented isRecord={true}>
    <td />
    <td />
    <td>
      <input type="date" placeholder="02/01/2019" />
    </td>
    <td>
      <CurrencyInput />
    </td>
    <td />
  </TableRowIndented>
  <TableRowIndented isRecord={true}>
    <td />
    <td />
    <td>
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value="Add"
        buttonStyle="primary-outline" />
    </td>
    <td />
    <td />
  </TableRowIndented>
  <TableRowIndented isRecord={true}>
    <td class="gdb-faux-label-short"> Terms: </td>
    <td>
      <select>
        <option>Net Rev. Share</option>
      </select>
    </td>
    <td>
      <CurrencyInput />
    </td>
    <td>
      <select>
        <option>until</option>
      </select>
    </td>
    <td>
      <CurrencyInput />
    </td>
  </TableRowIndented>
  <TableRowIndented isRecord={true}>
    <td />
    <td class="gdb-faux-label-short"> and then </td>
    <td>
      <PercentInput
        value={percent}
        on:change={(e) => (percent = e.detail.value)} />
    </td>
    <td>
      <select>
        <option>of all sales</option>
      </select>
    </td>
    <td />
  </TableRowIndented>
  <TableRowIndented isRecord={true} isBottom={true}>
    <td />
    <td />
    <td>
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value="Add"
        buttonStyle="primary-outline"
        disabled={true} />
    </td>
    <td />
    <td />
  </TableRowIndented>
  <TableRowEmpty colspan={6} />
  <!-- add row -->
  <TableRowIndented>
    <td colspan="4">
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value="Add Funding"
        buttonStyle="primary-outline" />
    </td>
  </TableRowIndented>
</table>
