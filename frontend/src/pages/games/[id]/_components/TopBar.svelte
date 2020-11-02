<script lang="ts">
  import { isActive } from "@sveltech/routify";
  import IconButton from "../../../../components/buttons/IconButton.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
  export let icon: string;
  export let id: string;
  export let name: string;

  $: breadcrumbs = [{ name: "Dashboard", path: `/games/${id}` }];
  $: {
    if ($isActive(`/games/${id}/businessModel`)) {
      breadcrumbs.push({
        name: "Business Plan",
        path: `/games/${id}/businessModel`,
      });
    }
  }

  function handleClick() {
    alert("clicked");
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
  .gdb-page-header-buttons {
    float: right;
    padding: 0;
  }
</style>

<div class="gdb-page-header">
  <div class="gdb-page-header-game">
    <i class="{icon} gdb-page-header-game-icon" />
    <div class="gdb-page-header-game-name">{name}</div>
  </div>
  <div class="gdb-page-header-breadcrumb">
    {#each breadcrumbs as breadcrumb, i}
      /
      <a
        href={breadcrumb.path}
        class:disabled={false && i == breadcrumbs.length - 1}>{breadcrumb.name}</a>
    {/each}
  </div>
  <div class="gdb-page-header-buttons">
    <IconButton
      on:click={handleClick}
      icon={PredefinedIcons.Download}
      buttonStyle="icon-only" />
  </div>
</div>
