<script lang="ts">
  export let date: Date;

  $: formattedDate = date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";
</style>

<span class="gdb-input gdb-input-date gdb-input-noneditable"
  >{formattedDate}</span>
