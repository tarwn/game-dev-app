
export function calculateMonthCount(startDate: Date, endDate: Date, includeFullFinalMonth?: boolean): number {
  if (startDate >= endDate) {
    return 0;
  }

  if (endDate > startDate) {
    return (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12
      - startDate.getUTCMonth()
      + endDate.getUTCMonth()
      + (includeFullFinalMonth === true ? 1 : 0);
  }
}
