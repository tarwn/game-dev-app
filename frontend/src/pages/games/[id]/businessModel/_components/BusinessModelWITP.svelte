<script lang="ts">
  import WitpImage from "../../../../../components/witp/WitpImage.svelte";
</script>

<style lang="scss">
  @import "../../../../../styles/_variables.scss";

  h2 {
    margin-top: $space-l;
  }

  p {
    max-width: 800px;
  }

  .indented {
    margin: $space-m $space-m $space-l $space-m;
    padding: $space-s $space-m;
    border: 2px dashed $cs-green-1;
    border-radius: 8px;
  }
</style>

<h1>Outlining your Business Model</h1>

<p>
  Your game is unique. A Business Model Canvas helps you focus on each business angle to identify the unique advantages,
  audience characteristics, and resources for your game.
</p>

<div class="indented">
  <p>You don't have to know all the answers!</p>

  <p>
    This is as much about what you know as what you don't, and discovering where you're confident and where you're not.
  </p>
  <p>The goals are:</p>
  <ol>
    <li>perform an end-to-end pass with your business glasses on</li>
    <li>inform the places that time spent on prototypes, advisors, or audience validation can help most</li>
  </ol>
</div>

<h2>Navigating the Screen</h2>

<p>Click "Start" to begin entering details ("Full View" will zoom back out).</p>

<WitpImage src="/images/witp/BusinessModelGetStarted.png" alt="Getting started on the Business Model screen" />

<p>Inside, each section includes instructions, ideas, and links to external content.</p>

<WitpImage src="/images/witp/BusinessModelStage1.png" alt="Overview of the Business Model screen" />

<p>
  <i>Note: Everything autosaves so you won't lose work. A message will appear if you're offline and it can't save.</i>
</p>
