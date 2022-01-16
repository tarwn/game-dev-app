<script lang="ts">
  import { ForecastStage } from "../../../_types/cashForecast";

  export let stage: ForecastStage;
</script>

<style lang="scss">
  @import "../../../../../../../styles/_variables.scss";

  li {
    margin: $space-s;
  }
</style>

<p>
  <b>Forecast Stage</b> reflects the stage of execution for the game, from testing the initial idea (Viability) to executing
  and or seeking funding (Execution) to growth after launch (Post-launch)
</p>
{#if stage == ForecastStage.ViabilityCost}
  <p>
    <b>Viability, Cost</b>: Can I afford to build this?
  </p>
  <ol>
    <li>Check your Forecast start date and enter your target launch date, leaving "Forecast To" set to "Launch"</li>
    <li>Next, use the tabs to enter funds, funding, and all of your major expenses for the current project scope</li>
  </ol>
  <p><b>Goals</b>, <b>Estimated Sales</b>, and more will be available in the next stage.</p>
  <p>After getting a sense for your potential costs, next steps can be found on the dashboard task list.</p>
{:else if stage == ForecastStage.ViabilitySales}
  <p>
    <b>Viability, Sales</b>: Will this game's sales meet my goals?
  </p>
  <ol>
    <li>Verify your dates below and update "Forecast To" to "Launch + 18 Months"</li>
    <li>Verify your <b>Goals</b> below, especially if you have added funding partners</li>
    <li>Go to the Revenue tab and follow the instructions to enter target prices and sales estimates</li>
  </ol>
  <p>
    After finishing, review the details here or on the "Summary" view, then look at the task list on the Dashboard for
    next steps
  </p>
{:else if stage == ForecastStage.Execution}
  <p>
    <b>Execution:</b> With a general plan, now your focus is on execution and, possibly, raising funding.
  </p>
  <p>
    <b>Pitch data</b>: To help with pitching, you can adjust the <b>Forecast To</b> period to 3 or 5 years. The
    <b>Goals</b> section will continue to relfect 18 months and can help you show that you're considering their goals in
    your planning.
  </p>
  <p>
    <b>Monthly/Bi-monthly</b>: Review your forecast, use the "Update Forecast Start" button below to advance the
    timeline and enter in updated current balances to forecast from.
  </p>
{:else}
  <p>
    <b>Post Launch:</b> During the post-launch phase, keeping the cash forecast up to date will help you budget funds and
    keep an eye on your cashflow, as you focus on building add-ons or new games.
  </p>
{/if}
