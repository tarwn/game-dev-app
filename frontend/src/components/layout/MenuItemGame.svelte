<script lang="ts">
  import { url, isActive } from "@sveltech/routify";
  // TODO - wire in actual game icons
  export let icon = "true-Videogames_controller_joystick_games_video_console";
  export let id = "na";
  export let name = "na";
  const params = { id: id };
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";

  $base-main-background: $color-background-white;
  $base-main-color: $cs-grey-3;
  $base-accent-background: $cs-grey-0;
  $base-accent-color: $color-accent-1;
  $base-accent-border: $cs-grey-1;
  $hover-main-background: $cs_lighterblue;
  $hover-main-color: $color-accent-1-darker;
  $hover-accent-background: $cs-grey-3;
  $hover-accent-color: $color-accent-1-darker;
  $active-main-background: $color-accent-1;
  $active-main-color: $color-background-white;
  $active-accent-background: $color-accent-1-darker;
  $active-accent-color: $text-color-inverse;

  $main-height: 40px;

  .gdb-nav-game {
    display: flex;
    flex-direction: row;
    // padding: $space-m $space-m;
    text-decoration: none;
    margin: $space-s -4px $space-s $space-s;
    border: 1px solid $base-accent-border;
    border-top-left-radius: 30px;
    border-bottom-left-radius: 30px;
    overflow: hidden;
    background-color: $base-main-background;
    color: $base-main-color;

    box-shadow: $shadow-nav-button;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;

    &:hover {
      background-color: $hover-main-background;
      color: $hover-main-color;
      border-color: $hover-accent-color;
    }

    &.active {
      background-color: $active-main-background;
      color: $active-main-color;
      border-color: $active-main-background;
    }

    &::after {
      position: relative;
      content: "";
    }
  }

  .gdb-nav-game-icon {
    display: inline-block;
    width: 2rem;
    font-size: 1.5rem;
    line-height: $main-height;
    padding: $space-s;
    padding-left: $space-m; // extra padding for curve
    background-color: $base-accent-background;
    color: $base-accent-color;
    text-align: center;

    // .gdb-nav-game:hover > & {
    //   // color: $hover-accent-color;
    // }

    .gdb-nav-game.active > & {
      background-color: $active-accent-background;
      color: $active-accent-color;
    }
  }

  .gdb-nav-game-name {
    display: inline-block;
    flex-grow: 1;
    line-height: $main-height;
    padding: $space-s;

    .gdb-nav-game:hover > & {
      text-decoration: underline;
    }

    .gdb-nav-game.active:hover > & {
      text-decoration: none;
    }
  }
</style>

<a class="gdb-nav-game" href={$url("./games/:id", params)} class:active={$isActive(`./games/${id}`)}>
  <div class="gdb-nav-game-icon"><i class={icon} /></div>
  <div class="gdb-nav-game-name">{name}</div>
</a>
