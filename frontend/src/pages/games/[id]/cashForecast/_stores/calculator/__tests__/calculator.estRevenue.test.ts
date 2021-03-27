import { createEmptyCashForecast } from "../../../../../../../testUtils/dataModel";
import { createEstRevPlatform, createEstRevShare } from "../../../../../../../testUtils/helpers";
import { getUtcDate } from "../../../../../../../utilities/date";
import { BasicDateOption } from "../../../_types/cashForecast";
import { calculate } from "../calculator";
import { getEmptyProjection, SubTotalType } from "../types";

const FIVE_YEARS_OF_ENTRIES = 12 * 5;
const revDelay = 1;

describe("estimated sales revenue", () => {
  // easy numbers:
  //  18mo of 180 means
  //  12mo of 132
  //  1st mo is 44
  //  following months are +8

  it("applies no estimated sales revenue if no platforms added", () => {
    const initial = getEmptyProjection();
    const forecast = createEmptyCashForecast();
    forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
    forecast.launchDate.value = getUtcDate(2016, 5, 1);
    forecast.estimatedRevenue.targetPrice.value = 5.00;
    forecast.estimatedRevenue.targetUnitsSold.value = 180;

    const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

    // check some amounts in the range
    expect(initialProjection.GrossRevenue_SalesRevenue[12].amount).toBe(0);
    expect(initialProjection.GrossRevenue_SalesRevenue[13].amount).toBe(0);
    expect(initialProjection.GrossRevenue_SalesRevenue[14].amount).toBe(0);
  });

  it("applies estimated sales revenue (no platform fee) to the projection on launch date", () => {
    const initial = getEmptyProjection();
    const forecast = createEmptyCashForecast();
    forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
    forecast.launchDate.value = getUtcDate(2016, 5, 1);
    forecast.estimatedRevenue.targetPrice.value = 5.00;
    forecast.estimatedRevenue.targetUnitsSold.value = 180;
    const platform = createEstRevPlatform(forecast.estimatedRevenue.platforms, BasicDateOption.Launch, getUtcDate(2016, 5, 1), 1.0);
    platform.revenueShares.list.push(
      createEstRevShare(platform, 0.0, 0)
    );
    forecast.estimatedRevenue.platforms.list.push(platform);

    const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

    const detail = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
      .get(platform.globalId);
    let rollingSum = 0;

    [0, 44 * 5.00, 8 * 5.00, 8 * 5.00].forEach((amt, i) => {
      rollingSum += amt;
      expect(detail[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_SalesRevenue[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_RevenueAfterPlatform[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_RevenueAfterDistribution[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_RevenueAfterPublisher[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossProfit[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.NetProfit[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.EndingCash[11 + revDelay + i].amount).toBeCloseTo(rollingSum);
      expect(initialProjection.BeginningCash[11 + revDelay + i + 1].amount).toBeCloseTo(rollingSum);
    });
  });

  it("applies estimated sales revenue (no platform fee) to the projection on specified date", () => {
    const initial = getEmptyProjection();
    const forecast = createEmptyCashForecast();
    forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
    forecast.launchDate.value = getUtcDate(2016, 5, 1);
    forecast.estimatedRevenue.targetPrice.value = 5.00;
    forecast.estimatedRevenue.targetUnitsSold.value = 180;
    const platform = createEstRevPlatform(forecast.estimatedRevenue.platforms, BasicDateOption.Date, getUtcDate(2016, 6, 1), 1.0);
    platform.revenueShares.list.push(
      createEstRevShare(platform, 0.0, 0)
    );
    forecast.estimatedRevenue.platforms.list.push(platform);

    const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

    const detail = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
      .get(platform.globalId);
    let rollingSum = 0;

    [0, 0, 8 * 5.00, 8 * 5.00].forEach((amt, i) => {
      rollingSum += amt;
      expect(detail[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_SalesRevenue[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_RevenueAfterPlatform[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_RevenueAfterDistribution[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_RevenueAfterPublisher[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossProfit[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.NetProfit[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.EndingCash[11 + revDelay + i].amount).toBeCloseTo(rollingSum);
      expect(initialProjection.BeginningCash[11 + revDelay + i + 1].amount).toBeCloseTo(rollingSum);
    });
  });

  it("removes estimated sales revenue from the projection when 0'd", () => {
    const initial = getEmptyProjection();
    const forecast = createEmptyCashForecast();
    forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
    forecast.launchDate.value = getUtcDate(2016, 5, 1);
    forecast.estimatedRevenue.targetPrice.value = 5.00;
    forecast.estimatedRevenue.targetUnitsSold.value = 180;
    const platform = createEstRevPlatform(forecast.estimatedRevenue.platforms, BasicDateOption.Launch, getUtcDate(2016, 5, 1), 1.0);
    platform.revenueShares.list.push(
      createEstRevShare(platform, 0.0, 0)
    );
    forecast.estimatedRevenue.platforms.list.push(platform);

    const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
    forecast.estimatedRevenue.targetUnitsSold.value = 0;
    const nextProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

    const expectedAmount = 44 * 5.00; // 1st month
    const detail = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
      .get(platform.globalId);
    expect(detail[12 + revDelay].amount).toBeCloseTo(44 * 5.00);
    expect(initialProjection.GrossRevenue_SalesRevenue[12 + revDelay].amount).toBeCloseTo(expectedAmount);
    const nextDetail = nextProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
      .get(platform.globalId);
    expect(nextDetail[12 + revDelay].amount).toBeCloseTo(0);
    expect(nextProjection.GrossRevenue_SalesRevenue[12 + revDelay].amount).toBeCloseTo(0);
  });

  it("removes estimated sales revenue from the projection when platform removed", () => {
    const initial = getEmptyProjection();
    const forecast = createEmptyCashForecast();
    forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
    forecast.launchDate.value = getUtcDate(2016, 5, 1);
    forecast.estimatedRevenue.targetPrice.value = 5.00;
    forecast.estimatedRevenue.targetUnitsSold.value = 180;
    const platform = createEstRevPlatform(forecast.estimatedRevenue.platforms, BasicDateOption.Launch, getUtcDate(2016, 5, 1), 1.0);
    platform.revenueShares.list.push(
      createEstRevShare(platform, 0.0, 0)
    );
    forecast.estimatedRevenue.platforms.list.push(platform);

    const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
    forecast.estimatedRevenue.platforms.list.pop();
    const nextProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

    const expectedAmount = 44 * 5.00; // 1st month
    const detail = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
      .get(platform.globalId);
    expect(detail[12 + revDelay].amount).toBeCloseTo(44 * 5.00);
    expect(initialProjection.GrossRevenue_SalesRevenue[12 + revDelay].amount).toBeCloseTo(expectedAmount);
    const nextDetail = nextProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
      .get(platform.globalId);
    expect(nextDetail).toBeUndefined();
    expect(nextProjection.GrossRevenue_SalesRevenue[12 + revDelay].amount).toBeCloseTo(0);
  });

  it("applies a single platform rev share correctly", () => {
    const initial = getEmptyProjection();
    const forecast = createEmptyCashForecast();
    forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
    forecast.launchDate.value = getUtcDate(2016, 5, 1);
    forecast.estimatedRevenue.targetPrice.value = 5.00;
    forecast.estimatedRevenue.targetUnitsSold.value = 180;
    const platform = createEstRevPlatform(forecast.estimatedRevenue.platforms, BasicDateOption.Launch, getUtcDate(2016, 5, 1), 1.0);
    platform.revenueShares.list.push(
      createEstRevShare(platform, 0.30, 0)
    );
    forecast.estimatedRevenue.platforms.list.push(platform);

    const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

    const detail = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
      .get(platform.globalId);
    let rollingSum = 0;

    [0, 44 * 5.00, 8 * 5.00, 8 * 5.00].forEach((amt, i) => {
      const expectedAmtAfterPlatform = amt * (1 - 0.30);
      rollingSum += expectedAmtAfterPlatform;
      expect(detail[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_SalesRevenue[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_RevenueAfterPlatform[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossRevenue_RevenueAfterDistribution[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossRevenue_RevenueAfterPublisher[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossRevenue[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossProfit[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.NetProfit[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.EndingCash[11 + revDelay + i].amount).toBeCloseTo(rollingSum);
      expect(initialProjection.BeginningCash[11 + revDelay + i + 1].amount).toBeCloseTo(rollingSum);
    });
  });

  it("applies a dual platform rev share proportionally (even if the percents don't add up to 100)", () => {
    const initial = getEmptyProjection();
    const forecast = createEmptyCashForecast();
    forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
    forecast.launchDate.value = getUtcDate(2016, 5, 1);
    forecast.estimatedRevenue.targetPrice.value = 5.00;
    forecast.estimatedRevenue.targetUnitsSold.value = 180;
    [0.30, 0.25].forEach(percent => {
      const platform = createEstRevPlatform(forecast.estimatedRevenue.platforms, BasicDateOption.Launch, getUtcDate(2016, 5, 1), 1.0);
      platform.revenueShares.list.push(createEstRevShare(platform, percent, 0));
      forecast.estimatedRevenue.platforms.list.push(platform);
    });

    const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

    const detail = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
      .get(forecast.estimatedRevenue.platforms.list[0].globalId);
    let rollingSum = 0;

    [0, 44 * 5.00, 8 * 5.00, 8 * 5.00].forEach((amt, i) => {
      const expectedAmtAfterPlatform = amt * (1 - 0.30 / 2 - 0.25 / 2);
      rollingSum += expectedAmtAfterPlatform;
      expect(detail[11 + revDelay + i].amount).toBeCloseTo(amt / 2);
      expect(initialProjection.GrossRevenue_SalesRevenue[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_RevenueAfterPlatform[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossRevenue_RevenueAfterDistribution[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossRevenue_RevenueAfterPublisher[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossRevenue[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossProfit[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.NetProfit[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.EndingCash[11 + revDelay + i].amount).toBeCloseTo(rollingSum);
      expect(initialProjection.BeginningCash[11 + revDelay + i + 1].amount).toBeCloseTo(rollingSum);
    });

  });

  it("applies platform rev share only for the active platform when there are staggered start dates", () => {
    const initial = getEmptyProjection();
    const forecast = createEmptyCashForecast();
    forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
    forecast.launchDate.value = getUtcDate(2016, 5, 1);
    forecast.estimatedRevenue.targetPrice.value = 5.00;
    forecast.estimatedRevenue.targetUnitsSold.value = 180;
    [0.30, 0.25].forEach((percent, i) => {
      const platform = createEstRevPlatform(forecast.estimatedRevenue.platforms, BasicDateOption.Date, getUtcDate(2016 + i, 5, 1), 1.0);
      platform.revenueShares.list.push(createEstRevShare(platform, percent, 0));
      forecast.estimatedRevenue.platforms.list.push(platform);
    });

    const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

    const detail = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
      .get(forecast.estimatedRevenue.platforms.list[0].globalId);
    let rollingSum = 0;

    // 1st year - 1st platform
    [0, 44 * 5.00, 8 * 5.00, 8 * 5.00].forEach((amt, i) => {
      const expectedAmtAfterPlatform = amt * (1 - 0.30);
      rollingSum += expectedAmtAfterPlatform;
      expect(detail[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_SalesRevenue[11 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_RevenueAfterPlatform[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossRevenue_RevenueAfterDistribution[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossRevenue_RevenueAfterPublisher[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossRevenue[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossProfit[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.NetProfit[11 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.EndingCash[11 + revDelay + i].amount).toBeCloseTo(rollingSum);
      expect(initialProjection.BeginningCash[11 + revDelay + i + 1].amount).toBeCloseTo(rollingSum);
    });
    // 2nd year - 2 platforms
    [8 * 5.00, 8 * 5.00, 8 * 5.00].forEach((amt, i) => {
      const expectedAmtAfterPlatform = amt * (1 - 0.30 / 2 - 0.25 / 2);
      expect(detail[24 + revDelay + i].amount).toBeCloseTo(amt / 2);
      expect(initialProjection.GrossRevenue_SalesRevenue[24 + revDelay + i].amount).toBeCloseTo(amt);
      expect(initialProjection.GrossRevenue_RevenueAfterPlatform[24 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossRevenue_RevenueAfterDistribution[24 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
      expect(initialProjection.GrossRevenue_RevenueAfterPublisher[24 + revDelay + i].amount).toBeCloseTo(expectedAmtAfterPlatform);
    });
  });

  it("applies platform rev share tiers correctly", () => {
    const initial = getEmptyProjection();
    const forecast = createEmptyCashForecast();
    forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
    forecast.launchDate.value = getUtcDate(2016, 5, 1);
    forecast.estimatedRevenue.targetPrice.value = 5.00;
    forecast.estimatedRevenue.targetUnitsSold.value = 180;
    const platform = createEstRevPlatform(forecast.estimatedRevenue.platforms, BasicDateOption.Date, getUtcDate(2016, 5, 1), 1.0);
    platform.revenueShares.list.push(createEstRevShare(platform, 0.30, 30));  // ensure it consumes $100
    platform.revenueShares.list.push(createEstRevShare(platform, 0.25, 30 + 25));  // ensure it consumes $100
    platform.revenueShares.list.push(createEstRevShare(platform, 0.20, 0));
    forecast.estimatedRevenue.platforms.list.push(platform);

    const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

    const detail = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
      .get(forecast.estimatedRevenue.platforms.list[0].globalId);

    // 1st year numbers:
    // 1st: 44 * 5.00;
    // each Month: 8 * 5.00;
    for (let i = 0; i < 12; i++) {
      const amount = (i == 0 ? 44 : 8) * 5.00;
      expect(detail[12 + revDelay + i].amount).toBeCloseTo(amount);
      expect(initialProjection.GrossRevenue_SalesRevenue[12 + revDelay + i].amount).toBeCloseTo(amount);
      if (i == 0) {
        // 220 in month 0 - some to each bucket
        const expPlatform = 100 * 0.30 + 100 * 0.25 + 20 * 0.20;
        expect(initialProjection.GrossRevenue_RevenueAfterPlatform[12 + revDelay + i].amount).toBeCloseTo(amount - expPlatform);
      }
      else {
        // all last bucket for later months
        const expPlatform = amount * 0.20;
        expect(initialProjection.GrossRevenue_RevenueAfterPlatform[12 + revDelay + i].amount).toBeCloseTo(amount - expPlatform);
      }
    }

  });

});

