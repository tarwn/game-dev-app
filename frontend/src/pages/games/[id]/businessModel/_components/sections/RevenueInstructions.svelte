<script lang="ts">
  import Instructions from "./components/Instructions.svelte";
</script>

<style lang="scss">
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
  title="Revenue"
  href="https://www.launchready.co/blog/define-your-business-model/?utm_source=inapp&medium=inapp&name=inapp#section-5-revenue-streams">
  <p>How are we pricing the game?</p>
  <p>Identify real prices and expected number of sales, if you can, or placeholders if you can't.</p>
  <p>Some examples:</p>
  <ul class="gdb-instructions-list">
    <li>Direct sale on _____: $15 sticker price, 200 sales first week then 50/month at avg price of $12.50</li>
    <li>
      Direct Subscription through ______: $4.99 monthly fee, 200 sales first week and grow to ~1,000 over 6 months
    </li>
    <li>Platform Subscription: $10k monthly to be in their subscription catalog</li>
    <li>Funding from (______?) $250k funding, every (6?) months over (18?) months</li>
    <li>$5k local city small business grant in (march?)</li>
  </ul>
  <p>See the linked post for more sources and ideas.</p>
</Instructions>
