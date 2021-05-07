<script lang="ts">
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import ComingSoon from "../../../../../../components/ComingSoon.svelte";
  import CurrencyInput from "../../../../../../components/inputs/CurrencyInput.svelte";
  import DateInput from "../../../../../../components/inputs/DateInput.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import PercentInput from "../../../../../../components/inputs/PercentInput.svelte";
  import TextInput from "../../../../../../components/inputs/TextInput.svelte";
  import type { ICashForecast } from "../../_types/cashForecast";
  import ForecastSummary from "./ForecastSummary.svelte";
  import FauxLabelCell from "../../../../../../components/table/FauxLabelCell.svelte";
  import TableRowIndented from "../../../../../../components/table/TableRowIndented.svelte";
  import TableSubHeaderRow from "../../../../../../components/table/TableSubHeaderRow.svelte";
  import EntryTable from "../../../../../../components/table/EntryTable.svelte";

  export let cashForecast: ICashForecast;

  const scenarios = [{ name: "Scenario 1" }, { name: "Scenario 2" }, { name: "Scenario 3" }];
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";
</style>

<ForecastSummary {cashForecast} />
<ComingSoon subject="Alternate projections feature">
  <EntryTable>
    <TableSubHeaderRow colspan={7} value="Scenarios" />
    <TableRowIndented>
      <td colspan={6}> Add names for up to 3 scenarios </td>
    </TableRowIndented>
    <TableRowIndented isRecord={true} isTop={true}>
      <FauxLabelCell>Names</FauxLabelCell>
      <td>
        <LabeledInput label={scenarios[0].name} vertical={true}>
          <TextInput bind:value={scenarios[0].name} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label={scenarios[1].name} vertical={true}>
          <TextInput bind:value={scenarios[0].name} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label={scenarios[2].name} vertical={true}>
          <TextInput bind:value={scenarios[0].name} />
        </LabeledInput>
      </td>
      <td>
        <IconTextButton icon={PredefinedIcons.PlusRound} value="Add Scenario" />
      </td>
    </TableRowIndented>
    <TableRowIndented isRecord={true} isBottom={true}>
      <FauxLabelCell>Launch</FauxLabelCell>
      <td>
        <LabeledInput label={scenarios[0].name} vertical={true}>
          <DateInput date={cashForecast.launchDate.value} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label={scenarios[1].name} vertical={true}>
          <DateInput date={cashForecast.launchDate.value} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label={scenarios[2].name} vertical={true}>
          <DateInput date={cashForecast.launchDate.value} />
        </LabeledInput>
      </td>
      <td />
    </TableRowIndented>

    <TableSubHeaderRow colspan={7} value="Funding" />
    <TableRowIndented>
      <td colspan={6}> Multiply funding (and repayment amounts) by a percentage</td>
    </TableRowIndented>
    <TableRowIndented isRecord={true} isTop={true} isBottom={true}>
      <FauxLabelCell>Funding %</FauxLabelCell>
      <td>
        <LabeledInput label={scenarios[0].name} vertical={true}>
          <PercentInput value={1.0} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label={scenarios[1].name} vertical={true}>
          <PercentInput value={1.0} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label={scenarios[2].name} vertical={true}>
          <PercentInput value={1.0} />
        </LabeledInput>
      </td>
      <td />
    </TableRowIndented>

    <TableSubHeaderRow colspan={7} value="Sales Projection" />
    <TableRowIndented>
      <td colspan={6}> Multiple sales for each scenario and specify a different target unit price</td>
    </TableRowIndented>
    <TableRowIndented isRecord={true} isTop={true}>
      <FauxLabelCell>Sales %</FauxLabelCell>
      <td>
        <LabeledInput label={scenarios[0].name} vertical={true}>
          <PercentInput value={1.0} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label={scenarios[1].name} vertical={true}>
          <PercentInput value={1.0} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label={scenarios[2].name} vertical={true}>
          <PercentInput value={1.0} />
        </LabeledInput>
      </td>
      <td />
    </TableRowIndented>
    <TableRowIndented isRecord={true} isBottom={true}>
      <FauxLabelCell>Avg Unit Price</FauxLabelCell>
      <td>
        <LabeledInput label={scenarios[0].name} vertical={true}>
          <CurrencyInput value={9.99} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label={scenarios[1].name} vertical={true}>
          <CurrencyInput value={14.99} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label={scenarios[2].name} vertical={true}>
          <CurrencyInput value={19.99} />
        </LabeledInput>
      </td>
      <td />
    </TableRowIndented>
    <TableSubHeaderRow colspan={7} value="Notable Results" />
    <TableRowIndented>
      <td colspan={5}>
        This is where notable results will be display, including:
        <ul>
          <li>If/when each scenario goes under $0.00 of cash</li>
          <li>If/when your goals are reached</li>
          <li>If/when your partner's goals are reached (if applicable)</li>
        </ul>
      </td>
    </TableRowIndented>
  </EntryTable>
</ComingSoon>
