<script lang="ts">
  import { onMount } from 'svelte';
  import ErrorReporter from "./ErrorReporter.svelte";

  export let name: string;

  onMount(() => {

  });

  function handleClick(){
    throw new Error("this is a test error");
  }

  function reloadApp(){
    console.log("reload from error");
    window.location.reload();
  }
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<ErrorReporter on:dismiss={reloadApp} />

<h1>Hello {name}!</h1>

<button on:click={handleClick}>Error</button>
