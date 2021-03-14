<script lang="ts">
  export let date: Date;
  const className: string | undefined = $$props["class"];
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

<span class={className}>{formattedDate}</span>
