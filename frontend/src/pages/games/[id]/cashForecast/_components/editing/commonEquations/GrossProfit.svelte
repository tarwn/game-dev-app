<script lang="ts">
  import Equation from "../Equation.svelte";
  import EquationAbbr from "../EquationAbbr.svelte";
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";
</style>

<Equation>
  <EquationAbbr title="Gross Profit, also called Gross Margin">Gross Profit</EquationAbbr> =
  <EquationAbbr title="Gross Revenue">Gross Revenue</EquationAbbr> -
  <EquationAbbr title="Percentage of gross due to the platform (Ex: Steam)">Platform %</EquationAbbr> -
  <EquationAbbr title="Repayment for funding/loans listed as 'Gross Revenue %'">Gross Revenue %</EquationAbbr> -
  <EquationAbbr title="Direct expenses from the People tab">Direct Personnel</EquationAbbr> -
  <EquationAbbr title="Direct expenses on this tab">Direct Expenses</EquationAbbr>
</Equation>
