<script lang="ts">
  type dateStyle = null | "date" | "long date";

  export let date: Date;
  export let style: dateStyle = null;
  const className: string | undefined = $$props["class"];
  $: formattedDate = formatDate(date, style);

  function formatDate(date: Date, style: dateStyle) {
    if (style == "long date") {
      return date.toLocaleDateString("en-US", {
        timeZone: "UTC",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    return date.toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  }
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";
</style>

<span class={className}>{formattedDate}</span>
