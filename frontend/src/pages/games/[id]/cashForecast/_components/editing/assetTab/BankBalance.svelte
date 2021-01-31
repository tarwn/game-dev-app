<script lang="ts">
  import CurrencyInput from "../../../../../../../components/inputs/CurrencyInput.svelte";
  import DateOutput from "../../../../../../../components/inputs/DateOutput.svelte";
  import LabeledInput from "../../../../../../../components/inputs/LabeledInput.svelte";
  import TextInput from "../../../../../../../components/inputs/TextInput.svelte";
  import TableRowIndented from "../table/TableRowIndented.svelte";
  import TableSubHeaderRow from "../table/TableSubHeaderRow.svelte";
  import type { ICashForecast } from "../../../_types/cashForecast";
  import type { IEvent } from "../../../../../../_stores/eventStore/types";
  import { events } from "../../../_stores/cashForecastStore";

  export let cashForecast: ICashForecast;
  export let forecastDate: Date;
  export let colSpan: number;
  export let publish: (event: IEvent<ICashForecast>) => void;
</script>

<TableSubHeaderRow colspan={colSpan} value="Bank Balance" />
<TableRowIndented isRecord={true} isTop={true} isBottom={true}>
  <td>
    <LabeledInput label="Name" vertical={true}>
      <TextInput
        maxLength={30}
        value={cashForecast.bankBalance.name.value}
        on:change={({ detail }) => publish(events.SetBankBalanceName(cashForecast.bankBalance.name, detail.value))} />
    </LabeledInput>
  </td>
  <td />
  <td>
    <LabeledInput label="Date" vertical={true}>
      <DateOutput date={forecastDate} />
    </LabeledInput>
  </td>
  <td>
    <LabeledInput label="Amount" vertical={true}>
      <CurrencyInput
        value={cashForecast.bankBalance.amount.value}
        on:change={({ detail }) => events.SetBankBalanceAmount(cashForecast.bankBalance.amount, detail.value)} />
    </LabeledInput>
  </td>
  <td />
  <td />
</TableRowIndented>
