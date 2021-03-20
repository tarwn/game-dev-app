import { createEmptyCashForecast } from "../../../../../../../testUtils/dataModel";
import { getUtcDate } from "../../../../../../../utilities/date";
import { createIdentifiedPrimitive } from "../../../../../../_stores/eventStore/helpers";
import {
  AdditionalEmployeeExpenseFrequency,
  AdditionalEmployeeExpenseType,
  ContractorExpenseFrequency,
  ExpenseCategory,
  ExpenseFrequency,
  ExpenseUntil,
  FundingRepaymentType,
  NetIncomeCategory,
  RevenueModelType,
  SalesRevenueShareType,
  TaxSchedule
} from "../../../_types/cashForecast";
import { LoanRepaymentType, LoanType } from "../../../_types/cashForecast";
import { calculate } from "../calculator";
import { getEmptyProjection, ICashValue, SubTotalType } from "../types";
import {
  createContractor,
  createContractorPayment,
  createEmployee,
  createEmployeeAdditionalPay,
  createExpense,
  createFunding,
  createFundingRepaymentCashOut,
  createFundingRepaymentTerms,
  createLoan,
  createLoanCashIn,
  createLoanRepaymentCashOut,
  createLoanRepaymentTerms,
  createRevenue,
  createRevenueShare,
  createRevenueValue,
  createTax
} from "../../../../../../../testUtils/helpers";

const FIVE_YEARS_OF_ENTRIES = 12 * 5;

const subTotalTypesParams = Object.keys(SubTotalType)
  .filter(lt => isNaN(Number(lt)))
  .map(lt => [lt, SubTotalType[lt]]);

describe("calculate", () => {
  describe("initialization", () => {
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
  });

  describe("bank balance", () => {
    const initial = getEmptyProjection();
    const getForecast = (balanceDate: Date, amount: number) => {
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.bankBalance.date.value = balanceDate;
      forecast.bankBalance.amount.value = amount;
      return forecast;
    };

    it("incorporates starting bank balance on correct date", () => {
      const forecast = getForecast(getUtcDate(2017, 5, 1), 1234.56);

      const newProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      // details
      const detail = newProjection.details.get(SubTotalType.BeginningCash_Balances)
        .get(forecast.bankBalance.globalId);
      expect(detail.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(1234.56);
      expect(detail[25].amount).toBe(0);
      // beginning balances subtotal
      const bankBalance = newProjection.BeginningCash_Balances;
      expect(bankBalance).not.toBeUndefined();
      expect(bankBalance.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(bankBalance[23].amount).toBe(0);
      expect(bankBalance[24].amount).toBe(1234.56);
      expect(bankBalance[25].amount).toBe(0);
      // beginning cash subtotal
      const subtotal = newProjection.BeginningCash;
      expect(subtotal).not.toBeUndefined();
      expect(subtotal.length).toBe(FIVE_YEARS_OF_ENTRIES);
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
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

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

    it("increasing length of forecast expands length of projection", () => {
      const forecast = createEmptyCashForecast();
      // first pass
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.bankBalance.date.value = getUtcDate(2017, 5, 1);
      forecast.bankBalance.amount.value = 1234.56;
      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
      // second pass
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES + 12);

      {
        //= initial pass - 5 year
        expect(initialProjection.BeginningCash_Balances.length).toBe(FIVE_YEARS_OF_ENTRIES);
        expect(initialProjection.BeginningCash_Balances[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(0);
        // detail
        // beginning + ending cash subtotal
        expect(initialProjection.BeginningCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
        expect(initialProjection.BeginningCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
        expect(initialProjection.EndingCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
        expect(initialProjection.EndingCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
        // details are present too
        const details = initialProjection.details.get(SubTotalType.BeginningCash_Balances)
          .get(forecast.bankBalance.globalId);
        expect(details.length).toBe(FIVE_YEARS_OF_ENTRIES);
      }
      {
        //= second pass - 6 year
        const sixYears = 12 * 6;
        expect(secondProjection.BeginningCash_Balances.length).toBe(sixYears);
        expect(secondProjection.BeginningCash_Balances[sixYears - 1].amount).toBe(0);
        // detail
        // beginning + ending cash subtotal
        expect(secondProjection.BeginningCash.length).toBe(sixYears);
        expect(secondProjection.BeginningCash[sixYears - 1].amount).toBe(1234.56);
        expect(secondProjection.EndingCash.length).toBe(sixYears);
        expect(secondProjection.EndingCash[sixYears - 1].amount).toBe(1234.56);
        // details are present too
        const details = secondProjection.details.get(SubTotalType.BeginningCash_Balances)
          .get(forecast.bankBalance.globalId);
        expect(details.length).toBe(sixYears);
      }
    });

    it("reducing length of forecast truncates length of projection", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      // first pass
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.bankBalance.date.value = getUtcDate(2017, 5, 1);
      forecast.bankBalance.amount.value = 1234.56;
      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
      // second pass
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES - 12);

      {
        //= initial pass - 5 year
        expect(initialProjection.BeginningCash_Balances.length).toBe(FIVE_YEARS_OF_ENTRIES);
        expect(initialProjection.BeginningCash_Balances[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(0);
        // detail
        // beginning + ending cash subtotal
        expect(initialProjection.BeginningCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
        expect(initialProjection.BeginningCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
        expect(initialProjection.EndingCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
        expect(initialProjection.EndingCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
        // details are present too
        const details = initialProjection.details.get(SubTotalType.BeginningCash_Balances)
          .get(forecast.bankBalance.globalId);
        expect(details.length).toBe(FIVE_YEARS_OF_ENTRIES);
      }
      {
        //= second pass - 4 year
        const fourYears = 12 * 4;
        expect(secondProjection.BeginningCash_Balances.length).toBe(fourYears);
        expect(secondProjection.BeginningCash_Balances[fourYears - 1].amount).toBe(0);
        // detail
        // beginning + ending cash subtotal
        expect(secondProjection.BeginningCash.length).toBe(fourYears);
        expect(secondProjection.BeginningCash[fourYears - 1].amount).toBe(1234.56);
        expect(secondProjection.EndingCash.length).toBe(fourYears);
        expect(secondProjection.EndingCash[fourYears - 1].amount).toBe(1234.56);
        // details are present too
        const details = secondProjection.details.get(SubTotalType.BeginningCash_Balances)
          .get(forecast.bankBalance.globalId);
        expect(details.length).toBe(fourYears);
      }
    });
  });

  describe("loan - inflow", () => {
    it("adds one-time loan inflow on correct date to loan, subtotal, and total", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.loans.list.push({
        ...createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56)
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const { OtherCash_LoanIn, OtherCash } = initialProjection;
      const detail = initialProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(1234.56);
      expect(detail[25].amount).toBe(0);
      expect(OtherCash_LoanIn[24].amount).toBe(1234.56);
      expect(OtherCash_LoanIn[25].amount).toBe(0);
      expect(OtherCash[23].amount).toBe(0);
      expect(OtherCash[24].amount).toBe(1234.56);
      expect(OtherCash[25].amount).toBe(0);
    });

    it("adds monthly loan inflow on correct dates to loan, subtotal, and total", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.loans.list.push({
        ...createLoan(forecast.loans, LoanType.Monthly, getUtcDate(2017, 5, 1), 1234.56, 4)
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const { OtherCash_LoanIn, OtherCash } = initialProjection;
      const detail = initialProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      [0, 1234.56, 1234.56, 1234.56, 1234.56, 0].forEach((amt, i) => {
        expect(detail[23 + i].amount).toBe(amt);
        expect(OtherCash_LoanIn[23 + i].amount).toBe(amt);
        expect(OtherCash[23 + i].amount).toBe(amt);
      });
    });

    it("adds multiple loan inflow on correct dates to loan, subtotal, and total", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const loan = createLoan(forecast.loans, LoanType.Multiple, getUtcDate(2017, 5, 15), 1234.56);
      loan.cashIn.list.push(createLoanCashIn(loan.cashIn, getUtcDate(2017, 6, 1), 2234.56));
      loan.cashIn.list.push(createLoanCashIn(loan.cashIn, getUtcDate(2017, 8, 1), 3234.56));
      forecast.loans.list.push({
        ...loan
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const { OtherCash_LoanIn, OtherCash } = initialProjection;
      const detail = initialProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      [0, 1234.56, 2234.56, 0, 3234.56, 0].forEach((amt, i) => {
        expect(detail[23 + i].amount).toBe(amt);
        expect(OtherCash_LoanIn[23 + i].amount).toBe(amt);
        expect(OtherCash[23 + i].amount).toBe(amt);
      });
    });

    it("adds single loan inflow w/extraneous cashIns on correct date to loan, subtotal, and total", () => {
      // this is same as last test, but expect to only read first cashIn
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const loan = createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 15), 1234.56);
      loan.cashIn.list.push(createLoanCashIn(loan.cashIn, getUtcDate(2017, 6, 1), 2234.56));
      loan.cashIn.list.push(createLoanCashIn(loan.cashIn, getUtcDate(2017, 8, 1), 3234.56));
      forecast.loans.list.push({
        ...loan
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const { OtherCash_LoanIn, OtherCash } = initialProjection;
      const detail = initialProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      [0, 1234.56, 0, 0, 0, 0].forEach((amt, i) => {
        expect(detail[23 + i].amount).toBe(amt);
        expect(OtherCash_LoanIn[23 + i].amount).toBe(amt);
        expect(OtherCash[23 + i].amount).toBe(amt);
      });
    });

    it("adds monthly loan inflow w/extraneous cashIns on correct dates to loan, subtotal, and total", () => {
      // this is same as multime test, but expect values to be set only from first item
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const loan = createLoan(forecast.loans, LoanType.Monthly, getUtcDate(2017, 5, 15), 1234.56, 3);
      loan.cashIn.list.push(createLoanCashIn(loan.cashIn, getUtcDate(2017, 6, 1), 2234.56));
      loan.cashIn.list.push(createLoanCashIn(loan.cashIn, getUtcDate(2017, 8, 1), 3234.56));
      forecast.loans.list.push({
        ...loan
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const { OtherCash_LoanIn, OtherCash } = initialProjection;
      const detail = initialProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      [0, 1234.56, 1234.56, 1234.56, 0, 0].forEach((amt, i) => {
        expect(detail[23 + i].amount).toBe(amt);
        expect(OtherCash_LoanIn[23 + i].amount).toBe(amt);
        expect(OtherCash[23 + i].amount).toBe(amt);
      });
    });

    it("removes loan inflow when deleted from forecast", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.loans.list.push({
        ...createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56)
      });
      const loanGlobalId = forecast.loans.list[0].globalId;
      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      forecast.loans.list.pop();
      const finalProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

      // initialProjection is untouched
      {
        const { OtherCash_LoanIn, OtherCash } = initialProjection;
        const detail = initialProjection.details.get(SubTotalType.OtherCash_LoanIn)
          .get(loanGlobalId);
        expect(detail[24].amount).toBe(1234.56);
        expect(OtherCash_LoanIn[24].amount).toBe(1234.56);
        expect(OtherCash[24].amount).toBe(1234.56);
      }
      // final projection is 0'd
      {
        const { OtherCash_LoanIn, OtherCash } = finalProjection;
        expect(finalProjection.details.get(SubTotalType.OtherCash_LoanIn).size).toBe(0);
        expect(OtherCash_LoanIn[24].amount).toBe(0);
        expect(OtherCash[24].amount).toBe(0);
      }
    });

    it("adds loans not present in first projection to later ones", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      forecast.loans.list.push({
        ...createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56)
      });
      const finalProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

      // initialProjection is untouched
      {
        const { OtherCash_LoanIn, OtherCash } = initialProjection;
        expect(initialProjection.details.get(SubTotalType.OtherCash_LoanIn).size).toBe(0);
        expect(OtherCash_LoanIn[24].amount).toBe(0);
        expect(OtherCash[24].amount).toBe(0);
      }
      // final projection is 0'd
      {
        const { OtherCash_LoanIn, OtherCash } = finalProjection;
        const detail = finalProjection.details.get(SubTotalType.OtherCash_LoanIn)
          .get(forecast.loans.list[0].globalId);
        expect(detail[24].amount).toBe(1234.56);
        expect(OtherCash_LoanIn[24].amount).toBe(1234.56);
        expect(OtherCash[24].amount).toBe(1234.56);
      }
    });

    it("adds multiple loan inflows together", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.loans.list.push({
        ...createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 10), 1234.56)
      });
      forecast.loans.list.push({
        ...createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 15), 1000.04)
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail1 = initialProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      const detail2 = initialProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[1].globalId);
      expect(detail1[24].amount).toBe(1234.56);
      expect(detail2[24].amount).toBe(1000.04);
      expect(initialProjection.OtherCash_LoanIn[24].amount).toBe(1234.56 + 1000.04);
      expect(initialProjection.OtherCash[24].amount).toBe(1234.56 + 1000.04);
    });

    it("adds loan inflows into all subtotals to ending cash", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.loans.list.push({
        ...createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 10), 1234.56)
      });
      forecast.loans.list.push({
        ...createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 15), 1000.04)
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      expect(initialProjection.EndingCash[23].amount).toBe(0);
      expect(initialProjection.BeginningCash[24].amount).toBe(0);
      expect(initialProjection.OtherCash_LoanIn[24].amount).toBe(1234.56 + 1000.04);
      expect(initialProjection.OtherCash[24].amount).toBe(1234.56 + 1000.04);
      expect(initialProjection.EndingCash[24].amount).toBe(1234.56 + 1000.04);
      expect(initialProjection.BeginningCash[25].amount).toBe(1234.56 + 1000.04);
      expect(initialProjection.BeginningCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56 + 1000.04);
      expect(initialProjection.EndingCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56 + 1000.04);
    });

    it("increasing length of forecast extends projection", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.loans.list.push({
        ...createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 10), 1234.56)
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES + 12);

      const sixYears = FIVE_YEARS_OF_ENTRIES + 12;
      const initialDetail = initialProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      expect(initialDetail.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.OtherCash_LoanIn.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.BeginningCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.BeginningCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
      expect(initialProjection.EndingCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.EndingCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
      const secondDetail = secondProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      expect(secondDetail.length).toBe(sixYears);
      expect(secondProjection.OtherCash_LoanIn.length).toBe(sixYears);
      expect(secondProjection.BeginningCash.length).toBe(sixYears);
      expect(secondProjection.BeginningCash[sixYears - 1].amount).toBe(1234.56);
      expect(secondProjection.EndingCash.length).toBe(sixYears);
      expect(secondProjection.EndingCash[sixYears - 1].amount).toBe(1234.56);
    });

    it("decreasing length of forecast truncates projection", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.loans.list.push({
        ...createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 10), 1234.56)
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES - 12);

      const fourYears = FIVE_YEARS_OF_ENTRIES - 12;
      const initialDetail = initialProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      expect(initialDetail.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.OtherCash_LoanIn.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.BeginningCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.BeginningCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
      expect(initialProjection.EndingCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.EndingCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
      const secondDetail = secondProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      expect(secondDetail.length).toBe(fourYears);
      expect(secondProjection.OtherCash_LoanIn.length).toBe(fourYears);
      expect(secondProjection.BeginningCash.length).toBe(fourYears);
      expect(secondProjection.BeginningCash[fourYears - 1].amount).toBe(1234.56);
      expect(secondProjection.EndingCash.length).toBe(fourYears);
      expect(secondProjection.EndingCash[fourYears - 1].amount).toBe(1234.56);
    });
  });

  describe("loan - outflow", () => {
    it("adds one-time loan outflow on correct date to loan, subtotal, and total", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const loan = createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56);
      const repaymentTerms = createLoanRepaymentTerms(loan, LoanRepaymentType.OneTime, getUtcDate(2017, 8, 1), 2222.33);
      forecast.loans.list.push({
        ...loan,
        repaymentTerms
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const { OtherCash_LoanOut, OtherCash } = initialProjection;
      const detail = initialProjection.details.get(SubTotalType.OtherCash_LoanOut)
        .get(forecast.loans.list[0].globalId);
      expect(detail[26].amount).toBe(0);
      expect(detail[27].amount).toBe(-2222.33);
      expect(detail[28].amount).toBe(0);
      expect(OtherCash_LoanOut[27].amount).toBe(-2222.33);
      expect(OtherCash_LoanOut[28].amount).toBe(0);
      expect(OtherCash[26].amount).toBe(0);
      expect(OtherCash[27].amount).toBe(-2222.33);
      expect(OtherCash[28].amount).toBe(0);
    });

    it("adds monthly loan outflow on correct dates to loan, subtotal, and total", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const loan = createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56);
      const repaymentTerms = createLoanRepaymentTerms(loan, LoanRepaymentType.Monthly, getUtcDate(2017, 8, 15), 222.33, 3);
      forecast.loans.list.push({
        ...loan,
        repaymentTerms
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const { OtherCash_LoanOut, OtherCash } = initialProjection;
      const detail = initialProjection.details.get(SubTotalType.OtherCash_LoanOut)
        .get(forecast.loans.list[0].globalId);
      [0, -222.33, -222.33, -222.33, 0].forEach((amt, i) => {
        expect(detail[26 + i].amount).toBe(amt);
        expect(OtherCash_LoanOut[26 + i].amount).toBe(amt);
        expect(OtherCash[26 + i].amount).toBe(amt);
      });
    });

    it("adds one-time loan outflow w/ extraneous monthly detail on correct dates to loan, subtotal, and total", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const loan = createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56);
      const repaymentTerms = createLoanRepaymentTerms(loan, LoanRepaymentType.OneTime, getUtcDate(2017, 8, 15), 222.33, 3);
      forecast.loans.list.push({
        ...loan,
        repaymentTerms
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const { OtherCash_LoanOut, OtherCash } = initialProjection;
      const detail = initialProjection.details.get(SubTotalType.OtherCash_LoanOut)
        .get(forecast.loans.list[0].globalId);
      [0, -222.33, 0, 0, 0].forEach((amt, i) => {
        expect(detail[26 + i].amount).toBe(amt);
        expect(OtherCash_LoanOut[26 + i].amount).toBe(amt);
        expect(OtherCash[26 + i].amount).toBe(amt);
      });
    });

    it("adds multiple loan outflows on correct date to loan, subtotal, and total", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const loan = createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56);
      const repaymentTerms = createLoanRepaymentTerms(loan, LoanRepaymentType.OneTime, getUtcDate(2017, 8, 1), 2222.33);
      repaymentTerms.cashOut.list.push(
        createLoanRepaymentCashOut(repaymentTerms.cashOut, LoanRepaymentType.OneTime, getUtcDate(2017, 9, 1), 1000.07)
      );
      forecast.loans.list.push({
        ...loan,
        repaymentTerms
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const { OtherCash_LoanOut, OtherCash } = initialProjection;
      const detail = initialProjection.details.get(SubTotalType.OtherCash_LoanOut)
        .get(forecast.loans.list[0].globalId);
      expect(detail[26].amount).toBe(0);
      expect(detail[27].amount).toBe(-2222.33);
      expect(detail[28].amount).toBe(-1000.07);
      expect(detail[29].amount).toBe(0);
      expect(OtherCash_LoanOut[26].amount).toBe(0);
      expect(OtherCash_LoanOut[27].amount).toBe(-2222.33);
      expect(OtherCash_LoanOut[28].amount).toBe(-1000.07);
      expect(OtherCash_LoanOut[29].amount).toBe(0);
      expect(OtherCash[26].amount).toBe(0);
      expect(OtherCash[27].amount).toBe(-2222.33);
      expect(OtherCash[28].amount).toBe(-1000.07);
      expect(OtherCash[29].amount).toBe(0);
    });

    it("adds multiple loans w/ multiple outflows on correct date to loan, subtotal, and total", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const loan1 = createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56);
      const repaymentTerms1 = createLoanRepaymentTerms(loan1, LoanRepaymentType.OneTime, getUtcDate(2017, 8, 1), 2222.33);
      repaymentTerms1.cashOut.list.push(
        createLoanRepaymentCashOut(repaymentTerms1.cashOut, LoanRepaymentType.OneTime, getUtcDate(2017, 9, 1), 1000.07)
      );
      forecast.loans.list.push({
        ...loan1,
        repaymentTerms: repaymentTerms1
      });
      const loan2 = createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56);
      const repaymentTerms2 = createLoanRepaymentTerms(loan2, LoanRepaymentType.Monthly, getUtcDate(2017, 10, 1), 33.44, 2);
      forecast.loans.list.push({
        ...loan2,
        repaymentTerms: repaymentTerms2
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const { OtherCash_LoanOut, OtherCash } = initialProjection;
      const detail1 = initialProjection.details.get(SubTotalType.OtherCash_LoanOut)
        .get(forecast.loans.list[0].globalId);
      const detail2 = initialProjection.details.get(SubTotalType.OtherCash_LoanOut)
        .get(forecast.loans.list[1].globalId);
      expect(detail1[26].amount).toBe(0);
      expect(detail1[27].amount).toBe(-2222.33);
      expect(detail1[28].amount).toBe(-1000.07);
      expect(detail1[29].amount).toBe(0);
      expect(detail1[30].amount).toBe(0);
      expect(detail1[31].amount).toBe(0);
      expect(detail2[26].amount).toBe(0);
      expect(detail2[27].amount).toBe(0);
      expect(detail2[28].amount).toBe(0);
      expect(detail2[29].amount).toBe(-33.44);
      expect(detail2[30].amount).toBe(-33.44);
      expect(detail2[31].amount).toBe(0);
      expect(OtherCash_LoanOut[26].amount).toBe(0);
      expect(OtherCash_LoanOut[27].amount).toBe(-2222.33);
      expect(OtherCash_LoanOut[28].amount).toBe(-1000.07);
      expect(OtherCash_LoanOut[29].amount).toBe(-33.44);
      expect(OtherCash_LoanOut[30].amount).toBe(-33.44);
      expect(OtherCash_LoanOut[31].amount).toBe(0);
      expect(OtherCash[26].amount).toBe(0);
      expect(OtherCash[27].amount).toBe(-2222.33);
      expect(OtherCash[28].amount).toBe(-1000.07);
      expect(OtherCash[29].amount).toBe(-33.44);
      expect(OtherCash[30].amount).toBe(-33.44);
      expect(OtherCash[31].amount).toBe(0);
    });

    it("removes loan outflow when loan deleted from forecast", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const loan = createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56);
      const repaymentTerms = createLoanRepaymentTerms(loan, LoanRepaymentType.OneTime, getUtcDate(2017, 8, 1), 2222.33);
      forecast.loans.list.push({
        ...loan,
        repaymentTerms
      });
      const loanId = loan.globalId;
      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      forecast.loans.list.pop();
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

      // initial
      {
        const detail = initialProjection.details.get(SubTotalType.OtherCash_LoanOut)
          .get(loanId);
        expect(detail[27].amount).toBe(-2222.33);
        expect(initialProjection.OtherCash_LoanOut[27].amount).toBe(-2222.33);
        expect(initialProjection.OtherCash[27].amount).toBe(-2222.33);
      }
      // second
      {
        expect(secondProjection.details.get(SubTotalType.OtherCash_LoanOut).size).toBe(0);
        expect(secondProjection.OtherCash_LoanOut[27].amount).toBe(0);
        expect(secondProjection.OtherCash[27].amount).toBe(0);
      }
    });

    it("removes loan outflow when cashOut deleted from forecast loan", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const loan = createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56);
      const repaymentTerms = createLoanRepaymentTerms(loan, LoanRepaymentType.OneTime, getUtcDate(2017, 8, 1), 444.33);
      forecast.loans.list.push({
        ...loan,
        repaymentTerms
      });
      const loanId = loan.globalId;
      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      forecast.loans.list[0].repaymentTerms = null;
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

      // initial
      {
        const detail = initialProjection.details.get(SubTotalType.OtherCash_LoanOut)
          .get(loanId);
        expect(detail[27].amount).toBe(-444.33);
        expect(initialProjection.OtherCash_LoanOut[27].amount).toBe(-444.33);
        expect(initialProjection.OtherCash[27].amount).toBe(-444.33);
      }
      // second
      {
        const detail = secondProjection.details.get(SubTotalType.OtherCash_LoanOut)
          .get(loanId);
        expect(detail[27].amount).toBe(0);
        expect(secondProjection.OtherCash_LoanOut[27].amount).toBe(0);
        expect(secondProjection.OtherCash[27].amount).toBe(0);
      }
    });

    it("reduces loan outflow when one of multiple cash flows is deleted", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const loan = createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56);
      const repaymentTerms = createLoanRepaymentTerms(loan, LoanRepaymentType.OneTime, getUtcDate(2017, 8, 1), 2222.33);
      repaymentTerms.cashOut.list.push(
        createLoanRepaymentCashOut(repaymentTerms.cashOut, LoanRepaymentType.OneTime, getUtcDate(2017, 9, 1), 1000.07)
      );
      forecast.loans.list.push({
        ...loan,
        repaymentTerms
      });
      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      forecast.loans.list[0].repaymentTerms.cashOut.list.pop();
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

      // initial
      {
        const detail = initialProjection.details.get(SubTotalType.OtherCash_LoanOut)
          .get(forecast.loans.list[0].globalId);
        expect(detail[27].amount).toBe(-2222.33);
        expect(detail[28].amount).toBe(-1000.07);
        expect(initialProjection.OtherCash_LoanOut[27].amount).toBe(-2222.33);
        expect(initialProjection.OtherCash_LoanOut[28].amount).toBe(-1000.07);
        expect(initialProjection.OtherCash[27].amount).toBe(-2222.33);
        expect(initialProjection.OtherCash[28].amount).toBe(-1000.07);
      }
      // second
      {
        const detail = secondProjection.details.get(SubTotalType.OtherCash_LoanOut)
          .get(forecast.loans.list[0].globalId);
        expect(detail[27].amount).toBe(-2222.33);
        expect(detail[28].amount).toBe(0);
        expect(secondProjection.OtherCash_LoanOut[27].amount).toBe(-2222.33);
        expect(secondProjection.OtherCash_LoanOut[28].amount).toBe(0);
        expect(secondProjection.OtherCash[27].amount).toBe(-2222.33);
        expect(secondProjection.OtherCash[28].amount).toBe(0);
      }
    });

    it("increasing length of forecast extends projection", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const loan = createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1000.33);
      const repaymentTerms = createLoanRepaymentTerms(loan, LoanRepaymentType.OneTime, getUtcDate(2017, 8, 1), 2222.33);
      forecast.loans.list.push({
        ...loan,
        repaymentTerms
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES + 12);

      const sixYears = FIVE_YEARS_OF_ENTRIES + 12;
      const initialDetail = initialProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      expect(initialDetail.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.OtherCash_LoanOut.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.BeginningCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.BeginningCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(-1222.00);
      expect(initialProjection.EndingCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.EndingCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(-1222.00);
      const secondDetail = secondProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      expect(secondDetail.length).toBe(sixYears);
      expect(secondProjection.OtherCash_LoanOut.length).toBe(sixYears);
      expect(secondProjection.BeginningCash.length).toBe(sixYears);
      expect(secondProjection.BeginningCash[sixYears - 1].amount).toBe(-1222.00);
      expect(secondProjection.EndingCash.length).toBe(sixYears);
      expect(secondProjection.EndingCash[sixYears - 1].amount).toBe(-1222.00);
    });

    it("decreasing length of forecast truncates projection", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const loan = createLoan(forecast.loans, LoanType.OneTime, getUtcDate(2017, 5, 1), 1000.33);
      const repaymentTerms = createLoanRepaymentTerms(loan, LoanRepaymentType.OneTime, getUtcDate(2017, 8, 1), 2222.33);
      forecast.loans.list.push({
        ...loan,
        repaymentTerms
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES - 12);

      const fourYears = FIVE_YEARS_OF_ENTRIES - 12;
      const initialDetail = initialProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      expect(initialDetail.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.OtherCash_LoanIn.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.BeginningCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.BeginningCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(-1222.00);
      expect(initialProjection.EndingCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.EndingCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(-1222.00);
      const secondDetail = secondProjection.details.get(SubTotalType.OtherCash_LoanIn)
        .get(forecast.loans.list[0].globalId);
      expect(secondDetail.length).toBe(fourYears);
      expect(secondProjection.OtherCash_LoanIn.length).toBe(fourYears);
      expect(secondProjection.BeginningCash.length).toBe(fourYears);
      expect(secondProjection.BeginningCash[fourYears - 1].amount).toBe(-1222.00);
      expect(secondProjection.EndingCash.length).toBe(fourYears);
      expect(secondProjection.EndingCash[fourYears - 1].amount).toBe(-1222.00);
    });
  });

  describe("funding - inflow", () => {
    it("adds one-time funding inflow on correct date to funding, subtotal, and total", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.funding.list.push({
        ...createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56)
      });

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const { OtherCash_FundingIn, OtherCash } = initialProjection;
      const detail = initialProjection.details.get(SubTotalType.OtherCash_FundingIn)
        .get(forecast.funding.list[0].globalId);
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(1234.56);
      expect(detail[25].amount).toBe(0);
      expect(OtherCash_FundingIn[24].amount).toBe(1234.56);
      expect(OtherCash_FundingIn[25].amount).toBe(0);
      expect(OtherCash[23].amount).toBe(0);
      expect(OtherCash[24].amount).toBe(1234.56);
      expect(OtherCash[25].amount).toBe(0);
    });

    it("adds monthly funding inflow on correct dates to loan, subtotal, and total", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.funding.list.push({
        ...createFunding(forecast.funding, LoanType.Monthly, getUtcDate(2017, 5, 1), 1234.56)
      });

      expect(() => calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES))
        .toThrowError("Monthly is not a valid type for a Funding");
    });

    it("adds multiple funding inflow on correct dates to loan, subtotal, and total", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const funding = createFunding(forecast.funding, LoanType.Multiple, getUtcDate(2017, 5, 1), 1234.56);
      funding.cashIn.list.push(createLoanCashIn(funding.cashIn, getUtcDate(2017, 6, 1), 2234.56));
      funding.cashIn.list.push(createLoanCashIn(funding.cashIn, getUtcDate(2017, 8, 1), 3234.56));
      forecast.funding.list.push(funding);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const { OtherCash_FundingIn, OtherCash } = initialProjection;
      const detail = initialProjection.details.get(SubTotalType.OtherCash_FundingIn)
        .get(forecast.funding.list[0].globalId);
      [0, 1234.56, 2234.56, 0, 3234.56, 0].forEach((amt, i) => {
        expect(detail[23 + i].amount).toBe(amt);
        expect(OtherCash_FundingIn[23 + i].amount).toBe(amt);
        expect(OtherCash[23 + i].amount).toBe(amt);
      });
    });

    it("adds single funding inflow w/extraneous cashIns on correct date to loan, subtotal, and total", () => {
      // this is same as last test, but expect to only read first cashIn
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const funding = createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56);
      funding.cashIn.list.push(createLoanCashIn(funding.cashIn, getUtcDate(2017, 6, 1), 2234.56));
      funding.cashIn.list.push(createLoanCashIn(funding.cashIn, getUtcDate(2017, 8, 1), 3234.56));
      forecast.funding.list.push(funding);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const { OtherCash_FundingIn, OtherCash } = initialProjection;
      const detail = initialProjection.details.get(SubTotalType.OtherCash_FundingIn)
        .get(forecast.funding.list[0].globalId);
      [0, 1234.56, 0, 0, 0, 0].forEach((amt, i) => {
        expect(detail[23 + i].amount).toBe(amt);
        expect(OtherCash_FundingIn[23 + i].amount).toBe(amt);
        expect(OtherCash[23 + i].amount).toBe(amt);
      });
    });

    it("removes funding inflow when deleted from forecast", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const funding = createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56);
      const fundingGlobalId = funding.globalId;
      forecast.funding.list.push(funding);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      forecast.funding.list.pop();
      const finalProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

      // initialProjection is untouched
      {
        const { OtherCash_FundingIn, OtherCash } = initialProjection;
        const detail = initialProjection.details.get(SubTotalType.OtherCash_FundingIn)
          .get(fundingGlobalId);
        expect(detail[24].amount).toBe(1234.56);
        expect(OtherCash_FundingIn[24].amount).toBe(1234.56);
        expect(OtherCash[24].amount).toBe(1234.56);
      }
      // final projection is 0'd
      {
        const { OtherCash_FundingIn, OtherCash } = finalProjection;
        expect(finalProjection.details.get(SubTotalType.OtherCash_FundingIn).size).toBe(0);
        expect(OtherCash_FundingIn[24].amount).toBe(0);
        expect(OtherCash[24].amount).toBe(0);
      }
    });

    it("adds funding not present in first projection to later ones", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const funding = createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56);
      forecast.funding.list.push(funding);
      const finalProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

      // initialProjection is untouched
      {
        const { OtherCash_FundingIn, OtherCash } = initialProjection;
        expect(initialProjection.details.get(SubTotalType.OtherCash_FundingIn).size).toBe(0);
        expect(OtherCash_FundingIn[24].amount).toBe(0);
        expect(OtherCash[24].amount).toBe(0);
      }
      // final projection is 0'd
      {
        const { OtherCash_FundingIn, OtherCash } = finalProjection;
        const detail = finalProjection.details.get(SubTotalType.OtherCash_FundingIn)
          .get(forecast.funding.list[0].globalId);
        expect(detail[24].amount).toBe(1234.56);
        expect(OtherCash_FundingIn[24].amount).toBe(1234.56);
        expect(OtherCash[24].amount).toBe(1234.56);
      }
    });

    it("adds multiple funding inflows together", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.funding.list.push(createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56));
      forecast.funding.list.push(createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 1000.04));

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail1 = initialProjection.details.get(SubTotalType.OtherCash_FundingIn)
        .get(forecast.funding.list[0].globalId);
      const detail2 = initialProjection.details.get(SubTotalType.OtherCash_FundingIn)
        .get(forecast.funding.list[1].globalId);
      expect(detail1[24].amount).toBe(1234.56);
      expect(detail2[24].amount).toBe(1000.04);
      expect(initialProjection.OtherCash_FundingIn[24].amount).toBe(1234.56 + 1000.04);
      expect(initialProjection.OtherCash[24].amount).toBe(1234.56 + 1000.04);
    });

    it("adds funding inflows into all subtotals to ending cash", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.funding.list.push(createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56));
      forecast.funding.list.push(createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 1000.04));

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      expect(initialProjection.EndingCash[23].amount).toBe(0);
      expect(initialProjection.BeginningCash[24].amount).toBe(0);
      expect(initialProjection.OtherCash_FundingIn[24].amount).toBe(1234.56 + 1000.04);
      expect(initialProjection.OtherCash[24].amount).toBe(1234.56 + 1000.04);
      expect(initialProjection.EndingCash[24].amount).toBe(1234.56 + 1000.04);
      expect(initialProjection.BeginningCash[25].amount).toBe(1234.56 + 1000.04);
      expect(initialProjection.BeginningCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56 + 1000.04);
      expect(initialProjection.EndingCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56 + 1000.04);
    });

    it("increasing length of forecast extends projection", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.funding.list.push(createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56));

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES + 12);

      const sixYears = FIVE_YEARS_OF_ENTRIES + 12;
      const initialDetail = initialProjection.details.get(SubTotalType.OtherCash_FundingIn)
        .get(forecast.funding.list[0].globalId);
      expect(initialDetail.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.OtherCash_FundingIn.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.BeginningCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.BeginningCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
      expect(initialProjection.EndingCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.EndingCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
      const secondDetail = secondProjection.details.get(SubTotalType.OtherCash_FundingIn)
        .get(forecast.funding.list[0].globalId);
      expect(secondDetail.length).toBe(sixYears);
      expect(secondProjection.OtherCash_FundingIn.length).toBe(sixYears);
      expect(secondProjection.BeginningCash.length).toBe(sixYears);
      expect(secondProjection.BeginningCash[sixYears - 1].amount).toBe(1234.56);
      expect(secondProjection.EndingCash.length).toBe(sixYears);
      expect(secondProjection.EndingCash[sixYears - 1].amount).toBe(1234.56);
    });

    it("decreasing length of forecast truncates projection", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.funding.list.push(createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 1234.56));

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES - 12);

      const fourYears = FIVE_YEARS_OF_ENTRIES - 12;
      const initialDetail = initialProjection.details.get(SubTotalType.OtherCash_FundingIn)
        .get(forecast.funding.list[0].globalId);
      expect(initialDetail.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.OtherCash_FundingIn.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.BeginningCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.BeginningCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
      expect(initialProjection.EndingCash.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.EndingCash[FIVE_YEARS_OF_ENTRIES - 1].amount).toBe(1234.56);
      const secondDetail = secondProjection.details.get(SubTotalType.OtherCash_FundingIn)
        .get(forecast.funding.list[0].globalId);
      expect(secondDetail.length).toBe(fourYears);
      expect(secondProjection.OtherCash_FundingIn.length).toBe(fourYears);
      expect(secondProjection.BeginningCash.length).toBe(fourYears);
      expect(secondProjection.BeginningCash[fourYears - 1].amount).toBe(1234.56);
      expect(secondProjection.EndingCash.length).toBe(fourYears);
      expect(secondProjection.EndingCash[fourYears - 1].amount).toBe(1234.56);
    });
  });

  describe("sales revenue", () => {
    it("applies basic sales revenue (no platform fee) to the projection", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.revenues.list.push({
        ...createRevenue(forecast.revenues, RevenueModelType.ExplicitValues)
      });
      const numMonths = 4;
      forecast.revenues.list[0].values.list = Array.from(new Array(numMonths).keys()).map((_, i) =>
        createRevenueValue(forecast.revenues.list[0].values, 10000.10, getUtcDate(2016, 5 + i, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
        .get(forecast.revenues.list[0].globalId);
      let rollingSum = 0;
      [0, 10000.10, 10000.10, 10000.10, 10000.10, 0, 0].forEach((amt, i) => {
        rollingSum += amt;
        expect(detail[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_SalesRevenue[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_RevenueAfterPlatform[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_RevenueAfterDistribution[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_RevenueAfterPublisher[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossProfit[11 + i].amount).toBe(amt);
        expect(initialProjection.NetProfit[11 + i].amount).toBe(amt);
        expect(initialProjection.EndingCash[11 + i].amount).toBe(rollingSum);
        expect(initialProjection.BeginningCash[11 + i + 1].amount).toBe(rollingSum);
      });
    });

    it("removes projected revenue when revenue deleted from forecast", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.revenues.list.push({
        ...createRevenue(forecast.revenues, RevenueModelType.ExplicitValues)
      });
      const numMonths = 4;
      forecast.revenues.list[0].values.list = Array.from(new Array(numMonths).keys()).map((_, i) =>
        createRevenueValue(forecast.revenues.list[0].values, 10000.10, getUtcDate(2016, 5 + i, 1))
      );
      const revGlobalid = forecast.revenues.list[0].globalId;
      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
      forecast.revenues.list.pop();

      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

      {
        const detail = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
          .get(revGlobalid);
        let rollingSum = 0;
        [0, 10000.10, 10000.10, 10000.10, 10000.10, 0].forEach((amt, i) => {
          rollingSum += amt;
          expect(detail[11 + i].amount).toBe(amt);
          expect(initialProjection.GrossRevenue_SalesRevenue[11 + i].amount).toBe(amt);
          expect(initialProjection.GrossRevenue_RevenueAfterPlatform[11 + i].amount).toBe(amt);
          expect(initialProjection.GrossRevenue_RevenueAfterDistribution[11 + i].amount).toBe(amt);
          expect(initialProjection.GrossRevenue_RevenueAfterPublisher[11 + i].amount).toBe(amt);
          expect(initialProjection.GrossRevenue[11 + i].amount).toBe(amt);
          expect(initialProjection.GrossProfit[11 + i].amount).toBe(amt);
          expect(initialProjection.NetProfit[11 + i].amount).toBe(amt);
          expect(initialProjection.EndingCash[11 + i].amount).toBe(rollingSum);
          expect(initialProjection.BeginningCash[11 + i + 1].amount).toBe(rollingSum);
        });
      }
      {
        expect(secondProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue).size).toBe(0);
        expect(secondProjection.GrossRevenue_SalesRevenue[13].amount).toBe(0);
        expect(secondProjection.GrossRevenue_RevenueAfterPlatform[13].amount).toBe(0);
        expect(secondProjection.GrossRevenue_RevenueAfterDistribution[13].amount).toBe(0);
        expect(secondProjection.GrossRevenue_RevenueAfterPublisher[13].amount).toBe(0);
        expect(secondProjection.GrossRevenue[13].amount).toBe(0);
        expect(secondProjection.GrossProfit[13].amount).toBe(0);
        expect(secondProjection.NetProfit[13].amount).toBe(0);
        expect(secondProjection.EndingCash[13].amount).toBe(0);
        expect(secondProjection.BeginningCash[13 + 1].amount).toBe(0);
      }
    });

    it("removes projected revenue when revenue values deleted from revenue", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.revenues.list.push({
        ...createRevenue(forecast.revenues, RevenueModelType.ExplicitValues)
      });
      const numMonths = 4;
      forecast.revenues.list[0].values.list = Array.from(new Array(numMonths).keys()).map((_, i) =>
        createRevenueValue(forecast.revenues.list[0].values, 10000.10, getUtcDate(2016, 5 + i, 1))
      );
      const revGlobalid = forecast.revenues.list[0].globalId;
      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
      forecast.revenues.list[0].values.list = [];

      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

      {
        const detail = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
          .get(revGlobalid);
        let rollingSum = 0;
        [0, 10000.10, 10000.10, 10000.10, 10000.10, 0].forEach((amt, i) => {
          rollingSum += amt;
          expect(detail[11 + i].amount).toBe(amt);
          expect(initialProjection.GrossRevenue_SalesRevenue[11 + i].amount).toBe(amt);
          expect(initialProjection.GrossRevenue_RevenueAfterPlatform[11 + i].amount).toBe(amt);
          expect(initialProjection.GrossRevenue_RevenueAfterDistribution[11 + i].amount).toBe(amt);
          expect(initialProjection.GrossRevenue_RevenueAfterPublisher[11 + i].amount).toBe(amt);
          expect(initialProjection.GrossRevenue[11 + i].amount).toBe(amt);
          expect(initialProjection.GrossProfit[11 + i].amount).toBe(amt);
          expect(initialProjection.NetProfit[11 + i].amount).toBe(amt);
          expect(initialProjection.EndingCash[11 + i].amount).toBe(rollingSum);
          expect(initialProjection.BeginningCash[11 + i + 1].amount).toBe(rollingSum);
        });
      }
      {
        expect(secondProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue).size).toBe(1);
        expect(secondProjection.GrossRevenue_SalesRevenue[13].amount).toBe(0);
        expect(secondProjection.GrossRevenue_RevenueAfterPlatform[13].amount).toBe(0);
        expect(secondProjection.GrossRevenue_RevenueAfterDistribution[13].amount).toBe(0);
        expect(secondProjection.GrossRevenue_RevenueAfterPublisher[13].amount).toBe(0);
        expect(secondProjection.GrossRevenue[13].amount).toBe(0);
        expect(secondProjection.GrossProfit[13].amount).toBe(0);
        expect(secondProjection.NetProfit[13].amount).toBe(0);
        expect(secondProjection.EndingCash[13].amount).toBe(0);
        expect(secondProjection.BeginningCash[13 + 1].amount).toBe(0);
      }
    });

    it("increasing length of forecast extends projection", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.revenues.list.push({
        ...createRevenue(forecast.revenues, RevenueModelType.ExplicitValues)
      });
      const numMonths = 4;
      forecast.revenues.list[0].values.list = Array.from(new Array(numMonths).keys()).map((_, i) =>
        createRevenueValue(forecast.revenues.list[0].values, 10000.10, getUtcDate(2016, 5 + i, 1))
      );
      const revGlobalid = forecast.revenues.list[0].globalId;

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES + 12);

      expect(initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue).get(revGlobalid).length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_SalesRevenue.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_PlatformShares.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_RevenueAfterPlatform.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_DistributionShares.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_RevenueAfterDistribution.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_PublisherShares.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_RevenueAfterPublisher.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue.length).toBe(FIVE_YEARS_OF_ENTRIES);
      const sixYears = FIVE_YEARS_OF_ENTRIES + 12;
      expect(secondProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue).get(revGlobalid).length).toBe(sixYears);
      expect(secondProjection.GrossRevenue_SalesRevenue.length).toBe(sixYears);
      expect(secondProjection.GrossRevenue_PlatformShares.length).toBe(sixYears);
      expect(secondProjection.GrossRevenue_RevenueAfterPlatform.length).toBe(sixYears);
      expect(secondProjection.GrossRevenue_DistributionShares.length).toBe(sixYears);
      expect(secondProjection.GrossRevenue_RevenueAfterDistribution.length).toBe(sixYears);
      expect(secondProjection.GrossRevenue_PublisherShares.length).toBe(sixYears);
      expect(secondProjection.GrossRevenue_RevenueAfterPublisher.length).toBe(sixYears);
      expect(secondProjection.GrossRevenue.length).toBe(sixYears);
    });

    it("decreasing length of forecast truncates projection", () => {
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      forecast.revenues.list.push({
        ...createRevenue(forecast.revenues, RevenueModelType.ExplicitValues)
      });
      const numMonths = 4;
      forecast.revenues.list[0].values.list = Array.from(new Array(numMonths).keys()).map((_, i) =>
        createRevenueValue(forecast.revenues.list[0].values, 10000.10, getUtcDate(2016, 5 + i, 1))
      );
      const revGlobalid = forecast.revenues.list[0].globalId;

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES - 12);

      expect(initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue).get(revGlobalid).length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_SalesRevenue.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_PlatformShares.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_RevenueAfterPlatform.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_DistributionShares.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_RevenueAfterDistribution.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_PublisherShares.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue_RevenueAfterPublisher.length).toBe(FIVE_YEARS_OF_ENTRIES);
      expect(initialProjection.GrossRevenue.length).toBe(FIVE_YEARS_OF_ENTRIES);
      const fourYears = FIVE_YEARS_OF_ENTRIES - 12;
      expect(secondProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue).get(revGlobalid).length).toBe(fourYears);
      expect(secondProjection.GrossRevenue_SalesRevenue.length).toBe(fourYears);
      expect(secondProjection.GrossRevenue_PlatformShares.length).toBe(fourYears);
      expect(secondProjection.GrossRevenue_RevenueAfterPlatform.length).toBe(fourYears);
      expect(secondProjection.GrossRevenue_DistributionShares.length).toBe(fourYears);
      expect(secondProjection.GrossRevenue_RevenueAfterDistribution.length).toBe(fourYears);
      expect(secondProjection.GrossRevenue_PublisherShares.length).toBe(fourYears);
      expect(secondProjection.GrossRevenue_RevenueAfterPublisher.length).toBe(fourYears);
      expect(secondProjection.GrossRevenue.length).toBe(fourYears);

    });
  });

  describe("sales revenue - platform share", () => {
    it("applies basic sales revenue w/ platform fee to the projection", () => {
      const numMonths = 4;
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
      revenue.values.list = Array.from(new Array(numMonths).keys()).map((_, i) =>
        createRevenueValue(revenue.values, 10000.10, getUtcDate(2016, 5 + i, 1))
      );
      revenue.revenueShare.list.push(createRevenueShare(revenue.revenueShare, SalesRevenueShareType.GrossRevenueAfterSales, .10));
      forecast.revenues.list.push(revenue);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
        .get(forecast.revenues.list[0].globalId);
      [0, 10000.10, 10000.10, 10000.10, 10000.10, 0].forEach((amt, i) => {
        expect(detail[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_SalesRevenue[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_PlatformShares[11 + i].amount).toBeCloseTo(amt * -0.10);
        expect(initialProjection.GrossRevenue_RevenueAfterPlatform[11 + i].amount).toBeCloseTo(amt - (amt * 0.10));
      });
    });

    it("removes platform fee from basic sales revenue when fee removed from forecast", () => {
      const numMonths = 4;
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
      revenue.values.list = Array.from(new Array(numMonths).keys()).map((_, i) =>
        createRevenueValue(revenue.values, 10000.10, getUtcDate(2016, 5 + i, 1))
      );
      revenue.revenueShare.list.push(createRevenueShare(revenue.revenueShare, SalesRevenueShareType.GrossRevenueAfterSales, .10));
      forecast.revenues.list.push(revenue);
      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      revenue.revenueShare.list.pop();
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

      const detail1 = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
        .get(forecast.revenues.list[0].globalId);
      [0, 10000.10, 10000.10, 10000.10, 10000.10, 0].forEach((amt, i) => {
        expect(detail1[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_SalesRevenue[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_PlatformShares[11 + i].amount).toBeCloseTo(amt * -0.10);
        expect(initialProjection.GrossRevenue_RevenueAfterPlatform[11 + i].amount).toBeCloseTo(amt - (amt * 0.10));
      });
      const detail2 = secondProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
        .get(forecast.revenues.list[0].globalId);
      [0, 10000.10, 10000.10, 10000.10, 10000.10, 0].forEach((amt, i) => {
        expect(detail2[11 + i].amount).toBe(amt);
        expect(secondProjection.GrossRevenue_SalesRevenue[11 + i].amount).toBe(amt);
        expect(secondProjection.GrossRevenue_PlatformShares[11 + i].amount).toBe(0);
        expect(secondProjection.GrossRevenue_RevenueAfterPlatform[11 + i].amount).toBe(amt);
      });
    });
  });

  describe("sales revenue - distribution share", () => {
    it("applies basic sales revenue w/ distribution fee to the projection", () => {
      const numMonths = 4;
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
      revenue.values.list = Array.from(new Array(numMonths).keys()).map((_, i) => {
        return createRevenueValue(revenue.values, 10000.10, getUtcDate(2016, 5 + i, 1));
      });
      revenue.revenueShare.list.push(createRevenueShare(revenue.revenueShare, SalesRevenueShareType.GrossRevenueAfterPlatform, .10));
      forecast.revenues.list.push(revenue);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
        .get(forecast.revenues.list[0].globalId);
      [0, 10000.10, 10000.10, 10000.10, 10000.10, 0].forEach((amt, i) => {
        expect(detail[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_SalesRevenue[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_PlatformShares[11 + i].amount).toBe(0);
        expect(initialProjection.GrossRevenue_RevenueAfterPlatform[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_DistributionShares[11 + i].amount).toBeCloseTo(amt * -0.10);
        expect(initialProjection.GrossRevenue_RevenueAfterDistribution[11 + i].amount).toBeCloseTo(amt - (amt * 0.10));
      });
    });

    it("removes platform fee from basic sales revenue when fee removed from forecast", () => {
      const numMonths = 4;
      const initial = getEmptyProjection();
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
      revenue.values.list = Array.from(new Array(numMonths).keys()).map((_, i) => {
        const globalId = revenue.globalId + "_" + (i + 1);
        return {
          parentId: revenue.globalId,
          globalId,
          amount: createIdentifiedPrimitive<number>(globalId, globalId + 'a', 10000.10),
          date: createIdentifiedPrimitive<Date>(globalId, globalId + 'a', getUtcDate(2016, 5 + i, 1))
        };
      });
      revenue.revenueShare.list.push(createRevenueShare(revenue.revenueShare, SalesRevenueShareType.GrossRevenueAfterPlatform, .10));
      forecast.revenues.list.push(revenue);
      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      revenue.revenueShare.list.pop();
      const secondProjection = calculate(forecast, initialProjection, FIVE_YEARS_OF_ENTRIES);

      const detail1 = initialProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
        .get(forecast.revenues.list[0].globalId);
      [0, 10000.10, 10000.10, 10000.10, 10000.10, 0].forEach((amt, i) => {
        expect(detail1[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_SalesRevenue[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_PlatformShares[11 + i].amount).toBe(0);
        expect(initialProjection.GrossRevenue_RevenueAfterPlatform[11 + i].amount).toBe(amt);
        expect(initialProjection.GrossRevenue_DistributionShares[11 + i].amount).toBeCloseTo(amt * -0.10);
        expect(initialProjection.GrossRevenue_RevenueAfterDistribution[11 + i].amount).toBeCloseTo(amt - (amt * 0.10));
      });
      const detail2 = secondProjection.details.get(SubTotalType.GrossRevenue_SalesRevenue)
        .get(forecast.revenues.list[0].globalId);
      [0, 10000.10, 10000.10, 10000.10, 10000.10, 0].forEach((amt, i) => {
        expect(detail2[11 + i].amount).toBe(amt);
        expect(secondProjection.GrossRevenue_SalesRevenue[11 + i].amount).toBe(amt);
        expect(secondProjection.GrossRevenue_PlatformShares[11 + i].amount).toBe(0);
        expect(secondProjection.GrossRevenue_RevenueAfterPlatform[11 + i].amount).toBe(amt);
        expect(secondProjection.GrossRevenue_DistributionShares[11 + i].amount).toBe(0);
        expect(secondProjection.GrossRevenue_RevenueAfterDistribution[11 + i].amount).toBe(amt);
      });
    });
  });

  describe("funding - outflow", () => {
    describe.each(
      [
        ["GrossRevenue_PlatformShares", "GrossRevenue_RevenueAfterPlatform", FundingRepaymentType.GrossRevenueAfterSales],
        ["GrossRevenue_DistributionShares", "GrossRevenue_RevenueAfterDistribution", FundingRepaymentType.GrossRevenueAfterPlatform],
        ["GrossRevenue_PublisherShares", "GrossRevenue_RevenueAfterPublisher", FundingRepaymentType.GrossRevenueAfterDistributor]
      ]
    )("%s", (shareCategory, postShareCategory, fundingRepayType: FundingRepaymentType) => {
      const subTotalType = parseInt(Object.entries(SubTotalType).find(stt => stt[1] == shareCategory)[0]);
      // this is late enough in the process it wil require a different set of tests
      const altFundingRepayType = FundingRepaymentType.NetProfitShare;

      it("adds funding-based distribution outflow ", () => {
        const initial = getEmptyProjection();
        const forecast = createEmptyCashForecast();
        forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
        const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
        revenue.values.list = [createRevenueValue(revenue.values, 10000.10, getUtcDate(2017, 5, 1))];
        forecast.revenues.list.push(revenue);
        const funding = createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2015, 5, 1), 1234.56);
        // $fundingRepayType repayment
        funding.repaymentTerms = createFundingRepaymentTerms(funding, fundingRepayType, getUtcDate(2017, 5, 1), 0.60);
        forecast.funding.list.push(funding);
        const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

        // details are in correct subtype
        const detail = initialProjection.details.get(subTotalType)
          .get(forecast.funding.list[0].globalId);
        expect(detail).not.toBeUndefined();
        expect(detail[23].amount).toBeCloseTo(0);
        expect(detail[24].amount).toBeCloseTo(0.60 * 10000.10 * -1);
        expect(detail[25].amount).toBeCloseTo(0);
        expect(initialProjection[shareCategory][23].amount).toBeCloseTo(0);
        expect(initialProjection[shareCategory][24].amount).toBeCloseTo(0.60 * 10000.10 * -1);
        expect(initialProjection[shareCategory][25].amount).toBeCloseTo(0);
        expect(initialProjection[postShareCategory][23].amount).toBeCloseTo(0);
        expect(initialProjection[postShareCategory][24].amount).toBeCloseTo(10000.10 + 0.60 * 10000.10 * -1);
        expect(initialProjection[postShareCategory][25].amount).toBeCloseTo(0);
      });

      it("calculates distribution outflow and stops at tier limit", () => {
        const limitAmount = 5000.01;
        const initial = getEmptyProjection();
        const forecast = createEmptyCashForecast();
        forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
        const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
        revenue.values.list = [createRevenueValue(revenue.values, 10000.10, getUtcDate(2017, 5, 1))];
        forecast.revenues.list.push(revenue);
        const funding = createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2015, 5, 1), 1234.56);
        // $fundingRepayType repayment
        funding.repaymentTerms = createFundingRepaymentTerms(funding, fundingRepayType, getUtcDate(2017, 5, 1), 1.00, limitAmount);
        forecast.funding.list.push(funding);
        const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

        const detail = initialProjection.details.get(subTotalType)
          .get(forecast.funding.list[0].globalId);
        expect(detail).not.toBeUndefined();
        expect(detail[23].amount).toBeCloseTo(0);
        expect(detail[24].amount).toBeCloseTo(limitAmount * -1);
        expect(detail[25].amount).toBeCloseTo(0);
        expect(initialProjection[shareCategory][23].amount).toBe(0);
        expect(initialProjection[shareCategory][24].amount).toBe(-1 * limitAmount);
        expect(initialProjection[shareCategory][25].amount).toBe(0);
        expect(initialProjection[postShareCategory][23].amount).toBe(0);
        expect(initialProjection[postShareCategory][24].amount).toBe(10000.10 - limitAmount);
        expect(initialProjection[postShareCategory][25].amount).toBe(0);
      });

      it("calculates distribution outflow and pays across tiers when multiple tiers present", () => {
        const limitAmount = 5000.01;
        const initial = getEmptyProjection();
        const forecast = createEmptyCashForecast();
        forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
        const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
        revenue.values.list = [createRevenueValue(revenue.values, 10000.10, getUtcDate(2017, 5, 1))];
        forecast.revenues.list.push(revenue);
        const funding = createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2015, 5, 1), 1234.56);
        // first cash out is limited and paid at 100%
        funding.repaymentTerms = createFundingRepaymentTerms(
          funding, fundingRepayType, getUtcDate(2017, 5, 1), 1.00, limitAmount);
        // second is unlimited and paid at 100%
        const cashOut2 = createFundingRepaymentCashOut(
          funding.repaymentTerms.cashOut, fundingRepayType, getUtcDate(2017, 5, 1), 1.00, 0);
        funding.repaymentTerms.cashOut.list.push(cashOut2);
        forecast.funding.list.push(funding);
        const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

        const detail = initialProjection.details.get(subTotalType)
          .get(forecast.funding.list[0].globalId);
        expect(detail).not.toBeUndefined();
        expect(detail[23].amount).toBeCloseTo(0);
        expect(detail[24].amount).toBeCloseTo(10000.10 * -1);
        expect(detail[25].amount).toBeCloseTo(0);
        expect(initialProjection[shareCategory][23].amount).toBe(0);
        expect(initialProjection[shareCategory][24].amount).toBe(-1 * 10000.10);
        expect(initialProjection[shareCategory][25].amount).toBe(0);
        expect(initialProjection[postShareCategory][23].amount).toBe(0);
        expect(initialProjection[postShareCategory][24].amount).toBe(0);
        expect(initialProjection[postShareCategory][25].amount).toBe(0);
      });

      it("calculates distribution outflow and skips already satisfied tiers", () => {
        const tier1Limit = 12345.10;
        const tier2Limit = tier1Limit + 5000.00;
        const initial = getEmptyProjection();
        const forecast = createEmptyCashForecast();
        forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
        const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
        revenue.values.list = [
          createRevenueValue(revenue.values, tier1Limit, getUtcDate(2017, 5, 1)),
          createRevenueValue(revenue.values, 10000.10, getUtcDate(2017, 6, 1))
        ];
        forecast.revenues.list.push(revenue);
        const funding = createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2015, 5, 1), 1234.56);
        // first cash out is limited to tier1Limit and paid at 100%
        funding.repaymentTerms = createFundingRepaymentTerms(
          funding, fundingRepayType, getUtcDate(2017, 5, 1), 1.00, tier1Limit);
        // second is limited and paid at 100%
        const cashOut2 = createFundingRepaymentCashOut(
          funding.repaymentTerms.cashOut, fundingRepayType, getUtcDate(2015, 5, 1), 1.00, tier2Limit);
        funding.repaymentTerms.cashOut.list.push(cashOut2);
        forecast.funding.list.push(funding);
        const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

        const detail = initialProjection.details.get(subTotalType)
          .get(forecast.funding.list[0].globalId);
        expect(detail).not.toBeUndefined();
        expect(detail[23].amount).toBeCloseTo(0);
        expect(detail[24].amount).toBeCloseTo(tier1Limit * -1);
        expect(detail[25].amount).toBeCloseTo(tier2Limit * -1 + tier1Limit);
        expect(detail[26].amount).toBeCloseTo(0);
        expect(initialProjection[shareCategory][23].amount).toBeCloseTo(0);
        expect(initialProjection[shareCategory][24].amount).toBeCloseTo(-1 * tier1Limit);
        expect(initialProjection[shareCategory][25].amount).toBeCloseTo(-1 * tier2Limit + tier1Limit);
        expect(initialProjection[shareCategory][26].amount).toBeCloseTo(0);
        expect(initialProjection[postShareCategory][23].amount).toBe(0);
        expect(initialProjection[postShareCategory][24].amount).toBe(0);
        expect(initialProjection[postShareCategory][25].amount).toBeCloseTo(10000.10 - tier2Limit + tier1Limit);
        expect(initialProjection[postShareCategory][26].amount).toBe(0);
      });

      it("calculates distribution outflow and skips unsatisfied tiers for a different share type", () => {
        const tier1Limit = 12345.10;
        const tier2Limit = tier1Limit + 5000.00;
        const initial = getEmptyProjection();
        const forecast = createEmptyCashForecast();
        forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
        const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
        revenue.values.list = [
          createRevenueValue(revenue.values, tier1Limit, getUtcDate(2017, 5, 1)),
          createRevenueValue(revenue.values, 10000.10, getUtcDate(2017, 6, 1))
        ];
        forecast.revenues.list.push(revenue);
        const funding = createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2015, 5, 1), 1234.56);
        // first cash out is limited to tier1Limit and paid at 100%
        funding.repaymentTerms = createFundingRepaymentTerms(
          funding, fundingRepayType, getUtcDate(2017, 5, 1), 1.00, tier1Limit);
        // second is limited and paid at 100% - but to distribution shares
        const cashOut2 = createFundingRepaymentCashOut(
          funding.repaymentTerms.cashOut, altFundingRepayType, getUtcDate(2015, 5, 1), 1.00, tier2Limit);
        funding.repaymentTerms.cashOut.list.push(cashOut2);
        forecast.funding.list.push(funding);
        const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

        const detail = initialProjection.details.get(subTotalType)
          .get(forecast.funding.list[0].globalId);
        expect(detail).not.toBeUndefined();
        expect(detail[23].amount).toBeCloseTo(0);
        expect(detail[24].amount).toBeCloseTo(tier1Limit * -1);
        expect(detail[25].amount).toBeCloseTo(0);
        expect(detail[26].amount).toBeCloseTo(0);
        expect(initialProjection[shareCategory][23].amount).toBe(0);
        expect(initialProjection[shareCategory][24].amount).toBe(-1 * tier1Limit);
        expect(initialProjection[shareCategory][25].amount).toBe(0);
        expect(initialProjection[shareCategory][26].amount).toBe(0);
        expect(initialProjection[postShareCategory][23].amount).toBe(0);
        expect(initialProjection[postShareCategory][24].amount).toBe(0);
        expect(initialProjection[postShareCategory][25].amount).toBe(10000.10);
        expect(initialProjection[postShareCategory][26].amount).toBe(0);
      });
    });

    const setupForecastWithRevenue = (monthlySalesAmount: number, monthlyDirect: number, monthlyIndirect: number) => {
      // this includes setup w/ 3 values to ensure lower tests are operating only on net profit
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      // revenue
      const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
      revenue.values.list = Array.from(new Array(FIVE_YEARS_OF_ENTRIES).keys()).map((i) => {
        const salesDate = getUtcDate(2015, 5 + i, 1);
        return createRevenueValue(revenue.values, monthlySalesAmount, salesDate);
      });
      forecast.revenues.list.push(revenue);
      // direct expense
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.DirectExpenses, ExpenseFrequency.Monthly,
          monthlyDirect, getUtcDate(2015, 5, 1), ExpenseUntil.Date, getUtcDate(2020, 5, 1))
      );
      // indirect expense
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.MarketingAndSales, ExpenseFrequency.Monthly,
          monthlyIndirect, getUtcDate(2015, 5, 1), ExpenseUntil.Date, getUtcDate(2020, 5, 1))
      );
      return forecast;
    };

    it("applies gross profit share for funding correctly", () => {
      const initial = getEmptyProjection();
      const forecast = setupForecastWithRevenue(10_000, 2_000, 3_000);
      const funding = createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 0);
      funding.repaymentTerms = createFundingRepaymentTerms(funding, FundingRepaymentType.GrossProfitShare,
        getUtcDate(2017, 5, 1), 0.25, 0);
      forecast.funding.list.push(funding);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const expectedGrossProfit = 10_000 - 2_000; // - 3_000;
      const expectedShare = -1 * expectedGrossProfit * 0.25;
      const detail = initialProjection.details.get(SubTotalType.TaxesAndProfitSharing_ProfitSharing)
        .get(forecast.funding.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[24].amount).toBeCloseTo(expectedShare);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[24].amount).toBeCloseTo(expectedShare);
    });


    it("applies gross profit share for funding correctly, with limit", () => {
      const limit = 500;
      const initial = getEmptyProjection();
      const forecast = setupForecastWithRevenue(10_000, 2_000, 3_000);
      const funding = createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 0);
      funding.repaymentTerms = createFundingRepaymentTerms(funding, FundingRepaymentType.GrossProfitShare,
        getUtcDate(2017, 5, 1), 0.25, limit);
      forecast.funding.list.push(funding);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.TaxesAndProfitSharing_ProfitSharing)
        .get(forecast.funding.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[0].amount).toBeCloseTo(-limit);
      expect(detail[1].amount).toBeCloseTo(0);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[0].amount).toBeCloseTo(-limit);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[1].amount).toBeCloseTo(0);
    });

    it("applies net profit share for funding correctly", () => {
      const initial = getEmptyProjection();
      const forecast = setupForecastWithRevenue(10_000, 2_000, 3_000);
      const funding = createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 0);
      funding.repaymentTerms = createFundingRepaymentTerms(funding, FundingRepaymentType.NetProfitShare,
        getUtcDate(2017, 5, 1), 0.25, 0);
      forecast.funding.list.push(funding);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const expectedGrossProfit = 10_000 - 2_000 - 3_000;
      const expectedShare = -1 * expectedGrossProfit * 0.25;
      const detail = initialProjection.details.get(SubTotalType.TaxesAndProfitSharing_ProfitSharing)
        .get(forecast.funding.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[24].amount).toBeCloseTo(expectedShare);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[24].amount).toBeCloseTo(expectedShare);
    });

    it("applies net profit share for funding correctly, with limit", () => {
      const expectedMonthlyNetProfitShare = (10_000 - 2_000 - 3_000) * 0.25;
      const limit = expectedMonthlyNetProfitShare * 1.5; // so we can see it span 2 periods and top off in the 2nd
      const initial = getEmptyProjection();
      const forecast = setupForecastWithRevenue(10_000, 2_000, 3_000);
      const funding = createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 0);
      funding.repaymentTerms = createFundingRepaymentTerms(funding, FundingRepaymentType.NetProfitShare,
        getUtcDate(2017, 5, 1), 0.25, limit);
      forecast.funding.list.push(funding);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.TaxesAndProfitSharing_ProfitSharing)
        .get(forecast.funding.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[0].amount).toBeCloseTo(-expectedMonthlyNetProfitShare);
      expect(detail[1].amount).toBeCloseTo(-expectedMonthlyNetProfitShare / 2);
      expect(detail[2].amount).toBeCloseTo(0);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[0].amount).toBeCloseTo(-expectedMonthlyNetProfitShare);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[1].amount).toBeCloseTo(-expectedMonthlyNetProfitShare / 2);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[2].amount).toBeCloseTo(0);
    });

    it("does not apply net profit share for funding when profit is negative", () => {
      // const expectedMonthlyNetProfitShare = (0 - 2_000 - 3_000) * 0.25;
      const initial = getEmptyProjection();
      const forecast = setupForecastWithRevenue(0, 2_000, 3_000);
      const funding = createFunding(forecast.funding, LoanType.OneTime, getUtcDate(2017, 5, 1), 0);
      funding.repaymentTerms = createFundingRepaymentTerms(funding, FundingRepaymentType.NetProfitShare,
        getUtcDate(2017, 5, 1), 0.25, 0);
      forecast.funding.list.push(funding);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.TaxesAndProfitSharing_ProfitSharing)
        .get(forecast.funding.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[0].amount).toBeCloseTo(0);
      expect(detail[1].amount).toBeCloseTo(0 / 2);
      expect(detail[2].amount).toBeCloseTo(0);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[0].amount).toBeCloseTo(0);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[1].amount).toBeCloseTo(0);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[2].amount).toBeCloseTo(0);
    });

  });

  describe("employees - direct - outflow", () => {
    const initial = getEmptyProjection();
    const setupForecastWithRevenue = (salesAmount: number, salesDate: Date) => {
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
      revenue.values.list = [createRevenueValue(revenue.values, salesAmount, salesDate)];
      forecast.revenues.list.push(revenue);
      return forecast;
    };

    it("applies direct employee pay to gross profit", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(-1234.56);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectEmployees[23].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectEmployees[24].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectEmployees[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit[23].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBe(-1234.56);
    });

    it("applies direct employee pay to gross profit, prorated for mid-month start", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2017, 5, 16), getUtcDate(2019, 5, 1), 1234.56, 0)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56 / 2);
      expect(detail[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectEmployees[23].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectEmployees[24].amount).toBe(-1234.56 / 2);
      expect(initialProjection.GrossProfit_DirectEmployees[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit[23].amount).toBe(0);
      expect(initialProjection.GrossProfit[24].amount).toBe(-1234.56 / 2 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBe(-1234.56);
    });

    it("applies direct employee pay to gross profit, prorated for mid-month end", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2015, 5, 1), getUtcDate(2017, 5, 15), 1234.56, 0)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(-1234.56);
      expect(detail[24].amount).toBe(-1234.56 / 2);
      expect(detail[25].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectEmployees[23].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectEmployees[24].amount).toBe(-1234.56 / 2);
      expect(initialProjection.GrossProfit_DirectEmployees[25].amount).toBe(0);
      expect(initialProjection.GrossProfit[23].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit[24].amount).toBe(-1234.56 / 2 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBe(0);
    });

    it("calculates no employee pay for reversed dates", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2019, 5, 1), getUtcDate(2015, 5, 1), 1234.56, 0)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(0);
      expect(detail[25].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectEmployees[23].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectEmployees[24].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectEmployees[25].amount).toBe(0);
      expect(initialProjection.GrossProfit[23].amount).toBe(0);
      expect(initialProjection.GrossProfit[24].amount).toBe(10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBe(0);
    });

    it("applies direct employee benefits to gross profit", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0.30)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(detail[24].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(detail[25].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.GrossProfit_DirectEmployees[23].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.GrossProfit_DirectEmployees[24].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.GrossProfit_DirectEmployees[25].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.GrossProfit[23].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.GrossProfit[24].amount).toBeCloseTo(-1234.56 * 1.30 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBeCloseTo(-1234.56 * 1.30);
    });

    it("applies direct employee pay to gross profit, prorated for mid-month start", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2017, 5, 16), getUtcDate(2019, 5, 1), 1234.56, .30)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(0);
      expect(detail[24].amount).toBeCloseTo(-1234.56 / 2 * 1.30);
      expect(detail[25].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.GrossProfit_DirectEmployees[23].amount).toBeCloseTo(0);
      expect(initialProjection.GrossProfit_DirectEmployees[24].amount).toBeCloseTo(-1234.56 / 2 * 1.30);
      expect(initialProjection.GrossProfit_DirectEmployees[25].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.GrossProfit[23].amount).toBeCloseTo(0);
      expect(initialProjection.GrossProfit[24].amount).toBeCloseTo(-1234.56 / 2 * 1.30 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBeCloseTo(-1234.56 * 1.30);
    });

    it("applies direct employee annual dollar bonus", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusDollarsAnnual,
          AdditionalEmployeeExpenseFrequency.Date,
          333.33,
          // purpusefully picking an earlier year for recurring math
          getUtcDate(2015, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(-1234.56);
      expect(detail[24].amount).toBeCloseTo(-1234.56 - 333.33);
      expect(detail[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit_DirectEmployees[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit_DirectEmployees[24].amount).toBeCloseTo(-1234.56 - 333.33);
      expect(initialProjection.GrossProfit_DirectEmployees[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit[24].amount).toBeCloseTo(-1234.56 - 333.33 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBeCloseTo(-1234.56);
    });

    it("applies no direct employee annual dollar bonus for wrong month", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusDollarsAnnual,
          AdditionalEmployeeExpenseFrequency.Date,
          333.33,
          // purpusefully picking an earlier year for recurring math
          getUtcDate(2015, 3, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[24].amount).toBeCloseTo(-1234.56  /* no bonus */);
    });

    it("applies direct employee one-time percent bonus", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusPercentAnnual,
          AdditionalEmployeeExpenseFrequency.Date,
          0.10,
          // purpusefully picking an earlier year for recurring math
          getUtcDate(2015, 5, 1))
      );
      const bonus = 1234.56 * 12 * 0.10;

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(-1234.56);
      expect(detail[24].amount).toBeCloseTo(-1234.56 - bonus);
      expect(detail[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit_DirectEmployees[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit_DirectEmployees[24].amount).toBeCloseTo(-1234.56 - bonus);
      expect(initialProjection.GrossProfit_DirectEmployees[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit[24].amount).toBeCloseTo(-1234.56 - bonus + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBeCloseTo(-1234.56);
    });

    it("applies no direct employee annual percent bonus for wrong month", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusDollarsAnnual,
          AdditionalEmployeeExpenseFrequency.Date,
          0.10,
          // purpusefully picking an earlier year for recurring math
          getUtcDate(2015, 3, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[24].amount).toBeCloseTo(-1234.56 /* no bonus */);
    });

    it("applies direct employee one-time dollar bonus", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusDollarsOnce,
          AdditionalEmployeeExpenseFrequency.Date,
          333.33,
          getUtcDate(2017, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(-1234.56);
      expect(detail[24].amount).toBeCloseTo(-1234.56 - 333.33);
      expect(detail[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit_DirectEmployees[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit_DirectEmployees[24].amount).toBeCloseTo(-1234.56 - 333.33);
      expect(initialProjection.GrossProfit_DirectEmployees[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit[24].amount).toBeCloseTo(-1234.56 - 333.33 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBeCloseTo(-1234.56);
    });

    it("applies no direct employee one-time dollar bonus for wrong date", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusDollarsOnce,
          AdditionalEmployeeExpenseFrequency.Date,
          333.33,
          getUtcDate(2017, 4, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail[24].amount).toBeCloseTo(-1234.56 /* no bonus */);
    });

    it("applies direct employee one-time percent bonus", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusPercentOnce,
          AdditionalEmployeeExpenseFrequency.Date,
          0.10,
          getUtcDate(2017, 5, 1))
      );
      const bonus = (0.10 * 1234.56 * 12);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(-1234.56);
      expect(detail[24].amount).toBeCloseTo(-1234.56 - bonus);
      expect(detail[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit_DirectEmployees[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit_DirectEmployees[24].amount).toBeCloseTo(-1234.56 - bonus);
      expect(initialProjection.GrossProfit_DirectEmployees[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.GrossProfit[24].amount).toBeCloseTo(-1234.56 - bonus + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBeCloseTo(-1234.56);
    });

    it("applies no direct employee one-time percent bonus for wrong date", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusPercentOnce,
          AdditionalEmployeeExpenseFrequency.Date,
          0.10,
          getUtcDate(2017, 4, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[24].amount).toBeCloseTo(-1234.56 /* no bonus */);
    });

    it("applies direct employee double bonuses when more than one present", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusPercentOnce,
          AdditionalEmployeeExpenseFrequency.Date,
          0.10,
          getUtcDate(2017, 5, 1))
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusPercentOnce,
          AdditionalEmployeeExpenseFrequency.Date,
          0.10,
          getUtcDate(2017, 5, 1))
      );
      const bonus = (0.10 * 1234.56 * 12);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[24].amount).toBeCloseTo(-1234.56 - bonus - bonus);
    });

    it("applies direct employee bonus based on forecasted launch date instead of on-object date when specified", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.launchDate.value = getUtcDate(2017, 5, 1);
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.DirectExpenses, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusDollarsOnce,
          AdditionalEmployeeExpenseFrequency.Launch,
          333.33,
          // purpusefully picked earlier month - we verify below it is not this date and is launch date
          getUtcDate(2017, 4, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(-1234.56);
      expect(detail[24].amount).toBeCloseTo(-1234.56 - 333.33);
      expect(detail[25].amount).toBeCloseTo(-1234.56);
    });
  });

  describe("contractors - direct - outflow", () => {
    const initial = getEmptyProjection();
    const setupForecastWithRevenue = (salesAmount: number, salesDate: Date) => {
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
      revenue.values.list = [createRevenueValue(revenue.values, salesAmount, salesDate)];
      forecast.revenues.list.push(revenue);
      return forecast;
    };

    it("applies one-time direct contractor pay to gross profit", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      const contractor = createContractor(forecast.contractors, ExpenseCategory.DirectExpenses, ContractorExpenseFrequency.Custom);
      contractor.payments.list.push(
        createContractorPayment(contractor.payments, getUtcDate(2017, 5, 1), 1234.56)
      );
      forecast.contractors.list.push(contractor);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectContractors)
        .get(forecast.contractors.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectContractors[23].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectContractors[24].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectContractors[25].amount).toBe(0);
      expect(initialProjection.GrossProfit[23].amount).toBe(0);
      expect(initialProjection.GrossProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBe(0);
    });

    it("applies multiple one-time direct contractor payments to gross profit", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      const contractor = createContractor(forecast.contractors, ExpenseCategory.DirectExpenses, ContractorExpenseFrequency.Custom);
      contractor.payments.list.push(
        createContractorPayment(contractor.payments, getUtcDate(2017, 5, 1), 1234.56),
        createContractorPayment(contractor.payments, getUtcDate(2017, 6, 1), 1234.56),
      );
      forecast.contractors.list.push(contractor);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectContractors)
        .get(forecast.contractors.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectContractors[23].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectContractors[24].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectContractors[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit[23].amount).toBe(0);
      expect(initialProjection.GrossProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBe(-1234.56);
    });

    it("applies monthly direct contractor payments to gross profit", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      const contractor = createContractor(forecast.contractors, ExpenseCategory.DirectExpenses, ContractorExpenseFrequency.Monthly);
      contractor.payments.list.push(
        createContractorPayment(contractor.payments, getUtcDate(2017, 5, 1), 1234.56, getUtcDate(2017, 6, 1))
      );
      forecast.contractors.list.push(contractor);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectContractors)
        .get(forecast.contractors.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectContractors[23].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectContractors[24].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectContractors[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit[23].amount).toBe(0);
      expect(initialProjection.GrossProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBe(-1234.56);
    });
  });

  describe("expenses - direct - outflow", () => {
    const initial = getEmptyProjection();
    const setupForecastWithRevenue = (salesAmount: number, salesDate: Date) => {
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
      revenue.values.list = [createRevenueValue(revenue.values, salesAmount, salesDate)];
      forecast.revenues.list.push(revenue);
      return forecast;
    };

    it("applies one-time direct expense to gross profit", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.DirectExpenses, ExpenseFrequency.OneTime,
          1234.56, getUtcDate(2017, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectExpenses[23].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectExpenses[24].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectExpenses[25].amount).toBe(0);
      expect(initialProjection.GrossProfit[23].amount).toBe(0);
      expect(initialProjection.GrossProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBe(0);
    });

    it("applies monthly direct expense to gross profit (end date)", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.DirectExpenses, ExpenseFrequency.Monthly,
          1234.56, getUtcDate(2017, 5, 1), ExpenseUntil.Date, getUtcDate(2017, 6, 30))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectExpenses[23].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectExpenses[24].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectExpenses[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit[23].amount).toBe(0);
      expect(initialProjection.GrossProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBe(-1234.56);
    });

    it("does not apply monthly direct expense to gross profit when startDate after endDate (end date)", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.DirectExpenses, ExpenseFrequency.Monthly,
          1234.56, getUtcDate(2018, 5, 1), ExpenseUntil.Date, getUtcDate(2017, 6, 30))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(0);
      expect(detail[25].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectExpenses[23].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectExpenses[24].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectExpenses[25].amount).toBe(0);
      expect(initialProjection.GrossProfit[23].amount).toBe(0);
      expect(initialProjection.GrossProfit[24].amount).toBe(0 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBe(0);
    });

    it("applies monthly direct expense to gross profit (end on launchdate)", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.launchDate.value = getUtcDate(2017, 6, 30);
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.DirectExpenses, ExpenseFrequency.Monthly,
          1234.56, getUtcDate(2017, 5, 1), ExpenseUntil.Launch)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectExpenses[23].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectExpenses[24].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectExpenses[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit[23].amount).toBe(0);
      expect(initialProjection.GrossProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBe(-1234.56);
    });

    it("applies monthly direct expense to gross profit (end on launchdate even if manual date is different)", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.launchDate.value = getUtcDate(2017, 6, 30);
      forecast.expenses.list.push(
        // explicitly set a manual date also, it shodl be ignored and launch date from forecast used
        createExpense(forecast.expenses, ExpenseCategory.DirectExpenses, ExpenseFrequency.Monthly,
          1234.56, getUtcDate(2017, 5, 1), ExpenseUntil.Launch, getUtcDate(2017, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectExpenses[23].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectExpenses[24].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit_DirectExpenses[25].amount).toBe(-1234.56);
      expect(initialProjection.GrossProfit[23].amount).toBe(0);
      expect(initialProjection.GrossProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBe(-1234.56);
    });

    it("does not apply monthly direct expense to gross profit when startDate is after launchdate (launchdate)", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.launchDate.value = getUtcDate(2015, 6, 30);
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.DirectExpenses, ExpenseFrequency.Monthly,
          1234.56, getUtcDate(2017, 5, 1), ExpenseUntil.Launch)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(0);
      expect(detail[25].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectExpenses[23].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectExpenses[24].amount).toBe(0);
      expect(initialProjection.GrossProfit_DirectExpenses[25].amount).toBe(0);
      expect(initialProjection.GrossProfit[23].amount).toBe(0);
      expect(initialProjection.GrossProfit[24].amount).toBe(0 + 10000.10);
      expect(initialProjection.GrossProfit[25].amount).toBe(0);
    });

    it("applies annual direct expense to gross profit (end on endDate)", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.DirectExpenses, ExpenseFrequency.Annual,
          1234.56, getUtcDate(2017, 5, 1), ExpenseUntil.Date, getUtcDate(2018, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(0);
      expect(detail[36].amount).toBe(-1234.56);
      expect(detail[48].amount).toBe(0);
    });

    it("applies annual direct expense to gross profit (end on launchDate)", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.launchDate.value = getUtcDate(2019, 4, 1);
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.DirectExpenses, ExpenseFrequency.Annual,
          1234.56, getUtcDate(2017, 5, 1), ExpenseUntil.Launch)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(0);
      expect(detail[36].amount).toBe(-1234.56);
      expect(detail[48].amount).toBe(0);
    });

    it("does not apply annual direct expense to gross profit when start and end date are reversed", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.DirectExpenses, ExpenseFrequency.Annual,
          1234.56, getUtcDate(2017, 5, 1), ExpenseUntil.Date, getUtcDate(2015, 4, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.GrossProfit_DirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(0);
      expect(detail[25].amount).toBe(0);
      expect(detail[36].amount).toBe(0);
      expect(detail[48].amount).toBe(0);
    });
  });

  describe("employees - indirect - outflow", () => {
    const initial = getEmptyProjection();
    const setupForecastWithRevenue = (salesAmount: number, salesDate: Date) => {
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
      revenue.values.list = [createRevenueValue(revenue.values, salesAmount, salesDate)];
      forecast.revenues.list.push(revenue);
      return forecast;
    };

    it("applies indirect employee pay to net profit", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(-1234.56);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectEmployees[23].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectEmployees[24].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectEmployees[25].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit[23].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBe(-1234.56);
    });

    it("applies indirect employee pay to net profit, prorated for mid-month start", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2017, 5, 16), getUtcDate(2019, 5, 1), 1234.56, 0)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56 / 2);
      expect(detail[25].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectEmployees[23].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectEmployees[24].amount).toBe(-1234.56 / 2);
      expect(initialProjection.NetProfit_IndirectEmployees[25].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit[23].amount).toBe(0);
      expect(initialProjection.NetProfit[24].amount).toBe(-1234.56 / 2 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBe(-1234.56);
    });

    it("applies indirect employee pay to net profit, prorated for mid-month end", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2015, 5, 1), getUtcDate(2017, 5, 15), 1234.56, 0)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(-1234.56);
      expect(detail[24].amount).toBe(-1234.56 / 2);
      expect(detail[25].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectEmployees[23].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectEmployees[24].amount).toBe(-1234.56 / 2);
      expect(initialProjection.NetProfit_IndirectEmployees[25].amount).toBe(0);
      expect(initialProjection.NetProfit[23].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit[24].amount).toBe(-1234.56 / 2 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBe(0);
    });

    it("calculates no employee pay for reversed dates", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2019, 5, 1), getUtcDate(2015, 5, 1), 1234.56, 0)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(0);
      expect(detail[25].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectEmployees[23].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectEmployees[24].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectEmployees[25].amount).toBe(0);
      expect(initialProjection.NetProfit[23].amount).toBe(0);
      expect(initialProjection.NetProfit[24].amount).toBe(10000.10);
      expect(initialProjection.NetProfit[25].amount).toBe(0);
    });

    it("applies indirect employee benefits to net profit", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0.30)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(detail[24].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(detail[25].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.NetProfit_IndirectEmployees[23].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.NetProfit_IndirectEmployees[24].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.NetProfit_IndirectEmployees[25].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.NetProfit[23].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.NetProfit[24].amount).toBeCloseTo(-1234.56 * 1.30 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBeCloseTo(-1234.56 * 1.30);
    });

    it("applies indirect employee pay to net profit, prorated for mid-month start", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2017, 5, 16), getUtcDate(2019, 5, 1), 1234.56, .30)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(0);
      expect(detail[24].amount).toBeCloseTo(-1234.56 / 2 * 1.30);
      expect(detail[25].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.NetProfit_IndirectEmployees[23].amount).toBeCloseTo(0);
      expect(initialProjection.NetProfit_IndirectEmployees[24].amount).toBeCloseTo(-1234.56 / 2 * 1.30);
      expect(initialProjection.NetProfit_IndirectEmployees[25].amount).toBeCloseTo(-1234.56 * 1.30);
      expect(initialProjection.NetProfit[23].amount).toBeCloseTo(0);
      expect(initialProjection.NetProfit[24].amount).toBeCloseTo(-1234.56 / 2 * 1.30 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBeCloseTo(-1234.56 * 1.30);
    });

    it("applies indirect employee annual dollar bonus", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusDollarsAnnual,
          AdditionalEmployeeExpenseFrequency.Date,
          333.33,
          // purpusefully picking an earlier year for recurring math
          getUtcDate(2015, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(-1234.56);
      expect(detail[24].amount).toBeCloseTo(-1234.56 - 333.33);
      expect(detail[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit_IndirectEmployees[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit_IndirectEmployees[24].amount).toBeCloseTo(-1234.56 - 333.33);
      expect(initialProjection.NetProfit_IndirectEmployees[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit[24].amount).toBeCloseTo(-1234.56 - 333.33 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBeCloseTo(-1234.56);
    });

    it("applies no indirect employee annual dollar bonus for wrong month", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusDollarsAnnual,
          AdditionalEmployeeExpenseFrequency.Date,
          333.33,
          // purpusefully picking an earlier year for recurring math
          getUtcDate(2015, 3, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[24].amount).toBeCloseTo(-1234.56  /* no bonus */);
    });

    it("applies indirect employee one-time percent bonus", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusPercentAnnual,
          AdditionalEmployeeExpenseFrequency.Date,
          0.10,
          // purpusefully picking an earlier year for recurring math
          getUtcDate(2015, 5, 1))
      );
      const bonus = 1234.56 * 12 * 0.10;

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(-1234.56);
      expect(detail[24].amount).toBeCloseTo(-1234.56 - bonus);
      expect(detail[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit_IndirectEmployees[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit_IndirectEmployees[24].amount).toBeCloseTo(-1234.56 - bonus);
      expect(initialProjection.NetProfit_IndirectEmployees[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit[24].amount).toBeCloseTo(-1234.56 - bonus + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBeCloseTo(-1234.56);
    });

    it("applies no indirect employee annual percent bonus for wrong month", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusDollarsAnnual,
          AdditionalEmployeeExpenseFrequency.Date,
          0.10,
          // purpusefully picking an earlier year for recurring math
          getUtcDate(2015, 3, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[24].amount).toBeCloseTo(-1234.56 /* no bonus */);
    });

    it("applies indirect employee one-time dollar bonus", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusDollarsOnce,
          AdditionalEmployeeExpenseFrequency.Date,
          333.33,
          getUtcDate(2017, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(-1234.56);
      expect(detail[24].amount).toBeCloseTo(-1234.56 - 333.33);
      expect(detail[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit_IndirectEmployees[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit_IndirectEmployees[24].amount).toBeCloseTo(-1234.56 - 333.33);
      expect(initialProjection.NetProfit_IndirectEmployees[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit[24].amount).toBeCloseTo(-1234.56 - 333.33 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBeCloseTo(-1234.56);
    });

    it("applies no indirect employee one-time dollar bonus for wrong date", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusDollarsOnce,
          AdditionalEmployeeExpenseFrequency.Date,
          333.33,
          getUtcDate(2017, 4, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail[24].amount).toBeCloseTo(-1234.56 /* no bonus */);
    });

    it("applies indirect employee one-time percent bonus", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusPercentOnce,
          AdditionalEmployeeExpenseFrequency.Date,
          0.10,
          getUtcDate(2017, 5, 1))
      );
      const bonus = (0.10 * 1234.56 * 12);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(-1234.56);
      expect(detail[24].amount).toBeCloseTo(-1234.56 - bonus);
      expect(detail[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit_IndirectEmployees[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit_IndirectEmployees[24].amount).toBeCloseTo(-1234.56 - bonus);
      expect(initialProjection.NetProfit_IndirectEmployees[25].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit[23].amount).toBeCloseTo(-1234.56);
      expect(initialProjection.NetProfit[24].amount).toBeCloseTo(-1234.56 - bonus + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBeCloseTo(-1234.56);
    });

    it("applies no indirect employee one-time percent bonus for wrong date", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusPercentOnce,
          AdditionalEmployeeExpenseFrequency.Date,
          0.10,
          getUtcDate(2017, 4, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[24].amount).toBeCloseTo(-1234.56 /* no bonus */);
    });

    it("applies indirect employee double bonuses when more than one present", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusPercentOnce,
          AdditionalEmployeeExpenseFrequency.Date,
          0.10,
          getUtcDate(2017, 5, 1))
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusPercentOnce,
          AdditionalEmployeeExpenseFrequency.Date,
          0.10,
          getUtcDate(2017, 5, 1))
      );
      const bonus = (0.10 * 1234.56 * 12);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[24].amount).toBeCloseTo(-1234.56 - bonus - bonus);
    });

    it("applies indirect employee bonus based on forecasted launch date instead of on-object date when specified", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.launchDate.value = getUtcDate(2017, 5, 1);
      forecast.employees.list.push(
        createEmployee(forecast.employees, ExpenseCategory.General, getUtcDate(2015, 5, 1), getUtcDate(2019, 5, 1), 1234.56, 0)
      );
      forecast.employees.list[0].additionalPay.list.push(
        createEmployeeAdditionalPay(
          forecast.employees.list[0].additionalPay,
          AdditionalEmployeeExpenseType.BonusDollarsOnce,
          AdditionalEmployeeExpenseFrequency.Launch,
          333.33,
          // purpusefully picked earlier month - we verify below it is not this date and is launch date
          getUtcDate(2017, 4, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectEmployees)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBeCloseTo(-1234.56);
      expect(detail[24].amount).toBeCloseTo(-1234.56 - 333.33);
      expect(detail[25].amount).toBeCloseTo(-1234.56);
    });
  });

  describe("contractors - indirect - outflow", () => {
    const initial = getEmptyProjection();
    const setupForecastWithRevenue = (salesAmount: number, salesDate: Date) => {
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
      revenue.values.list = [createRevenueValue(revenue.values, salesAmount, salesDate)];
      forecast.revenues.list.push(revenue);
      return forecast;
    };

    it("applies one-time indirect contractor pay to net profit", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      const contractor = createContractor(forecast.contractors, ExpenseCategory.General, ContractorExpenseFrequency.Custom);
      contractor.payments.list.push(
        createContractorPayment(contractor.payments, getUtcDate(2017, 5, 1), 1234.56)
      );
      forecast.contractors.list.push(contractor);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectContractors)
        .get(forecast.contractors.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectContractors[23].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectContractors[24].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectContractors[25].amount).toBe(0);
      expect(initialProjection.NetProfit[23].amount).toBe(0);
      expect(initialProjection.NetProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBe(0);
    });

    it("applies multiple one-time indirect contractor payments to net profit", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      const contractor = createContractor(forecast.contractors, ExpenseCategory.General, ContractorExpenseFrequency.Custom);
      contractor.payments.list.push(
        createContractorPayment(contractor.payments, getUtcDate(2017, 5, 1), 1234.56),
        createContractorPayment(contractor.payments, getUtcDate(2017, 6, 1), 1234.56),
      );
      forecast.contractors.list.push(contractor);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectContractors)
        .get(forecast.contractors.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectContractors[23].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectContractors[24].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectContractors[25].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit[23].amount).toBe(0);
      expect(initialProjection.NetProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBe(-1234.56);
    });

    it("applies monthly indirect contractor payments to net profit", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      const contractor = createContractor(forecast.contractors, ExpenseCategory.General, ContractorExpenseFrequency.Monthly);
      contractor.payments.list.push(
        createContractorPayment(contractor.payments, getUtcDate(2017, 5, 1), 1234.56, getUtcDate(2017, 6, 1))
      );
      forecast.contractors.list.push(contractor);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectContractors)
        .get(forecast.contractors.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectContractors[23].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectContractors[24].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectContractors[25].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit[23].amount).toBe(0);
      expect(initialProjection.NetProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBe(-1234.56);
    });
  });

  describe("expenses - indirect - outflow", () => {
    const initial = getEmptyProjection();
    const setupForecastWithRevenue = (salesAmount: number, salesDate: Date) => {
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
      revenue.values.list = [createRevenueValue(revenue.values, salesAmount, salesDate)];
      forecast.revenues.list.push(revenue);
      return forecast;
    };

    it("applies one-time indirect expense to net profit", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.General, ExpenseFrequency.OneTime,
          1234.56, getUtcDate(2017, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectExpenses[23].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectExpenses[24].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectExpenses[25].amount).toBe(0);
      expect(initialProjection.NetProfit[23].amount).toBe(0);
      expect(initialProjection.NetProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBe(0);
    });

    it("applies monthly indirect expense to net profit (end date)", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.General, ExpenseFrequency.Monthly,
          1234.56, getUtcDate(2017, 5, 1), ExpenseUntil.Date, getUtcDate(2017, 6, 30))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectExpenses[23].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectExpenses[24].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectExpenses[25].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit[23].amount).toBe(0);
      expect(initialProjection.NetProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBe(-1234.56);
    });

    it("does not apply monthly indirect expense to net profit when startDate after endDate (end date)", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.General, ExpenseFrequency.Monthly,
          1234.56, getUtcDate(2018, 5, 1), ExpenseUntil.Date, getUtcDate(2017, 6, 30))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(0);
      expect(detail[25].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectExpenses[23].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectExpenses[24].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectExpenses[25].amount).toBe(0);
      expect(initialProjection.NetProfit[23].amount).toBe(0);
      expect(initialProjection.NetProfit[24].amount).toBe(0 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBe(0);
    });

    it("applies monthly indirect expense to net profit (end on launchdate)", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.launchDate.value = getUtcDate(2017, 6, 30);
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.General, ExpenseFrequency.Monthly,
          1234.56, getUtcDate(2017, 5, 1), ExpenseUntil.Launch)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectExpenses[23].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectExpenses[24].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit_IndirectExpenses[25].amount).toBe(-1234.56);
      expect(initialProjection.NetProfit[23].amount).toBe(0);
      expect(initialProjection.NetProfit[24].amount).toBe(-1234.56 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBe(-1234.56);
    });

    it("does not apply monthly indirect expense to net profit when startDate is after launchdate (launchdate)", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.launchDate.value = getUtcDate(2015, 6, 30);
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.General, ExpenseFrequency.Monthly,
          1234.56, getUtcDate(2017, 5, 1), ExpenseUntil.Launch)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(0);
      expect(detail[25].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectExpenses[23].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectExpenses[24].amount).toBe(0);
      expect(initialProjection.NetProfit_IndirectExpenses[25].amount).toBe(0);
      expect(initialProjection.NetProfit[23].amount).toBe(0);
      expect(initialProjection.NetProfit[24].amount).toBe(0 + 10000.10);
      expect(initialProjection.NetProfit[25].amount).toBe(0);
    });

    it("applies annual indirect expense to net profit (end on endDate)", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.General, ExpenseFrequency.Annual,
          1234.56, getUtcDate(2017, 5, 1), ExpenseUntil.Date, getUtcDate(2018, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(0);
      expect(detail[36].amount).toBe(-1234.56);
      expect(detail[48].amount).toBe(0);
    });

    it("applies annual indirect expense to net profit (end on launchDate)", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.launchDate.value = getUtcDate(2019, 4, 1);
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.General, ExpenseFrequency.Annual,
          1234.56, getUtcDate(2017, 5, 1), ExpenseUntil.Launch)
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(-1234.56);
      expect(detail[25].amount).toBe(0);
      expect(detail[36].amount).toBe(-1234.56);
      expect(detail[48].amount).toBe(0);
    });

    it("does not apply annual indirect expense to net profit when start and end date are reversed", () => {
      const forecast = setupForecastWithRevenue(10000.10, getUtcDate(2017, 5, 1));
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.General, ExpenseFrequency.Annual,
          1234.56, getUtcDate(2017, 5, 1), ExpenseUntil.Date, getUtcDate(2015, 4, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const detail = initialProjection.details.get(SubTotalType.NetProfit_IndirectExpenses)
        .get(forecast.expenses.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[23].amount).toBe(0);
      expect(detail[24].amount).toBe(0);
      expect(detail[25].amount).toBe(0);
      expect(detail[36].amount).toBe(0);
      expect(detail[48].amount).toBe(0);
    });
  });

  describe("taxes - outflow", () => {
    const initial = getEmptyProjection();
    const setupForecastWithRevenue = (monthlySalesAmount: number, monthlyDirect: number, monthlyIndirect: number) => {
      // this includes setup w/ 3 values to ensure lower tests are operating only on net profit
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      // revenue
      const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
      revenue.values.list = Array.from(new Array(FIVE_YEARS_OF_ENTRIES).keys()).map((i) => {
        const salesDate = getUtcDate(2015, 5 + i, 1);
        return createRevenueValue(revenue.values, monthlySalesAmount, salesDate);
      });
      forecast.revenues.list.push(revenue);
      // direct expense
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.DirectExpenses, ExpenseFrequency.Monthly,
          monthlyDirect, getUtcDate(2015, 5, 1), ExpenseUntil.Date, getUtcDate(2020, 5, 1))
      );
      // indirect expense
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.MarketingAndSales, ExpenseFrequency.Monthly,
          monthlyIndirect, getUtcDate(2015, 5, 1), ExpenseUntil.Date, getUtcDate(2020, 5, 1))
      );
      return forecast;
    };

    it("applies taxes to net profit on correct schedule", () => {
      const forecast = setupForecastWithRevenue(15_000.00, 2_500.00, 3_500.00);
      forecast.taxes.list.push(
        createTax(forecast.taxes, NetIncomeCategory.NetProfitShare, 0.10, TaxSchedule.Annual, getUtcDate(2017, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const expectedTaxAmount = -1 * ((15_000 - 2_500 - 3_500) * 12) * 0.10;
      const detail = initialProjection.details.get(SubTotalType.TaxesAndProfitSharing_Taxes)
        .get(forecast.taxes.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[11].amount).toBe(0);
      expect(detail[12].amount).toBe(expectedTaxAmount);
      expect(detail[13].amount).toBe(0);
      expect(detail[24].amount).toBe(expectedTaxAmount);
      expect(initialProjection.TaxesAndProfitSharing_Taxes[11].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing_Taxes[12].amount).toBe(expectedTaxAmount);
      expect(initialProjection.TaxesAndProfitSharing_Taxes[13].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing_Taxes[24].amount).toBe(expectedTaxAmount);
      expect(initialProjection.TaxesAndProfitSharing[11].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing[12].amount).toBe(expectedTaxAmount);
      expect(initialProjection.TaxesAndProfitSharing[13].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing[24].amount).toBe(expectedTaxAmount);
    });

    it("applies taxes to gross profit on correct schedule", () => {
      const forecast = setupForecastWithRevenue(15_000.00, 2_500.00, 3_500.00);
      forecast.taxes.list.push(
        createTax(forecast.taxes, NetIncomeCategory.GrossProfitShare, 0.10, TaxSchedule.Annual, getUtcDate(2017, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const expectedTaxAmount = -1 * ((15_000 - 2_500) * 12) * 0.10;
      const detail = initialProjection.details.get(SubTotalType.TaxesAndProfitSharing_Taxes)
        .get(forecast.taxes.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[11].amount).toBe(0);
      expect(detail[12].amount).toBe(expectedTaxAmount);
      expect(detail[13].amount).toBe(0);
      expect(detail[24].amount).toBe(expectedTaxAmount);
      expect(initialProjection.TaxesAndProfitSharing_Taxes[11].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing_Taxes[12].amount).toBe(expectedTaxAmount);
      expect(initialProjection.TaxesAndProfitSharing_Taxes[13].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing_Taxes[24].amount).toBe(expectedTaxAmount);
      expect(initialProjection.TaxesAndProfitSharing[11].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing[12].amount).toBe(expectedTaxAmount);
      expect(initialProjection.TaxesAndProfitSharing[13].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing[24].amount).toBe(expectedTaxAmount);
    });

    it("applies taxes to gross revenue on correct schedule", () => {
      const forecast = setupForecastWithRevenue(15_000.00, 2_500.00, 3_500.00);
      forecast.taxes.list.push(
        createTax(forecast.taxes, NetIncomeCategory.GrossRevenueShare, 0.10, TaxSchedule.Annual, getUtcDate(2017, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const expectedTaxAmount = -1 * (15_000 * 12) * 0.10;
      const detail = initialProjection.details.get(SubTotalType.TaxesAndProfitSharing_Taxes)
        .get(forecast.taxes.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[11].amount).toBe(0);
      expect(detail[12].amount).toBe(expectedTaxAmount);
      expect(detail[13].amount).toBe(0);
      expect(detail[24].amount).toBe(expectedTaxAmount);
      expect(initialProjection.TaxesAndProfitSharing_Taxes[11].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing_Taxes[12].amount).toBe(expectedTaxAmount);
      expect(initialProjection.TaxesAndProfitSharing_Taxes[13].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing_Taxes[24].amount).toBe(expectedTaxAmount);
      expect(initialProjection.TaxesAndProfitSharing[11].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing[12].amount).toBe(expectedTaxAmount);
      expect(initialProjection.TaxesAndProfitSharing[13].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing[24].amount).toBe(expectedTaxAmount);
    });

    it("applies taxes to ending balance", () => {
      const forecast = setupForecastWithRevenue(15_000.00, 2_500.00, 3_500.00);
      forecast.taxes.list.push(
        createTax(forecast.taxes, NetIncomeCategory.NetProfitShare, 0.10, TaxSchedule.Annual, getUtcDate(2017, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const expectedTaxAmount = -1 * ((15_000 - 2_500 - 3_500) * 12) * 0.10;
      const detail = initialProjection.details.get(SubTotalType.TaxesAndProfitSharing_Taxes)
        .get(forecast.taxes.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[11].amount).toBe(0);
      expect(detail[12].amount).toBe(expectedTaxAmount);
      expect(initialProjection.TaxesAndProfitSharing[12].amount).toBe(expectedTaxAmount);
      expect(initialProjection.EndingCash[12].amount).toBe(
        initialProjection.BeginningCash[12].amount +
        initialProjection.NetProfit[12].amount +
        initialProjection.TaxesAndProfitSharing[12].amount
      );
    });

    it("does not apply taxes to negative profit", () => {
      const forecast = setupForecastWithRevenue(0, 2_500.00, 3_500.00);
      forecast.taxes.list.push(
        createTax(forecast.taxes, NetIncomeCategory.NetProfitShare, 0.10, TaxSchedule.Annual, getUtcDate(2017, 5, 1))
      );

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      // const expectedTaxAmount = -1 * ((0 - 2_500 - 3_500) * 12) * 0.10;
      const detail = initialProjection.details.get(SubTotalType.TaxesAndProfitSharing_Taxes)
        .get(forecast.taxes.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[11].amount).toBe(0);
      expect(detail[12].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing[12].amount).toBe(0);
      expect(initialProjection.EndingCash[12].amount).toBe(
        initialProjection.BeginningCash[12].amount +
        initialProjection.NetProfit[12].amount +
        initialProjection.TaxesAndProfitSharing[12].amount
      );
    });
  });

  describe("profit share - people", () => {
    const initial = getEmptyProjection();
    const setupForecastWithRevenue = (monthlySalesAmount: number, monthlyDirect: number, monthlyIndirect: number) => {
      // this includes setup w/ 3 values to ensure lower tests are operating only on net profit
      const forecast = createEmptyCashForecast();
      forecast.forecastStartDate.value = getUtcDate(2015, 5, 1);
      // revenue
      const revenue = createRevenue(forecast.revenues, RevenueModelType.ExplicitValues);
      revenue.values.list = Array.from(new Array(FIVE_YEARS_OF_ENTRIES).keys()).map((i) => {
        const salesDate = getUtcDate(2015, 5 + i, 1);
        return createRevenueValue(revenue.values, monthlySalesAmount, salesDate);
      });
      forecast.revenues.list.push(revenue);
      // direct expense
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.DirectExpenses, ExpenseFrequency.Monthly,
          monthlyDirect, getUtcDate(2015, 5, 1), ExpenseUntil.Date, getUtcDate(2020, 5, 1))
      );
      // indirect expense
      forecast.expenses.list.push(
        createExpense(forecast.expenses, ExpenseCategory.MarketingAndSales, ExpenseFrequency.Monthly,
          monthlyIndirect, getUtcDate(2015, 5, 1), ExpenseUntil.Date, getUtcDate(2020, 5, 1))
      );
      return forecast;
    };

    it("applies net profit share for person", () => {
      const forecast = setupForecastWithRevenue(15_000.00, 2_500.00, 3_500.00);
      const person = createEmployee(forecast.employees, ExpenseCategory.MarketingAndSales, getUtcDate(2015, 5, 1), getUtcDate(2020, 5, 1), 0, 0);
      const shareAmount = 0.0125;
      person.additionalPay.list.push(
        createEmployeeAdditionalPay(person.additionalPay,
          AdditionalEmployeeExpenseType.NetProfitShare,
          // frequency doesn't apply to shares
          AdditionalEmployeeExpenseFrequency.Launch,
          shareAmount,
          // date doesn't apply to shares
          getUtcDate(2020, 5, 1)
        )
      );
      forecast.employees.list.push(person);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const expectedShareAmount = -1 * (15_000 - 2_500 - 3_500) * shareAmount;
      const detail = initialProjection.details.get(SubTotalType.TaxesAndProfitSharing_ProfitSharing)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[0].amount).toBeCloseTo(expectedShareAmount);
      expect(detail[1].amount).toBeCloseTo(expectedShareAmount);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[0].amount).toBe(expectedShareAmount);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[1].amount).toBe(expectedShareAmount);
      expect(initialProjection.TaxesAndProfitSharing[0].amount).toBe(expectedShareAmount);
      expect(initialProjection.TaxesAndProfitSharing[1].amount).toBe(expectedShareAmount);
    });

    it("applies net profit share to overall ending cash", () => {
      const forecast = setupForecastWithRevenue(15_000.00, 2_500.00, 3_500.00);
      const person = createEmployee(forecast.employees, ExpenseCategory.MarketingAndSales, getUtcDate(2015, 5, 1),
        getUtcDate(2020, 5, 1), 0, 0);
      const shareAmount = 0.0125;
      person.additionalPay.list.push(
        createEmployeeAdditionalPay(person.additionalPay,
          AdditionalEmployeeExpenseType.NetProfitShare,
          // frequency doesn't apply to shares
          AdditionalEmployeeExpenseFrequency.Launch,
          shareAmount,
          // date doesn't apply to shares
          getUtcDate(2020, 5, 1)
        )
      );
      forecast.employees.list.push(person);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      const expectedShareAmount = -1 * (15_000 - 2_500 - 3_500) * shareAmount;
      const detail = initialProjection.details.get(SubTotalType.TaxesAndProfitSharing_ProfitSharing)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[1].amount).toBeCloseTo(expectedShareAmount);
      expect(initialProjection.EndingCash[1].amount).toBe(
        initialProjection.BeginningCash[1].amount +
        initialProjection.NetProfit[1].amount +
        initialProjection.OtherCash[1].amount +
        initialProjection.TaxesAndProfitSharing[1].amount
      );
    });

    it("does not apply profit share from negative profits", () => {
      const forecast = setupForecastWithRevenue(0.00, 2_500.00, 3_500.00);
      const person = createEmployee(forecast.employees, ExpenseCategory.MarketingAndSales, getUtcDate(2015, 5, 1), getUtcDate(2020, 5, 1), 0, 0);
      const shareAmount = 0.0125;
      person.additionalPay.list.push(
        createEmployeeAdditionalPay(person.additionalPay,
          AdditionalEmployeeExpenseType.NetProfitShare,
          // frequency doesn't apply to shares
          AdditionalEmployeeExpenseFrequency.Launch,
          shareAmount,
          // date doesn't apply to shares
          getUtcDate(2020, 5, 1)
        )
      );
      forecast.employees.list.push(person);

      const initialProjection = calculate(forecast, initial, FIVE_YEARS_OF_ENTRIES);

      //const expectedShareAmount = -1 * (0 - 2_500 - 3_500) * shareAmount;
      const detail = initialProjection.details.get(SubTotalType.TaxesAndProfitSharing_ProfitSharing)
        .get(forecast.employees.list[0].globalId);
      expect(detail).not.toBeUndefined();
      expect(detail[0].amount).toBeCloseTo(0);
      expect(detail[1].amount).toBeCloseTo(0);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[0].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing_ProfitSharing[1].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing[0].amount).toBe(0);
      expect(initialProjection.TaxesAndProfitSharing[1].amount).toBe(0);
    });
  });
});
