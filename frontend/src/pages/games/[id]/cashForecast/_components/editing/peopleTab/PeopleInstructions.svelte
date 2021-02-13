<script lang="ts">
  import Equation from "../Equation.svelte";
  import EquationAbbr from "../EquationAbbr.svelte";
</script>

<style type="text/scss">
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
  <Equation>
    <EquationAbbr title="Gross Profit, also called Gross Margin">Gross Profit</EquationAbbr> =
    <EquationAbbr title="Gross Revenue">Gross Revenue</EquationAbbr> -
    <EquationAbbr title="Percentage of gross due to the platform (Ex: Steam)">Platform %</EquationAbbr> -
    <EquationAbbr title="Repayment for funding/loans listed as 'Gross Revenue %'">Gross Revenue %</EquationAbbr> -
    <EquationAbbr title="Direct expenses from the People tab">Direct Personnel</EquationAbbr> -
    <EquationAbbr title="Direct expenses on this tab">Direct Expenses</EquationAbbr>
  </Equation>
  <Equation>
    <EquationAbbr title="Net Profit is your net of Revenue after all costs">Net Profit</EquationAbbr> =
    <EquationAbbr title="Gross Profit/Margin (Gross Revenue - Rev Share %'s - Direct Expenses)"
      >Gross Profit</EquationAbbr> -
    <EquationAbbr title="Repayment for funding/loans listed as 'Gross Profit %'">Gross Profit %</EquationAbbr> -
    <EquationAbbr title="Marketing & Sales expenses">M&S</EquationAbbr> -
    <EquationAbbr title="General & misc expenses">General Expenses</EquationAbbr> -
    <EquationAbbr title="People costs for indirect personnel">Indirect Personnel</EquationAbbr>
  </Equation>
</p>
