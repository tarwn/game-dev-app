export interface config {
  environment: string,
  version: string,
  sessionId: string,
  sentry: {
    dsn: string;
  }
}

export const getConfig = (): config => {
  return (window as any).config as config;
};