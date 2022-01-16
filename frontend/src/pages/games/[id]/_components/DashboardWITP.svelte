<script lang="ts">
  import WitpImage from "../../../../components/witp/WitpImage.svelte";
</script>

<style lang="scss">
  @import "../../../../styles/_variables.scss";

  h2 {
    margin-top: $space-l;
  }
</style>

<h1>This is the Game Dashboard</h1>

Every game has a planning dashboard just like this one. It shows a quick summary of the game details, but more
importantly holds your To Do List.

<WitpImage
  src="/images/witp/DashboardOverview.png"
  alt="Getting started on the Game Dashboard screen"
  caption="Key areas on the dashboard" />

<h2>Game To Do List</h2>
<p>When in doubt, this is the place to start 😀</p>
<p>
  These are the todo items LaunchReady is tracking for you. Early on, they start more generic and high level. The to do
  list becomes more custom and unique as you make decisions from planning, prototypes, and user feedback.
</p>
<h4>How to use?</h4>
<p>
  Click on a todo item to open up the details. Each one has options to work on the task, track it as your "active" item
  in the top bar, skip the it if it's not relevant, or mark it completed.
</p>
<h2>Planning Modules</h2>
<p>
  Easy access directly to the main planning modules, whether you're working on a task for them or looking up a detail.
</p>
