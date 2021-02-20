<script lang="ts">
  import DateOutput from "../../../../../../components/inputs/DateOutput.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import { cashForecastEventStore } from "../../_stores/cashForecastStore";
  import type { ICashForecast } from "../../_types/cashForecast";
  import BankBalance from "./assetTab/BankBalance.svelte";
  import FundingSection from "./assetTab/FundingSection.svelte";
  import LoanSection from "./assetTab/LoanSection.svelte";

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
    <col span="1" style="width: 12rem;" />
    <col span="1" style="width: 11rem;" />
    <col span="1" style="width: 10rem;" />
    <col span="1" style="width: 10rem;" />
    <col span="1" style="width: 13rem;" />
    <col span="1" style="" /><!-- soak up excess width -->
  </colgroup>
  <BankBalance {cashForecast} {publish} {forecastDate} colSpan={7} />
  <LoanSection {cashForecast} {publish} {forecastDate} colSpan={7} />
  <FundingSection {cashForecast} {publish} {forecastDate} {launchDate} colSpan={7} />
</table>
