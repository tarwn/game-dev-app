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
  title="Key Resources"
  href="https://www.launchready.co/blog/define-your-business-model/?utm_source=inapp&medium=inapp&name=inapp#section-6-key-resources">
  <p>
    What are the assets and resources we need to deliver on the game and
    channels?
  </p>
  <p>Some key resources may include:</p>
  <ul class="gdb-instructions-list">
    <li>Developers: internal, work for hire, existing IP?</li>
    <li>Visual or Audio design assets</li>
    <li>
      3rd Party IP (Sports teams, product licenses like cars, character
      licensing, etc.)
    </li>
    <li>Special equipment? For instance for a particular VR platform?</li>
    <li>
      Specific platforms we're relying to launch on that we don't want to switch
      mid-stream?
    </li>
    <li>An existing community we'll be relying on?</li>
  </ul>
  <p>Some other items we may be counting on:</p>
  <ul class="gdb-instructions-list">
    <li>Existing financial resources</li>
    <li>Successful completion of a crowdfunding campaign</li>
  </ul>
  <p>
    Are there any other resources (people, financial, licensing, tools or
    software) that are absolutely critical to success?
  </p>
</Instructions>
