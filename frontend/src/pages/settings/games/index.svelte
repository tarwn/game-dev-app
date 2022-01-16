<script lang="ts">
  import { onDestroy } from "svelte";
  import { metatags } from "@sveltech/routify";
  import PageTop from "../../../components/layout/PageTop.svelte";
  import EntryTable from "../../../components/table/EntryTable.svelte";
  import TableRowIndented from "../../../components/table/TableRowIndented.svelte";
  import { gamesApi } from "../../_stores/gamesApi";
  import type { Game } from "../../_stores/gamesApi";
  import DateInput from "../../../components/inputs/DateInput.svelte";
  import IconTextButton from "../../../components/buttons/IconTextButton.svelte";
  import { PredefinedIcons } from "../../../components/buttons/PredefinedIcons";
  import IconButton from "../../../components/buttons/IconButton.svelte";
  import TableRowEmpty from "../../../components/table/TableRowEmpty.svelte";
  import { GameStatuses } from "../../_stores/types";
  import TextInput from "../../../components/inputs/TextInput.svelte";
  import { gamesStore } from "../../_stores/gamesStore";
  import { isUserSessionAdmin } from "../../../authorization";
  import LabelCell from "../../../components/table/LabelCell.svelte";
  import LinkAsButton from "../../../components/buttons/LinkAsButton.svelte";

  metatags.title = "[LR] Settings / Games";
  metatags.description = "Your LaunchReady Settings: Manage games for your studio.";

  const isUserAnAdmin = isUserSessionAdmin();
  let games = [] as Array<Game>;
  var unsubscribe = gamesStore.subscribe((update) => {
    games = update ?? [];
  });

  onDestroy(unsubscribe);

  function addGame() {
    gamesApi.addNewGame().then((game) => {
      games = [...games, game];
    });
  }

  function hasNotBeenUsed(game: Game) {
    return (
      game.businessModelLastUpdatedOn == null &&
      game.cashForecastLastUpdatedOn == null &&
      game.comparablesLastUpdatedOn == null &&
      game.marketingPlanLastUpdatedOn == null
    );
  }
</script>

<style lang="scss">
  @import "../../../styles/_variables.scss";

  .gdb-content {
    margin: $space-s $space-xl $space-s $space-xl;
  }

  section {
    border-radius: 4px;
    margin: $space-m 0;
    background: $color-background-white;
    box-shadow: $shadow-main;
    padding: $space-s $space-m;
  }
</style>

<PageTop name="Settings / Games" />
<div class="gdb-content">
  <h1>Settings / Games</h1>

  <section>
    <h2>Your Game List</h2>
    <EntryTable>
      <colgroup>
        <col span="1" style="width: 2rem;" />
        <col span="1" style="width: 4rem;" />
        <col span="1" style="width: 14rem;" />
        <col span="1" style="width: 10rem;" />
        <col span="1" style="width: 10rem;" />
        <col span="1" style="width: 14rem;" />
        <col span="1" style="width: 4rem;" />
        <col span="1" style="" /><!-- soak up excess width -->
      </colgroup>
      {#if !isUserAnAdmin}
        <TableRowIndented>
          <td colspan={5}>
            <i
              >Note: you do not have edit rights for game settings, you need Administrator access to make changes here.</i>
          </td>
        </TableRowIndented>
      {/if}
      <TableRowIndented>
        <LabelCell />
        <LabelCell>Name</LabelCell>
        <LabelCell>Status</LabelCell>
        <LabelCell>Launch Date</LabelCell>
        <LabelCell>Actions</LabelCell>
      </TableRowIndented>
      {#each games as game}
        <TableRowIndented>
          <td>
            <IconButton
              icon={PredefinedIcons.Star}
              buttonStyle={game.isFavorite ? "accented-icon-only" : "icon-only"}
              on:click={() => gamesApi.updateFavorite(game.globalId, !game.isFavorite)}
              disabled={!isUserAnAdmin} /></td>
          <td
            ><TextInput
              value={game.name}
              on:change={({ detail }) => gamesApi.updateName(game.globalId, detail.value)}
              disabled={!isUserAnAdmin} /></td>
          <td>
            <!-- <Dropdown
              options={GameStatuses}
              value={game.status}
              on:change={({ detail }) => gamesApi.updateStatus(game.globalId, detail.value)}
              disabled={!isUserAnAdmin} /> -->
            {GameStatuses.find((s) => s.id == game.status).name}
          </td>
          <td>
            {#if game.launchDate}
              <DateInput
                value={game.launchDate}
                on:change={({ detail }) => gamesApi.updateLaunchDate(game.globalId, detail.value)}
                disabled={!isUserAnAdmin} />
            {:else}
              <DateInput
                on:change={({ detail }) => gamesApi.updateLaunchDate(game.globalId, detail.value)}
                disabled={!isUserAnAdmin} />
            {/if}
          </td>
          <td>
            <LinkAsButton href={`/games/${game.globalId}/details`} value="Open details" buttonStyle="primary-outline" />
            {#if hasNotBeenUsed(game)}
              <IconButton
                icon={PredefinedIcons.Delete}
                buttonStyle={"secondary-negative"}
                on:click={() => gamesApi.delete(game.globalId)}
                disabled={!isUserAnAdmin} />
            {/if}
          </td>
        </TableRowIndented>
        <TableRowEmpty colspan={7} />
      {/each}
      <!-- add row -->
      <TableRowIndented>
        <td colspan={6}>
          <IconTextButton
            icon={PredefinedIcons.PlusRound}
            value={"Add Game"}
            buttonStyle="primary-outline"
            on:click={addGame}
            disabled={!isUserAnAdmin} />
        </td>
      </TableRowIndented>
    </EntryTable>
  </section>
</div>
