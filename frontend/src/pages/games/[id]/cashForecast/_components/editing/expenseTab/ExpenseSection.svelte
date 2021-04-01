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
  import {
    ExpenseCategory,
    ExpenseFrequencies,
    ExpenseFrequency,
    ExpenseUntil,
    ExpenseUntils,
    isFrequencyRecurring,
  } from "../../../_types/cashForecast";
  import type { ICashForecast, IGenericExpense } from "../../../_types/cashForecast";
  import TableRowIndented from "../../../../../../../components/table/TableRowIndented.svelte";
  import TableSubHeaderRow from "../../../../../../../components/table/TableSubHeaderRow.svelte";
  import NotApplicableCell from "../../../../../../../components/table/NotApplicableCell.svelte";
  import LabelCell from "../../../../../../../components/table/LabelCell.svelte";
  import TableRowEmpty from "../../../../../../../components/table/TableRowEmpty.svelte";

  export let cashForecast: ICashForecast;
  export let forecastDate: Date;
  export let launchDate: Date;
  export let expenseCategory: ExpenseCategory;
  export let colSpan: number;
  export let publish: (event: IEvent<ICashForecast>) => void;

  // subset of relevant expenses, sorted
  const sortFn = (a: IGenericExpense, b: IGenericExpense) => {
    if (a.name.value.toLocaleLowerCase() > b.name.value.toLocaleLowerCase()) {
      return 1;
    } else if (a.name.value.toLocaleLowerCase() < b.name.value.toLocaleLowerCase()) {
      return -1;
    }

    return a.startDate.value.getTime() - b.startDate.value.getTime();
  };
  $: expenses = cashForecast.expenses.list.filter((e) => e.category.value == expenseCategory).sort(sortFn);

  // complex event updates
  function updateFrequency(expense: IGenericExpense, e: any) {
    const value = parseInt(e.target.value) as ExpenseFrequency;
    publish(events.SetExpenseFrequency(expense.frequency, value));
  }

  function updateUntil(expense: IGenericExpense, e: any) {
    const value = parseInt(e.target.value) as ExpenseUntil;
    publish(events.SetExpenseUntil(expense.until, value));
  }

  // animation
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

<TableSubHeaderRow colspan={colSpan} value={"Expenses"} />
<TableRowIndented>
  <LabelCell>Name</LabelCell>
  <LabelCell>Frequency</LabelCell>
  <LabelCell>Date</LabelCell>
  <LabelCell>Until</LabelCell>
  <LabelCell>End Date</LabelCell>
  <LabelCell>Amount</LabelCell>
</TableRowIndented>
{#each expenses as expense (expense.globalId)}
  <tbody
    in:receive|local={{ key: expense.globalId }}
    out:send|local={{ key: expense.globalId }}
    animate:flip={{ duration: 500 }}>
    <TableRowIndented isRecord={true} isTop={true} isBottom={true}>
      <td>
        <TextInput
          maxLength={30}
          value={expense.name.value}
          aria-label="Expense name"
          on:change={({ detail }) => publish(events.SetExpenseName(expense.name, detail.value))} />
      </td>
      <td>
        <!-- svelte-ignore a11y-no-onchange -->
        <select value={expense.frequency.value} aria-label="Frequency" on:change={(e) => updateFrequency(expense, e)}>
          {#each ExpenseFrequencies as frequency}
            <option value={frequency.id}>{frequency.name}</option>
          {/each}
        </select>
      </td>
      <td>
        <DateInput
          value={expense.startDate.value}
          aria-label="Start Date"
          on:change={({ detail }) => publish(events.SetExpenseStartDate(expense.startDate, detail.value))} />
      </td>
      {#if !isFrequencyRecurring(expense.frequency.value)}
        <NotApplicableCell />
      {:else}
        <td>
          <!-- svelte-ignore a11y-no-onchange -->
          <select value={expense.until.value} aria-label="Until" on:change={(e) => updateUntil(expense, e)}>
            {#each ExpenseUntils as until}
              <option value={until.id}>{until.name}</option>
            {/each}
          </select>
        </td>
      {/if}
      {#if !isFrequencyRecurring(expense.frequency.value)}
        <NotApplicableCell />
      {:else if expense.until.value === ExpenseUntil.Date}
        <td>
          <DateInput
            value={expense.endDate.value}
            aria-label="End Date"
            on:change={({ detail }) => publish(events.SetExpenseEndDate(expense.endDate, detail.value))} />
        </td>
      {:else}
        <td>
          <DateInput
            value={launchDate}
            aria-label="End Date"
            disabled={true}
            on:change={({ detail }) => publish(events.SetExpenseEndDate(expense.endDate, detail.value))} />
        </td>
      {/if}
      <td>
        <CurrencyInput
          value={expense.amount.value}
          aria-label="Amount"
          on:change={({ detail }) => publish(events.SetExpenseAmount(expense.amount, detail.value))} />
      </td>
      <td>
        <IconTextButton
          icon={PredefinedIcons.Delete}
          buttonStyle="secondary-negative"
          disabled={false}
          value="Delete"
          on:click={() => publish(events.DeleteExpense(expense))} />
      </td>
    </TableRowIndented>
    <TableRowEmpty colspan={colSpan} />
  </tbody>
{/each}
<!-- add row -->
<TableRowIndented>
  <td colspan={colSpan - 1}>
    <IconTextButton
      icon={PredefinedIcons.Plus}
      value={expenses.length === 0 ? "Add an Expense" : "Add another Expense"}
      buttonStyle="primary-outline"
      on:click={() =>
        publish(events.AddExpense(cashForecast.expenses.globalId, { date: forecastDate, expenseCategory }))} />
  </td>
</TableRowIndented>
