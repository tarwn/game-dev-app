<script lang="ts">
  import { onDestroy } from "svelte";

  import AnythingWithPopup from "../../../../components/buttons/AnythingWithPopup.svelte";
  import Button from "../../../../components/buttons/Button.svelte";
  import Icon from "../../../../components/buttons/Icon.svelte";
  import IconButton from "../../../../components/buttons/IconButton.svelte";
  import IconTextButton from "../../../../components/buttons/IconTextButton.svelte";

  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
  import { gamesApi } from "../../../_stores/gamesApi";
  import { GameStatus, GameStatuses } from "../../../_stores/types";

  export let gameId: string;
  export let gameStatus: number;

  $: currentGameStatus = GameStatuses.find((gs) => gs.id == gameStatus)?.name ?? "";
  $: nextStatus = getNextGameStatus(gameStatus);
  $: nextStatusName = GameStatuses.find((gs) => gs.id == nextStatus)?.name ?? "";

  function getNextGameStatus(status: GameStatus) {
    switch (gameStatus) {
      case GameStatus.Idea:
        return GameStatus.Planning;
      case GameStatus.Planning:
        return GameStatus.Developing;
      case GameStatus.Developing:
        return GameStatus.Live;
      case GameStatus.Live:
        return null;
      default:
        throw new Error(`Cannot advance a game in status ${gameStatus}`);
    }
  }

  function updateGameStatus() {
    gamesApi.updateStatus(gameId, nextStatus).then(() => close());
  }

  // manage dialog popup
  let isOpen = false;
  let ariaLabel = "Move to the next phase of game planning";
  let pulseButton = false;
  let closeDelay = 30;

  function open() {
    isOpen = true;
  }

  function close() {
    isOpen = false;
    // aria - set the focus to the button they clicked to open the modal
    setTimeout(() => (pulseButton = true), closeDelay - 20);
    setTimeout(() => (pulseButton = false), closeDelay + 1000);
  }

  onDestroy(() => {
    close();
  });
</script>

<style type="text/scss">
  @import "../../../../styles/_variables.scss";

  .gdb-tile {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    width: 200px;
    height: 200px;
    background-color: transparent;
    text-decoration: none;
    margin-bottom: $space-m;

    overflow: hidden;
    white-space: normal;

    // these styles are similarly reflected in TopBar for the empty todo item
    border-radius: 4px;
    border: 4px dashed $cs-green-1;
    // background-color: $cs-green-0;
    opacity: 0.9;

    justify-content: center;

    // extend slightly outside normal tile height
    margin-top: -$space-xs;
  }

  .gdb-advance-icon {
    display: inline-block;
    padding: $space-s $space-l;
    font-size: 36px;
    color: $cs-green-2;
    text-align: center;
  }

  .gdb-advance-text {
    padding: $space-s $space-l;
    text-align: center;
    color: $cs-green-5;
  }

  .gdb-advance-button {
    text-align: center;
  }
</style>

<div class="gdb-tile-container">
  <div class="gdb-tile">
    <div class="gdb-advance-icon"><Icon icon={PredefinedIcons.Check} /></div>
    <div class="gdb-advance-text">Excellent, You have completed the <b>{currentGameStatus}</b> stage.</div>
    <AnythingWithPopup {ariaLabel} {isOpen} on:close={close}>
      <div slot="button" class="gdb-advance-button">
        <Button
          value={`Advance Stage`}
          on:click={open}
          pulse={pulseButton}
          buttonStyle="primary-outline"
          title={`Advance Stage`} />
      </div>
      <div>
        <h2>Advance Game Phase</h2>
        <p>You have completed all of the planning tasks for this stage of your game, advance to the next stage:</p>
        <IconTextButton
          icon={PredefinedIcons.NextRound}
          value={`Advance to "${nextStatusName}"`}
          on:click={updateGameStatus} />
        <br />
        <p><i>What does this do? </i></p>
        <p>
          <i
            >Advancing the planning stage for the game opens up new planning items to help connect your development
            efforts to new questions, research, and information.</i>
        </p>
      </div>
    </AnythingWithPopup>
  </div>
  <div class="gdb-due-date" />
</div>
