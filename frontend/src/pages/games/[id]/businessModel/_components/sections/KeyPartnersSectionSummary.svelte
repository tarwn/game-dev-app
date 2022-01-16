<script lang="ts">
  import type { IBusinessModel } from "../../_types/businessModel";
  import EntrySummaryList from "./components/EntrySummaryList.svelte";
  import SummarySection from "./components/SummarySection.svelte";

  export let businessModel: IBusinessModel | null;
</script>

<style lang="scss">
  @import "../../../../../../styles/_variables.scss";

  // IMPORTANT: these styles are in `em` because we change the font size drastically
  //            for mini-map
</style>

{#if businessModel != null}
  <div>
    {#if businessModel.keyPartners.entries.list.length > 0}
      <SummarySection label="">
        <EntrySummaryList entries={businessModel.keyPartners.entries} />
      </SummarySection>
    {/if}
  </div>
{/if}
