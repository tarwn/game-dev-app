<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { log } from "../../utilities/logger";
  import ValidationPopup from "./ValidationPopup.svelte";

  export let id: string | undefined = undefined;
  export let value: string = "";
  export let maxLength: number = 20;
  const DEBOUNCE_LIMIT = 100; // ms

  // TODO - add delayed update - if they pause for a second or two, treat is as an update
  //  consumers can opt into that behavior, but also will have to consider ignoring the regular change event

  let internalValue = value;
  const dispatch = createEventDispatcher();

  function parseValue(rawValue: string) {
    return rawValue.trim();
  }

  function validateValue(parsedValue: string) {
    return parsedValue.length <= maxLength;
  }

  // this is the value displayed in the box
  //  if the external value is altered, we will react and update the visible value to match
  let visibleValue = value;
  let isValid = true;

  $: {
    if (internalValue !== value) {
      console.log("external value change detected");
      console.log({ a: "ext-a", internalValue, visibleValue, value });

      internalValue = value;
      visibleValue = value;
      console.log({ a: "ext-b", internalValue, visibleValue, value });
    }
  }
  $: {
    console.log("visible value changed: " + visibleValue);
    console.log({ value, internalValue, visibleValue });
  }

  function filterKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      internalValue = value;
      visibleValue = value;
      isValid = validateValue(value);
    }
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.value.length > maxLength) {
      target.value = target.value.substr(0, maxLength);
    }
  }

  function handleFocusOut(e: Event) {
    const target = e.target as HTMLInputElement;
    const rawValue = target.value;
    const parsedValue = parseValue(rawValue);

    if (!validateValue(parsedValue)) {
      e.stopPropagation();
      isValid = false;
      refocusWithDebounce(target);
      visibleValue = target.value;
      dispatch("validation", { isValid });
      return;
    }

    // may be unnecessary - if we exclude this it requires full round-trip from bound value to display fresh formatting
    isValid = true;
    visibleValue = parsedValue;
    // forced update in case the underlying values haven't changed
    target.value = visibleValue;
    dispatch("validation", { isValid });
    if (parsedValue != value) {
      dispatch("change", { value: parsedValue, formattedValue: visibleValue });
    }
  }

  let lastFocusTime = 0;
  function refocusWithDebounce(target: any) {
    const time = new Date().getTime();
    if (time - lastFocusTime > DEBOUNCE_LIMIT) {
      lastFocusTime - time;
      setTimeout(() => target.focus(), 1);
    }
  }
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  .gdb-faux-input {
    position: relative;
    display: flex;
    // width: 100%; remove because it was overflowin parent after other fixes
    box-sizing: border-box;
  }

  .gdb-faux-input > input {
    flex: 1 1 auto;
    padding: 0;
    border: 0;
    outline: 0;
    min-width: 0; // overrides default browser width so flex can size as expected
  }

  .gdb-faux-input.isInvalid {
    border-color: $cs-red-4;
    background-color: $cs-red-0;

    & > input {
      color: $cs-red-4;
      background-color: $cs-red-0;
    }
  }
</style>

<div class="gdb-input gdb-faux-input" class:isInvalid={!isValid}>
  <input
    type="text"
    {id}
    value={visibleValue}
    on:keydown={filterKeyDown}
    on:focusout={handleFocusOut}
    on:input={handleInput}
    role="textbox"
    tabIndex={0} />
  <ValidationPopup {isValid}>
    <span slot="message">
      Enter a value that is {maxLength} characters or less.
    </span>
    <span slot="note">
      or press "Esc" to return to "{internalValue}"
    </span>
  </ValidationPopup>
</div>
