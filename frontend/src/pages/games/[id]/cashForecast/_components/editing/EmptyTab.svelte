<script lang="ts">
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import type { ICashForecast } from "../../_types/cashForecast";
  import ForecastSummary from "./ForecastSummary.svelte";
  import TableRowEmpty from "../../../../../../components/table/TableRowEmpty.svelte";
  import TableRowIndented from "../../../../../../components/table/TableRowIndented.svelte";
  import TableSubHeaderRow from "../../../../../../components/table/TableSubHeaderRow.svelte";
  import EntryTable from "../../../../../../components/table/EntryTable.svelte";

  export let cashForecast: ICashForecast;
</script>

<style lang="scss">
  @import "../../../../../../styles/_variables.scss";
</style>

<ForecastSummary {cashForecast} />
<EntryTable>
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
      <IconTextButton icon={PredefinedIcons.PlusRound} value="Add Funding" buttonStyle="primary-outline" />
    </td>
  </TableRowIndented>
</EntryTable>
