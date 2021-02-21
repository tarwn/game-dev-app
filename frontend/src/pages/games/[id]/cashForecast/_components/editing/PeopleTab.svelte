<script lang="ts">
  import DateOutput from "../../../../../../components/inputs/DateOutput.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import { cashForecastEventStore } from "../../_stores/cashForecastStore";
  import type { ICashForecast } from "../../_types/cashForecast";
  import ContractorSection from "./peopleTab/ContractorSection.svelte";
  import EmployeeSection from "./peopleTab/EmployeeSection.svelte";

  export let cashForecast: ICashForecast;
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

    :global(select) {
      max-width: 100%;
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
    <col span="1" style="width: 10rem;" />
    <col span="1" style="width: 10.5rem;" />
    <col span="1" style="width: 10.5rem;" />
    <col span="1" style="width: 10.5rem;" />
    <col span="1" style="width: 6rem;" />
    <col span="1" style="width: 4rem;" />
    <col span="1" style="width: 10rem;" />
    <col span="1" style="" /><!-- soak up excess width -->
  </colgroup>
  <EmployeeSection {publish} {cashForecast} {forecastDate} {launchDate} colSpan={10} />
  <ContractorSection {publish} {cashForecast} {forecastDate} colSpan={10} />
</table>
