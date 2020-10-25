<script lang="ts">
  import { url, isActive } from "@sveltech/routify";
  export let icon = "true-Videogames_controller_joystick_games_video_console";
  export let path = "na";
  export let name = "na";
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  .gdb-nav-link {
    display: block;
    margin: $space-s $space-m;
    padding: $space-s;
    text-decoration: none;

    &:hover > .gdb-nav-link-name {
      text-decoration: underline;
      color: $color-accent-1-darker;
    }
    &:hover > .gdb-nav-link-icon {
      color: $color-accent-1-darker;
    }
  }

  .gdb-nav-link-icon {
    float: left;
    width: 2rem;
    text-align: center;
    text-decoration: none;
    color: $ws_medgrey;
    font-size: 1.5rem;
    line-height: 32px;
    padding-right: 0.5rem;
  }
  .gdb-nav-link-name {
    display: inline-block;
    line-height: 32px;
  }
</style>

<a class="gdb-nav-link" href={$url(path)} class:active={$isActive(path)}>
  <i class="gdb-nav-link-icon {icon}" />
  <div class="gdb-nav-link-name">{name}</div>
</a>
