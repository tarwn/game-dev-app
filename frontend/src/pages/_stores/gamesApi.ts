import { log } from "../../utilities/logger";
import { jsonOrThrow } from "../_communications/responseHandler";
import type { GameStatus } from "./types";

export type Game = {
  globalId: string;
  isFavorite: boolean;
  isArchived: boolean;
  name: string;
  status: GameStatus;
  lastUpdated: Date;
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
    lastUpdated: data.updatedOn != null ? new Date(data.updatedOn) : new Date(data.createdOn),
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
  }
};
