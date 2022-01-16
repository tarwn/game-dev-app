<script lang="ts">
  import { getContext } from "svelte";
  const { open } = getContext("simple-modal");

  export let component: any;

  function openModal() {
    open(
      component,
      {},
      {
        closeButton: true,
        closeOnEsc: true,
        closeOnOuterClick: false,
        styleCloseButton: {
          cursor: "pointer",
        },
      }
    );
  }
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";

  .gdb-button-witp {
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
</style>

<button
  on:click|preventDefault|stopPropagation={openModal}
  class="gdb-button gdb-button-witp"
  title="What do I do on this page?">
  ?
</button>
