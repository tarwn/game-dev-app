<script lang="ts">
  import EntryTable from "../../../../../../components/table/EntryTable.svelte";
  import { cashForecastEventStore } from "../../_stores/cashForecastStore";
  import type { ICashForecast } from "../../_types/cashForecast";
  import BankBalance from "./assetTab/BankBalance.svelte";
  import FundingSection from "./assetTab/FundingSection.svelte";
  import LoanSection from "./assetTab/LoanSection.svelte";
  import ForecastSummary from "./ForecastSummary.svelte";

  export let cashForecast: ICashForecast;
  const publish = cashForecastEventStore.addEvent;
  const forecastDate = cashForecast.forecastStartDate.value;
  const launchDate = cashForecast.launchDate.value;
</script>

<style lang="scss">
  @import "../../../../../../styles/_variables.scss";
</style>

<ForecastSummary {cashForecast} />
<EntryTable>
  <colgroup>
    <col span="1" style="width: 2rem;" />
    <col span="1" style="width: 14rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="width: 10rem;" />
    <col span="1" style="width: 10rem;" />
    <col span="1" style="width: 13rem;" />
    <col span="1" style="" /><!-- soak up excess width -->
  </colgroup>
  <BankBalance {cashForecast} {publish} {forecastDate} colSpan={7} />
  <LoanSection {cashForecast} {publish} {forecastDate} colSpan={7} />
  <FundingSection {cashForecast} {publish} {forecastDate} {launchDate} colSpan={7} />
</EntryTable>
