<script lang="ts">
  import { isActive } from "@sveltech/routify";
  import PageTop from "../../../../components/layout/PageTop.svelte";
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

  .gdb-breadcrumb {
    margin: 0 $space-s;
  }
</style>

<PageTop {icon} {name}>
  {#each breadcrumbs as breadcrumb, i}
    /<a href={breadcrumb.path} class:disabled={false && i == breadcrumbs.length - 1} class="gdb-breadcrumb"
      >{breadcrumb.name}</a>
  {/each}
</PageTop>
