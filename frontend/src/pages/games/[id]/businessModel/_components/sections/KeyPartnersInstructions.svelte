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
  title="Key Partners to launch the game"
  href="https://www.launchready.co/blog/define-your-business-model/?utm_source=inapp&medium=inapp&name=inapp#section-8-key-partnerships">
  <p>
    Earlier in sections like Key Activities and Channels, we probably identified some external companies or partners
    that we will ned to be sucecssful.
  </p>
  <p>Example areas to consider again:</p>
  <ul class="gdb-instructions-list">
    <li>
      <strong>Revenue:</strong>
      Are we relying on any third-parties for storefronts or indirect revenue (like ad networks)?
    </li>
    <li>
      <strong>Community:</strong>
      If we plan to have a community, will we be building this on someone else's platform?
    </li>
    <li><strong>Support:</strong> Where will folks go for support?</li>
    <li>
      <strong>Consultants:</strong>
      Will we be hiring external consultants to help with marketing, testing, or other key activities?
    </li>
    <li>
      <strong>Contractors:</strong>
      Will it be necessary to hire folks on contract for things like audio, design assets, or development?
    </li>
    <li>
      <strong>Partners:</strong>
      Will we be looking for or partnering with an identified publisher?
    </li>
    <li>
      <strong>Crowdfunding:</strong>
      Are we planning (or already executing) on a campaign on a crowdfunding platform?
    </li>
    <li>
      <strong>IP:</strong>
      Are there rights holders or similar that we need to partner with to get access to IP for the game?
    </li>
  </ul>
  <p>Like other sections, use specific names here only if it's an example or if that specific partner is critical.</p>
</Instructions>
