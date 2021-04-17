import { log } from "../../utilities/logger";
import { jsonOrThrow, throwFor401 } from "../_communications/responseHandler";

export type UserProfile = {
  id: number;
  displayName: string;
  hasSeenPopup: number;
}

export enum AutomaticPopup {
  None = 0,
  GameDashboard = 1,
  BusinessModel = 2,
  CashForecast = 4
}

function extractUserProfile(data: any): UserProfile {
  return {
    id: data.id,
    displayName: data.displayName,
    hasSeenPopup: data.hasSeenPopup
  };
}

export const profileApi = {
  get: (): Promise<UserProfile> => {
    log("ProfileAPI.get(): started", {});
    return fetch(`/api/fe/userProfile`)
      .then(jsonOrThrow)
      .then((data: any) => {
        log("ProfileAPI.get():JSON data received", {});
        return extractUserProfile(data);
      });
  },
  update: (profile: UserProfile): Promise<void> => {
    log("ProfileAPI.update(): started", {});
    return fetch(`/api/fe/userProfile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(profile)
    }).then(throwFor401)
      .then(() => {
        log("ProfileAPI.update():complete", {});
      });
  }
};
