<script lang="ts">
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
    {#if valueProp.genres.list.length > 0}
      <SummarySection label="Genre(s)">
        <TagSummaryList entries={valueProp.genres} />
      </SummarySection>
    {/if}
    {#if valueProp.platforms.list.length > 0}
      <SummarySection label="Platform(s)">
        <TagSummaryList entries={valueProp.platforms} />
      </SummarySection>
    {/if}
    <SummarySection>
      <EntrySummaryList entries={valueProp.entries} />
    </SummarySection>
  </div>
{/if}
