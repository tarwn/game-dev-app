<script lang="ts">
  import { isActive } from "@sveltech/routify";
  export let icon: string;
  export let id: string;
  export let name: string;

  let breadcrumbs = [];
  $: {
    const dashboard = { name: "Dashboard", path: `/games/${id}` };
    if ($isActive(`/games/${id}/businessModel`)) {
      breadcrumbs = [
        dashboard,
        {
          name: "Business Plan",
          path: `/games/${id}/businessModel`,
        },
      ];
    } else if ($isActive(`/games/${id}/cashForecast`)) {
      breadcrumbs = [
        dashboard,
        {
          name: "Cash Forecast",
          path: `/games/${id}/cashForecast`,
        },
      ];
    } else {
      breadcrumbs = [dashboard];
    }
  }
</script>

<style type="text/scss">
  @import "../../../../styles/_variables.scss";

  .gdb-page-header {
    padding: $space-s $space-m;
    color: $text-color-default;
  }
  .gdb-page-header-game-icon {
    font-size: 32px;
    color: $cs-grey-2;
  }
  .gdb-page-header-game {
    display: inline-block;
    margin-right: 0.25rem;
    line-height: 32px;
  }
  .gdb-page-header-game-name,
  .gdb-page-header-breadcrumb {
    display: inline-block;
    line-height: 32px;
  }

  .gdb-page-header-breadcrumb > a {
    margin: 0 $space-s;
  }

  .gdb-page-header-buttons {
    float: right;
    padding: 0;
    line-height: 32px;
  }
</style>

<div class="gdb-page-header">
  <div class="gdb-page-header-game">
    <i class="{icon} gdb-page-header-game-icon" />
    <div class="gdb-page-header-game-name">{name}</div>
  </div>
  <div class="gdb-page-header-breadcrumb">
    {#each breadcrumbs as breadcrumb, i}
      /<a href={breadcrumb.path} class:disabled={false && i == breadcrumbs.length - 1}>{breadcrumb.name}</a>
    {/each}
  </div>
  <div class="gdb-page-header-buttons">
    <a href="/account/logout" target="_self">Logout</a>
  </div>
</div>
