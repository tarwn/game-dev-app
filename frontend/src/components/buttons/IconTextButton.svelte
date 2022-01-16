<script lang="ts">
  import { PredefinedIcons, getIconString } from "./PredefinedIcons";
  export let icon: PredefinedIcons | string;
  export let spinIcon: boolean = false;
  export let value: string;
  export let buttonStyle: string = "primary";
  export let disabled: boolean = false;
  export let pulse = false;

  let buttonStyleClass = "";
  let iconStyleClass = "";

  $: iconString = getIconString(icon);
  $: {
    switch (buttonStyle) {
      case "primary-outline":
        buttonStyleClass = "gdb-bs-primary-outline";
        iconStyleClass = "gdb-is-primary";
        break;
      case "secondary-negative":
        buttonStyleClass = "gdb-bs-secondary-negative";
        iconStyleClass = "gdb-is-secondary-negative";
        break;
      case "primary":
      default:
        buttonStyleClass = "gdb-bs-primary";
        iconStyleClass = "gdb-is-inverse";
        break;
    }
  }
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";

  .gdb-button {
    white-space: nowrap;

    &.pulse {
      animation: pulse-orange 0.4s;
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

  @keyframes pulse-orange {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 2px 0px $cs_orange;
    }

    70% {
      transform: scale(1);
      box-shadow: 0 0 4px 3px $cs_orange;
    }

    100% {
      transform: scale(1);
      box-shadow: 0 0 8px 0px $cs_orange;
    }
  }

  @keyframes pulse-grey {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 2px 0px $cs_grey_2;
    }

    70% {
      transform: scale(1);
      box-shadow: 0 0 4px 3px $cs_grey_2;
    }

    100% {
      transform: scale(1);
      box-shadow: 0 0 8px 0px $cs_grey_2;
    }
  }

  .spin {
    animation-name: spin;
    animation-duration: 500ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>

<button on:click|preventDefault|stopPropagation class="gdb-button {buttonStyleClass}" class:pulse {disabled}>
  <i class="gdb-button-icon {iconString} {iconStyleClass}" class:spin={spinIcon} />
  <span class="gdb-button-text">{value}</span>
</button>
