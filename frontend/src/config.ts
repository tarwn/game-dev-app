export interface config {
  sentry: {
    dsn: string;
  }
}

export const getConfig = (): config => {
  return (window as any).config as config;
};
