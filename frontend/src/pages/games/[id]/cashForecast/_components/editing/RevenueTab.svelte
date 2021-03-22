<script lang="ts">
  import { getContext } from "svelte";
  import IconTextButton from "../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../components/buttons/PredefinedIcons";
  import CurrencyInput from "../../../../../../components/inputs/CurrencyInput.svelte";
  import LabeledInput from "../../../../../../components/inputs/LabeledInput.svelte";
  import NumberInput from "../../../../../../components/inputs/NumberInput.svelte";
  import { cashForecastEventStore, events } from "../../_stores/cashForecastStore";
  import type { ICashForecast } from "../../_types/cashForecast";
  import ForecastSummary from "./ForecastSummary.svelte";
  import CustomRevenue from "./revenueTab/CustomRevenue.svelte";
  import StandardPlatformSelector from "./revenueTab/StandardPlatformSelector.svelte";
  import { StandardPlatformOption, StandardPlatformSettings } from "./revenueTab/types";
  import FauxLabelCell from "./table/FauxLabelCell.svelte";
  import TableRowEmpty from "./table/TableRowEmpty.svelte";
  import TableRowIndented from "./table/TableRowIndented.svelte";
  import TableSubHeaderRow from "./table/TableSubHeaderRow.svelte";

  export let cashForecast: ICashForecast;
  const publish = cashForecastEventStore.addEvent;

  function addCustomPlatform() {
    publish(
      events.AddEstRevenuePlatform(cashForecast.estimatedRevenue.platforms.globalId, {
        name: "Custom",
        date: cashForecast.launchDate.value,
        salesPercent: 1.0,
        sharePercent: 0.3,
        until: 0,
      })
    );
  }

  // standard platform dialog
  const { open } = getContext("simple-modal");
  function addStandardPlatform() {
    open(
      StandardPlatformSelector,
      { onOkay: addSelectedStandardPlatform },
      {
        closeButton: false,
        closeOnEsc: true,
        closeOnOuterClick: false,
      }
    );
  }
  function addSelectedStandardPlatform(selectedPlatform: StandardPlatformOption) {
    // publish details
    if (selectedPlatform == null) return;
    const platform = StandardPlatformSettings.get(selectedPlatform);
    if (platform == null) return;

    if (platform.sharePercent2 != null) {
      publish(
        events.AddEstRevenuePlatformTriple(cashForecast.estimatedRevenue.platforms.globalId, {
          name: platform.name,
          date: cashForecast.launchDate.value,
          salesPercent: 1.0,
          sharePercent0: platform.sharePercent0,
          until0: platform.until0,
          sharePercent1: platform.sharePercent1,
          until1: platform.until1,
          sharePercent2: platform.sharePercent2,
          until2: platform.until2,
        })
      );
    } else if (platform.sharePercent1 != null) {
      publish(
        events.AddEstRevenuePlatformDouble(cashForecast.estimatedRevenue.platforms.globalId, {
          name: platform.name,
          date: cashForecast.launchDate.value,
          salesPercent: 1.0,
          sharePercent0: platform.sharePercent0,
          until0: platform.until0,
          sharePercent1: platform.sharePercent1,
          until1: platform.until1,
        })
      );
    } else {
      publish(
        events.AddEstRevenuePlatform(cashForecast.estimatedRevenue.platforms.globalId, {
          name: platform.name,
          date: cashForecast.launchDate.value,
          salesPercent: 1.0,
          sharePercent: platform.sharePercent0,
          until: platform.until0,
        })
      );
    }
  }
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-cf-table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    min-width: 1200px;
    table-layout: fixed;

    :global(td) {
      padding: $space-xs $space-m;
    }
  }
</style>

<ForecastSummary {cashForecast} />
<table class="gdb-cf-table">
  <colgroup>
    <col span="1" style="width: 2rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="width: 12rem;" />
    <col span="1" style="width: 4rem;" />
    <col span="1" style="width: 14rem;" />
    <col span="1" style="" /><!-- soak up excess width -->
  </colgroup>
  <TableSubHeaderRow colspan={9} value="Estimate Sales" />
  <TableRowIndented isRecord={true} isTop={true}>
    <FauxLabelCell>Unit Price:</FauxLabelCell>
    <td>
      <LabeledInput label="Minimum" vertical={true}>
        <CurrencyInput
          min={0}
          value={cashForecast.estimatedRevenue.minimumPrice.value}
          on:change={({ detail }) =>
            publish(events.SetEstRevenueMinPrice(cashForecast.estimatedRevenue.minimumPrice, detail.value))} />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Target (Main Forecast)" vertical={true}>
        <CurrencyInput
          min={0}
          value={cashForecast.estimatedRevenue.targetPrice.value}
          on:change={({ detail }) =>
            publish(events.SetEstRevenueTargetPrice(cashForecast.estimatedRevenue.targetPrice, detail.value))} />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Market max" vertical={true}>
        <CurrencyInput
          min={0}
          value={cashForecast.estimatedRevenue.maximumPrice.value}
          on:change={({ detail }) =>
            publish(events.SetEstRevenueMaxPrice(cashForecast.estimatedRevenue.maximumPrice, detail.value))} />
      </LabeledInput>
    </td>
  </TableRowIndented>
  <TableRowIndented isRecord={true} isBottom={true}>
    <FauxLabelCell>Est. Units Sold (18mo):</FauxLabelCell>
    <td>
      <LabeledInput label="Low" vertical={true}>
        <NumberInput
          min={0}
          max={100000000}
          value={cashForecast.estimatedRevenue.lowUnitsSold.value}
          on:change={({ detail }) =>
            publish(events.SetEstRevenueLowUnitsSold(cashForecast.estimatedRevenue.lowUnitsSold, detail.value))} />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="Target (Main Forecast)" vertical={true}>
        <NumberInput
          min={0}
          max={100000000}
          value={cashForecast.estimatedRevenue.targetUnitsSold.value}
          on:change={({ detail }) =>
            publish(
              events.SetEstRevenueTargetUnitsSold(cashForecast.estimatedRevenue.targetUnitsSold, detail.value)
            )} />
      </LabeledInput>
    </td>
    <td>
      <LabeledInput label="High" vertical={true}>
        <NumberInput
          min={0}
          max={100000000}
          value={cashForecast.estimatedRevenue.highUnitsSold.value}
          on:change={({ detail }) =>
            publish(events.SetEstRevenueHighUnitsSold(cashForecast.estimatedRevenue.highUnitsSold, detail.value))} />
      </LabeledInput>
    </td>
  </TableRowIndented>
  <TableRowEmpty colspan={9} />

  <!-- List of platforms -->
  <TableSubHeaderRow colspan={9} value="Sales Platforms" />
  {#each cashForecast.estimatedRevenue.platforms.list as platform (platform.globalId)}
    <CustomRevenue {platform} {publish} />
  {/each}

  <!-- add row -->
  <TableRowIndented>
    <td colspan="8">
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value="Add from List"
        buttonStyle="primary"
        on:click={addStandardPlatform} />
      <IconTextButton
        icon={PredefinedIcons.Plus}
        value="Add Custom"
        buttonStyle="primary-outline"
        on:click={addCustomPlatform} />
    </td>
  </TableRowIndented>
</table>
