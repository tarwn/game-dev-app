<script lang="ts">
  import SpacedButtons from "../buttons/SpacedButtons.svelte";
  export let title: string;
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";

  .gdb-page-screenTitle {
    display: flex;
    align-items: center;
    & > h1 {
      color: $cs-grey-4;
      flex-grow: 2;
    }
  }
</style>

<div class="gdb-page-screenTitle">
  <h1>{title}</h1>
  <SpacedButtons>
    <slot />
  </SpacedButtons>
</div>
