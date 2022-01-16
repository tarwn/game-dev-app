<script lang="ts">
  import GrossProfit from "../commonEquations/GrossProfit.svelte";
</script>

<style lang="scss">
  @import "../../../../../../../styles/_variables.scss";
</style>

<p>
  <b>Direct expenses</b> are costs from building and supporting the game. These include charges like computer equipment for
  development, licensing for tools or assets, support expenses, and so on.
</p>
<p>
  These expenses can be entered as one-time expenses or monthly, with a fixed ending date or "launch" to automatically
  adjust as the launch date is adjusted.
</p>
<p>
  <b>Gross Profit impact:</b> Direct expenses are also called "Cost of Goods Sold".<br />
  <GrossProfit />
</p>
