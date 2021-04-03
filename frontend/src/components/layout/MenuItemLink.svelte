<script lang="ts">
  import { url, isActive } from "@sveltech/routify";
  import { getIconString, PredefinedIcons } from "../buttons/PredefinedIcons";

  export let icon: PredefinedIcons | string = "true-Videogames_controller_joystick_games_video_console";
  export let path: string = "na";
  export let name: string = "na";
  export let demphasize: boolean = false;

  $: iconString = getIconString(icon);
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  .gdb-nav-link {
    display: block;
    margin: $space-s $space-m;
    padding: $space-s;
    text-decoration: none;
    color: $cs-grey-4;

    &:hover > .gdb-nav-link-name {
      text-decoration: underline;
      color: $color-accent-1-darker;
    }
    &:hover > .gdb-nav-link-icon {
      // color: $color-accent-1-lighter;
      color: $cs-grey-3;
    }
  }

  .gdb-nav-link-icon {
    float: left;
    width: 2rem;
    text-align: center;
    text-decoration: none;
    color: $cs-grey-2;
    font-size: 1.25rem;
    line-height: 32px;
    padding-right: 0.5rem;

    // &.demphasize {
    //   // color: $cs-grey-1;
    // }
  }
  .gdb-nav-link-name {
    display: inline-block;
    line-height: 32px;
  }
</style>

<a class="gdb-nav-link" href={$url(path)} class:active={$isActive(path)}>
  <i class="gdb-nav-link-icon {iconString}" class:demphasize />
  <div class="gdb-nav-link-name">{name}</div>
</a>
