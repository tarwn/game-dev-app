<script lang="ts">
  export let icon: string = "true-Videogames_controller_joystick_games_video_console";
  export let name: string = "";
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

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
    line-height: 32px;
  }
</style>

<div class="gdb-page-header">
  <div class="gdb-page-header-game">
    <i class="{icon} gdb-page-header-game-icon" />
    <div class="gdb-page-header-game-name">{name}</div>
  </div>
  <div class="gdb-page-header-breadcrumb">
    <slot />
  </div>
  <div class="gdb-page-header-buttons">
    <a href="/account/logout" target="_self">Logout</a>
  </div>
</div>
