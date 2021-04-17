<script lang="ts">
  import ComingSoonLink from "../../../../../../../components/ComingSoonLink.svelte";
  import ContactMe from "../../../../../../../components/ContactMe.svelte";

  import { ForecastStage } from "../../../_types/cashForecast";

  export let stage: ForecastStage;
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";
</style>

<p>
  Forecasting sales is key to making the post-launch numbers work. Forecasted sales are calculated without tax, revenue
  shares are then applied in order, and the remainder is your Gross Revenue.
</p>
{#if stage == ForecastStage.ViabilityCost}
  <p>
    <b>Note:</b> Sales forecasting and pricing is not required for Cost Viability, move the stage to "Sales Viability" in
    the General tab if you're ready.
  </p>
{:else if stage == ForecastStage.ViabilitySales}
  <p>
    There are three inputs for sales forecasting at this stage: target prices, the number of units you will sell, and
    the platform you will sell through.
  </p>
  <p>
    <b>Target price &amp; Units:</b> Use an early level of comparable research to find a range of games like yours to identify
    useful starting values.
  </p>
  <p>
    <b>Min/Max, Low/High: </b> These are used for pricing analytics only, the <b>Target</b> values are used in the cash forecast.
  </p>
  <p><ComingSoonLink><i>Detailed instructions post in progress</i></ComingSoonLink></p>
{:else if stage == ForecastStage.Execution}
  <p>
    During the <b>Execution</b> phase, you're building the product and doing further comparable research. As you continue
    to review comparables and make progress, update the estimated price and unit sales below.
  </p>
{:else}
  🚧 The Post-Launch Revenue view is coming soon. This will combine your current sales with projections. If you need
  this soon (or now), <ContactMe /> so I can look at boosting the priority.
{/if}
