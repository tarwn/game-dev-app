<script lang="ts">
  import { url, params } from "@sveltech/routify";
  import ForecastChart from "./_components/ForecastChart.svelte";
  import ProgressBar from "./_components/ProgressBar.svelte";
  import Tile from "./_components/Tile.svelte";

  $: id = $params.id;

  $: game = {
    id: id,
    name: "Demo Game",
    status: "Active",
    lastModified: "2 days ago by you",
  };
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
    min-width: 460px;
    display: flex;
    flex-direction: row;

    .sample-pic {
      position: relative;
      flex: 0;
      min-width: 200px;
      width: 200px;
      height: 200px;
      // border-right: 1px solid $cs-grey-1;

      background-color: $cs-grey-0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%235bc0eb' fill-opacity='0.3'%3E%3Cpath fill-rule='evenodd' d='M11 0l5 20H6l5-20zm42 31a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM0 72h40v4H0v-4zm0-8h31v4H0v-4zm20-16h20v4H20v-4zM0 56h40v4H0v-4zm63-25a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM53 41a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-30 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-28-8a5 5 0 0 0-10 0h10zm10 0a5 5 0 0 1-10 0h10zM56 5a5 5 0 0 0-10 0h10zm10 0a5 5 0 0 1-10 0h10zm-3 46a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21 0l5 20H16l5-20zm43 64v-4h-4v4h-4v4h4v4h4v-4h4v-4h-4zM36 13h4v4h-4v-4zm4 4h4v4h-4v-4zm-4 4h4v4h-4v-4zm8-8h4v4h-4v-4z'/%3E%3C/g%3E%3C/svg%3E");

      &::after {
        content: "";
        position: absolute;
        top: 20%;
        bottom: 20%;
        left: 20%;
        right: 20%;
      }
    }

    .sample-details {
      position: relative;
      padding: $space-m;
      line-height: 2rem;
      flex: 1;

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

  .sample-2 {
    display: flex;
    flex-direction: row;
    min-width: 600px;
    width: 600px;
    height: 200px;
    background-color: white;
    border-right: 1px solid $cs-grey-1;
  }

  .sample-2-progress {
    flex: 0 0 0;
    width: 200px;
    height: 200px;
  }

  .sample-2-forecast {
    flex: 1 0 0;
    width: 400px;
    height: 200px;
  }

  h1,
  h2 {
    color: $cs-grey-4;
    // font-weight: normal;
  }

  h2 {
    margin-top: $space-xl;
  }
</style>

<h1>Dashboard</h1>

<div class="row">
  <section class="sample-1">
    <div class="sample-pic" />
    <div class="sample-details">
      <div>Game: {game.name}</div>
      <div>Status: {game.status}</div>
      <div class="sample-footer">Last modified {game.lastModified}</div>
    </div>
  </section>
  <section class="sample-2">
    <div class="sample-2-progress">
      <ProgressBar />
    </div>
    <div class="sample-2-forecast">
      <ForecastChart />
    </div>
  </section>
</div>

<h2>Planning</h2>

<div class="row gdb-row-tiles">
  <Tile
    title="Business Model"
    status={'Done'}
    href={$url('../businessModel')}
    imgHref={'/images/BusinessModelCanvas.svg'}
    lastUpdated="Updated on Dec 3" />
  <Tile
    title="Comparables"
    status={'In Progress'}
    href={$url('../businessModel')}
    imgHref={'/images/BusinessModelCanvas.svg'}
    lastUpdated="Updated on Dec 7" />
  <Tile
    title="Financial Forecast"
    status={'In Progress'}
    href={$url('../businessModel')}
    imgHref={'/images/BusinessModelCanvas.svg'}
    lastUpdated="Updated on Dec 11" />
  <Tile
    title="Marketing Plan"
    status={null}
    href={$url('../businessModel')}
    imgHref={'/images/BusinessModelCanvas.svg'} />
</div>

<h2>Next Stages</h2>

<div class="row">
  <section class="tile" />
  <section class="tile" />
  <section class="tile" />
</div>
