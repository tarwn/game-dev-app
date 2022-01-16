<script lang="ts">
  import { getCurrencyHelper } from "./currencyHelper";

  export let value: number = 0.0;
  export let shorten: boolean = false;

  // -- prep for currency operations
  const locale = "en-US";
  const currency = "USD";
  const decimalScale = 2;
  const helper = getCurrencyHelper(locale, currency, decimalScale, 0);
  // --

  function shortenNumber(value: number) {
    if (shorten && value >= 990_000) {
      return helper.formatValue(value / 1_000_000) + "M";
    } else if (shorten && value >= 990) {
      return helper.formatValue(value / 1000) + "K";
    }
    return helper.formatValue(value);
  }

  $: formattedValue = shortenNumber(value);
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";
</style>

<span>{formattedValue}</span>
