import { log } from "../../utilities/logger";
import { jsonOrThrow, throwFor401 } from "../_communications/responseHandler";
import type { GameStatus } from "./types";

export type Game = {
  globalId: string;
  isFavorite: boolean;
  isArchived: boolean;
  name: string;
  status: GameStatus;
  lastModified: Date;
  launchDate: Date | null;
  businessModelLastUpdatedOn: Date | null;
  cashForecastLastUpdatedOn: Date | null;
  comparablesLastUpdatedOn: Date | null;
  marketingPlanLastUpdatedOn: Date | null;
};

export type GameDetails = Game & {
  goalsDocUrl: string | null;
  goalsNotes: string | null;
  groundworkDocUrl: string | null;
  groundworkNotes: string | null;
};

function extractGame(data: any): Game {
  return {
    globalId: data.globalId,
    isFavorite: data.isFavorite,
    isArchived: data.isArchived,
    name: data.name,
    status: data.status,
    launchDate: data.launchDate != null ? new Date(data.launchDate) : null,
    lastModified: new Date(data.lastModified),
    businessModelLastUpdatedOn: data.businessModelLastUpdatedOn != null ? new Date(data.businessModelLastUpdatedOn) : null,
    cashForecastLastUpdatedOn: data.cashForecastLastUpdatedOn != null ? new Date(data.cashForecastLastUpdatedOn) : null,
    comparablesLastUpdatedOn: data.comparablesLastUpdatedOn != null ? new Date(data.comparablesLastUpdatedOn) : null,
    marketingPlanLastUpdatedOn: data.marketingPlanLastUpdatedOn != null ? new Date(data.marketingPlanLastUpdatedOn) : null
  };
}

function extractGameDetails(data: any): GameDetails {
  return {
    ...extractGame(data),
    goalsDocUrl: data.goalsDocUrl ?? null,
    goalsNotes: data.goalsNotes ?? null,
    groundworkDocUrl: data.groundworkDocUrl ?? null,
    groundworkNotes: data.groundworkNotes ?? null,
  };
}

export const gamesApi = {
  getGameById: (id: string): Promise<Game> => {
    log("GamesAPI.getGameById(): started", {});
    return fetch(`/api/fe/games/${id}`)
      .then(jsonOrThrow)
      .then((data: any) => {
        log("GamesAPI.getGameById():JSON data received", {});
        return extractGame(data);
      });
  },
  getGameDetailsById: (id: string): Promise<GameDetails> => {
    log("GamesAPI.getGameDetailsById(): started", {});
    return fetch(`/api/fe/games/${id}/details`)
      .then(jsonOrThrow)
      .then((data: any) => {
        log("GamesAPI.getGameDetailsById():JSON data received", {});
        return extractGameDetails(data);
      });
  },
  getGames: (): Promise<Array<Game>> => {
    log("GamesAPI.getGames(): started", {});
    return fetch(`/api/fe/games`)
      .then(jsonOrThrow)
      .then((data: any) => {
        log("GamesAPI.getGames():JSON data received", {});
        return data.map(d => extractGame(d));
      });
  },

  addNewGame: (): Promise<Game> => {
    log("GamesAPI.addNewGame(): started", {});
    return fetch(`/api/fe/games/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({})
    }).then(throwFor401)
      .then(jsonOrThrow)
      .then((data: any) => {
        log("GamesAPI.addNewGame():JSON data received", {});
        return extractGame(data);
      });
  },

  delete: (id: string): Promise<void> => {
    log("GamesAPI.deleteGame(): started", {});
    return fetch(`/api/fe/games/${id}`, {
      method: 'DELETE'
    }).then(throwFor401)
      .then(() => {
        log("GamesAPI.deleteGame():complete", {});
      });
  },

  updateFavorite: updateGame<boolean>("isFavorite"),
  updateName: updateGame<string>("name"),
  updateStatus: updateGame<GameStatus>("status"),
  updateLaunchDate: updateGame<Date>("launchDate"),
  updateGoalsDocUrl: updateDetails<string>("goalsDocUrl"),
  updateGoalsNotes: updateDetails<string>("goalsNotes"),
  updateGroundworkDocUrl: updateDetails<string>("groundworkDocUrl"),
  updateGroundworkNotes: updateDetails<string>("groundworkNotes"),
};


function updateGame<T>(fieldName: string) {
  return (id: string, value: T): Promise<void> => {
    log(`GamesAPI.update${fieldName[0].toLocaleUpperCase()}(): started`, {});
    return fetch(`/api/fe/games/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        id,
        [fieldName]: value
      })
    }).then(throwFor401)
      .then(() => {
        log(`GamesAPI.update${fieldName.toLocaleUpperCase()}(): complete`, {});
      });
  };
}

function updateDetails<T>(fieldName: string) {
  return (id: string, value: T): Promise<void> => {
    log(`GamesAPI.update${fieldName.toLocaleUpperCase()}(): started`, {});
    return fetch(`/api/fe/games/${id}/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        id,
        [fieldName]: value
      })
    }).then(throwFor401)
      .then(() => {
        log(`GamesAPI.update${fieldName.toLocaleUpperCase()}(): complete`, {});
      });
  };
}
