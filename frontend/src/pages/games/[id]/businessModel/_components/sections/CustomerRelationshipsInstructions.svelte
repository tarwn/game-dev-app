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
  title="Building Customer Relationships"
  href="https://www.launchready.co/blog/define-your-business-model/?utm_source=inapp&medium=inapp&name=inapp#section-4-customer-relationships">
  <p>What customer relationships are critical to our game and business?</p>
  <p>Here are some ideas on how customers may be critical to the business:</p>
  <ul class="gdb-instructions-list">
    <li>Do we need a certain number of active players for the game to work?</li>
    <li>Is word of mouth from the community part of the marketing plan?</li>
    <li>
      Will community play a role in game support or onboarding new players?
    </li>
    <li>
      Will player-generated content be a key part of the game or revenue model?
    </li>
  </ul>
  <p>
    For each critical type of relationship, we want to work backwards and define
    how we're going to build that relationship:
  </p>
  <ul class="gdb-instructions-list">
    <li>
      Will we actively build a community? What will it live and what factors
      (like above) will it drive for the game?
    </li>
    <li>
      Will support be through community channels, direct support (a ticket
      system, for instance), or some form of automated assistance?
    </li>
    <li>
      Will we rely on players to produce content critical to the game, and if
      so, how will we encourage them and how will they provide it (direct
      submission, an in-game storefront, in-game upload for free sharing, etc.)
    </li>
    <li>
      Will we rely or encourage players to perform marketing for us, via
      reviews, social media posting, or similar? Is this supported or encouraged
      by a mechanic of the game?
    </li>
  </ul>
</Instructions>
