<script lang="ts">
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";

  import IconTextButton from "../../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../../components/buttons/PredefinedIcons";
  import DateInput from "../../../../../../../components/inputs/DateInput.svelte";
  import TextInput from "../../../../../../../components/inputs/TextInput.svelte";
  import type { IEvent } from "../../../../../../_stores/eventStore/types";
  import { events } from "../../../_stores/cashForecastStore";
  import { NetIncomeCategory, NetIncomeCategorys, TaxSchedule, TaxSchedules } from "../../../_types/cashForecast";
  import type { ITax, ICashForecast } from "../../../_types/cashForecast";
  import TableRowIndented from "../../../../../../../components/table/TableRowIndented.svelte";
  import TableSubHeaderRow from "../../../../../../../components/table/TableSubHeaderRow.svelte";
  import LabelCell from "../../../../../../../components/table/LabelCell.svelte";
  import TableRowEmpty from "../../../../../../../components/table/TableRowEmpty.svelte";
  import PercentInput from "../../../../../../../components/inputs/PercentInput.svelte";
  import { getUtcDate } from "../../../../../../../utilities/date";

  export let cashForecast: ICashForecast;
  export let forecastDate: Date;
  export let colSpan: number;
  export let publish: (event: IEvent<ICashForecast>) => void;

  $: nextJanuary = getUtcDate(forecastDate.getUTCFullYear() + 1, 0, 1);

  // complex event updates
  function updateBasedOn(tax: ITax, e: any) {
    const value = parseInt(e.target.value) as NetIncomeCategory;
    publish(events.SetTaxBasedOn(tax.basedOn, value));
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
  <LabelCell>Based On</LabelCell>
  <LabelCell>Amount</LabelCell>
  <LabelCell>Schedule</LabelCell>
  <LabelCell>Due Date</LabelCell>
</TableRowIndented>
{#each cashForecast.taxes.list as tax (tax.globalId)}
  <tbody
    in:receive|local={{ key: tax.globalId }}
    out:send|local={{ key: tax.globalId }}
    animate:flip={{ duration: 500 }}>
    <TableRowIndented isRecord={true} isTop={true} isBottom={true}>
      <td>
        <TextInput
          maxLength={30}
          value={tax.name.value}
          aria-label="Expense name"
          on:change={({ detail }) => publish(events.SetTaxName(tax.name, detail.value))} />
      </td>
      <td>
        <!-- svelte-ignore a11y-no-onchange -->
        <select value={tax.basedOn.value} aria-label="Frequency" on:change={(e) => updateBasedOn(tax, e)}>
          {#each NetIncomeCategorys as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
      </td>
      <td>
        <PercentInput
          value={tax.amount.value}
          aria-label="Amount"
          on:change={({ detail }) => publish(events.SetTaxAmount(tax.amount, detail.value))} />
      </td>
      <td>
        <TextInput value={TaxSchedules.find((ts) => ts.id == tax.schedule.value).name} disabled={true} />
      </td>

      <td>
        <DateInput
          value={tax.dueDate.value}
          aria-label="Due Date"
          on:change={({ detail }) => publish(events.SetTaxDueDate(tax.dueDate, detail.value))} />
      </td>
      <td>
        <IconTextButton
          icon={PredefinedIcons.Delete}
          buttonStyle="secondary-negative"
          disabled={false}
          value="Delete"
          on:click={() => publish(events.DeleteTax(tax))} />
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
      value={"Add Tax"}
      buttonStyle="primary-outline"
      on:click={() =>
        publish(
          events.AddTax(cashForecast.taxes.globalId, {
            date: nextJanuary,
            schedule: TaxSchedule.Annual,
            basedOn: NetIncomeCategory.NetProfitShare,
          })
        )} />
  </td>
</TableRowIndented>
