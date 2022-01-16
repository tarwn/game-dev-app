<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let disabled: boolean = false;
  export let value: number | undefined = undefined;
  export let options: { id: number; name: string }[];
  const ariaLabel: string | null = $$props["aria-label"];

  const dispatch = createEventDispatcher();

  function handleChange(e: any) {
    const value = parseInt(e.target.value);
    dispatch("change", { value });
  }
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";
</style>

<!-- svelte-ignore a11y-no-onchange -->
<select {value} aria-label={ariaLabel} on:change={handleChange} {disabled}>
  {#each options as option}
    <option value={option.id}>{option.name}</option>
  {/each}
</select>
