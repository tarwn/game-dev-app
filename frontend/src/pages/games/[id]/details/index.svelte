<script lang="ts">
  import { metatags, params } from "@sveltech/routify";
  import { onDestroy } from "svelte";
  import { isUserSessionAdmin } from "../../../../authorization";
  import ButtonWithPopup from "../../../../components/buttons/ButtonWithPopup.svelte";
  import IconButton from "../../../../components/buttons/IconButton.svelte";
  import Info from "../../../../components/buttons/Info.svelte";
  import LinkAsButton from "../../../../components/buttons/LinkAsButton.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";
  import ComingSoonBox from "../../../../components/ComingSoonBox.svelte";
  import ContactMe from "../../../../components/ContactMe.svelte";
  import DateInput from "../../../../components/inputs/DateInput.svelte";
  import LabeledInput from "../../../../components/inputs/LabeledInput.svelte";
  import TextAreaInput from "../../../../components/inputs/TextAreaInput.svelte";
  import TextInput from "../../../../components/inputs/TextInput.svelte";
  import TextOutput from "../../../../components/inputs/TextOutput.svelte";
  import FormRow from "../../../../components/layout/FormRow.svelte";
  import ScreenTitle from "../../../../components/layout/ScreenTitle.svelte";
  import { log } from "../../../../utilities/logger";
  import { UpdateScope } from "../../../_communications/UpdateScope";
  import WebSocketChannel from "../../../_communications/WebSocketChannel.svelte";
  import type { GameDetails } from "../../../_stores/gamesApi";
  import { gamesApi } from "../../../_stores/gamesApi";
  import type { UserProfile } from "../../../_stores/profileApi";
  import { AutomaticPopup } from "../../../_stores/profileApi";
  import { profileStore } from "../../../_stores/profileStore";
  import { GameStatuses } from "../../../_stores/types";
  import GameDetailsWitp from "./_components/GameDetailsWitp.svelte";

  // page title
  metatags.title = "[LR] Game Details";

  // params
  $: id = $params.id;
  let initializedId = null;
  let game: GameDetails | null = null;
  function loadGame() {
    gamesApi.getGameDetailsById(id).then((g) => {
      if (g.globalId == id) {
        game = g;
      }
    });
  }
  $: {
    if (id != null && id != initializedId) {
      initializedId = id;
      loadGame();
    }
  }

  const isUserAnAdmin = isUserSessionAdmin();

  // user profile data
  let latestProfile: null | UserProfile = null;
  var unsubscribe = profileStore.subscribe((p) => {
    if (p != null) latestProfile = p;
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

<style lang="scss">
  @import "../../../../styles/_variables.scss";

  .gdb-label-link {
    font-size: 0.85rem;
  }

  .gdb-detail-container {
    display: grid;
    grid-template-columns: [start] 40rem [gutter] auto [end];
    column-gap: $space-m;
  }

  .gdb-form {
    grid-column: start / end;
    border: 1px solid $cs-grey-1;
    background-color: white;
    box-shadow: $shadow-main;
    border-radius: 8px;
    margin-bottom: $space-l;
  }

  .gdb-form-content {
    display: grid;
    grid-template-columns: [start] 30rem [mid] 30rem [rem] auto [end];
    grid-template-rows: [start] auto [end];
    column-gap: $space-xl * 2;
  }

  // .top-indented {
  //   padding-top: $space-m + $space-s;
  // }

  .small-note {
    color: $text-color-light;
    font-size: $font-size-small;
  }

  .form-fields {
    padding: $space-m;
  }

  .no-h2 {
    margin-top: $space-l;
  }

  .text-for-star {
    display: flex;
    align-items: center;
  }

  .form-notes {
    grid-column: mid / end;
    grid-row: start / end;
    background-color: $cs-grey-0;
    padding: $space-m $space-l;
  }

  ul > li,
  ol > li {
    padding: $space-s;

    & > ul > li {
      padding: $space-xs;
    }
  }
</style>

<WebSocketChannel
  scope={UpdateScope.GameDetails}
  gameId={id}
  on:receive={(e) => {
    log("WebSocketChannel-GameDetails", e.detail);
    loadGame();
  }} />

<ScreenTitle title="Game Details">
  {#if latestProfile}
    <LinkAsButton value="Go to Dashboard" buttonStyle="primary-outline" href={`/games/${id}`} />
    <ButtonWithPopup
      buttonStyle="primary-outline-circle"
      label="?"
      buttonTitle="Help: How to use this screen"
      ariaLabel="Help: How to use this screen"
      forceOpen={(latestProfile.hasSeenPopup & AutomaticPopup.GameDetails) !== AutomaticPopup.GameDetails}
      on:close={() => profileStore.markPopupSeen(AutomaticPopup.GameDetails)}>
      <GameDetailsWitp />
    </ButtonWithPopup>
  {/if}
</ScreenTitle>

{#if game}
  <div class="gdb-detail-container">
    <div class="gdb-form">
      <div class="gdb-form-content">
        <div class="form-fields">
          <h2>Summary</h2>
          <FormRow>
            <LabeledInput label="Name" vertical={true}>
              <TextInput
                value={game.name}
                on:change={({ detail }) => gamesApi.updateName(game.globalId, detail.value)}
                disabled={!isUserAnAdmin} />
            </LabeledInput>
          </FormRow>
          <FormRow>
            <LabeledInput label="Launch Date" vertical={true}>
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
            </LabeledInput>
          </FormRow>
          <FormRow>
            <LabeledInput label="Is Favorited" vertical={true}>
              <span class="text-for-star">
                <IconButton
                  icon={PredefinedIcons.Star}
                  buttonStyle={game.isFavorite ? "accented-icon-only" : "icon-only"}
                  on:click={() => gamesApi.updateFavorite(game.globalId, !game.isFavorite)} />
                <span class="small-note">Favorited games appear on the left sidebar</span>
              </span>
            </LabeledInput>
          </FormRow>
        </div>
        <div class="form-fields no-h2">
          <FormRow>
            <LabeledInput label="Stage" vertical={true}>
              <TextOutput value={GameStatuses.find((s) => s.id == game.status).name} />
            </LabeledInput>
            <p class="small-note">"Stage" is updated as you complete tasks and reach major milestones (like Release)</p>
          </FormRow>
          <FormRow />
        </div>
      </div>
    </div>

    <div class="gdb-form">
      <div class="gdb-form-content">
        <div class="form-fields">
          <h2>Goals</h2>
          <FormRow>
            <LabeledInput label="Link" vertical={true}>
              <span slot="label" class="gdb-label-link"
                ><a
                  href={game.goalsDocUrl}
                  target="_blank"
                  class:disabled={!game.goalsDocUrl}
                  disabled={!game.goalsDocUrl}>Open in new window</a
                ></span>
              <TextInput
                value={game.goalsDocUrl}
                on:change={({ detail }) => gamesApi.updateGoalsDocUrl(game.globalId, detail.value)}
                disabled={!isUserAnAdmin} />
            </LabeledInput>
          </FormRow>
          <FormRow>
            <LabeledInput label="Notes" vertical={true}>
              <TextAreaInput
                value={game.goalsNotes}
                on:change={({ detail }) => gamesApi.updateGoalsNotes(game.globalId, detail.value)}
                disabled={!isUserAnAdmin} />
            </LabeledInput>
          </FormRow>
        </div>
        <div class="form-notes">
          <p><Info /> <i>Add this as an external document or wiki so you can share and collaborate more easily.</i></p>
          <p>
            Goals are one of the lenses to prioritize time and money, influence design decisions, and can cause a team
            to gel or explode when things get tough.
          </p>
          <ul class="spaced-out">
            <li>What has to be true to make this a success?</li>
            <li>What are some nice to have's you would like to see along the way?</li>
          </ul>
          <br />
          <p>
            <!-- [TODO ch1230] See <a href="#">"What are the goals of your indie game?"</a> for further guidance. -->
            🚧 "What are the goals of your indie game?" blog post coming soon.
          </p>
        </div>
      </div>
    </div>

    <div class="gdb-form">
      <div class="gdb-form-content">
        <div class="form-fields">
          <h2>Groundwork: Pipeline, Process, Roles</h2>
          <FormRow>
            <LabeledInput label="Link" vertical={true}>
              <span slot="label" class="gdb-label-link">
                <a
                  href={game.groundworkDocUrl}
                  target="_blank"
                  class:disabled={!game.groundworkDocUrl}
                  disabled={!game.groundworkDocUrl}>Open in new window</a>
              </span>
              <TextInput
                value={game.groundworkDocUrl}
                on:change={({ detail }) => gamesApi.updateGroundworkDocUrl(game.globalId, detail.value)}
                disabled={!isUserAnAdmin} />
            </LabeledInput>
          </FormRow>
          <FormRow>
            <LabeledInput label="Notes" vertical={true}>
              <TextAreaInput
                value={game.groundworkNotes}
                on:change={({ detail }) => gamesApi.updateGroundworkNotes(game.globalId, detail.value)}
                disabled={!isUserAnAdmin} />
            </LabeledInput>
          </FormRow>
        </div>
        <div class="form-notes">
          <p>
            <i><Info /> Add this as an external document or wiki so you can share and collaborate more easily.</i>
          </p>
          <p>
            This is your charter, how you're going to get work done (and what those high-level, known deliverables are).
            The goal is to make initial decisions about how you (or the team) will be working, to reduce day-to-day
            friction and make it faster to adjust and improve later as needed.
          </p>
          <p>
            <i
              >Note: this may look long, but it's one of those exercises that will clear a lot of mental clutter out of
              the way as you start develpoing and sidestep some conflicts that would otherwise soak up time.</i>
          </p>
          <ol>
            <li>
              Create the living document or wiki page this will live in (add links to borrow from other people/studios,
              expand on info as needed)
            </li>
            <li>
              Define your high-level pipeline/milestones (Concept, Pre-Production, Production, Post-Production is
              common) and the general deliverables in each. Some ideas:
              <ul>
                <li>
                  <a href="https://www.cgspectrum.com/blog/game-development-process" target="_blank"
                    >"How video games are made: the game development process", cgspectrum</a> (also good role list for next
                  item below)
                </li>
                <li>
                  <a href="https://gamedevpostmortem.com/phases-of-the-game-development-process/"
                    >"Phases of the Game Development Process", Game Dev Postmortem</a>
                </li>
                <li>
                  <a href="https://www.youtube.com/watch?v=6zO54tD0sDo"
                    >"Game Cinematics: Production, Pipelines and Workflows", Youtube</a> - concrete example of a pipeline
                  for cinematics
                </li>
              </ul>
              <p>
                A well-defined set of milestones/deliverables for pre-production and post-production is valuable, they
                have known deliverables. You can then choose from a variety of methods for Production work. Do you want
                to build a vertical slice, alpha, beta, etc. with rougher/MVP models and art and then iterate and
                enhance with the remaining time? Or maybe build a polished vertical slice and progresssively grow it
                into the full game (but polished at every step)?
              </p>
              <p>
                One last example, I like <a href="https://www.juegostudio.com/process">this visualization</a> (note: the
                3 columns are mis-labeled) of a high-level plan. Mine would look different, but it's a good balance of explaining
                the highest level plan and showing some concrete contents.
              </p>
            </li>
            <li>
              Which major roles will you need and how are decisions made within these areas?
              <ul>
                <li>
                  Role ideas: <a
                    href="https://www.gamedeveloper.com/disciplines/building-a-strong-indie-game-development-team"
                    target="_blank">"Building A Strong Indie Game Development Team", GameDeveloper.com</a>
                  <i>(consider whether some of these will be partners/contractors too)</i>
                </li>
                <li>
                  Change Process: Are decisions written down somewhere? A notification posted or emailed somewhere? If
                  you're not solo, when is permission required?
                </li>
                <li>
                  Decision-Making (if not solo): Will teammates make autonomous decisions? Will everyone have an equal
                  say? Do certain decisions only get made by leads? Where is the line? (Only go as deep as you need on
                  this, a small studio doesn't need the bureaucracy of a AAA)
                </li>
              </ul>
            </li>
            <li>
              When and how frequently are updates communicated?
              <ul>
                <li>
                  Make a list of the stakeholders in your game: the team, external partners, your early fans, your
                  players, anyone with a financial interest, and so on
                </li>
                <li>
                  Make a list of information or events they may care about: progress of the game, design or business
                  decisions, financial status, milestones
                </li>
                <li>
                  For each combination (consider a grid/table):
                  <ul>
                    <li>Does the stakeholder care about that topic?</li>
                    <li>
                      Is it valuable for them to know about it immediately? Summarized at a regular rythm (weekly,
                      monthly)?
                    </li>
                    <li>
                      Should it be pushed (presentation, meeting, email), available at a common place on demand (wiki,
                      google doc, etc), or a combination?
                    </li>
                    <li>
                      Does an empty message have value? (like a monthly, "Everything is still on track", "No bugs this
                      month", or similar)
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li>
              Project Management:
              <ul>
                <li>Style: Are you going to use specific style for developent and design work?</li>
                <li>
                  Tracking: Are you using a ticket system to manage tasks? Is someone responsible for overall
                  coordination and reminding folks to keep it up to date?
                </li>
                <li>
                  Communication and Coordination: Back up a level, are there any ceremonies, notifications, or similar
                  to add to the communications/updates in #4?
                </li>
              </ul>
            </li>
            <li>
              Source Control and Build processes?
              <ul>
                <li>Where will source code be stored? Assets?</li>
                <li>
                  What will the pipelines look like for those? CI? (at the beginning, "Roughly X, so-and-so will add
                  more detail w/ ticket ABC-123" could be enough)
                </li>
              </ul>
            </li>
          </ol>
          <ComingSoonBox>
            <p>
              <!-- [TODO ch1231] -->
              A blog post and sample templates are in progress and will be added soon. Please <ContactMe /> in the meantime
              if I can help or provide early drafts.
            </p>
          </ComingSoonBox>
        </div>
      </div>
    </div>
  </div>
{/if}
