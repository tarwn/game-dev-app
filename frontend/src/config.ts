export interface config {
  environment: string,
  version: string,
  sessionId: string,
  actorId: string;
  userId: number;
  sentry: {
    dsn: string;
    enabled: boolean;
  }
}

export const getConfig = (): config => {
  return (window as any).config as config;
};
