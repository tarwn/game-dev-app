<script lang="ts">
  export let date: Date;
  $: dateString = date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";
</style>

<span class="gdb-date-text">{dateString}</span>
