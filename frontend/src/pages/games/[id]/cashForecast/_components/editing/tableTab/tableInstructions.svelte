<script lang="ts">
  import GrossProfit from "../commonEquations/GrossProfit.svelte";
  import NetProfit from "../commonEquations/NetProfit.svelte";
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";
</style>

<p>
  This is your projected cashflow based on the values provided in earlier tabs, from <u>Forecast Start Date</u> forward.
</p>
<p>
  This is the expanded raw data view of your forecast, which is also available in summarized form in charts like the one
  to the left and the Cash Forecast Summary.
</p>
<p>
  <GrossProfit />
  <NetProfit />
</p>
