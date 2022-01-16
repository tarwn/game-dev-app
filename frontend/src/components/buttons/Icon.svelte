<script lang="ts">
  import { PredefinedIcons, getIconString } from "./PredefinedIcons";
  export let icon: PredefinedIcons | string;

  $: iconString = getIconString(icon);
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";
</style>

<i class="gdb-icon {iconString}" />
