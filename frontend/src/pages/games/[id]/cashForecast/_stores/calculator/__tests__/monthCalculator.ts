import { getUtcDate } from "../../../../../../../utilities/date";
import { calculateMonthCount } from "../monthCalculator";

describe("monthCalculator", () => {
  describe("calculateMonthCount", () => {
    it("returns 0 if the start date is past the end date", () => {
      const result = calculateMonthCount(getUtcDate(2021, 6, 1), getUtcDate(2021, 5, 1));
      expect(result).toBe(0);
    });

    it("returns 0 if the start date is past the end date in the same month, even if full month count i son", () => {
      const result = calculateMonthCount(getUtcDate(2021, 5, 15), getUtcDate(2021, 5, 1), true);
      expect(result).toBe(0);
    });

    it("returns 0 if the start date and end date are in the same month", () => {
      const result = calculateMonthCount(getUtcDate(2021, 5, 1), getUtcDate(2021, 5, 15));
      expect(result).toBe(0);
    });


    it("returns 1 if the start date and end date are in the same month and we specify full final month", () => {
      const result = calculateMonthCount(getUtcDate(2021, 5, 1), getUtcDate(2021, 5, 15), true);
      expect(result).toBe(1);
    });

    it("calculates the month difference if the dates are in the same year", () => {
      const result = calculateMonthCount(getUtcDate(2021, 5, 1), getUtcDate(2021, 6, 1));
      expect(result).toBe(1);
    });

    it("calculates the month difference plus 1 if the dates are in the same year and we include the full next month", () => {
      const result = calculateMonthCount(getUtcDate(2021, 5, 1), getUtcDate(2021, 6, 1), true);
      expect(result).toBe(1 + 1);
    });

    it("calculates the difference for the same month in 2 years", () => {
      const result = calculateMonthCount(getUtcDate(2021, 5, 1), getUtcDate(2022, 5, 1));
      expect(result).toBe(12);
    });

    it("calculates the difference for the same month in 2 years, and includes the full final month if asked", () => {
      const result = calculateMonthCount(getUtcDate(2021, 5, 1), getUtcDate(2022, 5, 1), true);
      expect(result).toBe(12 + 1);
    });

    it("calculates the difference if spanning years but fewer than 12 months", () => {
      const result = calculateMonthCount(getUtcDate(2021, 10, 1), getUtcDate(2022, 2, 1));
      expect(result).toBe(4);
    });

    it("calculates the difference if spanning years but fewer than 12 months, and includes the full final month if asked", () => {
      const result = calculateMonthCount(getUtcDate(2021, 10, 1), getUtcDate(2022, 2, 1), true);
      expect(result).toBe(4 + 1);
    });

    it("calculates the first month as a full month even if the date is the last day of the month", () => {
      const result = calculateMonthCount(getUtcDate(2021, 10, 30), getUtcDate(2021, 11, 1));
      expect(result).toBe(1);
    });

    it("does not include the 2nd month if not specified to count as full, even if it is the last day of the month", () => {
      const result = calculateMonthCount(getUtcDate(2021, 10, 30), getUtcDate(2021, 11, 31));
      expect(result).toBe(1);
    });

  });
});
