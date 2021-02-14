import { createEmptyCashForecast } from "../../../../../../testUtils/dataModel";
import { getUtcDate } from "../../../../../../utilities/date";
import { cashForecastEventStore } from "../cashForecastStore";
import { calculate, getEmptyProjection, SubTotalType, ICashValue } from "../projectedCashForecastCalculator";

const FIVE_YEARS_OF_ENTRIES = 12 * 5;

const subTotalTypesParams = Object.keys(SubTotalType)
  .filter(lt => isNaN(Number(lt)))
  .map(lt => [lt, SubTotalType[lt]]);

describe("calculate", () => {
  test.each(subTotalTypesParams)('calculates 5 years of zeroes for %s', (s) => {
    const initial = getEmptyProjection();
    const forecast = createEmptyCashForecast();
    forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);

    const newProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

    const subtotal = newProjection[s] as Array<ICashValue>;
    expect(subtotal).not.toBeUndefined();
    expect(subtotal.length).toBe(FIVE_YEARS_OF_ENTRIES);
    subtotal.forEach((cv) => {
      expect(cv.amount).toBe(0);
    });
  });

  describe("bank balance", () => {
    it("incorporates starting bank balance on correct date", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.bankBalance.date.value = getUtcDate(2017, 5, 1);
      forecast.bankBalance.amount.value = 1234.56;

      const newProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      // bank balance injection subtotal
      const bankBalance = newProjection.BeginningCash_Balances;
      expect(bankBalance).not.toBeUndefined();
      expect(bankBalance.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(bankBalance[0].amount).toBe(0);
      expect(bankBalance[23].amount).toBe(0);
      expect(bankBalance[24].amount).toBe(1234.56);
      expect(bankBalance[25].amount).toBe(0);
      // beginning cash subtotal
      const subtotal = newProjection.BeginningCash;
      expect(subtotal).not.toBeUndefined();
      expect(subtotal.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(subtotal[0].amount).toBe(0);
      expect(subtotal[23].amount).toBe(0);
      expect(subtotal[24].amount).toBe(1234.56);
      // end balance has to be working from here
      expect(subtotal[25].amount).toBe(1234.56);
      expect(subtotal[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
      // details are present too
      const details = newProjection.details.get(SubTotalType.BeginningCash_Balances);
      expect(details.size).toBe(1);
      expect(Array.from(details.keys())).toEqual([forecast.bankBalance.globalId]);
      expect(details.get(forecast.bankBalance.globalId).length).toBe(60);
    });

    it("updating bank balance 2nd time propagates without altering initial immutable projection", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      // first pass
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.bankBalance.date.value = getUtcDate(2017, 5, 1);
      forecast.bankBalance.amount.value = 1234.56;
      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
      // second pass
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.bankBalance.date.value = getUtcDate(2017, 5, 1);
      forecast.bankBalance.amount.value = 0;
      const secondProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      //= bank balance injection subtotal
      const bankBalance1 = initialProjection.BeginningCash_Balances;
      expect(bankBalance1[24].amount).toBe(1234.56);
      // beginning cash subtotal
      const subtotal1 = initialProjection.BeginningCash;
      expect(subtotal1[24].amount).toBe(1234.56);
      expect(subtotal1[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
      // details are present too
      const details1 = initialProjection.details.get(SubTotalType.BeginningCash_Balances);
      expect(details1.size).toBe(1);
      expect(Array.from(details1.keys())).toEqual([forecast.bankBalance.globalId]);
      expect(details1.get(forecast.bankBalance.globalId).length).toBe(60);
      //= second
      const bankBalance2 = secondProjection.BeginningCash_Balances;
      expect(bankBalance2[24].amount).toBe(0);
      // beginning cash subtotal
      const subtotal2 = secondProjection.BeginningCash;
      expect(subtotal2[24].amount).toBe(0);
      expect(subtotal2[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(0);
      // details are present too
      const details2 = secondProjection.details.get(SubTotalType.BeginningCash_Balances);
      expect(details2.size).toBe(1);
      expect(Array.from(details2.keys())).toEqual([forecast.bankBalance.globalId]);
      expect(details2.get(forecast.bankBalance.globalId).length).toBe(60);
    });
  });
});
