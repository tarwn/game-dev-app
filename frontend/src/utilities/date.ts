

export const getUtcDate = (year: number, month: number, date: number): Date => {
  return new Date(Date.UTC(year, month, date));
};

export const getUtcToday = (): Date => {
  const today = new Date();
  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
};
