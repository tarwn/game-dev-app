<script lang="ts">
  import Button from "./Button.svelte";
  import { createEventDispatcher, onDestroy } from "svelte";
  import AnythingWithPopup from "./AnythingWithPopup.svelte";

  export let label = "Open";
  export let ariaLabel: string = "Help information for the screen";
  export let buttonStyle = "primary" as "primary" | "primary-outline" | "primary-outline-circle" | "secondary-negative";
  export let buttonTitle: string = "Help information for the screen";
  export let forceOpen = false;

  const dispatch = createEventDispatcher();

  let isOpen = forceOpen;
  let pulseButton = false;
  // capture the button and the modal window for aria purposes

  let closeDelay = 300;

  function open() {
    isOpen = true;
  }

  function close() {
    isOpen = false;
    dispatch("close");
    // aria - set the focus to the button they clicked to open the modal
    setTimeout(() => (pulseButton = true), closeDelay - 20);
    setTimeout(() => (pulseButton = false), closeDelay + 1000);
  }

  onDestroy(() => {
    close();
  });
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";
</style>

<AnythingWithPopup {ariaLabel} {isOpen} on:close={close}>
  <span slot="button">
    <Button value={label} on:click={open} pulse={pulseButton} {buttonStyle} title={buttonTitle} />
  </span>
  <slot />
</AnythingWithPopup>
