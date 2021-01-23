<script lang="ts">
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import CurrencyInput from "../../../../../../components/inputs/CurrencyInput.svelte";
  import DateOutput from "../../../../../../components/inputs/DateOutput.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import NumberInput from "../../../../../../components/inputs/NumberInput.svelte";
  import PercentInput from "../../../../../../components/inputs/PercentInput.svelte";
  import TextInput from "../../../../../../components/inputs/TextInput.svelte";
  import {
    cashForecastEventStore,
    events,
  } from "../../_stores/cashForecastStore";
  import type { ICashForecast, LoanType } from "../../_types/cashForecast";
  import { LoanTypes } from "../../_types/cashForecast";
  import TableRowEmpty from "./TableRowEmpty.svelte";
  import TableRowIndented from "./TableRowIndented.svelte";
  import TableSubHeaderRow from "./TableSubHeaderRow.svelte";

  export let cashForecast: ICashForecast;
  const publish = cashForecastEventStore.addEvent;

  const forecastDate = cashForecast.forecastStartDate.value;

  function updateBankBalanceName(value: string) {
    const { parentId, globalId } = cashForecast.bankBalance.name;
    publish(events.SetBankBalanceName({ parentId, globalId, value }));
  }

  function updateBankBalanceAmount(value: number) {
    const { parentId, globalId } = cashForecast.bankBalance.amount;
    publish(events.SetBankBalanceAmount({ parentId, globalId, value }));
  }

  function addLoan() {
    const { globalId } = cashForecast.loans;
    publish(events.AddLoan({ parentId: globalId, date: forecastDate }));
  }

  function updateLoanName(parentId: string, globalId: string, value: string) {
    publish(events.SetLoanName({ parentId, globalId, value }));
  }

  function updateLoanType(parentId: string, globalId: string, e: any) {
    const value = parseInt(e.target.value) as LoanType;
    publish(events.SetLoanType({ parentId, globalId, value }));
  }

  function updateLoanCashInDate(parentId: string, globalId: string, e: any) {
    const selection = new Date(e.target.value);
    const value = new Date(
      Date.UTC(
        selection.getFullYear(),
        selection.getMonth(),
        selection.getDay()
      )
    );
    publish(events.SetLoanCashInDate({ parentId, globalId, value }));
  }

  function updateLoanCashInAmount(
    parentId: string,
    globalId: string,
    value: number
  ) {
    publish(events.SetLoanCashInAmount({ parentId, globalId, value }));
  }

  // temp values
  let percent = 0.0123;
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
    <DateOutput date={forecastDate} />
  </LabeledInput>
</div>
<table class="gdb-cf-table">
  <TableSubHeaderRow colspan={6} value="Bank Balance" />
  <TableRowIndented isRecord={true} isTop={true} isBottom={true}>
    <td>
      <LabeledInput label="Name" vertical={true}>
        <TextInput
          maxLength={30}
          value={cashForecast.bankBalance.name.value}
          on:change={({ detail }) => updateBankBalanceName(detail.value)} />
      </LabeledInput>
    </td>
    <td />
    <td>
      <LabeledInput label="Date" vertical={true}>
        <DateOutput date={forecastDate} />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Amount" vertical={true}>
        <CurrencyInput
          value={cashForecast.bankBalance.amount.value}
          on:change={({ detail }) => updateBankBalanceAmount(detail.value)} />
      </LabeledInput>
    </td>
    <td />
  </TableRowIndented>

  <!-- start loans -->
  <TableSubHeaderRow colspan={6} value="Loans & Credit" />
  {#each cashForecast.loans.list as loan (loan.globalId)}
    <TableRowIndented isRecord={true} isTop={true}>
      <td>
        <LabeledInput label="Name" vertical={true}>
          <TextInput
            maxLength={30}
            value={loan.name.value}
            on:change={({ detail }) =>
              updateLoanName(
                loan.name.parentId,
                loan.name.globalId,
                detail.value
              )} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label="Type" vertical={true}>
          <!-- svelte-ignore a11y-no-onchange -->
          <select
            value={loan.type.value}
            on:change={(e) =>
              updateLoanType(loan.name.parentId, loan.name.globalId, e)}>
            {#each LoanTypes as loanType}
              <option value={loanType.id}>{loanType.name}</option>
            {/each}
          </select>
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label="Date" vertical={true}>
          <input
            type="date"
            placeholder={forecastDate.toLocaleDateString({ timezone: "UTC" })}
            value={loan.cashIn.list[0].date.value.getTime()}
            on:change={(e) =>
              updateLoanCashInDate(
                loan.cashIn.list[0].date.parentId,
                loan.cashIn.list[0].date.globalId,
                e
              )} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label="Amount" vertical={true}>
          <CurrencyInput
            value={loan.cashIn.list[0].amount.value}
            on:change={({ detail }) =>
              updateLoanCashInAmount(
                loan.cashIn.list[0].amount.parentId,
                loan.cashIn.list[0].amount.globalId,
                detail.value
              )} />
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
  {/each}
  <!-- add row -->
  <TableRowIndented>
    <td colspan="4">
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value="Add Loan"
        buttonStyle="primary-outline"
        on:click={() => addLoan()} />
    </td>
  </TableRowIndented>

  <!-- start funding -->
  <TableSubHeaderRow colspan={6} value="Funding" />
  <TableRowIndented isRecord={true} isTop={true}>
    <td>
      <LabeledInput label="Name" vertical={true}>
        <TextInput maxLength={40} />
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
