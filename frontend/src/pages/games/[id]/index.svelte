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
  import TaskItem from "./_components/TaskItem.svelte";
  import DateSpan from "../../../components/inputs/DateSpan.svelte";
  import type { Game } from "../../_stores/gamesApi";
  import ScreenTitle from "../../../components/layout/ScreenTitle.svelte";
  import DashboardWitp from "./_components/DashboardWITP.svelte";
  import ButtonWithPopup from "../../../components/buttons/ButtonWithPopup.svelte";

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
    console.log({ game });
    if (id != null && id != initializedId) {
      initializedId = id;

      game = games.find((g) => g.globalId == initializedId) ?? null;

      cashForecastApi.get(id).then((data) => {
        if (initializedId != id) return;
        cashForecast = data.payload;
        if (cashForecast?.forecastMonthCount.value != null) {
          projectedCashForecast = calculate(cashForecast, projectedCashForecast, cashForecast.forecastMonthCount.value);
        } else {
          projectedCashForecast = getEmptyProjection();
        }
      });
    }
  }

  onDestroy(unsubscribe);
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
  }

  .gdb-forecast-tile > h3 {
    text-align: center;
    font-size: 90%;
    display: block;
    margin: $space-s 0 $space-m 0;
  }

  h1,
  h2 {
    color: $cs-grey-4;
    // font-weight: normal;
  }

  h2 {
    margin-top: $space-xl;
  }

  .gdb-task-list {
    margin: $space-m;
    padding-left: 1rem;

    & > :global(li) {
      margin: $space-s 0;
    }
  }

  .gdb-dame-title {
    font-weight: bold;
  }

  .gdb-label {
    color: $cs-grey-4;
    font-size: $font-size-small;
    display: inline-block;
    width: 4rem;
  }
</style>

<ButtonWithPopup buttonStyle="primary-outline-circle" label="?">
  <DashboardWitp />
</ButtonWithPopup>

<ScreenTitle title="Dashboard">
  <ButtonWithPopup
    buttonStyle="primary-outline-circle"
    label="?"
    buttonTitle="Help: How to use this screen"
    ariaLabel="Help: How to use this screen">
    <DashboardWitp />
  </ButtonWithPopup>
</ScreenTitle>

{#if game}
  <div class="row">
    <section class="gdb-tile-container">
      <div class="gdb-game-tile">
        <div class="gdb-dame-title">{game.name}</div>
        <div>
          <span class="gdb-label">Status:</span>
          <GameStatus status={game.status} />
        </div>
        <div>
          {#if cashForecast}
            <span class="gdb-label">Launch:</span>
            <DateSpan date={cashForecast.launchDate.value} />
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
    <section class="gdb-tile-container">
      <div class="gdb-forecast-tile">
        <h3>Core Biz Loop: Next Tasks</h3>
        <ol class="gdb-task-list">
          <TaskItem module="Business Model" task={'"Have I missed anything?"'} />
          <TaskItem module="Cash Forecast" task={'"Can I afford the development?"'} />
          <TaskItem module="Cash Forecast" task={'"Will this game make a profit?"'} />
          <!-- <TaskItem module="Business Model" task={"Find the biggest risks"} /> -->
        </ol>
      </div>
    </section>
  </div>
{/if}

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

<h2>Next Stages</h2>

<div class="row">
  <section class="tile" />
  <section class="tile" />
  <section class="tile" />
</div>
