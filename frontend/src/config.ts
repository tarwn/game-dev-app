export interface config {
  environment: string,
  version: string,
  sessionId: string,
  isFullUser?: boolean,
  sentry: {
    dsn: string;
    enabled: boolean;
  }
}

export const getConfig = (): config => {
  return (window as any).config as config;
};
