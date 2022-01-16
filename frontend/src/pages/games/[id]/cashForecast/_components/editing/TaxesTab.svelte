<script lang="ts">
  import EntryTable from "../../../../../../components/table/EntryTable.svelte";
  import { cashForecastEventStore } from "../../_stores/cashForecastStore";
  import type { ICashForecast } from "../../_types/cashForecast";
  import ForecastSummary from "./ForecastSummary.svelte";
  import TaxesSection from "./taxesTab/TaxesSection.svelte";

  export let cashForecast: ICashForecast;
  const publish = cashForecastEventStore.addEvent;
  const forecastDate = cashForecast.forecastStartDate.value;
</script>

<style lang="scss">
  @import "../../../../../../styles/_variables.scss";
</style>

<ForecastSummary {cashForecast} />
<EntryTable>
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
</EntryTable>
