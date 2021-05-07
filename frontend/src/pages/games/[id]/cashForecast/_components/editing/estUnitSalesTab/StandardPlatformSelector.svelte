<script lang="ts">
  import { getContext } from "svelte";
  import Button from "../../../../../../../components/buttons/Button.svelte";
  import IconTextButton from "../../../../../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../../../../../components/buttons/PredefinedIcons";
  import SpacedButtons from "../../../../../../../components/buttons/SpacedButtons.svelte";
  import ContactMe from "../../../../../../../components/ContactMe.svelte";
  import CurrencySpan from "../../../../../../../components/inputs/CurrencySpan.svelte";
  import Dropdown from "../../../../../../../components/inputs/Dropdown.svelte";

  import LabeledInput from "../../../../../../../components/inputs/LabeledInput.svelte";
  import PercentSpan from "../../../../../../../components/inputs/PercentSpan.svelte";
  import { StandardPlatformOption, StandardPlatformOptions, StandardPlatformSettings } from "./types";

  const { close } = getContext("simple-modal");

  export let onOkay: (selectedPlatform: StandardPlatformOption) => void;

  let userSelection = null as null | StandardPlatformOption;
  $: expandedSelect = userSelection == null ? null : StandardPlatformSettings.get(userSelection);

  function onClickOkay() {
    if (userSelection !== null) {
      onOkay(userSelection);
    }
    close();
  }

  function onCloseClick() {
    close();
  }
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  h2 {
    font-weight: bold;
    margin-right: 2rem;
  }

  .gdb-dialog-form {
    margin: $space-m 0;
  }
</style>

<div>
  <h2>Select a Platform</h2>
  <p>
    Select from the list of pre-defined platforms to add and automatically fill in the platform details. <i
      >(Please <ContactMe /> if one of these is stale and I miss it!)</i>
  </p>
  <div class="gdb-dialog-form">
    <div class="gdb-dialog-input">
      <LabeledInput label="Platform" vertical={true}>
        <Dropdown
          options={StandardPlatformOptions}
          value={userSelection}
          on:change={({ detail }) => (userSelection = detail.value)} />
      </LabeledInput>
    </div>
    {#if expandedSelect}
      <p>
        {expandedSelect.name} revenue share is
        <PercentSpan value={expandedSelect.sharePercent0} />
        {#if expandedSelect.until0 > 0}until <CurrencySpan value={expandedSelect.until0} shorten={true} />{/if}
        {#if expandedSelect.until0 > 0 && expandedSelect.sharePercent1 != null}, then <PercentSpan
            value={expandedSelect.sharePercent1} />
          {#if expandedSelect.until1 > 0}until <CurrencySpan value={expandedSelect.until1} shorten={true} />{/if}
        {/if}
        {#if expandedSelect.until1 > 0 && expandedSelect.sharePercent2 != null}, then <PercentSpan
            value={expandedSelect.sharePercent2} />
          {#if expandedSelect.until2 > 0}until <CurrencySpan value={expandedSelect.until2} shorten={true} />{/if}
        {/if}
      </p>
      {#if expandedSelect.caveat}
        <p><b>Note:</b> {expandedSelect.caveat}</p>
      {/if}
    {:else}
      <p>
        <i>(No platform selected yet)</i>
      </p>
    {/if}
  </div>
  <SpacedButtons align="right">
    <Button value="Cancel" buttonStyle="primary-outline" on:click={onCloseClick} />
    <IconTextButton
      icon={PredefinedIcons.NextRound}
      value="Add Platform"
      buttonStyle="primary"
      on:click={onClickOkay}
      disabled={userSelection === null} />
  </SpacedButtons>
</div>
