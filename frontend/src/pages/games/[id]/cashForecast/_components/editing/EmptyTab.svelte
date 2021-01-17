<script lang="ts">
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import TableRowEmpty from "./TableRowEmpty.svelte";
  import TableRowIndented from "./TableRowIndented.svelte";
  import TableSubHeaderRow from "./TableSubHeaderRow.svelte";
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

  .gdb-cf-forecast-row {
    padding-left: 0.1rem; // needs some indent
  }
</style>

<div class="gdb-cf-forecast-row">
  <LabeledInput label="Forecast Start Date">
    <span class="gdb-input gdb-input-date"
      >{new Date().toLocaleDateString("en-US")}</span>
  </LabeledInput>
</div>
<table class="gdb-cf-table">
  <TableSubHeaderRow colspan={6} value="Empty Section" />
  <TableRowIndented isRecord={true} isTop={true} isBottom={true}>
    <td />
    <td />
    <td />
    <td />
    <td />
  </TableRowIndented>
  <TableRowEmpty colspan={6} />
  <!-- add row -->
  <TableRowIndented>
    <td colspan="4">
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value="Add Funding"
        buttonStyle="primary-outline" />
    </td>
  </TableRowIndented>
</table>
