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
  .gdb-instructions-sublist {
    padding-left: $space-m;

    & > li {
      margin: $space-s;
    }
  }
</style>

<Instructions
  title="Communications and Purchase Channels"
  href="https://www.launchready.co/blog/define-your-business-model/?utm_source=inapp&medium=inapp&name=inapp#section-3-channels">
  <p>
    Where will players first see information about the game (awareness), dig in
    to learn more (consideration), buy it (purchase), and, if needed, request
    support (post-purchase)?
  </p>
  <ul class="gdb-instructions-list">
    <li>
      <strong>Building Awareness</strong>
      <ul class="gdb-instructions-sublist">
        <li>
          <strong>Where do they frequent?</strong>
          Social Media, Discords, Forums, etc
        </li>
        <li>
          <strong>Who do they follow?</strong>
          Reviewers, influencers, and similar
        </li>
        <li><strong>Game website or newsletter?</strong></li>
        <li>
          <strong>Discoverability on the marketplace</strong>
          or crowdfunding sites for the game?
        </li>
      </ul>
    </li>

    <li>
      <strong>Feed Consideration</strong>
      <ul class="gdb-instructions-sublist">
        <li>
          <strong>Deeper dive</strong>
          Walkthroughs, wikis, devblogs - how can they see more?
        </li>
        <li>
          <strong>Hands-on?</strong>
          Can they sign up for pre-release access or testing?
        </li>
        <li><strong>Post-release?</strong> Can they download a demo?</li>
      </ul>
    </li>

    <li>
      <strong>Purchase</strong>
      <ul class="gdb-instructions-sublist">
        <li>
          <strong>Where do they buy it?</strong>
          PC Marketplaces, console stores, mobile app stores, physical stores?
          Which one(s)?
        </li>
      </ul>
    </li>

    <li>
      <strong>Post-Purchase</strong>
      <ul class="gdb-instructions-sublist">
        <li>
          <strong>Requesting support</strong>
          Where do they request support? Get returns?
        </li>
      </ul>
    </li>
  </ul>
</Instructions>
