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
  <b>Marketing and Sales expenses</b> are costs associated with marketing and selling the game. This includes costs like
  web hosting, DNS, newsletter software, advertising, etc.
</p>
<p>
  If you have a publisher, you may still have a few entries here but would expect more of that activity to be handled by
  them.
</p>
<p>
  <b>Net Profit:</b> M&S expenses impact your net profit.<br />
  <Equation>
    <EquationAbbr title="Net Profit is your net of Revenue after all costs">Net Profit</EquationAbbr> =<br />
    <div class="gdb-indented">
      <EquationAbbr title="Gross Profit/Margin (Gross Revenue - Rev Share %'s - Direct Expenses)"
        >Gross Profit</EquationAbbr> -
      <EquationAbbr title="Repayment for funding/loans listed as 'Gross Profit %'">Gross Profit %</EquationAbbr> -
      <EquationAbbr title="Marketing & Sales expenses">M&S</EquationAbbr> -
      <EquationAbbr title="General & misc expenses">General Expenses</EquationAbbr> -
      <EquationAbbr title="People costs for indirect personnel">Indirect Personnel</EquationAbbr>
    </div>
  </Equation>
</p>
