<script lang="ts">
  import { PredefinedIcons, getIconString } from "./PredefinedIcons";
  export let icon: PredefinedIcons | string;
  export let value: string;
  export let buttonStyle: string = "primary";

  let buttonStyleClass = "";
  let iconStyleClass = "";

  $: iconString = getIconString(icon);
  $: {
    switch (buttonStyle) {
      case "primary":
      default:
        buttonStyleClass = "gdb-bs-primary";
        iconStyleClass = "gdb-is-inverse";
    }
  }
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  .gdb-button {
    cursor: pointer;
    font-size: $font-size-normal;
    border-radius: 4px;
    border: 0px;

    line-height: 2rem;
    min-height: 2rem;

    padding: $space-xs $space-m;
  }

  .gdb-button-icon {
    display: inline-block;
    vertical-align: top;
    font-size: 1.5rem;
    line-height: 2rem;
    // min-width: 32px;
    // min-height: 32px;
    // line-height: 32px;
  }

  .gdb-button-text {
    display: inline-block;
    vertical-align: top;
    line-height: 2rem;
  }

  .gdb-bs-primary {
    background-color: $color-accent-1;
    color: $text-color-inverse;
    box-shadow: $shadow-main;
    transition: $button-transitions;

    // &:hover {
    //   // background-color: $color-accent-1-lighter;
    // }

    &:active {
      background-color: $color-accent-1-darker;
      box-shadow: $shadow-push;
    }
  }
</style>

<button
  on:click|preventDefault|stopPropagation
  class="gdb-button {buttonStyleClass}">
  <i class="gdb-button-icon {iconString} {iconStyleClass}" />
  <span class="gdb-button-text">{value}</span>
</button>
