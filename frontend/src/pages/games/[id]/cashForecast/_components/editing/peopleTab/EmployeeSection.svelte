<script lang="ts">
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";

  import IconTextButton from "../../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../../components/buttons/PredefinedIcons";
  import CurrencyInput from "../../../../../../../components/inputs/CurrencyInput.svelte";
  import DateInput from "../../../../../../../components/inputs/DateInput.svelte";
  import TextInput from "../../../../../../../components/inputs/TextInput.svelte";
  import type { IEvent, IIdentifiedPrimitive } from "../../../../../../_stores/eventStore/types";
  import { events } from "../../../_stores/cashForecastStore";
  import type { ICashForecast, IEmployeeExpense } from "../../../_types/cashForecast";
  import {
    AdditionalEmployeeExpenseFrequencys,
    AdditionalEmployeeExpenseType,
    AdditionalEmployeeExpenseTypes,
    isCurrencyAdditionalEmployeeExpenseType,
    isDatedAdditionalEmployeeExpenseType,
  } from "../../../_types/cashForecast";
  import { AdditionalEmployeeExpenseFrequency, ExpenseCategories, ExpenseCategory } from "../../../_types/cashForecast";
  import TableRowIndented from "../table/TableRowIndented.svelte";
  import TableSubHeaderRow from "../table/TableSubHeaderRow.svelte";
  import LabelCell from "../table/LabelCell.svelte";
  import PercentInput from "../../../../../../../components/inputs/PercentInput.svelte";
  import FauxLabelCell from "../table/FauxLabelCell.svelte";
  import SpacedButtons from "../../../../../../../components/buttons/SpacedButtons.svelte";
  import DateOutput from "../../../../../../../components/inputs/DateOutput.svelte";
  import { listen } from "svelte/internal";
  import LabeledInput from "../../../../../../../components/inputs/LabeledInput.svelte";
  import TableRowEmpty from "../table/TableRowEmpty.svelte";

  export let cashForecast: ICashForecast;
  export let forecastDate: Date;
  export let launchDate: Date;
  export let colSpan: number;
  export let publish: (event: IEvent<ICashForecast>) => void;

  // subset of relevant expenses, sorted
  const sortFn = (a: IEmployeeExpense, b: IEmployeeExpense) => {
    if (a.name.value.toLocaleLowerCase() > b.name.value.toLocaleLowerCase()) {
      return 1;
    } else if (a.name.value.toLocaleLowerCase() < b.name.value.toLocaleLowerCase()) {
      return -1;
    }

    return a.startDate.value.getTime() - b.startDate.value.getTime();
  };
  $: sortedEmployees = cashForecast.employees.list.slice().sort(sortFn);

  // complex event updates
  function updateCategory(employee: IEmployeeExpense, e: any) {
    const value = parseInt(e.target.value) as ExpenseCategory;
    publish(events.SetEmployeeCategory(employee.category, value));
  }

  function updateAdditionalPayType(additionalPayType: IIdentifiedPrimitive<AdditionalEmployeeExpenseType>, e: any) {
    const value = parseInt(e.target.value) as AdditionalEmployeeExpenseType;
    publish(events.SetEmployeeAdditionalPayType(additionalPayType, value));
  }

  function updateAdditionalPayFrequency(
    additionalPayFreq: IIdentifiedPrimitive<AdditionalEmployeeExpenseFrequency>,
    e: any
  ) {
    const value = parseInt(e.target.value) as AdditionalEmployeeExpenseFrequency;
    publish(events.SetEmployeeAdditionalPayFrequency(additionalPayFreq, value));
  }

  // animation
  // this gives us a nice animation during sorting but not on create/delete
  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),
    fallback(node) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      // duration 0 for fallback so initial/final animation not used
      return {
        duration: 0,
        easing: quintOut,
        css: (t) => `
					transform: ${transform} scale(${t});
          opacity: ${t};
				`,
      };
    },
  });
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";
</style>

<TableSubHeaderRow colspan={colSpan} value={"Employees"} />
<TableRowIndented>
  <LabelCell>Name / Role</LabelCell>
  <LabelCell>Category</LabelCell>
  <LabelCell>Start Date</LabelCell>
  <LabelCell>End Date</LabelCell>
  <LabelCell>Pay Amount (monthly)</LabelCell>
  <LabelCell>Benefits / Taxes</LabelCell>
</TableRowIndented>
{#each sortedEmployees as employee (employee.globalId)}
  <tbody
    animate:flip={{ duration: 500 }}
    in:receive|local={{ key: employee.globalId }}
    out:send|local={{ key: employee.globalId }}>
    <TableRowIndented isRecord={true} isTop={true} isBottom={employee.additionalPay.list.length == 0}>
      <td>
        <TextInput
          maxLength={30}
          value={employee.name.value}
          aria-label="Employee name"
          on:change={({ detail }) => publish(events.SetEmployeeName(employee.name, detail.value))} />
      </td>
      <td>
        <!-- svelte-ignore a11y-no-onchange -->
        <select
          value={employee.category.value}
          aria-label="Expense category"
          on:change={(e) => updateCategory(employee, e)}>
          {#each ExpenseCategories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
      </td>
      <td>
        <DateInput
          value={employee.startDate.value}
          aria-label="Start Date"
          on:change={({ detail }) => publish(events.SetEmployeeStartDate(employee.startDate, detail.value))} />
      </td>
      <td>
        <DateInput
          value={employee.endDate.value}
          aria-label="End Date"
          on:change={({ detail }) => publish(events.SetEmployeeEndDate(employee.endDate, detail.value))} />
      </td>
      <td>
        <CurrencyInput
          value={employee.salaryAmount.value}
          aria-label="Amount"
          on:change={({ detail }) => publish(events.SetEmployeeAmount(employee.salaryAmount, detail.value))} />
      </td>
      <td>
        <PercentInput
          value={employee.benefitsPercent.value}
          aria-label="Benefits/taxes"
          title="Percent for benefits and taxes"
          on:change={({ detail }) => publish(events.SetEmployeeBenefits(employee.benefitsPercent, detail.value))} />
      </td>
      <td colspan="2">
        <SpacedButtons>
          {#if employee.additionalPay.list.length === 0}
            <IconTextButton
              icon={PredefinedIcons.Plus}
              buttonStyle="primary-outline"
              disabled={false}
              value="Addtl Pay"
              on:click={() =>
                publish(events.AddEmployeeAdditionalPay(employee.additionalPay.globalId, { date: launchDate }))} />
          {/if}
          <IconTextButton
            icon={PredefinedIcons.Delete}
            buttonStyle="secondary-negative"
            disabled={false}
            value="Delete"
            on:click={() => publish(events.DeleteEmployee(employee))} />
        </SpacedButtons>
      </td>
    </TableRowIndented>
    {#each employee.additionalPay.list as additionalPay, i (additionalPay.globalId)}
      <TableRowIndented isRecord={true}>
        {#if i == 0}
          <FauxLabelCell isShort={true}>Addtl Pay:</FauxLabelCell>
        {:else}
          <FauxLabelCell isShort={true}>and:</FauxLabelCell>
        {/if}
        <td>
          <!-- svelte-ignore a11y-no-onchange -->
          <select
            value={additionalPay.type.value}
            aria-label="Additional pay type"
            on:change={(e) => updateAdditionalPayType(additionalPay.type, e)}>
            {#each AdditionalEmployeeExpenseTypes as type}
              <option value={type.id}>{type.name}</option>
            {/each}
          </select>
        </td>
        <td>
          {#if isCurrencyAdditionalEmployeeExpenseType(additionalPay.type.value)}
            <CurrencyInput
              value={additionalPay.amount.value}
              aria-label="Dollar amount"
              on:change={({ detail }) =>
                publish(events.SetAdditionalEmployeePayAmount(additionalPay.amount, detail.value))} />
          {:else}
            <PercentInput
              value={additionalPay.amount.value}
              aria-label="Percent amount"
              on:change={({ detail }) =>
                publish(events.SetAdditionalEmployeePayAmount(additionalPay.amount, detail.value))} />
          {/if}
        </td>
        <td>
          {#if isDatedAdditionalEmployeeExpenseType(additionalPay.type.value)}
            <!-- svelte-ignore a11y-no-onchange -->
            <select
              value={additionalPay.frequency.value}
              aria-label="Pay date"
              on:change={(e) => updateAdditionalPayFrequency(additionalPay.frequency, e)}>
              {#each AdditionalEmployeeExpenseFrequencys as frequency}
                <option value={frequency.id}>{frequency.name}</option>
              {/each}
            </select>
          {/if}
        </td>
        <td>
          {#if isDatedAdditionalEmployeeExpenseType(additionalPay.type.value)}
            {#if additionalPay.frequency.value == AdditionalEmployeeExpenseFrequency.Launch}
              <DateOutput date={launchDate} />
            {:else}
              <DateInput
                value={additionalPay.date.value}
                aria-label="Start Date"
                on:change={({ detail }) =>
                  publish(events.SetEmployeeAdditionalPayDate(additionalPay.date, detail.value))} />
            {/if}
          {/if}
        </td>
        <td>
          <IconTextButton
            icon={PredefinedIcons.Delete}
            buttonStyle="secondary-negative"
            disabled={false}
            value=""
            on:click={() => publish(events.DeleteEmployeeAdditionalPay(additionalPay))} />
        </td>
        <td colspan="2" />
      </TableRowIndented>
    {/each}
    {#if employee.additionalPay.list.length > 0}
      <TableRowIndented isRecord={true} isBottom={true}>
        <td />
        <td colSpan={colSpan - 2}>
          <IconTextButton
            icon={PredefinedIcons.Plus}
            buttonStyle="primary-outline"
            disabled={false}
            value="Add more additional pay"
            on:click={() =>
              publish(events.AddEmployeeAdditionalPay(employee.additionalPay.globalId, { date: launchDate }))} />
        </td>
      </TableRowIndented>
    {/if}
    <TableRowEmpty colspan={colSpan} />
  </tbody>
{/each}
<!-- add row -->
<TableRowIndented>
  <td colspan={colSpan - 1}>
    <IconTextButton
      icon={PredefinedIcons.Plus}
      value={cashForecast.employees.list.length === 0 ? "Add an Employee" : "Add another Employee"}
      buttonStyle="primary-outline"
      on:click={() =>
        publish(
          events.AddEmployee(cashForecast.employees.globalId, {
            date: forecastDate,
            expenseCategory: ExpenseCategory.DirectExpenses,
          })
        )} />
  </td>
</TableRowIndented>
