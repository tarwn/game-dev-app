<script lang="ts">
  // import { params } from "@sveltech/routify";
  import BusinessModelCanvasLarge from "./_components/BusinessModelCanvasLarge.svelte";
  // $: id = $params.id;

  let displaySection = null;
  $: businessModel = {
    customer: {
      customers: [],
    },
  };

  function handleChangeSection(event) {
    displaySection = event.detail.section;
  }
</script>

<style type="text/scss">
  @import "../../../../styles/_variables.scss";
</style>

<h1>Business Model</h1>
<BusinessModelCanvasLarge
  bind:model={businessModel}
  isMiniMap={displaySection != null}
  on:sectionChange={handleChangeSection} />
