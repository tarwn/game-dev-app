<script lang="ts">
  import GrossProfit from "../commonEquations/GrossProfit.svelte";
  import NetProfit from "../commonEquations/NetProfit.svelte";
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";
</style>

<p>
  <b>Taxes</b> allows you to project the corporate taxes you will owe. This is typically based on Net Profit or Gross Revenue,
  depending on your tax jurisdiction(s).
</p>
<p>
  <b>Gross Profit:</b> Your total revenue minus direct costs for building and supporting the game
  <GrossProfit />
</p>
<p>
  <b>Net Profit:</b> Your gross profit minus marketing, sales, and other general expenses
  <NetProfit />
</p>
