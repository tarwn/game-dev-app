<script lang="ts">
  import NetProfit from "../commonEquations/NetProfit.svelte";
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";
</style>

<p>
  <b>Marketing and Sales expenses</b> are costs associated with marketing and selling the game. This includes costs like
  web hosting, DNS, newsletter software, advertising, etc.
</p>
<p>
  If you have a publisher, you may still have a few entries here but would expect more of that activity to be handled by
  them.
</p>
<p>
  <b>Net Profit impact:</b> M&S expenses impact your net profit.<br />
  <NetProfit />
</p>
