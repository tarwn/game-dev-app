<script lang="ts">
  import { url, params, metatags } from "@sveltech/routify";
  import { onDestroy } from "svelte";
  import { gamesStore } from "../../_stores/gamesStore";
  import Tile from "./_components/Tile.svelte";
  import GameStatus from "../../../components/outputs/GameStatus.svelte";
  import ShortDate from "../../../components/outputs/ShortDate.svelte";
  import { api as cashForecastApi } from "./cashForecast/_stores/cashForecastApi";
  import { calculate } from "./cashForecast/_stores/calculator/calculator";
  import type { ICashForecast } from "./cashForecast/_types/cashForecast";
  import { getEmptyProjection } from "./cashForecast/_stores/calculator/types";
  import ForecastChart from "./cashForecast/_components/ForecastChart.svelte";
  import TaskItem from "./_components/TaskItem.svelte";

  metatags.title = "[LR] Dashboard";

  $: id = $params.id;

  let games = [];
  const unsubscribe = gamesStore.subscribe((g) => (games = g ?? []));

  $: game = games.find((g) => g.globalId == id);
  //  {
  //   id: id,
  //   name: "Demo Game",
  //   status: "Active",
  //   lastModified: "2 days ago by you",
  // };

  // Cash forecast data
  //  this is a bit brute force, I don't expect to keep it live so we really only need latest DTO?
  let initializedId = null;
  let cashForecast = null as ICashForecast | null;
  let projectedCashForecast = getEmptyProjection();
  $: {
    if (id != null && id != initializedId) {
      initializedId = id;
      cashForecastApi.get(id).then((data) => {
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

  .sample-1 {
    display: inline-block;
    // min-width: 460px;
    display: flex;
    flex-direction: row;

    // .sample-pic {
    //   position: relative;
    //   flex: 0;
    //   min-width: 200px;
    //   width: 200px;
    //   height: 200px;
    //   // border-right: 1px solid $cs-grey-1;

    //   background-color: $cs-grey-0;
    //   background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%235bc0eb' fill-opacity='0.3'%3E%3Cpath fill-rule='evenodd' d='M11 0l5 20H6l5-20zm42 31a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM0 72h40v4H0v-4zm0-8h31v4H0v-4zm20-16h20v4H20v-4zM0 56h40v4H0v-4zm63-25a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM53 41a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-30 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-28-8a5 5 0 0 0-10 0h10zm10 0a5 5 0 0 1-10 0h10zM56 5a5 5 0 0 0-10 0h10zm10 0a5 5 0 0 1-10 0h10zm-3 46a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21 0l5 20H16l5-20zm43 64v-4h-4v4h-4v4h4v4h4v-4h4v-4h-4zM36 13h4v4h-4v-4zm4 4h4v4h-4v-4zm-4 4h4v4h-4v-4zm8-8h4v4h-4v-4z'/%3E%3C/g%3E%3C/svg%3E");

    //   &::after {
    //     content: "";
    //     position: absolute;
    //     top: 20%;
    //     bottom: 20%;
    //     left: 20%;
    //     right: 20%;
    //   }
    // }

    .sample-details {
      position: relative;
      padding: $space-m;
      line-height: 2rem;
      flex: 1;
      min-width: 240px;

      .sample-footer {
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

    & > h3 {
      text-align: center;
      font-size: 90%;
      display: block;
      margin: $space-s 0 $space-m 0;
    }
  }

  // .sample-2 {
  //   display: flex;
  //   flex-direction: row;
  //   min-width: 600px;
  //   width: 600px;
  //   height: 200px;
  //   background-color: white;
  //   border-right: 1px solid $cs-grey-1;
  // }

  // .sample-2-progress {
  //   flex: 0 0 0;
  //   width: 200px;
  //   height: 200px;
  // }

  // .sample-2-forecast {
  //   flex: 1 0 0;
  //   width: 400px;
  //   height: 200px;
  // }

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
</style>

<h1>Dashboard</h1>

{#if game}
  <div class="row">
    <section class="sample-1">
      <div class="sample-details">
        <div>Game: {game.name}</div>
        <div>
          Status:
          <GameStatus status={game.status} />
        </div>
        <div class="sample-footer">
          Last modified
          <ShortDate date={game.lastModified} />
        </div>
      </div>
    </section>
    <section class="sample-1">
      <div class="gdb-forecast-tile">
        <h3>Latest Forecast</h3>
        <ForecastChart width={400} height={120} {cashForecast} {projectedCashForecast} />
      </div>
    </section>
    <section class="sample-1">
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
    status={"Done"}
    href={$url("../businessModel")}
    imgHref={"/images/BusinessModelCanvas.svg"}
    lastUpdated="Updated on Jan 25" />
  <Tile
    title="Cash Forecast"
    status={"In Progress"}
    href={$url("../cashForecast")}
    imgHref={"/images/FinanceForecast.svg"}
    lastUpdated="Updated on Feb 28" />
  <Tile
    title="Comparables"
    status={"In Progress"}
    href={$url("../businessModel")}
    imgHref={"/images/Comparables.svg"}
    lastUpdated="Updated on Mar 7" />
  <Tile title="Marketing Plan" status={null} href={$url("../businessModel")} imgHref={"/images/MarketingPlan.svg"} />
</div>

<h2>Next Stages</h2>

<div class="row">
  <section class="tile" />
  <section class="tile" />
  <section class="tile" />
</div>
