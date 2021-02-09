<script lang="ts">
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";

  import IconTextButton from "../../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../../components/buttons/PredefinedIcons";
  import CurrencyInput from "../../../../../../../components/inputs/CurrencyInput.svelte";
  import DateInput from "../../../../../../../components/inputs/DateInput.svelte";
  import TextInput from "../../../../../../../components/inputs/TextInput.svelte";
  import type { IEvent } from "../../../../../../_stores/eventStore/types";
  import { events } from "../../../_stores/cashForecastStore";
  import type { ICashForecast, IEmployeeExpense } from "../../../_types/cashForecast";
  import {
    AdditionalEmployeeExpenseFrequency,
    ExpenseCategories,
    ExpenseCategory,
    ExpenseFrequency,
  } from "../../../_types/cashForecast";
  import TableRowIndented from "../table/TableRowIndented.svelte";
  import TableSubHeaderRow from "../table/TableSubHeaderRow.svelte";
  import LabelCell from "../table/LabelCell.svelte";
  import PercentInput from "../../../../../../../components/inputs/PercentInput.svelte";
  import FauxLabelCell from "../table/FauxLabelCell.svelte";
  import SpacedButtons from "../../../../../../../components/buttons/SpacedButtons.svelte";

  export let cashForecast: ICashForecast;
  export let forecastDate: Date;
  export let launchDate: Date;
  export let colSpan: number;
  export let publish: (event: IEvent<ICashForecast>) => void;

  // subset of relevant expenses, sorted
  // const sortFn = (a: IEmployeeExpense, b: IEmployeeExpense) => {
  //   if (a.name.value.toLocaleLowerCase() > b.name.value.toLocaleLowerCase()) {
  //     return 1;
  //   } else if (a.name.value.toLocaleLowerCase() < b.name.value.toLocaleLowerCase()) {
  //     return -1;
  //   }

  //   return a.startDate.value.getTime() - b.startDate.value.getTime();
  // };

  // complex event updates
  function updateCategory(employee: IEmployeeExpense, e: any) {
    const value = parseInt(e.target.value) as ExpenseCategory;
    publish(events.SetEmployeeCategory(employee.category, value));
  }

  // animation
  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),
    fallback(node) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 600,
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
{#each cashForecast.employees.list as employee (employee.globalId)}
  <tbody
    in:receive|local={{ key: employee.globalId }}
    out:send|local={{ key: employee.globalId }}
    animate:flip={{ duration: 500 }}>
    <tr>
      <td />
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
      <td>
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
    </tr>
    {#each employee.additionalPay.list as additionalPay, i (additionalPay.globalId)}
      <TableRowIndented>
        {#if i == 0}
          <FauxLabelCell isShort={true}>Addtl Pay:</FauxLabelCell>
        {:else}
          <td />
        {/if}
        <td> Select </td>
        <td> amount </td>
        <td>freq OR colspan 3 text</td>
        <td>opt date</td>
        <td>delete</td>
        <td />
      </TableRowIndented>
    {/each}
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
