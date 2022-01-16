<script lang="ts">
  import ForecastTable from "../shared/ForecastTable.svelte";
  import type { IProjectedCashFlowData } from "../../_stores/calculator/types";
  import type { ICashForecast } from "../../_types/cashForecast";
  import ForecastSummary from "./ForecastSummary.svelte";

  export let cashForecast: ICashForecast;
  export let projection: IProjectedCashFlowData;
</script>

<style lang="scss">
  @import "../../../../../../styles/_variables.scss";

  .gbd-table-wrapper {
    box-shadow: inset -7px 0 9px -7px $cs-grey-0;
  }
</style>

<ForecastSummary {cashForecast} />
<div class="gbd-table-wrapper">
  <ForecastTable {cashForecast} {projection} />
</div>
