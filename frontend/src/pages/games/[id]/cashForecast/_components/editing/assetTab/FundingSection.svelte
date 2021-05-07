<script lang="ts">
  import IconButton from "../../../../../../../components/buttons/IconButton.svelte";
  import IconTextButton from "../../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../../components/buttons/PredefinedIcons";
  import CurrencyInput from "../../../../../../../components/inputs/CurrencyInput.svelte";
  import DateInput from "../../../../../../../components/inputs/DateInput.svelte";
  import LabeledInput from "../../../../../../../components/inputs/LabeledInput.svelte";
  import PercentInput from "../../../../../../../components/inputs/PercentInput.svelte";
  import TextInput from "../../../../../../../components/inputs/TextInput.svelte";
  import type { IEvent } from "../../../../../../_stores/eventStore/types";
  import { events } from "../../../_stores/cashForecastStore";
  import type { ICashForecast, IFundingCashOut, IFundingItem } from "../../../_types/cashForecast";
  import { LoanType, FundingRepaymentType, FundingTypes, FundingRepaymentTypes } from "../../../_types/cashForecast";
  import FauxLabelCell from "../../../../../../../components/table/FauxLabelCell.svelte";
  import TableRowEmpty from "../../../../../../../components/table/TableRowEmpty.svelte";
  import TableRowIndented from "../../../../../../../components/table/TableRowIndented.svelte";
  import TableSubHeaderRow from "../../../../../../../components/table/TableSubHeaderRow.svelte";

  export let cashForecast: ICashForecast;
  export let forecastDate: Date;
  export let launchDate: Date;
  export let colSpan: number;
  export let publish: (event: IEvent<ICashForecast>) => void;

  function getStartDateLabel(fundingType: LoanType, number: number) {
    switch (fundingType) {
      case LoanType.Monthly:
        throw new Error("Funding specified a 'Monthly' type but does not support monthly payment receipt");
      case LoanType.Multiple:
        return `Receive Date (#${number})`;
    }
    return "Receive Date";
  }

  function getAmountLabel(fundingType: LoanType) {
    if (fundingType === LoanType.Monthly) {
      throw new Error("Funding specified a 'Monthly' type but does not support monthly payment receipt");
    }
    return "Receive Amount";
  }

  function updateFundingType(funding: IFundingItem, e: any) {
    const value = parseInt(e.target.value) as LoanType;
    if (value !== LoanType.Monthly) {
      publish(events.SetFundingType(funding.type, value));
    } else {
      throw new Error("Funding specified a 'Monthly' type but does not support monthly payment receipt");
    }
  }

  function updateRepaymentType(cashOut: IFundingCashOut, e: any) {
    const value = parseInt(e.target.value) as FundingRepaymentType;
    publish(events.SetFundingRepaymentTermsCashOutType(cashOut.type, value));
  }

  function addFundingRepaymentTerms(funding: IFundingItem) {
    let defaultAmount = funding.cashIn.list[0].amount.value;
    if (funding.type.value === LoanType.Multiple) {
      defaultAmount = funding.cashIn.list.reduce((ttl, ci) => ttl + ci.amount.value, 0);
    }
    publish(events.AddFundingRepaymentTerms(funding.globalId, { date: launchDate, amount: defaultAmount }));
  }

  function addFundingRepaymentTermsCashOut(funding: IFundingItem) {
    publish(events.AddFundingRepaymentTermsCashOut(funding.repaymentTerms.cashOut.globalId, { date: launchDate }));
  }
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  td.gdb-no-label {
    padding-top: 1.6rem;
  }
</style>

<TableSubHeaderRow colspan={colSpan} value="Funding" />
{#each cashForecast.funding.list as funding (funding.globalId)}
  <TableRowIndented isRecord={true} isTop={true}>
    <td>
      <LabeledInput label="Name" vertical={true}>
        <TextInput
          maxLength={30}
          value={funding.name.value}
          on:change={({ detail }) => publish(events.SetFundingName(funding.name, detail.value))} />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Type" vertical={true}>
        <!-- svelte-ignore a11y-no-onchange -->
        <select value={funding.type.value} on:change={(e) => updateFundingType(funding, e)}>
          {#each FundingTypes as fundingType}
            <option value={fundingType.id}>{fundingType.name}</option>
          {/each}
        </select>
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label={getStartDateLabel(funding.type.value, 1)} vertical={true}>
        <DateInput
          value={funding.cashIn.list[0].date.value}
          on:change={({ detail }) => publish(events.SetFundingCashInDate(funding.cashIn.list[0].date, detail.value))} />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label={getAmountLabel(funding.type.value)} vertical={true}>
        <CurrencyInput
          value={funding.cashIn.list[0].amount.value}
          on:change={({ detail }) =>
            publish(events.SetFundingCashInAmount(funding.cashIn.list[0].amount, detail.value))} />
      </LabeledInput>
    </td>
    <td />
    <td class="gdb-no-label">
      <IconTextButton
        icon={PredefinedIcons.Delete}
        buttonStyle="secondary-negative"
        disabled={false}
        value="Delete funding"
        on:click={() => publish(events.DeleteFunding(funding))} />
    </td>
  </TableRowIndented>
  {#if funding.type.value === LoanType.Multiple}
    {#each funding.cashIn.list.slice(1) as cashIn, num (cashIn.globalId)}
      <TableRowIndented isRecord={true}>
        <td />
        <FauxLabelCell>and</FauxLabelCell>
        <td>
          <LabeledInput label={getStartDateLabel(funding.type.value, num + 2)} vertical={true}>
            <DateInput
              value={cashIn.date.value}
              on:change={({ detail }) => publish(events.SetFundingCashInDate(cashIn.date, detail.value))} />
          </LabeledInput>
        </td>
        <td>
          <LabeledInput label={getAmountLabel(funding.type.value)} vertical={true}>
            <CurrencyInput
              value={cashIn.amount.value}
              on:change={({ detail }) => publish(events.SetFundingCashInAmount(cashIn.amount, detail.value))} />
          </LabeledInput>
        </td>
        <td class="gdb-no-label">
          <IconButton
            icon={PredefinedIcons.Delete}
            buttonStyle="secondary-negative"
            disabled={false}
            on:click={() => publish(events.DeleteFundingCashIn(cashIn))} />
        </td>
        <td />
      </TableRowIndented>
    {/each}
    <TableRowIndented isRecord={true}>
      <td />
      <td />
      <td>
        <IconTextButton
          icon={PredefinedIcons.PlusRound}
          value="Add Next Amount"
          buttonStyle="primary-outline"
          on:click={() =>
            publish(
              events.AddFundingCashIn(funding.cashIn.globalId, {
                date: funding.cashIn.list.slice(-1)[0].date.value,
              })
            )} />
      </td>
      <td />
      <td />
      <td />
    </TableRowIndented>
  {/if}
  {#if funding.repaymentTerms}
    {#each funding.repaymentTerms.cashOut.list as cashOut, i (cashOut.globalId)}
      <TableRowIndented isRecord={true} isBottom={false}>
        <FauxLabelCell>
          {#if i == 0}
            Terms:
          {/if}
        </FauxLabelCell>
        {#if i == 0}
          <td>
            <LabeledInput label="Start Date" vertical={true}>
              <DateInput
                value={cashOut.startDate.value}
                on:change={({ detail }) =>
                  publish(events.SetFundingRepaymentTermsCashOutStartDate(cashOut.startDate, detail.value))} />
            </LabeledInput>
          </td>
        {:else}
          <FauxLabelCell>and then:</FauxLabelCell>
        {/if}
        <td>
          <LabeledInput label="Share of" vertical={true}>
            <!-- svelte-ignore a11y-no-onchange -->
            <select value={cashOut.type.value} on:change={(e) => updateRepaymentType(cashOut, e)}>
              {#each FundingRepaymentTypes as repaymentType}
                <option value={repaymentType.id}>{repaymentType.name}</option>
              {/each}
            </select>
          </LabeledInput>
        </td>
        <td>
          <LabeledInput label="Percent Share" vertical={true}>
            <PercentInput
              value={cashOut.amount.value}
              on:change={({ detail }) =>
                publish(events.SetFundingRepaymentTermsCashOutAmount(cashOut.amount, detail.value))} />
          </LabeledInput>
        </td>
        <td>
          <LabeledInput label="To a Maximum Of" vertical={true}>
            <CurrencyInput
              min={0}
              max={1_000_000_000}
              value={cashOut.limitFixedAmount.value}
              on:change={({ detail }) =>
                publish(
                  events.SetFundingRepaymentTermsCashOutLimitFixedAmount(cashOut.limitFixedAmount, detail.value)
                )} />
          </LabeledInput>
        </td>
        <td class="gdb-no-label">
          {#if i > 0}
            <IconButton
              icon={PredefinedIcons.Delete}
              buttonStyle="secondary-negative"
              disabled={false}
              on:click={() => publish(events.DeleteFundingRepaymentTermsCashOut(cashOut))} />
          {/if}
        </td>
      </TableRowIndented>
    {/each}
    <TableRowIndented isRecord={true} isBottom={true}>
      <td />
      <td />
      <td colspan={colSpan - 3}>
        <IconTextButton
          icon={PredefinedIcons.PlusRound}
          value="Add Another Term"
          buttonStyle="primary-outline"
          on:click={() => addFundingRepaymentTermsCashOut(funding)} />
      </td>
    </TableRowIndented>
  {:else}
    <TableRowIndented isRecord={true} isBottom={true}>
      <td />
      <td />
      <td colspan={colSpan - 3}>
        <IconTextButton
          icon={PredefinedIcons.PlusRound}
          value="Add Repayment Terms"
          buttonStyle="primary-outline"
          on:click={() => addFundingRepaymentTerms(funding)} />
      </td>
    </TableRowIndented>
  {/if}
  <TableRowEmpty colspan={colSpan} />
{/each}
<!-- add row -->
<TableRowIndented>
  <td colspan={colSpan - 1}>
    <IconTextButton
      icon={PredefinedIcons.PlusRound}
      value={"Add Funding"}
      buttonStyle="primary-outline"
      on:click={() => publish(events.AddFunding(cashForecast.funding.globalId, { date: forecastDate }))} />
  </td>
</TableRowIndented>
