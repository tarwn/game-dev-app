<script lang="ts">
  import Instructions from "./components/Instructions.svelte";
</script>

<style type="text/scss">
  @import "../../../../../../styles/_variables.scss";

  .gdb-instructions-list {
    margin: $space-s 0;
    padding-left: $space-m;

    & > li {
      margin: $space-s;
    }
  }
</style>

<Instructions
  title="Summary of Key Costs"
  href="https://www.launchready.co/blog/define-your-business-model/?utm_source=inapp&medium=inapp&name=inapp#section-3-channels">
  <p>
    To round out the Business Model, what costs are expected during development
    and after launch?
  </p>
  <p>
    <em>Like other sections, be specific about costs that are high impact or
      high risk and summarize or leave off ones that don't rise to that level.</em>
  </p>
  <ul class="gdb-instructions-list">
    <li>
      <strong>People:</strong>
      Generally the biggest cost. You may want to summarize employee costs,
      work-for-hire, and other categories seperately.
    </li>
    <li>
      <strong>Percentage of Sales:</strong>
      Post-launch, storefronts, publishers, and some others will receive a
      percentage of the revenue from earlier
    </li>
    <li>
      <strong>Taxes:</strong>
      What types of taxes and is there a significant different pre/post-launch?
    </li>
    <li>
      <strong>Marketing:</strong>
      Consider expenses for marketing, like PR or trade shows, streaming
      expenses, hosting, etc
    </li>
    <li>
      <strong>Admin:</strong>
      When we're small with a single game, general legal and accounting fees may
      be accounted at the game level
    </li>
    <li>
      <strong>Small Misc:</strong>
      Unless they're notable, you can probably defere small fees like email
      service, ticket systems, etc until we do a full budget
    </li>
  </ul>
</Instructions>
