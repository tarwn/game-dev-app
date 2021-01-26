<script lang="ts">
  import { getDataDetail } from "@microsoft/signalr/dist/esm/Utils";
  import { listen } from "svelte/internal";
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import CurrencyInput from "../../../../../../components/inputs/CurrencyInput.svelte";
  import DateInput from "../../../../../../components/inputs/DateInput.svelte";
  import DateOutput from "../../../../../../components/inputs/DateOutput.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import NumberInput from "../../../../../../components/inputs/NumberInput.svelte";
  import PercentInput from "../../../../../../components/inputs/PercentInput.svelte";
  import TextInput from "../../../../../../components/inputs/TextInput.svelte";
  import { getUtcDate, getUtcToday } from "../../../../../../utilities/date";
  import type { Identified } from "../../../../../_stores/eventStore/types";
  import ValuePropositionSectionSummary from "../../../businessModel/_components/sections/ValuePropositionSectionSummary.svelte";
  import {
    cashForecastEventStore,
    events,
  } from "../../_stores/cashForecastStore";
  import type {
    ICashForecast,
    ICashIn,
    ILoanItem,
  } from "../../_types/cashForecast";
  import { LoanType } from "../../_types/cashForecast";
  import { LoanTypes } from "../../_types/cashForecast";
  import TableRowEmpty from "./TableRowEmpty.svelte";
  import TableRowIndented from "./TableRowIndented.svelte";
  import TableSubHeaderRow from "./TableSubHeaderRow.svelte";

  export let cashForecast: ICashForecast;
  const publish = cashForecastEventStore.addEvent;

  const forecastDate = cashForecast.forecastStartDate.value;

  function getStartDateLabel(loanType: LoanType, number: number) {
    switch (loanType) {
      case LoanType.Monthly:
        return "Start Date";
      case LoanType.Multiple:
        return `Date (#${number})`;
    }
    return "Date";
  }

  function getAmountLabel(loanType: LoanType) {
    if (loanType === LoanType.Monthly) {
      return "Amount/Month";
    }
    return "Amount";
  }

  function updateBankBalanceName(value: string) {
    publish(events.SetBankBalanceName(cashForecast.bankBalance.name, value));
  }

  function updateBankBalanceAmount(value: number) {
    publish(
      events.SetBankBalanceAmount(cashForecast.bankBalance.amount, value)
    );
  }

  function addLoan() {
    publish(
      events.AddLoan(cashForecast.loans.globalId, { date: forecastDate })
    );
  }

  function updateLoanName(loan: ILoanItem, value: string) {
    publish(events.SetLoanName(loan.name, value));
  }

  function updateLoanType(loan: ILoanItem, e: any) {
    const value = parseInt(e.target.value) as LoanType;
    if (value !== LoanType.Monthly) {
      publish(events.SetLoanType(loan.type, value));
    } else {
      publish(
        events.SetLoanTypeMonthly(
          loan.type,
          loan.numberOfMonths,
          loan.numberOfMonths?.value ?? 1
        )
      );
    }
  }

  function updateLoanCashInNumberOfMonths(loan: ILoanItem, value: number) {
    if (loan.numberOfMonths === undefined || loan.numberOfMonths === null) {
      publish(events.AddLoanNumberOfMonths(loan.globalId, value));
    } else {
      publish(events.SetLoanNumberOfMonths(loan.numberOfMonths, value));
    }
  }

  function updateLoanCashInDate(cashIn: ICashIn, value: Date) {
    publish(events.SetLoanCashInDate(cashIn.date, value));
  }

  function updateLoanCashInAmount(cashIn: ICashIn, value: number) {
    publish(events.SetLoanCashInAmount(cashIn.amount, value));
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
            on:change={({ detail }) => updateLoanName(loan, detail.value)} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label="Type" vertical={true}>
          <!-- svelte-ignore a11y-no-onchange -->
          <select
            value={loan.type.value}
            on:change={(e) => updateLoanType(loan, e)}>
            {#each LoanTypes as loanType}
              <option value={loanType.id}>{loanType.name}</option>
            {/each}
          </select>
        </LabeledInput>
      </td>
      <td>
        <LabeledInput
          label={getStartDateLabel(loan.type.value, 1)}
          vertical={true}>
          <DateInput
            value={loan.cashIn.list[0].date.value}
            on:change={({ detail }) =>
              updateLoanCashInDate(loan.cashIn.list[0], detail.value)} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label={getAmountLabel(loan.type.value)} vertical={true}>
          <CurrencyInput
            value={loan.cashIn.list[0].amount.value}
            on:change={({ detail }) =>
              updateLoanCashInAmount(loan.cashIn.list[0], detail.value)} />
        </LabeledInput>
      </td>
      <td>
        {#if loan.type.value === LoanType.Monthly}
          <LabeledInput label="Number of Months" vertical={true}>
            <NumberInput
              value={loan.numberOfMonths?.value ?? 0}
              on:change={({ detail }) =>
                updateLoanCashInNumberOfMonths(loan, detail.value)} />
          </LabeledInput>
        {/if}
      </td>
    </TableRowIndented>
    {#if loan.type.value === LoanType.Multiple}
      {#each loan.cashIn.list.slice(1) as cashIn, num (cashIn.globalId)}
        <TableRowIndented isRecord={true}>
          <td />
          <td class="gdb-faux-label"> and </td>
          <td>
            <LabeledInput
              label={getStartDateLabel(loan.type.value, num + 2)}
              vertical={true}>
              <DateInput
                value={cashIn.date.value}
                on:change={({ detail }) =>
                  updateLoanCashInDate(cashIn, detail.value)} />
            </LabeledInput>
          </td>
          <td>
            <LabeledInput
              label={getAmountLabel(loan.type.value)}
              vertical={true}>
              <CurrencyInput
                value={cashIn.amount.value}
                on:change={({ detail }) =>
                  updateLoanCashInAmount(cashIn, detail.value)} />
            </LabeledInput>
          </td>
          <td />
        </TableRowIndented>
      {/each}
      <TableRowIndented isRecord={true}>
        <td />
        <td />
        <td>
          <IconTextButton
            icon={PredefinedIcons.Plus}
            value="Add Next Amount"
            buttonStyle="primary-outline"
            on:click={() =>
              publish(
                events.AddLoanCashIn(loan.cashIn.globalId, {
                  date: getUtcToday(),
                })
              )} />
        </td>
        <td />
        <td />
      </TableRowIndented>
    {/if}
    {#if loan.repaymentTerms}
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
    {:else}
      <TableRowIndented isRecord={true} isBottom={true}>
        <td />
        <td />
        <td>
          <IconTextButton
            icon={PredefinedIcons.Plus}
            value="Add Repayment Terms"
            buttonStyle="primary-outline"
            on:click={() => {}} />
        </td>
        <td />
        <td />
      </TableRowIndented>
    {/if}
    <TableRowEmpty colspan={6} />
  {/each}
  <!-- add row -->
  <TableRowIndented>
    <td colspan="4">
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value={cashForecast.loans.list.length === 0
          ? "Add a Loan"
          : "Add another Loan"}
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
