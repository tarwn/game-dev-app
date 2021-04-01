<script lang="ts">
  import EntryTable from "../../../../../../components/table/EntryTable.svelte";
  import { cashForecastEventStore } from "../../_stores/cashForecastStore";
  import type { ICashForecast } from "../../_types/cashForecast";
  import ForecastSummary from "./ForecastSummary.svelte";
  import ContractorSection from "./peopleTab/ContractorSection.svelte";
  import EmployeeSection from "./peopleTab/EmployeeSection.svelte";

  export let cashForecast: ICashForecast;
  const publish = cashForecastEventStore.addEvent;
  const forecastDate = cashForecast.forecastStartDate.value;
  const launchDate = cashForecast.launchDate.value;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";
</style>

<ForecastSummary {cashForecast} />
<EntryTable>
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
</EntryTable>
