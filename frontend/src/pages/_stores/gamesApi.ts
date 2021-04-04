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

  updateFavorite: (id: string, isFavorite: boolean): Promise<void> => {
    log("GamesAPI.updateFavorite(): started", {});
    return fetch(`/api/fe/games/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        id,
        isFavorite
      })
    }).then(throwFor401)
      .then(() => {
        log("GamesAPI.updateFavorite():complete", {});
      });
  },
  updateName: (id: string, name: string): Promise<void> => {
    log("GamesAPI.updateName(): started", {});
    return fetch(`/api/fe/games/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        id,
        name
      })
    }).then(throwFor401)
      .then(() => {
        log("GamesAPI.updateName():complete", {});
      });
  },
  updateStatus: (id: string, status: GameStatus): Promise<void> => {
    log("GamesAPI.updateStatus(): started", {});
    return fetch(`/api/fe/games/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        id,
        status
      })
    }).then(throwFor401)
      .then(() => {
        log("GamesAPI.updateStatus():complete", {});
      });
  },
  updateLaunchDate: (id: string, launchDate: Date): Promise<void> => {
    log("GamesAPI.updateLaunchDate(): started", {});
    return fetch(`/api/fe/games/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        id,
        launchDate
      })
    }).then(throwFor401)
      .then(() => {
        log("GamesAPI.updateLaunchDate():complete", {});
      });
  }


};
