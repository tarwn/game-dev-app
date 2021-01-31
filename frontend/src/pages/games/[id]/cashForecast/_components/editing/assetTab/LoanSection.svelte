<script lang="ts">
  import IconButton from "../../../../../../../components/buttons/IconButton.svelte";
  import IconTextButton from "../../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../../components/buttons/PredefinedIcons";
  import CurrencyInput from "../../../../../../../components/inputs/CurrencyInput.svelte";
  import DateInput from "../../../../../../../components/inputs/DateInput.svelte";
  import LabeledInput from "../../../../../../../components/inputs/LabeledInput.svelte";
  import NumberInput from "../../../../../../../components/inputs/NumberInput.svelte";
  import PercentInput from "../../../../../../../components/inputs/PercentInput.svelte";
  import TextInput from "../../../../../../../components/inputs/TextInput.svelte";
  import { getUtcToday } from "../../../../../../../utilities/date";
  import type { IEvent } from "../../../../../../_stores/eventStore/types";
  import { events } from "../../../_stores/cashForecastStore";
  import type { ICashForecast, ICashOut, ILoanItem } from "../../../_types/cashForecast";
  import { LoanType, RepaymentType, LoanTypes, RepaymentTypes } from "../../../_types/cashForecast";
  import FauxLabelCell from "../table/FauxLabelCell.svelte";
  import TableRowEmpty from "../TableRowEmpty.svelte";
  import TableRowIndented from "../TableRowIndented.svelte";
  import TableSubHeaderRow from "../TableSubHeaderRow.svelte";

  export let cashForecast: ICashForecast;
  export let forecastDate: Date;
  export let colSpan: number;
  export let publish: (event: IEvent<ICashForecast>) => void;

  function getStartDateLabel(loanType: LoanType, number: number) {
    switch (loanType) {
      case LoanType.Monthly:
        return "Receive Start Date";
      case LoanType.Multiple:
        return `Receive Date (#${number})`;
    }
    return "Receive Date";
  }

  function getAmountLabel(loanType: LoanType) {
    if (loanType === LoanType.Monthly) {
      return "Amount/Month";
    }
    return "Receive Amount";
  }

  function updateLoanType(loan: ILoanItem, e: any) {
    const value = parseInt(e.target.value) as LoanType;
    if (value !== LoanType.Monthly) {
      publish(events.SetLoanType(loan.type, value));
    } else {
      publish(events.SetLoanTypeMonthly(loan.type, loan.numberOfMonths, loan.numberOfMonths?.value ?? 1));
    }
  }

  function updateLoanCashInNumberOfMonths(loan: ILoanItem, value: number) {
    if (loan.numberOfMonths === undefined || loan.numberOfMonths === null) {
      publish(events.AddLoanNumberOfMonths(loan.globalId, value));
    } else {
      publish(events.SetLoanNumberOfMonths(loan.numberOfMonths, value));
    }
  }

  function isShareRepayment(type: RepaymentType) {
    return type === RepaymentType.GrossRevenueShare || type === RepaymentType.NetRevenueShare;
  }

  function isCurrencyRepayment(type: RepaymentType) {
    return type === RepaymentType.Monthly || type === RepaymentType.OneTime;
  }

  function updateRepaymentType(cashOut: ICashOut, e: any) {
    const value = parseInt(e.target.value) as RepaymentType;
    let amount = cashOut.amount.value;
    if (
      (isShareRepayment(value) && !isShareRepayment(cashOut.type.value)) ||
      (isCurrencyRepayment(value) && !isCurrencyRepayment(cashOut.type.value))
    ) {
      amount = 0;
    }

    publish(events.SetLoanRepaymentTermsCashOutType(cashOut, value, amount));
  }

  function addLoanRepaymentTermsCashOut(loan: ILoanItem) {
    publish(events.AddLoanRepaymentTermsCashOut(loan.repaymentTerms.cashOut.globalId, { date: forecastDate }));
  }
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  td.gdb-no-label {
    padding-top: 1.6rem;
  }
</style>

<TableSubHeaderRow colspan={colSpan} value="Loans & Credit" />
{#each cashForecast.loans.list as loan (loan.globalId)}
  <TableRowIndented isRecord={true} isTop={true}>
    <td>
      <LabeledInput label="Name" vertical={true}>
        <TextInput
          maxLength={30}
          value={loan.name.value}
          on:change={({ detail }) => publish(events.SetLoanName(loan.name, detail.value))} />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Type" vertical={true}>
        <!-- svelte-ignore a11y-no-onchange -->
        <select value={loan.type.value} on:change={(e) => updateLoanType(loan, e)}>
          {#each LoanTypes as loanType}
            <option value={loanType.id}>{loanType.name}</option>
          {/each}
        </select>
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label={getStartDateLabel(loan.type.value, 1)} vertical={true}>
        <DateInput
          value={loan.cashIn.list[0].date.value}
          on:change={({ detail }) => publish(events.SetLoanCashInDate(loan.cashIn.list[0].date, detail.value))} />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label={getAmountLabel(loan.type.value)} vertical={true}>
        <CurrencyInput
          value={loan.cashIn.list[0].amount.value}
          on:change={({ detail }) => publish(events.SetLoanCashInAmount(loan.cashIn.list[0].amount, detail.value))} />
      </LabeledInput>
    </td>
    <td>
      {#if loan.type.value === LoanType.Monthly}
        <LabeledInput label="Number of Months" vertical={true}>
          <NumberInput
            value={loan.numberOfMonths?.value ?? 0}
            on:change={({ detail }) => updateLoanCashInNumberOfMonths(loan, detail.value)} />
        </LabeledInput>
      {/if}
    </td>
    <td>
      <IconTextButton
        icon={PredefinedIcons.Delete}
        buttonStyle="secondary-negative"
        disabled={false}
        value="Delete loan"
        on:click={() => publish(events.DeleteLoan(loan))} />
    </td>
  </TableRowIndented>
  {#if loan.type.value === LoanType.Multiple}
    {#each loan.cashIn.list.slice(1) as cashIn, num (cashIn.globalId)}
      <TableRowIndented isRecord={true}>
        <td />
        <FauxLabelCell>and</FauxLabelCell>
        <td>
          <LabeledInput label={getStartDateLabel(loan.type.value, num + 2)} vertical={true}>
            <DateInput
              value={cashIn.date.value}
              on:change={({ detail }) => publish(events.SetLoanCashInDate(cashIn.date, detail.value))} />
          </LabeledInput>
        </td>
        <td>
          <LabeledInput label={getAmountLabel(loan.type.value)} vertical={true}>
            <CurrencyInput
              value={cashIn.amount.value}
              on:change={({ detail }) => publish(events.SetLoanCashInAmount(cashIn.amount, detail.value))} />
          </LabeledInput>
        </td>
        <td class="gdb-no-label">
          <IconButton
            icon={PredefinedIcons.Delete}
            buttonStyle="secondary-negative"
            disabled={false}
            on:click={() => publish(events.DeleteLoanCashIn(cashIn))} />
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
      <td />
    </TableRowIndented>
  {/if}
  {#if loan.repaymentTerms}
    {#each loan.repaymentTerms.cashOut.list as cashOut, i (cashOut.globalId)}
      <TableRowIndented isRecord={true} isBottom={false}>
        <FauxLabelCell>
          {#if i == 0}
            Repayment:
          {:else}
            and then:
          {/if}
        </FauxLabelCell>
        <td>
          <LabeledInput label="Frequency" vertical={true}>
            <!-- svelte-ignore a11y-no-onchange -->
            <select value={cashOut.type.value} on:change={(e) => updateRepaymentType(cashOut, e)}>
              {#each RepaymentTypes as repaymentType}
                <option value={repaymentType.id}>{repaymentType.name}</option>
              {/each}
            </select>
          </LabeledInput>
        </td>
        <td>
          <LabeledInput label={cashOut.type.value === RepaymentType.OneTime ? "Date" : "Start Date"} vertical={true}>
            <DateInput
              value={cashOut.startDate.value}
              on:change={({ detail }) =>
                publish(events.SetLoanRepaymentTermsCashOutStartDate(cashOut.startDate, detail.value))} />
          </LabeledInput>
        </td>
        <td>
          <LabeledInput label="Amount" vertical={true}>
            {#if isShareRepayment(cashOut.type.value)}
              <PercentInput
                value={cashOut.amount.value}
                on:change={({ detail }) =>
                  publish(events.SetLoanRepaymentTermsCashOutAmount(cashOut.amount, detail.value))} />
            {:else}
              <CurrencyInput
                value={cashOut.amount.value}
                on:change={({ detail }) =>
                  publish(events.SetLoanRepaymentTermsCashOutAmount(cashOut.amount, detail.value))} />
            {/if}
          </LabeledInput>
        </td>
        <td>
          {#if cashOut.type.value === RepaymentType.Monthly}
            <LabeledInput label="Number of Months" vertical={true}>
              <NumberInput
                min={0}
                max={360}
                value={cashOut.numberOfMonths.value}
                on:change={({ detail }) =>
                  publish(events.SetLoanRepaymentTermsCashOutNumberOfMonths(cashOut.numberOfMonths, detail.value))} />
            </LabeledInput>
          {/if}
          {#if isShareRepayment(cashOut.type.value)}
            <LabeledInput label="To a Maximum Of" vertical={true}>
              <CurrencyInput
                min={0}
                max={1_000_000_000}
                value={cashOut.limitFixedAmount.value}
                on:change={({ detail }) =>
                  publish(
                    events.SetLoanRepaymentTermsCashOutLimitFixedAmount(cashOut.limitFixedAmount, detail.value)
                  )} />
            </LabeledInput>
          {/if}
        </td>
        <td class="gdb-no-label">
          {#if i > 0}
            <IconButton
              icon={PredefinedIcons.Delete}
              buttonStyle="secondary-negative"
              disabled={false}
              on:click={() => publish(events.DeleteLoanRepaymentTermsCashOut(cashOut))} />
          {/if}
        </td>
      </TableRowIndented>
    {/each}
    <TableRowIndented isRecord={true} isBottom={true}>
      <td />
      <td />
      <td colspan={colSpan - 3}>
        <IconTextButton
          icon={PredefinedIcons.Plus}
          value="Add Another Term"
          buttonStyle="primary-outline"
          on:click={() => addLoanRepaymentTermsCashOut(loan)} />
      </td>
    </TableRowIndented>
  {:else}
    <TableRowIndented isRecord={true} isBottom={true}>
      <td />
      <td />
      <td colspan={colSpan - 3}>
        <IconTextButton
          icon={PredefinedIcons.Plus}
          value="Add Repayment Terms"
          buttonStyle="primary-outline"
          on:click={() =>
            publish(
              events.AddLoanRepaymentTerms(loan.globalId, {
                date: forecastDate,
              })
            )} />
      </td>
    </TableRowIndented>
  {/if}
  <TableRowEmpty colspan={colSpan} />
{/each}
<!-- add row -->
<TableRowIndented>
  <td colspan={colSpan - 1}>
    <IconTextButton
      icon={PredefinedIcons.Plus}
      value={cashForecast.loans.list.length === 0 ? "Add a Loan" : "Add another Loan"}
      buttonStyle="primary-outline"
      on:click={() => publish(events.AddLoan(cashForecast.loans.globalId, { date: forecastDate }))} />
  </td>
</TableRowIndented>
