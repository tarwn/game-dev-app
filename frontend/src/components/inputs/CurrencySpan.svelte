<script lang="ts">
  import { getCurrencyHelper } from "./currencyHelper";

  export let value: number = 0.0;

  // -- prep for currency operations
  const locale = "en-US";
  const currency = "USD";
  const decimalScale = 2;
  const helper = getCurrencyHelper(locale, currency, decimalScale);
  // --

  $: formattedValue = helper.formatValue(value);
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";
</style>

<span>{formattedValue}</span>
