<script lang="ts">
  export let value: string;
  export let buttonStyle: string = "primary";
  export let disabled: boolean = false;

  let buttonStyleClass = "";

  $: {
    switch (buttonStyle) {
      case "primary-outline":
        buttonStyleClass = "gdb-bs-primary-outline";
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
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  .gdb-button {
    white-space: nowrap;
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
</style>

<button on:click|preventDefault|stopPropagation class="gdb-button {buttonStyleClass}" {disabled}>
  <span class="gdb-button-text">{value}</span>
</button>
