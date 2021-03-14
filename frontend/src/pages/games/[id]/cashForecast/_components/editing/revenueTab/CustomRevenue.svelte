<script lang="ts">
  import ButtonAsLink from "../../../../../../../components/buttons/ButtonAsLink.svelte";
  import LabeledInput from "../../../../../../../components/inputs/LabeledInput.svelte";
  import PercentInput from "../../../../../../../components/inputs/PercentInput.svelte";
  import TextInput from "../../../../../../../components/inputs/TextInput.svelte";
  import type { IEvent } from "../../../../../../_stores/eventStore/types";
  import { events } from "../../../_stores/cashForecastStore";
  import { BasicDateOption } from "../../../_types/cashForecast";
  import type {
    ICashForecast,
    IEstimatedRevenuePlatform,
    IEstimatedRevenuePlatformShare,
  } from "../../../_types/cashForecast";
  import TableRowEmpty from "../table/TableRowEmpty.svelte";
  import TableRowIndented from "../table/TableRowIndented.svelte";
  import DateInput from "../../../../../../../components/inputs/DateInput.svelte";
  import FauxLabelCell from "../table/FauxLabelCell.svelte";
  import CurrencyInput from "../../../../../../../components/inputs/CurrencyInput.svelte";
  import IconTextButton from "../../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../../components/buttons/PredefinedIcons";
  import IconButton from "../../../../../../../components/buttons/IconButton.svelte";

  export let platform: IEstimatedRevenuePlatform;
  export let publish: (event: IEvent<ICashForecast>) => void;

  $: isLaunchDate = platform.dateType.value === BasicDateOption.Launch;
  $: dateButtonLabel = isLaunchDate ? "Set a date" : "Set to launch";
  $: lastRevShareIndex = platform.revenueShares.list.length - 1;

  function swapDateType() {
    if (isLaunchDate) {
      publish(events.SetEstRevenuePlatformDateType(platform.dateType, BasicDateOption.Date));
    } else {
      publish(events.SetEstRevenuePlatformDateType(platform.dateType, BasicDateOption.Launch));
    }
  }

  function addLimit(revShare: IEstimatedRevenuePlatformShare) {
    publish(events.SetEstRevenuePlatformRevUntilAmount(revShare.untilAmount, 1));
  }

  function makeUnlimited(revShare: IEstimatedRevenuePlatformShare) {
    publish(events.SetEstRevenuePlatformRevUntilAmount(revShare.untilAmount, 0));
  }

  function addRevShare() {
    const maxUntil = platform.revenueShares.list.reduce(
      (max, rs) => (rs.untilAmount.value < max ? max : rs.untilAmount.value),
      500000.0
    );
    const lastPercent = platform.revenueShares.list.slice(-1)[0]?.revenueShare.value ?? 0.15;
    publish(
      events.AddEstRevenuePlatformRevShare(platform.revenueShares.globalId, {
        percent: lastPercent,
        until: maxUntil * 2,
      })
    );
  }

  function deleteRevShare(revShare: IEstimatedRevenuePlatformShare) {
    publish(events.DeleteEstRevenuePlatformRevShare(revShare));
  }
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  td.gdb-no-label {
    padding-top: 1.6rem;
  }
</style>

{#each platform.revenueShares.list as revShare, i (revShare.globalId)}
  <TableRowIndented isRecord={true} isTop={i == 0}>
    {#if i === 0}
      <td>
        <LabeledInput label="Platform Name" vertical={true}>
          <TextInput
            value={platform.name.value}
            on:change={({ detail }) => publish(events.SetEstRevenuePlatformName(platform.name, detail.value))} />
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label="Start" vertical={true}>
          <span slot="label"
            ><ButtonAsLink value={dateButtonLabel} small={true} on:click={() => swapDateType()} /></span>
          {#if isLaunchDate}
            <TextInput value="Launch" disabled={true} />
          {:else}
            <DateInput
              value={platform.startDate.value}
              on:change={({ detail }) =>
                publish(events.SetEstRevenuePlatformStartDate(platform.startDate, detail.value))} />
          {/if}
        </LabeledInput>
      </td>
      <td>
        <LabeledInput label="% of Sales" vertical={true}>
          <PercentInput
            min={0}
            max={1}
            value={platform.percentOfSales.value}
            on:change={({ detail }) =>
              publish(events.SetEstRevenuePlatformPercentOfSales(platform.percentOfSales, detail.value))} />
        </LabeledInput>
      </td>
    {:else}
      <!-- Additional share rows-->
      <td />
      <td />
      <FauxLabelCell>And then</FauxLabelCell>
    {/if}
    <td>
      <LabeledInput label="Revenue Share" vertical={true}>
        <PercentInput
          min={0}
          max={1}
          value={revShare.revenueShare.value}
          on:change={({ detail }) =>
            publish(events.SetEstRevenuePlatformRevRevenueShare(revShare.revenueShare, detail.value))} />
      </LabeledInput>
    </td>
    <td>
      {#if revShare.untilAmount.value === 0}
        <LabeledInput label="Until" vertical={true}>
          <span slot="label"
            ><ButtonAsLink value="Add a limit" small={true} on:click={() => addLimit(revShare)} /></span>
          <TextInput value="no limit" disabled={true} />
        </LabeledInput>
      {:else}
        <LabeledInput label="Until" vertical={true}>
          <span slot="label"
            ><ButtonAsLink value="Set Unlimited" small={true} on:click={() => makeUnlimited(revShare)} /></span>
          <CurrencyInput
            value={revShare.untilAmount.value}
            on:change={({ detail }) =>
              publish(events.SetEstRevenuePlatformRevUntilAmount(revShare.untilAmount, detail.value))} />
        </LabeledInput>
      {/if}
    </td>
    <td class="gdb-no-label">
      {#if i > 0}
        <IconButton
          icon={PredefinedIcons.Delete}
          on:click={() => deleteRevShare(revShare)}
          buttonStyle="secondary-negative" />
      {/if}
    </td>
    <td class="gdb-no-label">
      {#if i == 0}
        <IconTextButton
          icon={PredefinedIcons.Delete}
          on:click={() => publish(events.DeleteEstRevenuePlatform(platform))}
          buttonStyle="secondary-negative"
          value="Delete Platform" />
      {/if}
    </td>
  </TableRowIndented>
{/each}
<TableRowIndented isRecord={true} isBottom={true}>
  <td />
  <td />
  <td />
  <td>
    <IconTextButton
      icon={PredefinedIcons.Plus}
      on:click={addRevShare}
      buttonStyle="primary-outline"
      value="Add Another" />
  </td>
  <td />
  <td />
  <td />
</TableRowIndented>
<TableRowEmpty colspan={9} />
