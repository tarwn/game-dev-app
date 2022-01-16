<script lang="ts">
  import { PredefinedIcons, getIconString } from "./PredefinedIcons";
  export let icon: PredefinedIcons | string;
  export let buttonStyle: string = "primary";
  export let disabled: boolean = false;
  export let label: string | null = null;
  export let size: "normal" | "small" = "normal";

  let buttonStyleClass = "";

  $: iconString = getIconString(icon);
  $: {
    switch (buttonStyle) {
      case "icon-only":
        buttonStyleClass = "gdb-bs-iconOnly";
        break;
      case "accented-icon-only":
        buttonStyleClass = "accented gdb-bs-iconOnly";
        break;
      case "bm-edit-charm":
        buttonStyleClass = "gdb-bs-bmEditCharm";
        break;
      case "secondary-negative":
        buttonStyleClass = "gdb-bs-secondary-negative";
        break;
      case "primary":
      default:
        buttonStyleClass = "gdb-bs-primary";
        break;
    }

    if (size === "small") {
      buttonStyleClass += " gdb-bs-small";
    }
  }
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";

  .gdb-bs-iconOnly {
    background: none;
    font-size: 32px;
    min-width: 32px;
    min-height: 32px;
    line-height: 32px;
    color: $cs-grey-2;
    box-shadow: unset;

    &.gdb-bs-small {
      font-size: 16px;
    }

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

  .gdb-bs-iconOnly.accented {
    color: $cs-green-2;

    &:hover {
      color: $cs-green-4;
    }
  }

  .gdb-bs-bmEditCharm {
    background: none;
    font-size: 32px;
    width: 48px;
    height: 48px;
    line-height: 48px;
    text-align: center;
    padding: 0;
    color: $cs-grey-1;
    box-shadow: unset;
    transition: $button-transitions;
    border-radius: 50%;
    border: 1px solid transparent;

    &:hover {
      color: $color-accent-1;
      background-color: $color-accent-1-lightest;
      box-shadow: $shadow-main;
      border-color: $cs-grey-1;
    }

    &:active {
      color: $color-accent-1-darker;
      background-color: $color-accent-1-lighter;
      box-shadow: $shadow-push;
      border-color: $cs-grey-1;
    }

    &[disabled],
    &[disabled]:hover,
    &[disabled]:active {
      color: $cs-grey-1;
      cursor: not-allowed;
    }
  }

  .gdb-bs-secondary-negative {
    background-color: $color-background-white;
    color: $cs-red-2;
    border: 2px solid $cs-red-1;

    &:hover {
      background-color: $cs-red-0;
      color: $cs_red;
      border-color: $cs_red;
    }

    &:active {
      background-color: $cs-red-0;
      color: $cs_red;
      border-color: $cs_red;
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

<button on:click|preventDefault|stopPropagation class="gdb-button {buttonStyleClass}" {disabled} {label}>
  <i class="gdb-button-icon {iconString}" />
</button>
