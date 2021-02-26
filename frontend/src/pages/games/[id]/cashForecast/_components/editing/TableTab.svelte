<script lang="ts">
  import ForecastTable from "../shared/ForecastTable.svelte";

  import DateOutput from "../../../../../../components/inputs/DateOutput.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import type { IProjectedCashFlowData } from "../../_stores/calculator/types";
  import type { ICashForecast } from "../../_types/cashForecast";

  export let cashForecast: ICashForecast;
  export let projection: IProjectedCashFlowData;

  $: forecastDate = cashForecast.forecastStartDate.value;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-cf-forecast-row {
    padding-left: 0.1rem; // needs some indent
  }

  .gbd-table-wrapper {
    box-shadow: inset -7px 0 9px -7px $cs-grey-0;
  }
</style>

<div class="gdb-cf-forecast-row">
  <LabeledInput label="Forecast Start Date">
    <DateOutput date={forecastDate} />
  </LabeledInput>
</div>
<div class="gbd-table-wrapper">
  <ForecastTable {cashForecast} {projection} />
</div>
