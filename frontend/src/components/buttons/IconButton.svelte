<script lang="ts">
  import { PredefinedIcons, getIconString } from "./PredefinedIcons";
  export let icon: PredefinedIcons | string;
  export let buttonStyle: string = "primary";
  export let disabled: boolean = false;

  let buttonStyleClass = "";

  $: iconString = getIconString(icon);
  $: {
    switch (buttonStyle) {
      case "icon-only":
        buttonStyleClass = "gdb-bs-iconOnly";
        break;
      case "primary":
      default:
        buttonStyleClass = "gdb-bs-primary";
        break;
    }
  }
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  .gdb-button {
    cursor: pointer;
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

  .gdb-bs-iconOnly {
    background: none;
    font-size: 32px;
    min-width: 32px;
    min-height: 32px;
    line-height: 32px;
    color: $cs-grey-2;
    box-shadow: unset;

    &:hover {
      color: $color-accent-1;
    }

    &[disabled],
    &[disabled]:hover,
    &[disabled]:active {
      color: $cs-grey-1;
      cursor: not-allowed;
    }
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
</style>

<button
  on:click|preventDefault|stopPropagation
  class="gdb-button {buttonStyleClass}"
  {disabled}>
  <i class="gdb-button-icon {iconString}" />
</button>
