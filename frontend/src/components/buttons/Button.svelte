<script lang="ts">
  export let value: string;
  export let buttonStyle: string = "primary";
  export let disabled: boolean = false;
  export let pulse = false;
  export let title: string | null = null;

  let buttonElem: any;
  let buttonStyleClass = "";

  $: {
    switch (buttonStyle) {
      case "primary-outline":
        buttonStyleClass = "gdb-bs-primary-outline";
        break;
      case "primary-outline-circle":
        buttonStyleClass = "gdb-bs-primary-outline-circle";
        break;
      case "secondary-negative":
        buttonStyleClass = "gdb-bs-secondary-negative";
        break;
      case "primary":
      default:
        buttonStyleClass = "gdb-bs-primary";
        break;
    }
  }

  $: {
    // hacky
    if (pulse) {
      buttonElem.focus();
    }
  }
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  .gdb-button {
    white-space: nowrap;

    &.pulse {
      animation: pulse-orange 0.4s;
    }
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

  .gdb-bs-primary-outline-circle {
    width: $space-l + $space-s;
    height: $space-l + $space-s;
    margin-top: -1 * $space-s;
    margin-bottom: -1 * $space-s;
    line-height: $space-l + $space-s - $space-xs;
    padding: 0;

    display: inline-block;
    // box-shadow: unset;

    background-color: white;
    border: 3px solid $color-accent-1;
    border-radius: 50%;
    font-size: 1.75rem;
    font-weight: bold;

    opacity: 0.7;

    color: $cs-blue-3;

    &:hover {
      box-shadow: $shadow-main-hover;
      opacity: 1;
    }
    &:active {
      box-shadow: $shadow-main;
      opacity: 1;
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
</style>

<button
  on:click|preventDefault|stopPropagation
  class="gdb-button {buttonStyleClass}"
  class:pulse
  {disabled}
  bind:this={buttonElem}
  {title}>
  <span class="gdb-button-text">{value}</span>
</button>
