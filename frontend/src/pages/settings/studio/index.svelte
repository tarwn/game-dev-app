<script lang="ts">
  import { metatags } from "@sveltech/routify";
  import PageTop from "../../../components/layout/PageTop.svelte";
  import EntryTable from "../../../components/table/EntryTable.svelte";
  import TableRowIndented from "../../../components/table/TableRowIndented.svelte";
  import IconTextButton from "../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../components/buttons/PredefinedIcons";
  import TableRowEmpty from "../../../components/table/TableRowEmpty.svelte";
  import TextInput from "../../../components/inputs/TextInput.svelte";
  import LabeledInput from "../../../components/inputs/LabeledInput.svelte";
  import SpacedButtons from "../../../components/buttons/SpacedButtons.svelte";
  import FauxLabelCell from "../../../components/table/FauxLabelCell.svelte";
  import { studioStore } from "../../_stores/studioStore";
  import { onDestroy, onMount } from "svelte";
  import { studioApi } from "../../_stores/studioApi";
  import type { Studio } from "../../_stores/studioApi";
  import { BillingPlans } from "../../_stores/studioApi";
  import { usersStore } from "../../_stores/usersStore";
  import { UpdateScope } from "../../_communications/UpdateScope";
  import WebSocketChannel from "../../_communications/WebSocketChannel.svelte";
  import type { User } from "../../_stores/usersApi";
  import { UserAccess } from "../../_stores/usersApi";
  import { getConfig } from "../../../config";

  metatags.title = "[LR] Settings / Studio";
  metatags.description = "Your LaunchReady Settings: Studio Administration";

  let config = getConfig();
  let studio = null;
  let users = [] as Array<User>;
  const unsubscribeStudio = studioStore.subscribe((update) => (studio = update));
  const unsubscribeUsers = usersStore.subscribe((u) => (users = u ?? []));

  $: planDescription = getPlanDescription(studio);
  function getPlanDescription(studio: Studio | null) {
    if (studio == null) return "Loading...";
    console.log(studio);
    const plan = BillingPlans.find((b) => b.id == studio.billingPlan);
    // TODO - once billing is enabled come back and add in real check [ch972][ch971]
    return `${plan?.name ?? "Unknown Plan"} - Free Trial`;
  }

  onMount(() => {
    usersStore.load();
  });

  onDestroy(() => {
    unsubscribeStudio();
    unsubscribeUsers();
  });

  function updateStudioName(name: string) {
    studioApi.updateName(name);
  }
</script>

<style type="text/scss">
  @import "../../../styles/_variables.scss";

  .gdb-content {
    margin: $space-s $space-xl $space-s $space-xl;
  }

  section {
    border-radius: 4px;
    margin: $space-m 0;
    background: $color-background-white;
    box-shadow: $shadow-main;
    padding: $space-s $space-m $space-m $space-m;
  }

  .gdb-extra-space {
    margin-top: $space-xl;
  }
</style>

<WebSocketChannel updateScope={UpdateScope.StudioUserList} on:receive={() => usersStore.load()} />

<PageTop name="Settings / Studio" />
<div class="gdb-content">
  <h1>Settings / Studio</h1>

  <section>
    <h2>Studio Settings</h2>
    <EntryTable>
      <colgroup>
        <col span="1" style="width: 1rem;" />
        <col span="1" style="width: 20rem;" />
        <col span="1" style="width: 14rem;" />
        <col span="1" style="" /><!-- soak up excess width -->
      </colgroup>
      <TableRowIndented>
        <td colspan={2}>
          <LabeledInput label="Studio Name" vertical={true}>
            <TextInput value={studio?.name} on:change={({ detail }) => updateStudioName(detail.value)} maxLength={80} />
          </LabeledInput>
        </td>
      </TableRowIndented>
      <TableRowEmpty />
      <TableRowIndented>
        <td>
          <LabeledInput label="Current LaunchReady Plan" vertical={true}>
            <span>{planDescription}</span>
          </LabeledInput>
        </td>
        <FauxLabelCell>
          <IconTextButton icon={PredefinedIcons.Star} value="Activate Subscription" disabled={true} />
        </FauxLabelCell>
      </TableRowIndented>
    </EntryTable>

    <h2 class="gdb-extra-space">Access List</h2>
    <EntryTable>
      <colgroup>
        <col span="1" style="width: 1rem;" />
        <col span="1" style="width: 14rem;" />
        <col span="1" style="width: 16rem;" />
        <col span="1" style="width: 12rem;" />
        <col span="1" style="width: 30rem;" />
        <col span="1" style="" /><!-- soak up excess width -->
      </colgroup>
      {#each users as user}
        <TableRowIndented isRecord={true} isTop={true} isBottom={true}>
          <td>
            <LabeledInput label="Name" vertical={true}>
              <span>{user.displayName}</span>
            </LabeledInput>
          </td>
          <td>
            <LabeledInput label="Username / Email" vertical={true}>
              <span>{user.userName}</span>
            </LabeledInput>
          </td>
          <td>
            <LabeledInput label="Status" vertical={true}>
              <span>Administrator</span>
            </LabeledInput>
          </td>
          <td>
            <LabeledInput label="Actions" vertical={true}>
              <SpacedButtons>
                <IconTextButton
                  icon={PredefinedIcons.Edit}
                  value="Change Access"
                  buttonStyle="primary-outline"
                  disabled={config.userId == user.id} />
                {#if user.access == UserAccess.PendingActivation}
                  <IconTextButton icon={PredefinedIcons.Delete} value="Cancel Invite" buttonStyle="primary-outline" />
                {/if}
              </SpacedButtons>
            </LabeledInput>
          </td>
        </TableRowIndented>
        <TableRowEmpty colspan={3} />
      {/each}
      <TableRowIndented>
        <td colspan="2">
          <IconTextButton
            icon={PredefinedIcons.Plus}
            value="Send an Invite"
            buttonStyle="primary-outline"
            disabled={true} />
        </td>
      </TableRowIndented>
    </EntryTable>
  </section>
</div>
