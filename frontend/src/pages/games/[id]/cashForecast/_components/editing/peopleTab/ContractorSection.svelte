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
  import type { ICashForecast, IContractorExpense } from "../../../_types/cashForecast";
  import { ContractorExpenseFrequencys, ContractorExpenseFrequency } from "../../../_types/cashForecast";
  import { ExpenseCategories, ExpenseCategory } from "../../../_types/cashForecast";
  import TableRowIndented from "../table/TableRowIndented.svelte";
  import TableSubHeaderRow from "../table/TableSubHeaderRow.svelte";
  import LabeledInput from "../../../../../../../components/inputs/LabeledInput.svelte";
  import SpacedButtons from "../../../../../../../components/buttons/SpacedButtons.svelte";
  import FauxLabelCell from "../table/FauxLabelCell.svelte";
  import TableRowEmpty from "../table/TableRowEmpty.svelte";

  export let cashForecast: ICashForecast;
  export let forecastDate: Date;
  export let launchDate: Date;
  export let colSpan: number;
  export let publish: (event: IEvent<ICashForecast>) => void;

  // subset of relevant expenses, sorted
  const sortFn = (a: IContractorExpense, b: IContractorExpense) => {
    if (a.name.value.toLocaleLowerCase() > b.name.value.toLocaleLowerCase()) {
      return 1;
    } else if (a.name.value.toLocaleLowerCase() < b.name.value.toLocaleLowerCase()) {
      return -1;
    }

    return a.payments.list[0].startDate.value.getTime() - b.payments.list[0].startDate.value.getTime();
  };
  $: sortedContractors = cashForecast.contractors.list.slice().sort(sortFn);

  // complex event updates
  function updateCategory(employee: IContractorExpense, e: any) {
    const value = parseInt(e.target.value) as ExpenseCategory;
    publish(events.SetContractorCategory(employee.category, value));
  }

  function updateFrequency(employee: IContractorExpense, e: any) {
    const value = parseInt(e.target.value) as ContractorExpenseFrequency;
    publish(events.SetContractorFrequency(employee.frequency, value));
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

  td.gdb-no-label {
    padding-top: 1.6rem;
  }
</style>

<TableSubHeaderRow colspan={colSpan} value={"Contractors"} />
{#each sortedContractors as contractor (contractor.globalId)}
  <tbody
    animate:flip={{ duration: 500 }}
    in:receive|local={{ key: contractor.globalId }}
    out:send|local={{ key: contractor.globalId }}>
    <TableRowIndented
      isRecord={true}
      isTop={true}
      isBottom={contractor.frequency.value === ContractorExpenseFrequency.Monthly}>
      <td>
        <LabeledInput label="Name / Role" vertical={true}>
          <TextInput
            maxLength={30}
            value={contractor.name.value}
            aria-label="Employee name"
            on:change={({ detail }) => publish(events.SetContractorName(contractor.name, detail.value))} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label="Category" vertical={true}>
          <!-- svelte-ignore a11y-no-onchange -->
          <select
            value={contractor.category.value}
            aria-label="Expense category"
            on:change={(e) => updateCategory(contractor, e)}>
            {#each ExpenseCategories as category}
              <option value={category.id}>{category.name}</option>
            {/each}
          </select>
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label="Frequency" vertical={true}>
          <!-- svelte-ignore a11y-no-onchange -->
          <select
            value={contractor.frequency.value}
            aria-label="Payment type/frequency"
            on:change={(e) => updateFrequency(contractor, e)}>
            {#each ContractorExpenseFrequencys as frequency}
              <option value={frequency.id}>{frequency.name}</option>
            {/each}
          </select>
        </LabeledInput>
      </td>
      <td>
        <LabeledInput
          label={contractor.frequency.value == ContractorExpenseFrequency.Custom ? "Date" : "Start Date"}
          vertical={true}>
          <DateInput
            value={contractor.payments.list[0].startDate.value}
            aria-label="Start Date"
            on:change={({ detail }) =>
              publish(events.SetContractorPaymentStartDate(contractor.payments.list[0].startDate, detail.value))} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label="Amount" vertical={true}>
          <CurrencyInput
            value={contractor.payments.list[0].amount.value}
            aria-label="Amount"
            on:change={({ detail }) =>
              publish(events.SetContractorPaymentAmount(contractor.payments.list[0].amount, detail.value))} />
        </LabeledInput>
      </td>
      {#if contractor.frequency.value == ContractorExpenseFrequency.Monthly}
        <td colspan="2">
          <LabeledInput label="End Date" vertical={true}>
            <DateInput
              value={contractor.payments.list[0].endDate.value}
              aria-label="End Date"
              on:change={({ detail }) =>
                publish(events.SetContractorPaymentEndDate(contractor.payments.list[0].endDate, detail.value))} />
          </LabeledInput>
        </td>
      {:else}
        <td colspan="2" class="gdb-no-label">
          <IconTextButton
            icon={PredefinedIcons.Delete}
            buttonStyle="secondary-negative"
            disabled={false}
            value=""
            on:click={() => publish(events.DeleteContractorPayment(contractor.payments.list[0]))} />
        </td>
      {/if}
      <td class="gdb-no-label">
        <IconTextButton
          icon={PredefinedIcons.Delete}
          buttonStyle="secondary-negative"
          disabled={false}
          value="Delete"
          on:click={() => publish(events.DeleteContractor(contractor))} />
      </td>
    </TableRowIndented>
    <!-- additional rows here -->
    {#if contractor.frequency.value == ContractorExpenseFrequency.Custom}
      {#each contractor.payments.list as payment, i (payment.globalId)}
        {#if i > 0}
          <TableRowIndented isRecord={true}>
            <td />
            <td />
            <td />
            <td>
              <DateInput
                value={payment.startDate.value}
                aria-label="Date"
                on:change={({ detail }) =>
                  publish(events.SetContractorPaymentStartDate(payment.startDate, detail.value))} />
            </td>
            <td>
              <CurrencyInput
                value={payment.amount.value}
                aria-label="Amount"
                on:change={({ detail }) => publish(events.SetContractorPaymentAmount(payment.amount, detail.value))} />
            </td>
            <td>
              <IconTextButton
                icon={PredefinedIcons.Delete}
                buttonStyle="secondary-negative"
                disabled={false}
                value=""
                on:click={() => publish(events.DeleteContractorPayment(payment))} />
            </td>
            <td colspan="2" />
          </TableRowIndented>
        {/if}
      {/each}
      <TableRowIndented isRecord={true} isBottom={true}>
        <td />
        <td />
        <td />
        <td colSpan={colSpan - 4}>
          <IconTextButton
            icon={PredefinedIcons.Plus}
            buttonStyle="primary-outline"
            disabled={false}
            value="Add Another Payment"
            on:click={() =>
              publish(
                events.AddContractorPayment(contractor.payments.globalId, {
                  date: contractor.payments.list.slice(-1)[0].startDate.value,
                })
              )} />
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
      value={cashForecast.employees.list.length === 0 ? "Add a Contractor" : "Add another Contractor"}
      buttonStyle="primary-outline"
      on:click={() =>
        publish(
          events.AddContractor(cashForecast.contractors.globalId, {
            date: forecastDate,
            expenseCategory: ExpenseCategory.DirectExpenses,
            frequency: ContractorExpenseFrequency.Monthly,
          })
        )} />
  </td>
</TableRowIndented>
