<script lang="ts">
  import Equation from "../Equation.svelte";
  import EquationAbbr from "../EquationAbbr.svelte";
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";
</style>

<p>
  <b>General expenses</b> are administrative costs, like office space and utilities, and the catch-all category for any expenses
  not covered by prior categories.
</p>
<p>
  <b>Net Profit:</b> General expenses impact your net profit. <br />
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
