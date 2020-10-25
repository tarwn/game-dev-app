<script lang="ts">
  import { url } from "@sveltech/routify";
  import MenuItemGame from "../components/layout/MenuItemGame.svelte";
  import MenuItemLink from "../components/layout/MenuItemLink.svelte";
  import Logo from "../components/layout/Logo.svelte";
</script>

<style type="text/scss">
  @import "../styles/_variables.scss";

  .gdb-screen {
    display: grid;
    grid-template-columns: [start] 15rem [start-content] auto [end];
    grid-template-rows: [top] 3rem [top-content] auto [bottom];
    height: 100vh;
    width: 100vw;
  }
  .gdb-sidebar {
    display: block;
    grid-column-start: start;
    grid-column-end: start-content;
    grid-row-start: top;
    grid-row-end: bottom;
    background-color: $color-background-white;
    color: $text-color-default;
    border-right: 1px solid $ws_lightgrey;
    z-index: 10;
  }
  .gdb-content {
    display: block;
    grid-column-start: start-content;
    grid-column-end: end;
    grid-row-start: top;
    grid-row-end: bottom;
    background-color: $color-background-light;
  }

  .gdb-nav-header {
    text-transform: uppercase;
    font-size: $font-size-smallest;
    color: $text-color-light;
    margin-left: 1rem;
    margin-top: 4rem;
    margin-bottom: 0.75rem;
  }

  .gdb-nav-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>

<div class="gdb-screen">
  <div class="gdb-sidebar">
    <Logo />
    <nav>
      <div class="gdb-nav-header">Active Games</div>
      <ul class="gdb-nav-list">
        <li>
          <MenuItemGame id="demo" name="Demo Game" />
        </li>
        <li>
          <MenuItemGame id="na" name="Example Game" />
        </li>
        <li>
          <MenuItemGame id="na" name="Another Example" />
        </li>
        <li>
          <MenuItemLink
            path="./games/new"
            name="Add New Game"
            icon="true-UIEssentials_button_circle_round_add"
            demphasize={true} />
        </li>
      </ul>
      <div class="gdb-nav-header">Studio Settings</div>
      <ul class="gdb-nav-list">
        <li>
          <MenuItemLink
            path="./studio/settings"
            name="Settings"
            icon="true-Construction_gear_cog_engineering_engine_machine" />
        </li>
        <li>
          <MenuItemLink
            path="./studio/members"
            name="Team Members"
            icon="true-Users_users_female_male_people" />
        </li>
        <li>
          <MenuItemLink
            path="./studio/billing"
            name="Billing Plan"
            icon="true-BusinessandFinance_business_finance_invoice" />
        </li>
      </ul>
    </nav>
  </div>
  <div class="gdb-content">
    <slot />
  </div>
</div>
