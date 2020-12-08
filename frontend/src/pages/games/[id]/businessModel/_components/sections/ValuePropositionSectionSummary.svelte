<script type="ts">
  import type { IBusinessModel } from "../../_types/businessModel";

  export let businessModel: IBusinessModel | null;

  $: valueProp = businessModel?.valueProposition;
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  // IMPORTANT: these styles are in `em` because we change the font size drastically
  //            for mini-map

  .gdb-section-summary {
    margin: 1em 0;
  }

  .gdb-list-flat {
    margin: 0 0.5em 0 2em;
    padding: 0;
    list-style-type: none;
  }

  .gdb-list-flat-li {
    display: inline-block;
  }

  .gdb-list-nonbulleted {
    margin: 0 0.5em 0 2em;
    padding: 0;
    list-style-type: none;
  }

  .gdb-list-li {
    margin: 0.5em 0;
  }
</style>

{#if businessModel != null}
  <div>
    <div class="gdb-section-summary">
      <ul class="gdb-list-flat">
        {#each valueProp.genres.list as genre (genre.globalId)}
          <li class="gdb-list-flat-li">{genre.value}</li>
        {/each}
      </ul>
      <ul class="gdb-list-flat">
        {#each valueProp.platforms.list as platform (platform.globalId)}
          <li class="gdb-list-flat-li">{platform.value}</li>
        {/each}
      </ul>
      <ul class="gdb-list-nonbulleted">
        {#each valueProp.entries.list as entry (entry.globalId)}
          <li class="gdb-list-li">{entry.value}</li>
        {/each}
      </ul>
    </div>
  </div>
{/if}
