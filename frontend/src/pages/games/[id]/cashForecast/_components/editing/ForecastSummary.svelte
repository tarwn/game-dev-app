<script lang="ts">
  import DateSpan from "../../../../../../components/inputs/DateSpan.svelte";
  import { ForecastLengths } from "../../_types/cashForecast";
  import type { ICashForecast } from "../../_types/cashForecast";

  export let cashForecast: ICashForecast;

  $: forecastStartDate = cashForecast.forecastStartDate.value;
  $: launchDate = cashForecast.launchDate.value;
  $: forecastLength = ForecastLengths.find((f) => f.id == cashForecast.length.value)?.name;
</script>

<style lang="scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-cf-forecast-row {
    padding-left: 1rem;

    & > :global(.gdb-emphasis) {
      display: inline-block;
      border-bottom: 1px dashed $cs-grey-4;
      margin: 0 $space-xs;
      color: $cs-blue-5;
    }
  }
</style>

<div class="gdb-cf-forecast-row">
  Forecast Settings: <span class="gdb-emphasis">{forecastLength}</span> from <DateSpan
    date={forecastStartDate}
    class="gdb-emphasis" /> through launch <DateSpan date={launchDate} class="gdb-emphasis" />
</div>
