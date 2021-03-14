<script lang="ts">
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import type { ICashForecast } from "../../_types/cashForecast";
  import ForecastSummary from "./ForecastSummary.svelte";
  import TableRowEmpty from "./table/TableRowEmpty.svelte";
  import TableRowIndented from "./table/TableRowIndented.svelte";
  import TableSubHeaderRow from "./table/TableSubHeaderRow.svelte";

  export let cashForecast: ICashForecast;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-cf-table {
    border-collapse: separate;
    border-spacing: 0;
    min-width: 1000px;

    td {
      padding: $space-xs $space-m;
    }
  }
</style>

<ForecastSummary {cashForecast} />
<table class="gdb-cf-table">
  <TableSubHeaderRow colspan={7} value="Empty Section" />
  <TableRowIndented isRecord={true} isTop={true} isBottom={true}>
    <td />
    <td />
    <td />
    <td />
    <td />
    <td />
  </TableRowIndented>
  <TableRowEmpty colspan={7} />
  <!-- add row -->
  <TableRowIndented>
    <td colspan="6">
      <IconTextButton icon={PredefinedIcons.Plus} value="Add Funding" buttonStyle="primary-outline" />
    </td>
  </TableRowIndented>
</table>
