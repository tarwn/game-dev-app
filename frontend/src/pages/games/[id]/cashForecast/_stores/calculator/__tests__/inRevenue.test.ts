import { EstimatedSalesCurve } from "../../../_types/cashForecast";
import { calculateEstimatedSalesRevenue } from "../inRevenue";

describe("estimated sales revenue", () => {
  it("calculates an evenly rounded value", () => {
    const price = 5.00;
    const units18mo = 100.0;
    const monthAfterLaunch = 0;

    const result = calculateEstimatedSalesRevenue(price, units18mo, monthAfterLaunch, EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x);

    expect(result % price).toBeCloseTo(0);
  });

  it("calculates an evenly rounded value", () => {
    const price = 5.00;
    const units18mo = 100.0;
    const monthAfterLaunch = 0;

    const result = calculateEstimatedSalesRevenue(price, units18mo, monthAfterLaunch, EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x);

    expect(result % price).toBeCloseTo(0);
  });

  describe("FirstWeekToFirstYearRatioOf3x", () => {
    // easy numbers:
    //  18 mo of 180
    //  12 mo of 132
    //  1st mo => 44
    //  next mo's => 8
    test.each([
      [180, 0, 44],
      [180, 1, 8],
      [180, 11, 8],
      [180, 15, 8],
      [180, 30, 8],
    ])("calculates % of 18mo %d for month %d as %d", (target: number, month: number, expected: number) => {
      const result = calculateEstimatedSalesRevenue(1.00, target, month, EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x);

      expect(result).toBe(expected);
    });

    // for rounding testing - test cases created in excel
    //  18 mo of 155
    //  12 mo of 113.366
    //  1st mo => 37.888
    //  next mo's => 6.8888
    // floor the current month's count minus the last months count
    const testval = (month) => Math.floor(37.888 + month * 6.888 - Math.floor(37.888 + (month - 1) * 6.888));
    test.each([
      [155, 0, 37],
      [155, 1, testval(1)],
      [155, 11, testval(11)]
    ])("calculates % of 18mo %d for month %d as %d", (target: number, month: number, expected: number) => {
      const result = calculateEstimatedSalesRevenue(1.00, target, month, EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x);

      expect(result).toBe(expected);
    });
  });
});
