<script lang="ts">
  import { params } from "@sveltech/routify";
  import { scale, crossfade, fade } from "svelte/transition";
  import IconTextButton from "../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
  import ScreenTitle from "../../../../components/layout/ScreenTitle.svelte";
  import { getConfig } from "../../../../config";
  import { log } from "../../../../utilities/logger";
  import ForecastChartLarge from "./_components/ForecastChartLarge.svelte";
  import WebSocketChannel from "../../../_communications/WebSocketChannel.svelte";
  import ForecastTable from "./_components/ForecastTable.svelte";
  import SpacedButtons from "../../../../components/buttons/SpacedButtons.svelte";

  // params
  const { actorId } = getConfig();
  $: id = $params.id;
  let isLoading = false;

  // section change
  const [send, receive] = crossfade({ duration: 500, fallback: scale });
  function switchToEditView() {}
  function switchToSummaryView() {}
</script>

<style type="text/scss">
  @import "../../../../styles/_variables.scss";

  // duplicate of section in ../index
  //  what are the screen constraints going to be (and how to implement constraint)
  section {
    border-radius: 4px;
    margin: $space-m 0;
    background: $color-background-white;
    box-shadow: $shadow-main;
    padding: $space-m 0;
  }

  .gdb-chart-placeholder {
    margin: $space-l;
    padding: $space-m;
    border: 1px solid $cs-grey-0;
  }

  .gdb-table-area {
    margin: $space-l;
  }

  .gdb-title-sub-description {
    color: $text-color-light;
    margin-bottom: $space-m;

    display: flex;
    & > span {
      display: inline-block;
      flex: 1 1;
      line-height: 2rem;
    }
  }
</style>

<ScreenTitle title="Cash Forecast">
  <IconTextButton
    icon={PredefinedIcons.Next}
    value="Edit"
    buttonStyle="primary"
    on:click={switchToEditView}
    disabled={isLoading} />
</ScreenTitle>

<section>
  <div class="gdb-chart-placeholder">
    <ForecastChartLarge />
  </div>

  <div class="gdb-table-area">
    <h2>Cashflow Details</h2>
    <div class="gdb-title-sub-description">
      <span> Detailed in- and out-flows of cash each month.</span>
      <IconTextButton
        icon={PredefinedIcons.Expand}
        value="Expand Details"
        buttonStyle="primary-outline" />
    </div>
    <ForecastTable />
  </div>
</section>

<WebSocketChannel
  channelId={id}
  updateType="cashForecastUpdate"
  on:receive={({ detail }) => {
    log('WebSocketChannel.on:receiveUpdate', detail);
    // businessModelEventStore.receiveEvent(detail.gameId, detail.event);
  }}
  on:connect={({ detail }) => log('WebSocketChannel.on:channelConnected', {
      channel: detail,
    })}
  on:disconnect={({ detail }) => log(
      'WebSocketChannel.on:channelDisconnected',
      {
        channel: detail,
      }
    )} />
