<script type="ts">
  import type { IBusinessModel } from "../../_types/businessModel";
  import EntrySummaryList from "./components/EntrySummaryList.svelte";
  import SummarySection from "./components/SummarySection.svelte";

  export let businessModel: IBusinessModel | null;

  $: channels = businessModel?.channels;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  // IMPORTANT: these styles are in `em` because we change the font size drastically
  //            for mini-map
</style>

{#if businessModel != null}
  <div>
    <SummarySection label="">
      {#if channels.awareness.list.length > 0}
        <EntrySummaryList entries={channels.awareness} />
      {/if}
      {#if channels.consideration.list.length > 0}
        <EntrySummaryList entries={channels.consideration} />
      {/if}
      {#if channels.purchase.list.length > 0}
        <EntrySummaryList entries={channels.purchase} />
      {/if}
      {#if channels.postPurchase.list.length > 0}
        <EntrySummaryList entries={channels.postPurchase} />
      {/if}
    </SummarySection>
  </div>
{/if}
