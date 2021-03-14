<script lang="ts">
  import { getPercentHelper } from "./percentHelper";

  export let value: number;
  const className: string | undefined = $$props["class"];

  // -- prep for currency operations
  const locale = "en-US";
  const decimalScale = 3;
  const helper = getPercentHelper(locale, decimalScale);
  // --

  $: formattedValue = helper.formatValue(value);
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";
</style>

<span class={className}>{formattedValue}</span>
