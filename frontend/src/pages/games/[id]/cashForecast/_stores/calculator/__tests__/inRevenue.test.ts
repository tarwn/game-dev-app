import { EstimatedRevenueDelay, EstimatedSalesCurve } from "../../../_types/cashForecast";
import { calculateEstimatedSalesRevenue } from "../inRevenue";

describe("estimated sales revenue", () => {
  it("calculates an evenly rounded value", () => {
    const price = 5.00;
    const units18mo = 100.0;
    const monthAfterLaunch = 0;

    const result = calculateEstimatedSalesRevenue(
      price,
      units18mo,
      monthAfterLaunch,
      EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x,
      EstimatedRevenueDelay.None
    );

    expect(result % price).toBeCloseTo(0);
  });

  it("calculates an evenly rounded value", () => {
    const price = 5.00;
    const units18mo = 100.0;
    const monthAfterLaunch = 0;

    const result = calculateEstimatedSalesRevenue(
      price,
      units18mo,
      monthAfterLaunch,
      EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x,
      EstimatedRevenueDelay.None
    );

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
      const result = calculateEstimatedSalesRevenue(
        1.00,
        target,
        month,
        EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x,
        EstimatedRevenueDelay.None
      );

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
      const result = calculateEstimatedSalesRevenue(
        1.00,
        target,
        month,
        EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x,
        EstimatedRevenueDelay.None
      );

      expect(result).toBe(expected);
    });
  });

  describe("Revenue inflow delay", () => {

    // magic numbers for 180 18mo est
    // 1st year numbers:
    // 1st: 44 * 5.00;
    // each Month: 8 * 5.00;
    const units18mo = 180.0;
    const price = 5.00;
    const launchMonthAmount = 44 * price;
    const followMonthAmount = 8 * price;

    it("calculates launch month revenue in as launch month estimated revenue", () => {
      const monthAfterLaunch = 0;

      const result = calculateEstimatedSalesRevenue(
        price,
        units18mo,
        monthAfterLaunch,
        EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x,
        EstimatedRevenueDelay.None
      );

      expect(result).toBeCloseTo(launchMonthAmount);
    });

    it("calculates launch month + 1 revenue in as launch month + 1 estimated revenue", () => {
      const monthAfterLaunch = 1;

      const result = calculateEstimatedSalesRevenue(
        price,
        units18mo,
        monthAfterLaunch,
        EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x,
        EstimatedRevenueDelay.None
      );

      expect(result).toBeCloseTo(followMonthAmount);
    });

    it("calculates launch month revenue in as no estimated sales revenue", () => {
      const monthAfterLaunch = 0;

      const result = calculateEstimatedSalesRevenue(
        price,
        units18mo,
        monthAfterLaunch,
        EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x,
        EstimatedRevenueDelay.NextMonth
      );

      expect(result).toBeCloseTo(0);
    });

    it("calculates launch month + 1 revenue in as launch month estimated revenue", () => {
      const monthAfterLaunch = 1;

      const result = calculateEstimatedSalesRevenue(
        price,
        units18mo,
        monthAfterLaunch,
        EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x,
        EstimatedRevenueDelay.NextMonth
      );

      expect(result).toBeCloseTo(launchMonthAmount);
    });

    it("calculates launch month + 2 revenue in as launch month + 1 estimated revenue", () => {
      const monthAfterLaunch = 2;

      const result = calculateEstimatedSalesRevenue(
        price,
        units18mo,
        monthAfterLaunch,
        EstimatedSalesCurve.FirstWeekToFirstYearRatioOf3x,
        EstimatedRevenueDelay.NextMonth
      );

      expect(result).toBeCloseTo(followMonthAmount);
    });
  });
});
