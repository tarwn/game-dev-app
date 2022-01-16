<script lang="ts">
  import GrossProfit from "../commonEquations/GrossProfit.svelte";
  import NetProfit from "../commonEquations/NetProfit.svelte";
</script>

<style lang="scss">
  @import "../../../../../../../styles/_variables.scss";
</style>

<p>
  <b>People expenses</b> are costs for employees and contractors and can be categorized as Direct, Marketing & Sales, or
  General.
</p>
<p>
  <b>Direct:</b> People listed as <b>Direct</b> are directly part of building or supporting the game.
</p>
<p>
  <b>Indirect:</b> People listed as <b>Marketing & Sales</b>, or <b>General</b> are not directly part of building or supporting
  the game.
</p>
<p>
  <GrossProfit />
  <NetProfit />
</p>
