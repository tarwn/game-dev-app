<script lang="ts">
  import DateOutput from "../../../../../../components/inputs/DateOutput.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import { cashForecastEventStore } from "../../_stores/cashForecastStore";
  import type { ICashForecast } from "../../_types/cashForecast";
  import TaxesSection from "./taxesTab/TaxesSection.svelte";

  export let cashForecast: ICashForecast;
  const publish = cashForecastEventStore.addEvent;
  const forecastDate = cashForecast.forecastStartDate.value;
  // TODO - add launch date into cashforecast and default on creation from game data
  //  later can add an option to project to a different date and warn if diff from overall game launch date
  const launchDate = new Date(forecastDate.getTime());
  launchDate.setMonth(forecastDate.getMonth() + 12);
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
    <col span="1" style="width: 14rem;" />
    <col span="1" style="width: 6rem;" />
    <col span="1" style="width: 11rem;" />
    <col span="1" style="width: 11rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="" /><!-- soak up excess width -->
  </colgroup>
  <TaxesSection {publish} {cashForecast} {forecastDate} colSpan={7} />
</table>
