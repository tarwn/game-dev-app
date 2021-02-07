<script lang="ts">
  import Equation from "../Equation.svelte";
  import EquationAbbr from "../EquationAbbr.svelte";
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  .gdb-indented {
    margin-top: $space-xs;
    margin-left: $space-m;
  }
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
  <b>Gross Profit:</b> Direct expenses are also called "Cost of Goods Sold".<br />
  <Equation>
    <EquationAbbr title="Gross Profit, also called Gross Margin">Gross Profit</EquationAbbr> = <br />
    <div class="gdb-indented">
      <EquationAbbr title="Gross Revenue">Gross Revenue</EquationAbbr> -
      <EquationAbbr title="Percentage of gross due to the platform (Ex: Steam)">Platform %</EquationAbbr>
      <EquationAbbr title="Repayment for funding/loans listed as 'Gross Revenue %'">Gross Revenue %</EquationAbbr> -
      <EquationAbbr title="Direct expenses from the People tab">Most of People</EquationAbbr> -
      <EquationAbbr title="Direct expenses on this tab">Direct Expenses</EquationAbbr>
    </div>
  </Equation>
</p>
