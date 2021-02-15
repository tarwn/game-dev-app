const roundingFactor = Math.pow(10, 2);

export const roundCurrency = (value: number): number => {
  const result = Math.round(value * roundingFactor) / roundingFactor;
  if (result === 0) return 0;
  return result;
};
