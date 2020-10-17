<script lang="ts">
  import { params } from "@sveltech/routify";
  $: id = $params.id;
</script>

<h2>Example {id}</h2>
