<script lang="ts">
  export let title: string = "";
  export let href: string = "";
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";
</style>

<div>
  <h3>{title}</h3>
  <em><a {href} title="Longer instruction for this section" target="_blank">Read
      longer instructions</a></em>
  <slot />
</div>
