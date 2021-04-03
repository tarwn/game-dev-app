import { log } from "../../utilities/logger";
import { jsonOrThrow } from "../_communications/responseHandler";

export type User = {
  id: number,
  userName: string,
  displayName: string,
  role: StudioRole,
  access: UserAccess,
  invitedBy: number | null,
  invitedOn: Date | null,
  inviteGoodThrough: Date | null,
}

export enum StudioRole {
  Administrator = 1,
  User = 2
}

export enum UserAccess {
  PendingActivation = 1,
  Active = 2,
  Revoked = 3
}

export const usersApi = {
  getAll: (): Promise<Array<User>> => {
    log("StudioAPI.get(): started", {});

    return fetch(`/api/fe/studio/users`)
      .then(jsonOrThrow)
      .then((data: Array<any>) => {
        return data.map(d => ({
          id: d.id,
          userName: d.userName,
          displayName: d.displayName,
          role: d.role,
          access: d.access,
          invitedBy: d.invitedBy,
          invitedOn: d.invitedOn == null ? new Date(d.invitedOn) : null,
          inviteGoodThrough: d.inviteGoodThrough == null ? new Date(d.inviteGoodThrough) : null
        })) as Array<User>;
      });
  }
};
