<script lang="ts">
  import { params } from "@sveltech/routify";
  $: id = $params.id;
</script>

<style type="text/scss">
  @import "../../../styles/_variables.scss";

  .row {
    display: flex;
  }

  section {
    border: 1px solid #dddddd;
    margin: $space-m 0;
    background: $color-background-white;
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
      flex: 0;
      min-width: 200px;
      width: 200px;
      height: 200px;
      background-color: #eee;
      border-right: 1px solid #ddd;
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
    display: inline-block;
    min-width: 600px;
    width: 600px;
    height: 200px;
    background-color: white;
    border-right: 1px solid #ddd;
  }

  .sample-tile {
    display: inline-block;
    min-width: 200px;
    width: 200px;
    height: 200px;
    background-color: white;
    border-right: 1px solid #ddd;

    & + .sample-tile {
      margin-left: $space-xl;
    }
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
      <div>Game: {id}</div>
      <div>Status: Active</div>
      <div class="sample-footer">Last updated 2 days ago by You</div>
    </div>
  </section>
  <section class="sample-2" />
</div>

<h2>Planning</h2>

<div class="row">
  <section class="sample-tile" />
  <section class="sample-tile" />
  <section class="sample-tile" />
  <section class="sample-tile" />
</div>

<h2>Next Stages</h2>

<div class="row">
  <section class="sample-tile" />
  <section class="sample-tile" />
  <section class="sample-tile" />
</div>
