<script lang="ts">
  import { fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import Portal from "svelte-portal";
  import Button from "./Button.svelte";
  import SpacedButtons from "./SpacedButtons.svelte";
  import { createEventDispatcher, onDestroy } from "svelte";

  export let ariaLabel: string = "Help information for the screen";
  export let isOpen: boolean = false;
  export let borderStyle: "blue" | "task" = "blue";

  const dispatch = createEventDispatcher();

  // capture the button and the modal window for aria purposes
  let visibleModal: any;

  let closeDelay = 300;

  function onOpened() {
    // aria - set focus to first focusable thing in dialog
    const nodes = visibleModal.querySelectorAll("*") as Array<any>;
    const tabbable = Array.from(nodes).filter((node) => node.tabIndex >= 0);
    // assumes there is something tabbable - the close button should suffice
    tabbable[0].focus();
  }

  function close() {
    isOpen = false;
    dispatch("close");
  }

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * closeDelay),

    fallback(node) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 0,
        easing: quintOut,
        css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
      };
    },
  });

  // aria - escape closes, tab is locked inside
  const handleKeydown = (event: any) => {
    if (isOpen && event.key === "Escape") {
      event.preventDefault();
      close();
    }
    if (isOpen && event.key === "Tab") {
      // trap focus
      const nodes = visibleModal.querySelectorAll("*") as Array<any>;
      const tabbable = Array.from(nodes).filter((node) => node.tabIndex >= 0 && !node.disabled);
      // console.log(tabbable);
      let index = tabbable.indexOf(document.activeElement);
      if (index === -1 && event.shiftKey) index = 0;
      index += tabbable.length + (event.shiftKey ? -1 : 1);
      index %= tabbable.length;
      tabbable[index].focus();
      event.preventDefault();
    }
  };

  onDestroy(() => {
    close();
  });
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  .gdb-popup-placeholder {
    width: 0;
    height: 0;
    overflow: auto;
  }

  .gdb-popup-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .gdb-popup-backsplash {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;
    opacity: 0.6;

    z-index: 10;
  }

  .gdb-popup-main {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    padding: 100px 400px;
    display: flex;
    align-items: center;

    z-index: 11;
  }

  .gdb-popup-visible-box {
    flex: 1 1;

    display: flex;
    flex-direction: column;
    max-height: 100%;
    max-width: 1000px;
    min-width: 640px;

    background-color: white;
    border: 3px solid $color-accent-1;
    border-radius: 4px;

    &.task {
      border-radius: 8px;
      border: 3px solid $cs-grey-5;
      border-top: 10px solid $cs-grey-5;

      & > :global(.gdb-page-bm-buttons) {
        background-color: $cs-grey-5;
      }
    }

    box-shadow: $shadow-main;

    // hack to get at the bottom div w/ buttons
    & > div + :global(div) {
      flex: 0 0;
      padding: $space-s $space-m;
    }
  }

  .gdb-popup-slot {
    overflow-y: auto;
    flex: 1 1;
    padding: $space-m;
  }
</style>

<svelte:window on:keydown={handleKeydown} />

{#if !isOpen}
  {#key "portalbutton"}
    <div in:receive={{ key: "popup" }} class="gdb-popup-placeholder"><!--placeholder target--></div>
  {/key}
{/if}
<slot name="button" />
{#if isOpen}
  <Portal target="body">
    <div class="gdb-popup-container">
      <div class="gdb-popup-backsplash" transition:fade={{ duration: closeDelay }} />
      <div class="gdb-popup-main">
        {#key "portal"}
          <div
            class={`gdb-popup-visible-box ${borderStyle}`}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            bind:this={visibleModal}
            on:introend={onOpened}
            in:fade={{ duration: 50, delay: 0 }}
            out:send={{ key: "popup" }}>
            <div class="gdb-popup-slot">
              <slot />
            </div>
            <SpacedButtons align="right">
              <Button value="Close" on:click={close} disabled={!isOpen} />
            </SpacedButtons>
          </div>
        {/key}
      </div>
    </div>
  </Portal>
{/if}
