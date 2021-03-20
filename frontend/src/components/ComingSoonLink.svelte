<script lang="ts">
  import ContactMe from "./ContactMe.svelte";

  export let subject: string;
</script>

<style type="text/scss">
  @import "../styles/_variables.scss";

  .gdb-coming-soon {
    text-decoration: dotted;
  }
</style>

<span class="gdb-coming-soon">🚧 <slot /></span>
