<script lang="ts">
  import { url, params, metatags } from "@sveltech/routify";
  import { onDestroy } from "svelte";
  import { gamesStore } from "../../_stores/gamesStore";
  import Tile from "./_components/Tile.svelte";
  import GameStatus from "../../../components/outputs/GameStatus.svelte";
  import { api as cashForecastApi } from "./cashForecast/_stores/cashForecastApi";
  import { calculate } from "./cashForecast/_stores/calculator/calculator";
  import type { ICashForecast } from "./cashForecast/_types/cashForecast";
  import { getEmptyProjection } from "./cashForecast/_stores/calculator/types";
  import ForecastChart from "./cashForecast/_components/ForecastChart.svelte";
  import DateSpan from "../../../components/inputs/DateSpan.svelte";
  import type { Game } from "../../_stores/gamesApi";
  import ScreenTitle from "../../../components/layout/ScreenTitle.svelte";
  import DashboardWitp from "./_components/DashboardWITP.svelte";
  import ButtonWithPopup from "../../../components/buttons/ButtonWithPopup.svelte";
  import { profileStore } from "../../_stores/profileStore";
  import { AutomaticPopup } from "../../_stores/profileApi";
  import type { UserProfile } from "../../_stores/profileApi";
  import TaskTile from "./_components/TaskTile.svelte";
  import { getUtcDate } from "../../../utilities/date";
  import { TaskStatus } from "./_components/TaskStatus";
  import TaskTilePlaceholder from "./_components/TaskTilePlaceholder.svelte";

  metatags.title = "[LR] Dashboard";

  $: id = $params.id;
  let initializedId = null;

  let games = [] as Array<Game>;
  let game = null as Game;
  const unsubscribe = gamesStore.subscribe((g) => {
    games = g ?? [];
    game = games.find((g) => g.globalId == initializedId) ?? null;
  });

  // Cash forecast data
  //  this is a bit brute force, I don't expect to keep it live so we really only need latest DTO?
  let cashForecast = null as ICashForecast | null;
  let projectedCashForecast = getEmptyProjection();
  $: {
    if (id != null && id != initializedId) {
      initializedId = id;

      game = games.find((g) => g.globalId == initializedId) ?? null;

      cashForecastApi.get(id, { skipCreate: true }).then((data) => {
        if (initializedId != id) return;
        cashForecast = data.payload;
        // if a cashforecast wasn't loaded, we want an empty projection
        if (cashForecast?.forecastMonthCount.value != null) {
          projectedCashForecast = calculate(cashForecast, projectedCashForecast, cashForecast.forecastMonthCount.value);
        } else {
          projectedCashForecast = getEmptyProjection();
        }
      });
    }
  }

  let latestProfile: null | UserProfile = null;
  var unsubscribe2 = profileStore.subscribe((p) => {
    if (p != null) latestProfile = p;
  });

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
  });
</script>

<style type="text/scss">
  @import "../../../styles/_variables.scss";

  .row {
    display: flex;
  }

  section {
    // border: 1px solid $cs-grey-1;
    border-radius: 4px;
    margin: $space-m 0;
    background: $color-background-white;
    box-shadow: $shadow-main;
  }
  section + section {
    margin-left: $space-xl;
  }

  .gdb-tile-container {
    display: inline-block;
    // min-width: 460px;
    display: flex;
    flex-direction: row;

    .gdb-game-tile {
      position: relative;
      padding: $space-m;
      line-height: 2rem;
      flex: 1;
      min-width: 240px;
      // temp width for taking up space
      width: 200px + 64px + 200px;
      box-sizing: border-box;

      .gdb-game-tile-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        color: $text-color-light;
        padding: $space-s $space-m;
        font-size: $font-size-smallest;
      }
    }
  }

  .gdb-forecast-tile {
    width: 420px;
    padding: $space-m $space-m $space-m $space-m;
    // temp width for taking up space
    width: 200px + 64px + 200px;
    box-sizing: border-box;
  }

  .gdb-forecast-tile > h3 {
    text-align: center;
    font-size: 90%;
    display: block;
    margin: $space-s 0 $space-m 0;
  }

  .gdb-tile-carousel {
    margin: $space-l 0;
  }

  h2 {
    color: $cs-grey-4;
    // font-weight: normal;
  }

  h2 {
    margin-top: $space-xl;
  }

  .gdb-game-title {
    font-weight: bold;
  }

  .gdb-label {
    color: $cs-grey-4;
    font-size: $font-size-small;
    display: inline-block;
    width: 4rem;
  }
</style>

<ScreenTitle title="Dashboard">
  {#if latestProfile}
    <ButtonWithPopup
      buttonStyle="primary-outline-circle"
      label="?"
      buttonTitle="Help: How to use this screen"
      ariaLabel="Help: How to use this screen"
      forceOpen={(latestProfile.hasSeenPopup & AutomaticPopup.GameDashboard) !== AutomaticPopup.GameDashboard}
      on:close={() => profileStore.markPopupSeen(AutomaticPopup.GameDashboard)}>
      <DashboardWitp />
    </ButtonWithPopup>
  {/if}
</ScreenTitle>

{#if game}
  <div class="row">
    <section class="gdb-tile-container">
      <div class="gdb-game-tile">
        <div class="gdb-game-title">{game.name}</div>
        <div>
          <span class="gdb-label">Status:</span>
          <GameStatus status={game.status} />
        </div>
        <div>
          {#if cashForecast}
            <span class="gdb-label">Launch:</span>
            <DateSpan date={game.launchDate} />
          {/if}
        </div>
        <div class="gdb-game-tile-footer">
          Last updated on
          <DateSpan date={game.lastModified} style={"long date"} />
        </div>
      </div>
    </section>
    <section class="gdb-tile-container">
      <div class="gdb-forecast-tile">
        <h3>Latest Forecast</h3>
        <ForecastChart width={400} height={120} {cashForecast} {projectedCashForecast} />
      </div>
    </section>
  </div>
{/if}

<h2>Next Core Tasks</h2>

<div class="gdb-tile-carousel">
  <div class="row">
    <TaskTile
      module="External Task"
      title="Identify Goals"
      description="Outline your goals for this game release"
      status={TaskStatus.Selected} />
    <TaskTile
      module="External Task"
      title="Team Agreement"
      description="Ensure the team is agreed on leadership, ownership, and goals"
      status={TaskStatus.Ready} />
    <TaskTile
      module="Business Model"
      title="Business Outline"
      description="Initial definition: unique concept/hook, audience, resources, and cashflow"
      status={TaskStatus.Ready}
      disabled={true} />
    <TaskTile
      dueDate={getUtcDate(2020, 1, 1)}
      module="External"
      title="Example Late Task"
      description="This is an example late task to see overdue LF"
      status={TaskStatus.Overdue} />
    <TaskTilePlaceholder />
  </div>
  <div class="row">
    <a href="#c" class:disabled={true}>View All Tasks</a>
  </div>
</div>

<h2>Planning Modules</h2>

<div class="row gdb-row-tiles">
  <Tile
    title="Business Model"
    href={$url("../businessModel")}
    imgHref={"/images/BusinessModelCanvas.svg"}
    lastUpdated={game?.businessModelLastUpdatedOn} />
  <Tile
    title="Cash Forecast"
    href={$url("../cashForecast")}
    imgHref={"/images/FinanceForecast.svg"}
    lastUpdated={game?.cashForecastLastUpdatedOn} />
  <Tile title="Comparables" href={$url(id)} imgHref={"/images/Comparables.svg"} disabled={true} />
  <Tile title="Marketing Plan" href={$url(id)} imgHref={"/images/MarketingPlan.svg"} disabled={true} />
</div>
