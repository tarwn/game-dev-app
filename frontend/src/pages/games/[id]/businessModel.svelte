<script lang="ts">
  import { params } from "@sveltech/routify";
  $: id = $params.id;
</script>

<style type="text/scss">
  @import "../../../styles/_variables.scss";
</style>

<div class="gdp-busmodel">Business Model for {id}</div>
