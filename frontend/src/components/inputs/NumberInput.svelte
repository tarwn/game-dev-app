<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { getNumberHelper } from "./numberHelper";
  import ValidationPopup from "./ValidationPopup.svelte";

  export let disabled: boolean = false;
  export let min: number = 0;
  export let max: number = 100;
  export let decimalScale = 0;
  export let id: string | undefined = undefined;
  export let value: number = 0.0;
  const ariaLabel: string | null = $$props["aria-label"];
  const DEBOUNCE_LIMIT = 100; // ms

  let internalValue = value;
  const dispatch = createEventDispatcher();

  // -- prep for currency operations
  const locale = "en-US";
  const helper = getNumberHelper(locale, decimalScale);
  // --

  function validateValue(parsedValue: number) {
    return !isNaN(parsedValue) && parsedValue >= min && parsedValue <= max;
  }

  function formatValue(value: number) {
    return helper.formatValue(value);
  }

  // this is the value displayed in the box
  //  if the external value is altered, we will react and update the visible value to match
  let visibleValue = formatValue(value);
  let isValid = true;
  let formattedMin = helper.formatValue(min);
  let formattedMax = helper.formatValue(max);

  $: {
    if (internalValue !== value) {
      console.log("external value change detected");
      console.log({ a: "ext-a", internalValue, visibleValue, value });

      internalValue = value;
      visibleValue = formatValue(value);
      console.log({ a: "ext-b", internalValue, visibleValue, value });
    }
  }
  $: {
    console.log("visible value changed: " + visibleValue);
  }

  function filterKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      internalValue = value;
      visibleValue = formatValue(value);
      isValid = validateValue(value);
    } else if (!e.metaKey && !e.ctrlKey && !e.altKey && !helper.allowedCharacters.has(e.key)) {
      e.preventDefault();
    }
  }

  function handleFocusOut(e: any) {
    const rawValue = e.target.value;
    const parsedValue = helper.parseValue(rawValue);

    if (!validateValue(parsedValue)) {
      e.stopPropagation();
      isValid = false;
      refocusWithDebounce(e.target);
      visibleValue = e.target.value;
      dispatch("validation", { isValid });
      return;
    }

    // may be unnecessary - if we exclude this it requires full round-trip from bound value to display fresh formatting
    isValid = true;
    visibleValue = formatValue(parsedValue);
    // forced update in case the underlying values haven't changed
    e.target.value = visibleValue;
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
    text-align: right;
    // max-width: 6rem;
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
    role="textbox"
    {disabled}
    tabIndex={disabled ? -1 : 0}
    aria-label={ariaLabel} />
  <ValidationPopup {isValid}>
    <span slot="message">
      Enter a value between <b>{formattedMin}</b> - <b>{formattedMax}</b>.
    </span>
    <span slot="note">
      or press "Esc" to return to {helper.formatValue(internalValue)}
    </span>
  </ValidationPopup>
</div>
