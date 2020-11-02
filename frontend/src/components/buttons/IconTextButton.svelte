<script lang="ts">
  import { PredefinedIcons, getIconString } from "./PredefinedIcons";
  export let icon: PredefinedIcons | string;
  export let value: string;
  export let buttonStyle: string = "primary";
  export let disabled: boolean = false;

  let buttonStyleClass = "";
  let iconStyleClass = "";

  $: iconString = getIconString(icon);
  $: {
    switch (buttonStyle) {
      case "primary-outline":
        buttonStyleClass = "gdb-bs-primary-outline";
        iconStyleClass = "gdb-is-primary";
        break;
      case "primary":
      default:
        buttonStyleClass = "gdb-bs-primary";
        iconStyleClass = "gdb-is-inverse";
        break;
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
    outline: none;
    line-height: 2rem;
    min-height: 2rem;
    padding: 0 $space-m 0 $space-m;
    box-shadow: $shadow-main;
    transition: $button-transitions;

    &:active {
      box-shadow: $shadow-push;
    }
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
    border: 2px solid $color-accent-1;
    color: $text-color-inverse;

    &:hover {
      background-color: $color-accent-1-darker;
    }

    &:active {
      background-color: $color-accent-1-darker;
    }

    &[disabled],
    &[disabled]:hover,
    &[disabled]:active {
      background-color: $cs-grey-0;
      color: $cs-grey-1;
      border-color: $cs-grey-1;
      box-shadow: none;
      cursor: default;
    }
  }

  .gdb-bs-primary-outline {
    background-color: $color-background-white;
    color: $color-accent-1;
    border: 2px solid $color-accent-1;

    &:hover {
      background-color: $color-accent-1-lightest;
    }

    &:active {
      background-color: $color-accent-1-lighter;
    }

    &[disabled],
    &[disabled]:hover,
    &[disabled]:active {
      background-color: $cs-grey-0;
      color: $cs-grey-1;
      border-color: $cs-grey-1;
      box-shadow: none;
      cursor: default;
    }
  }
</style>

<button
  on:click|preventDefault|stopPropagation
  class="gdb-button {buttonStyleClass}"
  {disabled}>
  <i class="gdb-button-icon {iconString} {iconStyleClass}" />
  <span class="gdb-button-text">{value}</span>
</button>
