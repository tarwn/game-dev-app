<script lang="ts">
  import { url } from "@sveltech/routify";
</script>

<nav>
  <ul>
    <li><a href={$url('/')}>Home</a></li>
    <li><a href={$url('../examples')}>Examples</a></li>
    <li><a href={$url('../examples/:id', { id: 1 })}>Example 1</a></li>
  </ul>
</nav>
<slot />
