<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    window.onunhandledrejection = (e) => {
      console.log('Unhandled exception at top-level', e);
    };
  });

	export let name: string;
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>Hello {name}!</h1>
