import { getUtcDate } from "../../../../../../../utilities/date";
import { createObjectList } from "../../../../../../_stores/eventStore/helpers";
import { BasicDateOption, FundingRepaymentType, LoanType } from "../../../_types/cashForecast";
import type { IEstimatedRevenuePlatform, IFundingItem } from "../../../_types/cashForecast";
import { calculateFundingShareOutflow, calculatePublisherOutflow } from "../outRevenueShares";
import {
  createEstRevPlatform,
  createEstRevShare,
  createFunding,
  createFundingRepaymentCashOut,
  createFundingRepaymentTerms
} from "../../../../../../../testUtils/helpers";

describe("outRevenueShare", () => {
  describe("calculateFundingShareOutflow", () => {
    it("calculates a basic share correctly", () => {
      const fundings = createObjectList<IFundingItem>("p", "g");
      const funding = createFunding(fundings, LoanType.OneTime, getUtcDate(2020, 5, 1), 1_000.00);
      funding.repaymentTerms =
        createFundingRepaymentTerms(funding, FundingRepaymentType.GrossRevenueAfterSales, getUtcDate(2020, 5, 1), 0.50, 0);

      const portfolioShare = calculateFundingShareOutflow(FundingRepaymentType.GrossRevenueAfterSales, funding, 5_000, 0);

      expect(portfolioShare).toBe(-2500);
    });

    it("stops at a limit", () => {
      const fundings = createObjectList<IFundingItem>("p", "g");
      const funding = createFunding(fundings, LoanType.OneTime, getUtcDate(2020, 5, 1), 1_000.00);
      funding.repaymentTerms =
        createFundingRepaymentTerms(funding, FundingRepaymentType.GrossRevenueAfterSales, getUtcDate(2020, 5, 1), 0.50, 100);

      const portfolioShare = calculateFundingShareOutflow(FundingRepaymentType.GrossRevenueAfterSales, funding, 5_000, 0);

      expect(portfolioShare).toBe(-100);
    });


    // TODO - note - there is the possibility of confusing this by transitioning from a later type to earlier in two tiers

    it("stops calculating when it hits a different tier type", () => {
      const fundings = createObjectList<IFundingItem>("p", "g");
      const funding = createFunding(fundings, LoanType.OneTime, getUtcDate(2020, 5, 1), 0.00);
      funding.repaymentTerms =
        createFundingRepaymentTerms(funding, FundingRepaymentType.GrossRevenueAfterSales, getUtcDate(2020, 5, 1), 1.00, 100);
      funding.repaymentTerms.cashOut.list.push(
        createFundingRepaymentCashOut(funding.repaymentTerms.cashOut, FundingRepaymentType.GrossRevenueAfterDistributor,
          getUtcDate(2020, 5, 1), 1.00, 200)
      );
      funding.repaymentTerms.cashOut.list.push(
        createFundingRepaymentCashOut(funding.repaymentTerms.cashOut, FundingRepaymentType.GrossRevenueAfterSales,
          getUtcDate(2020, 5, 1), 1.00, 0)
      );

      const portfolioShare = calculateFundingShareOutflow(FundingRepaymentType.GrossRevenueAfterSales, funding, 5_000, 0);

      expect(portfolioShare).toBe(-100);
    });

    it("splits across two tiers as expected", () => {
      const fundings = createObjectList<IFundingItem>("p", "g");
      const funding = createFunding(fundings, LoanType.OneTime, getUtcDate(2020, 5, 1), 0.00);
      funding.repaymentTerms =
        createFundingRepaymentTerms(funding, FundingRepaymentType.GrossRevenueAfterSales, getUtcDate(2020, 5, 1), 0.50, 500);
      funding.repaymentTerms.cashOut.list.push(
        createFundingRepaymentCashOut(funding.repaymentTerms.cashOut, FundingRepaymentType.GrossRevenueAfterSales,
          getUtcDate(2020, 5, 1), 1.00, 2_000)
      );

      const portfolioShare = calculateFundingShareOutflow(FundingRepaymentType.GrossRevenueAfterSales, funding, 2_000, 0);

      expect(portfolioShare).toBe(-500 + -1000);
    });

  });

  describe("calculatePublisherOutflow", () => {
    it("calculates an unlimited share correctly", () => {
      const list = createObjectList<IEstimatedRevenuePlatform>("p", "g");
      const platform = createEstRevPlatform(list, BasicDateOption.Date, getUtcDate(2020, 5, 1), 1.00);
      platform.revenueShares.list.push(createEstRevShare(platform, 0.50, 0));

      const share = calculatePublisherOutflow(platform, 1_000, 0);

      expect(share).toBe(-500);
    });

    it("calculates a limited share correctly", () => {
      const list = createObjectList<IEstimatedRevenuePlatform>("p", "g");
      const platform = createEstRevPlatform(list, BasicDateOption.Date, getUtcDate(2020, 5, 1), 1.00);
      platform.revenueShares.list.push(createEstRevShare(platform, 0.50, 100));

      const share = calculatePublisherOutflow(platform, 1_000, 0);

      expect(share).toBe(-100);
    });

    it("calculates limited shares across tiers correctly", () => {
      const list = createObjectList<IEstimatedRevenuePlatform>("p", "g");
      const platform = createEstRevPlatform(list, BasicDateOption.Date, getUtcDate(2020, 5, 1), 1.00);
      platform.revenueShares.list.push(createEstRevShare(platform, 0.30, 100));
      platform.revenueShares.list.push(createEstRevShare(platform, 0.20, 200));
      platform.revenueShares.list.push(createEstRevShare(platform, 0.25, 300));

      const totalSales = 100 / .3 + 100 / .2 + 100 / .25 + 100;
      const share = calculatePublisherOutflow(platform, totalSales, 0);

      expect(share).toBe(-300);
    });
  });
});
