<script lang="ts">
  import { getContext } from "svelte";
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import DateOutput from "../../../../../../components/inputs/DateOutput.svelte";
  import TableRowEmpty from "../../../../../../components/table/TableRowEmpty.svelte";
  import TableRowIndented from "../../../../../../components/table/TableRowIndented.svelte";
  import {
    ForecastLength,
    ForecastLengths,
    ForecastStage,
    ForecastStages,
    getForecastMonths,
    LoanType,
  } from "../../_types/cashForecast";
  import type { ICashForecast, IFundingItem } from "../../_types/cashForecast";
  import ForecastDateDialog from "./general/ForecastDateDialog.svelte";
  import { cashForecastEventStore, events } from "../../_stores/cashForecastStore";
  import { calculateMonthCount } from "../../_stores/calculator/monthCalculator";
  import CurrencyInput from "../../../../../../components/inputs/CurrencyInput.svelte";
  import LabelCell from "../../../../../../components/table/LabelCell.svelte";
  import PercentInput from "../../../../../../components/inputs/PercentInput.svelte";
  import LaunchDateDialog from "./general/LaunchDateDialog.svelte";
  import Dropdown from "../../../../../../components/inputs/Dropdown.svelte";
  import ForecastStageDialog from "./general/ForecastStageDialog.svelte";
  import EntryTable from "../../../../../../components/table/EntryTable.svelte";

  export let cashForecast: ICashForecast;
  const publish = cashForecastEventStore.addEvent;

  $: forecastStageText = ForecastStages.find((f) => f.id == cashForecast.stage.value)?.name;
  $: partnersWithTerms = cashForecast.funding.list
    .filter((f) => f.repaymentTerms?.cashOut.list.length > 0)
    .map((f) => mapToProfit(f));

  function mapToProfit(funding: IFundingItem) {
    let totalCost = 0;
    switch (funding.type.value) {
      case LoanType.OneTime:
        totalCost = funding.cashIn.list[0].amount.value;
        break;
      case LoanType.Monthly:
        throw new Error("Monthly is not a valid type for a Funding");
      case LoanType.Multiple:
        totalCost = funding.cashIn.list.reduce((ttl, cashIn) => {
          return ttl + cashIn.amount.value;
        }, 0);
        break;
    }

    return {
      globalId: funding.globalId,
      name: funding.name.value,
      investment: totalCost,
      targetReturn: cashForecast.goals.partnerGoal.value,
      profit: totalCost * cashForecast.goals.partnerGoal.value - totalCost,
    };
  }

  // Modal dialogs + update methods
  const { open } = getContext("simple-modal");

  // forecast stage
  function openUpdateForecastStage() {
    open(
      ForecastStageDialog,
      { currentStage: cashForecast.stage.value, onOkay: updateForecastStage },
      {
        closeButton: false,
        closeOnEsc: true,
        closeOnOuterClick: false,
      }
    );
  }
  function updateForecastStage(newStage: ForecastStage) {
    if (newStage == cashForecast.stage.value) return;
    // if we change to Cost, we need to reset some other fields too
    if (newStage == ForecastStage.ViabilityCost) {
      const newLength = ForecastLength.ToLaunch;
      const newMonthCount =
        getForecastMonths(newLength) +
        calculateMonthCount(cashForecast.forecastStartDate.value, cashForecast.launchDate.value, true);
      const { stage, length, forecastMonthCount } = cashForecast;
      publish(events.SetForecastStageAndLength(stage, newStage, length, newLength, forecastMonthCount, newMonthCount));
    } else {
      publish(events.SetForecastStage(cashForecast.stage, newStage));
    }
  }

  // forecast date
  function openUpdateForecastDate() {
    open(
      ForecastDateDialog,
      {
        currentDate: cashForecast.forecastStartDate.value,
        bankBalanceDate: cashForecast.bankBalance.date.value,
        bankBalanceAmount: cashForecast.bankBalance.amount.value,
        onOkay: updateForecastDate,
      },
      {
        closeButton: false,
        closeOnEsc: true,
        closeOnOuterClick: false,
      }
    );
  }
  function updateForecastDate(newDate: Date, newBankBalance: number) {
    if (newDate == cashForecast.forecastStartDate.value && newBankBalance == cashForecast.bankBalance.amount.value)
      return;

    const forecastTypeMonths = getForecastMonths(cashForecast.length.value);
    const newMonthCount = forecastTypeMonths + calculateMonthCount(newDate, cashForecast.launchDate.value, true);
    publish(
      events.AdvanceForecastStartDate(
        cashForecast.forecastStartDate,
        newDate,
        cashForecast.forecastMonthCount,
        newMonthCount,
        cashForecast.bankBalance.date,
        newDate,
        cashForecast.bankBalance.amount,
        newBankBalance
      )
    );
  }

  // launch date
  function openUpdateLaunchDate() {
    open(
      LaunchDateDialog,
      { currentDate: cashForecast.launchDate.value, onOkay: updateLaunchDate },
      {
        closeButton: false,
        closeOnEsc: true,
        closeOnOuterClick: false,
      }
    );
  }
  function updateLaunchDate(newDate: Date) {
    if (newDate == cashForecast.launchDate.value) return;

    const forecastTypeMonths = getForecastMonths(cashForecast.length.value);
    const newMonthCount = forecastTypeMonths + calculateMonthCount(cashForecast.forecastStartDate.value, newDate, true);
    publish(events.SetLaunchDate(cashForecast.launchDate, newDate, cashForecast.forecastMonthCount, newMonthCount));
  }

  // forecast length
  function updateForecastLength(newLength: ForecastLength) {
    if (newLength == cashForecast.length.value) return;

    const forecastTypeMonths = getForecastMonths(newLength);
    const newMonthCount =
      forecastTypeMonths +
      calculateMonthCount(cashForecast.forecastStartDate.value, cashForecast.launchDate.value, true);
    publish(events.SetForecastLength(cashForecast.length, newLength, cashForecast.forecastMonthCount, newMonthCount));
  }
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-cf-forecast-row {
    padding-left: 0.1rem; // needs some indent
  }

  .gdb-nowrap {
    white-space: nowrap;
  }

  .gdb-general-row {
    display: flex;
    flex-direction: row;
    line-height: 2rem;
    margin: $space-s;

    & > .gdb-gen-label {
      min-width: 8rem;
      flex: 0 0;
    }
    & > .gdb-gen-input {
      min-width: 10rem;
      flex: 0 0;
    }
  }
</style>

<div class="gdb-cf-forecast-row">
  <div class="gdb-general-row">
    <div class="gdb-gen-label">Forecast Stage:</div>
    <div class="gdb-gen-input">{forecastStageText}</div>
    <div class="gdb-gen-button">
      <IconTextButton
        icon={PredefinedIcons.NextRound}
        value="Go to next Stage"
        on:click={openUpdateForecastStage}
        buttonStyle="primary-outline" />
    </div>
  </div>
  <div class="gdb-general-row">
    <div class="gdb-gen-label">Forecast Start:</div>
    <div class="gdb-gen-input"><DateOutput date={cashForecast.forecastStartDate.value} /></div>
    <div class="gdb-gen-button">
      <IconTextButton
        icon={PredefinedIcons.NextRound}
        value="Update"
        on:click={openUpdateForecastDate}
        buttonStyle="primary-outline" />
    </div>
  </div>
  <div class="gdb-general-row">
    <div class="gdb-gen-label">Target Launch:</div>
    <div class="gdb-gen-input"><DateOutput date={cashForecast.launchDate.value} /></div>
    <div class="gdb-gen-button">
      <IconTextButton
        icon={PredefinedIcons.NextRound}
        value="Update"
        on:click={openUpdateLaunchDate}
        buttonStyle="primary-outline" />
    </div>
  </div>
  <div class="gdb-general-row">
    <div class="gdb-gen-label">Forecast to:</div>
    <div class="gdb-gen-input">
      <Dropdown
        options={ForecastLengths}
        value={cashForecast.length.value}
        on:change={({ detail }) => updateForecastLength(detail.value)} />
    </div>
  </div>
</div>
{#if cashForecast.stage.value != ForecastStage.ViabilityCost}
  <div class="gdb-cf-forecast-row">
    <h3>Goals</h3>
    <p>How much of a profit are you aiming to make from this game for yourself? For your partners?</p>
    <p>
      <i>An estimated return 18 months after launch, used to evaluate the price and sales estimates.</i>
    </p>
    <EntryTable>
      <colgroup>
        <col span="1" style="width: 1rem;" />
        <col span="1" style="width: 12rem;" />
        <col span="1" style="width: 10rem;" />
        <col span="1" style="width: 10rem;" />
        <col span="1" style="width: 10rem;" />
        <col span="1" style="" /><!-- soak up excess width -->
      </colgroup>
      <tbody>
        <TableRowIndented isRecord={true} isTop={true} isBottom={true}>
          <td class="gdb-nowrap"> Your Goal: </td>
          <td>
            <CurrencyInput
              value={cashForecast.goals.yourGoal.value}
              on:change={({ detail }) => publish(events.SetYourGoal(cashForecast.goals.yourGoal, detail.value))} />
          </td>
        </TableRowIndented>
        <TableRowEmpty colspan={6} />
      </tbody>
      <tbody>
        <TableRowIndented isRecord={true} isTop={true} isBottom={true}>
          <td class="gdb-nowrap">Partner(s) Goal: </td>
          <td>
            <PercentInput
              value={cashForecast.goals.partnerGoal.value}
              max={10}
              on:change={({ detail }) =>
                publish(events.SetPartnerGoal(cashForecast.goals.partnerGoal, detail.value))} />
          </td>
        </TableRowIndented>

        <TableRowEmpty colspan={6} />
        <TableRowEmpty colspan={6} />
        <TableRowIndented>
          <td colspan="5"><b>Partners from the Assets & Funding tab:</b></td>
        </TableRowIndented>
        <TableRowIndented>
          <LabelCell>Name</LabelCell>
          <LabelCell>Investment</LabelCell>
          <LabelCell>Target Return</LabelCell>
          <LabelCell>Target Profit</LabelCell>
        </TableRowIndented>
        {#if partnersWithTerms.length > 0}
          {#each partnersWithTerms as partner (partner.globalId)}
            <TableRowIndented isRecord={true} isTop={true} isBottom={true}>
              <td class="gdb-nowrap">{partner.name}</td>
              <td>
                <CurrencyInput disabled={true} value={partner.investment} />
              </td>
              <td>
                <PercentInput disabled={true} value={partner.targetReturn} />
              </td>
              <td>
                <CurrencyInput disabled={true} value={partner.profit} />
              </td>
            </TableRowIndented>
          {/each}
        {:else}
          <TableRowIndented isRecord={true} isTop={true} isBottom={true}>
            <td class="gdb-nowrap"><i>No Partners Yet</i></td>
            <td />
            <td />
            <td />
          </TableRowIndented>
        {/if}
      </tbody>
    </EntryTable>
  </div>
{:else}
  <div class="gdb-cf-forecast-row">
    <h3>Goals</h3>
    <p>This section will be available in later stages to help evaluate against estimates sales</p>
  </div>
{/if}
