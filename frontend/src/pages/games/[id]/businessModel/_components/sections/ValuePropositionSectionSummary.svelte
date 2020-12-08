<script type="ts">
  import type { IBusinessModel } from "../../_types/businessModel";
  import TagSummaryList from "./components/TagSummaryList.svelte";
  import EntrySummaryList from "./components/EntrySummaryList.svelte";
  import SummarySection from "./components/SummarySection.svelte";

  export let businessModel: IBusinessModel | null;

  $: valueProp = businessModel?.valueProposition;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  // IMPORTANT: these styles are in `em` because we change the font size drastically
  //            for mini-map
</style>

{#if businessModel != null}
  <div>
    <SummarySection label="Genre(s)">
      <TagSummaryList entries={valueProp.genres} />
    </SummarySection>
    <SummarySection label="Platform(s)">
      <TagSummaryList entries={valueProp.platforms} />
    </SummarySection>
    <SummarySection>
      <EntrySummaryList entries={valueProp.entries} />
    </SummarySection>
  </div>
{/if}
