<script lang="ts">
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-cf-table {
    border-collapse: collapse;

    td {
      padding: $space-xs $space-m;
    }
  }

  .gdb-cf-forecast-row {
    padding-left: 0.1rem; // needs some indent
  }

  .gdb-cf-table-indent {
    width: 1rem;
  }

  .gdb-cf-table-subheader > td {
    font-weight: bold;
    padding: $space-l 0 $space-m 0;
  }

  .gdb-cf-table-subtitle {
    margin-right: 2rem;
  }

  .gdb-input > input {
    padding: 0;
    border: 0;
    outline: 0;
  }

  .gdb-faux-input {
    display: flex;
    font-size: $font-size-small;
    color: $cs-grey-3;
    width: 6rem;

    & > input {
      flex: 1 1;
      min-width: 4rem;
    }
  }

  .gdb-currency {
    text-align: right;
    max-width: 6rem;
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
  <tr class="gdb-cf-table-subheader"> <td colspan={6}>Bank Balance</td> </tr>
  <tr>
    <td class="gdb-cf-table-indent" />
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
        <div class="gdb-input gdb-faux-input">
          $<input type="text" placeholder="0.00" class="gdb-currency" />
        </div>
      </LabeledInput>
    </td>
    <td />
  </tr>

  <!-- start loans -->
  <tr class="gdb-cf-table-subheader">
    <td colspan={6}>
      <span class="gdb-cf-table-subtitle">Loans & Credit</span>
    </td>
  </tr>
  <tr>
    <td class="gdb-cf-table-indent" />
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
        <div class="gdb-input gdb-faux-input">
          $<input type="text" placeholder="0.00" class="gdb-currency" />
        </div>
      </LabeledInput>
    </td>
    <td />
  </tr>
  <tr>
    <td class="gdb-cf-table-indent" />
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
        <div class="gdb-input gdb-faux-input">
          $<input type="text" placeholder="0.00" class="gdb-currency" />
        </div>
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Number of Months" vertical={true}>
        <input type="number" placeholder="24" />
      </LabeledInput>
    </td>
  </tr>
  <!-- add row -->
  <tr>
    <td />
    <td colspan="4">
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value="Add Loan"
        buttonStyle="primary-outline" />
    </td>
  </tr>

  <!-- start funding -->
  <tr class="gdb-cf-table-subheader">
    <td colspan={6}>
      <span class="gdb-cf-table-subtitle">Funding</span>
    </td>
  </tr>
  <tr>
    <td class="gdb-cf-table-indent" />
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
        <div class="gdb-input gdb-faux-input">
          $<input type="text" placeholder="0.00" class="gdb-currency" />
        </div>
      </LabeledInput>
    </td>
    <td />
  </tr>
  <tr>
    <td class="gdb-cf-table-indent" />
    <td />
    <td />
    <td>
      <input type="date" placeholder="02/01/2019" />
    </td>
    <td>
      <div class="gdb-input gdb-faux-input">
        $<input type="text" placeholder="0.00" class="gdb-currency" />
      </div>
    </td>
    <td />
  </tr>
  <tr>
    <td class="gdb-cf-table-indent" />
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
  </tr>
  <tr>
    <td class="gdb-cf-table-indent" />
    <td class="gdb-faux-label-short"> Terms: </td>
    <td>
      <select>
        <option>Net Rev. Share</option>
      </select>
    </td>
    <td>
      <div class="gdb-input gdb-faux-input">
        <input type="text" placeholder="0.0" class="gdb-currency" />%
      </div>
    </td>
    <td>
      <select>
        <option>until</option>
      </select>
    </td>
    <td>
      <div class="gdb-input gdb-faux-input">
        $<input type="text" placeholder="0.00" class="gdb-currency" />
      </div>
    </td>
  </tr>
  <tr>
    <td class="gdb-cf-table-indent" />
    <td />
    <td class="gdb-faux-label-short"> and then </td>
    <td>
      <div class="gdb-input gdb-faux-input">
        <input type="text" placeholder="0.0" class="gdb-currency" />%
      </div>
    </td>
    <td>
      <select>
        <option>of all sales</option>
      </select>
    </td>
    <td />
  </tr>
  <tr>
    <td class="gdb-cf-table-indent" />
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
  </tr>
  <!-- add row -->
  <tr>
    <td />
    <td colspan="4">
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value="Add Funding"
        buttonStyle="primary-outline" />
    </td>
  </tr>
</table>
