export interface config {
  environment: string,
  version: string,
  sessionId: string,
  actorId: string;
  userId: number;
  studioUserRole: StudioUserRole;
  sentry: {
    dsn: string;
    enabled: boolean;
  }
}

export const getConfig = (): config => {
  return (window as any).config as config;
};

export enum StudioUserRole {
  Administrator = 1,
  User = 2
}
