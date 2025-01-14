This is an archive of the source code behind [LaunchReady](https://www.tiernok.com/projects/launchready-igd), a software product
I founded and launched, but shuttered a few years ago so I could focus on another role that had come my way.

**Licensing:** This software is shared for portfolio and educational purposes. All rights to modify, reuse, or redistribute the code are reserved. I am open to individual licenses, reach out to me to chat.

![Dashboard screenshot from LaunchReady](https://www.tiernok.com/images/projects/launchready-igd/App-Dashboard.png)

1. Check out the [LaunchReady Product Write-up](https://www.tiernok.com/projects/launchready-igd) on my site, for background on the product, intended users, UI and technical design overview.
2. Check out notable example links from the codebase below.

# Notable Code Elements

## Top Level Summary

This is a startup codebase, so it's not as polished as it would be if things were further along, but if you've built as many CI/CD pipelines, overhauled as many brownfield products, etc. as I have, you tend to wire in some things even at an early stage that may be missing in other 0-to-1 projects.

1. **CI/CD**: The `.circleci` and `database` folders (plus `backend/GDB.Tools.DatabaseMigration` using [DbUp](https://github.com/DbUp/DbUp)) are the only way this code touched production
    * _Note: this had working CI/CD with labels on the commits, but CircleCI not only made changes they also somehow no longer display status on all the historical commits 🤷‍♀️🤷‍♂️_
2. **Deploy one service**: this is designed to all run on one (horizontally scalable) web service, so the build process and backend are built to bundle up the front-end and host both
3. **Fast**: [Svelte](https://svelte.dev/) on the frontend, websockets and CRDTs for realtime collaborative edits, [.Net Core](https://learn.microsoft.com/en-us/aspnet/core/introduction-to-aspnet-core) and pretty clean DB and queries for storage
4. **Developer Experience**: This is a one developer startup, I don't have time to wade through a mess, so 
    * the front-end has automated formatting wired in
    * realtime test feedback: [Wallaby](https://wallabyjs.com/) on the frontend, [NCrunch](https://www.ncrunch.net/) on the backend
    * automatic application of database changes on startup
    * automatic launch of my frontend processes on startup
    * mail delivery to a local folder locally for fast testing of real output on multiple clients
    * and probably more I'm forgetting

## Multiplayer Financial App

This is a multiplayer business and finance app. That means the core screens (the business model plan, task tracking, massive financial planning workbook) are all realtime updated using custom CRDTs. An end user jumping on a call with a teammate or advisor can work collaboratively while chatting, and the charts, dashboard, and other tabs will update in realtime.

The main components of each realtime collaborative page are:
1. A core data element: [ICashForecast](./frontend/src/pages/games/[id]/cashForecast/_types/cashForecast.ts) - _financial planning for one game_
2. An API interface: [cashForecastApi](./frontend/src/pages/games/[id]/cashForecast/_stores/cashForecastApi.ts) - _standard 4 API calls powering the generic store: get (snapshot), getSince (events), update (event), getActorSeqNo (special)_
3. Two Stores: 
    * [cashForecastStore](./frontend/src/pages/games/[id]/cashForecast/_stores/cashForecastStore.ts): _definitive store of events and map of user events to CRDT operation sets_
    * `cashForecastLocalStore`: _a [local store](./frontend/src/pages/_stores/eventStore/localStore.ts) that projects remote and pending local events to display the current state_
4. A page: [/games/id/cashForecast](./frontend/src/pages/games/[id]/cashForecast/index.svelte) 

Here's how it all works _(the tests [here](./frontend/src/pages/_stores/eventStore/__tests__/) may be valuable)_

1. `Index.svelte` initializes the data store: [eventStore.initialize](./frontend/src/pages/_stores/eventStore/eventStore.ts)
    * _Initialization requests the latest `seqNo` already used by this user's `actorId` so it can produce event versions autonomously without repeating past used values_
2. Loads a snapshot of the latest state, via `eventstore.loadFullState` and `cashForecastApi`
3. And subscribes to changes on the store:
    * When the underlying store changes, it is fed to the [the forecast store](./frontend/src/pages/games/[id]/cashForecast/_stores/projectedCashForecasetStore.ts) which [calculates an updated forecast](./frontend/src/pages/games/[id]/cashForecast/_stores/calculator/calculator.ts)

At this point, the screen is fully loaded and waiting for the user to make changes OR updates to come in from a filtered `<WebSocketChannel>` (a custom component wrapped around SignalR channels).

1. Changes from the user are mapped to pre-built events versioned via the `actorId` and `seqNo`, then added to an updated `pendingEvents` store property
2. Two things happen from `pendingEvents`:
    1. The events are queued to send to the server
    2. The `localStore` receives the updated `pendingEvents` and projects a fresh final state

The service is self-healing. If the server send fails, the pending events continue to queue and retry and the user can continue working.

As the server receives updates, it mildly breaks the CRDT pattern, borrowing from OT to apply a single version number to each event to simplify conflict management based on order of reception by the server. It then sends up updates view SignalR/WebSockets to every subscribed browser.

1. New events come in through the custom [WebSocketChannel](./frontend/src/pages/_communications/WebSocketChannel.svelte)
2. The page uses `receiveEvent` in the `cashForecastEventStore` to process incoming events:
    * Mismatched parent: ignore the change, it's from a stale subscription to another id
    * Matched actor: this came from me, I can ignore it it's in my store already
    * Older version than latest in store: I can ignore it, I have it already
    * More than 1 version newer: I missed some events, ignore this and call `loadSinceEvents` which uses the `cashForecastApi` to ask the server for all events newer than version X and then processes them
    * Finally, apply this event to my state and update the `state` and `pendingEvents` store properties

In this way, we are constantly projecting what the user expects to see, but also factoring in other edits streaming in from the server in an appropriate order, always applying versioned events and then un-versioned pending events.

Additionally, we're using immutable data properties to ensure we're only doing the math heavy financial projections when something actually changes.

## Math

The math for the cash forecast is particularly intense, modelling assets, expenses, taxes, revenue, plus complex waterfalls of loan pay back, revenue sharing, and more.

![Example of how customizeable the funding agreements can be to match realwork funding examples](https://www.tiernok.com/images/projects/launchready-igd/App-Publisher-Funding.png)

* [calculator.calculate](./frontend/src/pages/games/[id]/cashForecast/_stores/calculator/calculator.ts): the top-level driver of calculating the balance sheet and forecasting
* [calculator.test.ts](./frontend/src/pages/games/[id]/cashForecast/_stores/calculator/__tests__/calculator.test.ts): the first 3,400 lines of test code for the math

## Back-end Developer Experience

The backend is running .Net Core. This service was designed to deploy as a single web service, simplifying auth between the front-end and backend. However, Microsoft chose to change how front-end and back-end projects work together by default, to a model that favors separate deployment of the two.

Unlike most .Net apps, [on startup](./backend/GDB.App/Startup.cs) this app:
1. Automatically migrates your local development database
2. Automatically starts the Svelte front-end with npm

All traffic is sent to the back-end, which proxies those calls to the JS dev server when running locally so we get the benefit of live changes without rebuilding or refreshing.

## Backend Integration Tests

Mentioned earlier in the "Multiplayer" section, this backend has a number of API endpoints to serve the front-end. These are covered in integration tests that reference a secondary test database, allowing us to reset and add specific data to the database, call a method, then clean up, all without breaking data we have in our own local development db.

```csharp
[Test]
public async Task GetLatestSeqNoAsync_ValidActorAndUser_ReturnsLatestSeqNo()
{
    var user = _sampleUser;
    var actor = Database.Actors.Add("actor-1", user.Id, 123, DateTime.UtcNow);

    var result = await _controller.GetLatestSeqNoAsync(actor.Actor);

    result.Should().BeOfType<OkObjectResult>()
        .Which.Value.Should().BeOfType<LatestSeqNoModel>()
        .Which.SeqNo.Should().Be(123);
}
```
[Example test for the Actor endpoint](./backend/GDB.App.Tests/IntegrationTests/Controllers/Frontend/ActorControllerTests.cs)

Additionally, when these tests are run they automatically run the database migrations against the test database to ensure it's up to date.

_Note: this project does not use WebApplicationFactory, but [here's an example of ASP.Net integration testing via WebApplicationFactory](https://www.tiernok.com/posts/2021/mocking-oidc-logins-for-integration-tests) on my site_

## Database Migrations

The database migrations are designed to run in a roll-forward manner, and the CI/CD deployment runs in this manner:

1. Build and pre-deploy to a blue slot
2. Apply the database changes
3. Swap the blue slot into green

The migrations are intended to be run both automatically from our code in the Startup and Tests above (raising exceptions), but also as a command-line call during the CI/CD pipeline (outputting error codes), so there are two entry points that must operate the same.

* [Program.cs](./backend/GDB.Tools.DatabaseMigration/Program.cs) uses [DatabaseMigrator](./backend/GDB.Tools.DatabaseMigration/DatabaseMigrator.cs) for command line deploys
* [LocalDatabaseMigrator](./backend/GDB.Tools.DatabaseMigration/LocalDatabaseMigrator.cs) is used from inside the codebase for automatic migrations
