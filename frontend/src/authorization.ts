import { getConfig, StudioUserRole } from "./config";


export const isUserSessionAdmin = (): boolean => {
  return getConfig().studioUserRole == StudioUserRole.Administrator;
};

export class AuthorizationError extends Error {
  public isAuthorizationError: true;

  constructor(message: string) {
    super(message);
  }
}
