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
  title="Key Activities to build and launch"
  href="https://www.launchready.co/blog/define-your-business-model/?utm_source=inapp&medium=inapp&name=inapp#section-7-key-activities">
  <p>
    Key Activities will generally include things like (1) building the game, (2)
    marketing, and (3) potential partnerships or activity.
  </p>
  <p>
    We don't need to go into the full project plan for building the game, a good
    guideline here is if a major activity has a different type of risk or
    unknown, list it separately.
  </p>
  <p>
    <em>For example, if I had an internal team doing development and
      post-production work, but an external one managing QA, I might list this
      as "Development, Post-Production" and "QA and hardening" because they have
      different risks.</em>
  </p>
  <p>Major areas to consider:</p>
  <ul class="gdb-instructions-list">
    <li>Developing: Coding, Sound, Art, Post-production, Testing</li>
    <li>
      Marketing: Community management, content/writing, artwork, PR, website
      development
    </li>
    <li>Distribution: from Steam setup to box design, etc</li>
    <li>
      More: Pitching publishers, raising funding, building partnerships for
      hardware, etc
    </li>
  </ul>
  <p>Some of these may also tie to the Key Partners section, next</p>
</Instructions>
