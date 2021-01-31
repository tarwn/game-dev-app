<script lang="ts">
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import CurrencyInput from "../../../../../../components/inputs/CurrencyInput.svelte";
  import DateOutput from "../../../../../../components/inputs/DateOutput.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import PercentInput from "../../../../../../components/inputs/PercentInput.svelte";
  import TextInput from "../../../../../../components/inputs/TextInput.svelte";
  import { cashForecastEventStore, events } from "../../_stores/cashForecastStore";
  import type { ICashForecast, ICashIn, ICashOut, ILoanItem } from "../../_types/cashForecast";
  import { LoanType, RepaymentType, LoanTypes, RepaymentTypes } from "../../_types/cashForecast";
  import BankBalance from "./assetTab/BankBalance.svelte";
  import LoanSection from "./assetTab/LoanSection.svelte";
  import TableRowEmpty from "./table/TableRowEmpty.svelte";
  import TableRowIndented from "./table/TableRowIndented.svelte";
  import TableSubHeaderRow from "./table/TableSubHeaderRow.svelte";

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

  function addLoan() {
    publish(events.AddLoan(cashForecast.loans.globalId, { date: forecastDate }));
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

  function updateLoanCashInDate(cashIn: ICashIn, value: Date) {
    publish(events.SetLoanCashInDate(cashIn.date, value));
  }

  function updateLoanCashInAmount(cashIn: ICashIn, value: number) {
    publish(events.SetLoanCashInAmount(cashIn.amount, value));
  }

  function addLoanRepaymentTerms(loan: ILoanItem) {
    publish(events.AddLoanRepaymentTerms(loan.globalId, { date: forecastDate }));
  }

  function addLoanRepaymentTermsCashOut(loan: ILoanItem) {
    publish(events.AddLoanRepaymentTermsCashOut(loan.repaymentTerms.cashOut.globalId, { date: forecastDate }));
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

  // temp values
  let percent = 0.0123;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-cf-table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    min-width: 1200px;
    table-layout: fixed;

    :global(td) {
      padding: $space-xs $space-m;
    }
  }

  .gdb-cf-forecast-row {
    padding-left: 0.1rem; // needs some indent
  }
</style>

<div class="gdb-cf-forecast-row">
  <LabeledInput label="Forecast Start Date">
    <DateOutput date={forecastDate} />
  </LabeledInput>
</div>
<table class="gdb-cf-table">
  <colgroup>
    <col span="1" style="width: 2rem;" />
    <col span="1" style="width: 14rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="" /><!-- soak up excess width -->
  </colgroup>
  <BankBalance {cashForecast} {publish} {forecastDate} colSpan={7} />

  <LoanSection {cashForecast} {publish} {forecastDate} colSpan={7} />

  <!-- start funding -->
  <TableSubHeaderRow colspan={7} value="Funding" />
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
    <td />
  </TableRowIndented>
  <TableRowIndented isRecord={true}>
    <td />
    <td />
    <td>
      <IconTextButton icon={PredefinedIcons.Plus} value="Add" buttonStyle="primary-outline" />
    </td>
    <td />
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
    <td />
  </TableRowIndented>
  <TableRowIndented isRecord={true}>
    <td />
    <td class="gdb-faux-label-short"> and then </td>
    <td>
      <PercentInput value={percent} on:change={(e) => (percent = e.detail.value)} />
    </td>
    <td>
      <select>
        <option>of all sales</option>
      </select>
    </td>
    <td />
    <td />
  </TableRowIndented>
  <TableRowIndented isRecord={true} isBottom={true}>
    <td />
    <td />
    <td>
      <IconTextButton icon={PredefinedIcons.Plus} value="Add" buttonStyle="primary-outline" disabled={true} />
    </td>
    <td />
    <td />
    <td />
  </TableRowIndented>
  <TableRowEmpty colspan={7} />
  <!-- add row -->
  <TableRowIndented>
    <td colspan="7">
      <IconTextButton icon={PredefinedIcons.Plus} value="Add Funding" buttonStyle="primary-outline" />
    </td>
  </TableRowIndented>
</table>
