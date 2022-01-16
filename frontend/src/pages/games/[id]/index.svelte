<script lang="ts">
  import { params, metatags, url, goto } from "@sveltech/routify";
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
  import TaskTilePlaceholder from "./_components/TaskTilePlaceholder.svelte";
  import type { Task, DetailedTask } from "../../_stores/tasksApi";
  import { activeTaskStore, openTasksStore } from "../../_stores/tasksStore";
  import { log } from "../../../utilities/logger";
  import WebSocketChannel from "../../_communications/WebSocketChannel.svelte";
  import { UpdateScope } from "../../_communications/UpdateScope";
  import { ModuleLinkType } from "../../_types/modules";
  import TaskTileLoading from "./_components/TaskTileLoading.svelte";
  import TaskTileAdvanceGame from "./_components/TaskTileAdvanceGame.svelte";
  import LinkAsButton from "../../../components/buttons/LinkAsButton.svelte";

  metatags.title = "[LR] Dashboard";

  $: id = $params.id;
  let initializedId = null;
  let games = [] as Array<Game>;

  // initialization
  function initialize() {
    game = games.find((g) => g.globalId == id) ?? null;

    if (game) {
      initializedId = id;
      openTasksStore.load(initializedId);
      refreshCashForecast();
    } else {
      log("NOT FOUND", {
        game,
        games,
        id,
        initializedId,
      });
      $goto($url("/notfound"));
    }
  }

  $: {
    if (id != null && id != initializedId && games.length > 0) {
      initialize();
    }
  }

  // game data
  let game = null as Game;
  const unsubscribe = gamesStore.subscribe((g) => {
    games = g ?? [];
    // if we've already initialized, see if the game has changed status + needs a task refresh
    if (initializedId) {
      let prevGame = game;
      game = games.find((g) => g.globalId == initializedId) ?? null;
      // see if anything significant has changed
      if (prevGame && game && prevGame.status != game.status) {
        openTasksStore.load(initializedId);
      }
    }
  });

  // Cash forecast data
  // load once initially, then listen for events to load again
  //  I'm not sure how hardcore this will be if someone else is making a lot of edits,
  //  may need to introduce a debounce?
  let cashForecast = null as ICashForecast | null;
  let projectedCashForecast = getEmptyProjection();
  function refreshCashForecast() {
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

  // user profile data
  let latestProfile: null | UserProfile = null;
  var unsubscribe2 = profileStore.subscribe((p) => {
    if (p != null) latestProfile = p;
  });

  // open tasks data
  let openTasks: null | DetailedTask[] = null;
  var unsubscribe3 = openTasksStore.subscribe((t) => {
    if (initializedId != t.gameId) return;
    openTasks = t.tasks;
    log("Tasks received", { openTasks });
  });

  // active tasks
  let activeTask: { gameId: string | null; task: Task | null };
  const unsubscribe4 = activeTaskStore.subscribe((t) => (activeTask = t ?? { gameId: null, task: null }));

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
    unsubscribe3();
    unsubscribe4();
  });
</script>

<style lang="scss">
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
    white-space: nowrap;
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

  .gdb-instructions-light {
    font-size: $font-size-small;
    display: inline-block;
    color: $text-color-light;
  }

  .gdb-game-buttons {
    float: right;
  }
</style>

<WebSocketChannel
  scope={UpdateScope.GameTasks}
  gameId={initializedId}
  on:receive={() => openTasksStore.load(initializedId)} />
<WebSocketChannel scope={UpdateScope.GameCashforecast} gameId={id} on:receive={() => refreshCashForecast()} />

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
        <div class="gdb-game-buttons">
          <LinkAsButton value="Edit details" buttonStyle="primary-outline" href={`/games/${game.globalId}/details`} />
        </div>
        <div class="gdb-game-title">{game.name}</div>
        <div>
          <span class="gdb-label">Stage:</span>
          <GameStatus status={game.status} />
        </div>
        <div>
          {#if cashForecast}
            <span class="gdb-label">Launch:</span>
            <DateSpan date={game.launchDate} style="date" />
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

<h2>Game To Do List</h2>
<span class="gdb-instructions-light"
  >The next business tasks to make progress on the business side of your game. Click tile to expand details.</span>
<div class="gdb-tile-carousel">
  {#if openTasks}
    <div class="row">
      {#each openTasks as task (task.id)}
        <!-- {#if openTasks.length <= 5 || i < 4} -->
        <TaskTile {task} isAssignedTask={task.id == activeTask?.task?.id} disabled={false} />
        <!-- {/if} -->
      {/each}
      {#if openTasks.length > 0 && openTasks.length < 5}
        <TaskTilePlaceholder />
      {:else if openTasks.length == 0}
        {#if game}
          <TaskTileAdvanceGame gameId={id} gameStatus={game?.status} />
        {:else}
          <TaskTileLoading />
        {/if}
      {:else if openTasks.length > 5}
        <TaskTilePlaceholder count={openTasks.length - 4} type="..." />
      {/if}
    </div>
  {:else}
    <TaskTileLoading />
    <TaskTileLoading />
    <TaskTileLoading />
    <TaskTileLoading />
    <TaskTileLoading />
  {/if}
  <div class="row">
    <a href={$url("../tasks")}>View All Tasks</a>
  </div>
</div>

<h2>Planning Modules</h2>
<span class="gdb-instructions-light"
  >Direct access to the main modules for updates, reviewing information, or making progress on a task. Click tile to go
  to module.</span>
<div class="row gdb-row-tiles">
  <Tile {id} module={ModuleLinkType.BusinessModel} lastUpdated={game?.businessModelLastUpdatedOn} />
  <Tile {id} module={ModuleLinkType.CashForecast} lastUpdated={game?.cashForecastLastUpdatedOn} />
  <Tile {id} module={ModuleLinkType.Comparables} lastUpdated={null} disabled={false} />
  <Tile {id} module={ModuleLinkType.MarketingStrategy} lastUpdated={null} disabled={false} />
</div>
