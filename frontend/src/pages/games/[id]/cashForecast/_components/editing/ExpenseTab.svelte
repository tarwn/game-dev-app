<script lang="ts">
  import { cashForecastEventStore } from "../../_stores/cashForecastStore";
  import type { ExpenseCategory, ICashForecast } from "../../_types/cashForecast";
  import ExpenseSection from "./expenseTab/ExpenseSection.svelte";
  import ForecastSummary from "./ForecastSummary.svelte";

  export let cashForecast: ICashForecast;
  export let expenseCategory: ExpenseCategory;
  const publish = cashForecastEventStore.addEvent;
  const forecastDate = cashForecast.forecastStartDate.value;
  const launchDate = cashForecast.launchDate.value;
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
</style>

<ForecastSummary {cashForecast} />
<table class="gdb-cf-table">
  <colgroup>
    <col span="1" style="width: 2rem;" />
    <col span="1" style="width: 14rem;" />
    <col span="1" style="width: 10rem;" />
    <col span="1" style="width: 11rem;" />
    <col span="1" style="width: 10rem;" />
    <col span="1" style="width: 11rem;" />
    <col span="1" style="width: 8rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="" /><!-- soak up excess width -->
  </colgroup>
  <ExpenseSection {publish} {cashForecast} {forecastDate} {launchDate} {expenseCategory} colSpan={8} />
</table>
