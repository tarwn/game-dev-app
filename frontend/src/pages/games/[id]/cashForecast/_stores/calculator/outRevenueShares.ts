import type { WritableDraft } from "immer/dist/internal";
import { roundCurrency } from "../../../../../../utilities/currency";
import { FundingRepaymentType, SalesRevenueShareType } from "../../_types/cashForecast";
import type {
  ICashForecast,
  IEstimatedRevenuePlatform,
  IFundingItem
} from "../../_types/cashForecast";
import { SubTotalType } from "./types";
import type { IProjectedCashFlowData } from "./types";

// shared logic for calculating funding shares + managing tiers
// eslint-disable-next-line max-len
export function calculateFundingShareOutflow(type: FundingRepaymentType, funding: IFundingItem, availableRevenue: number, paidSoFar: number): number {
  if (availableRevenue === 0) return 0;

  let fundingOutflowAmount = 0;
  let remainingRevenue = availableRevenue;
  let currentFundingOutflowTotal = paidSoFar;
  let canContinueToNextTier = true;
  funding.repaymentTerms?.cashOut.list.forEach(co => {
    if (canContinueToNextTier && remainingRevenue > 0) {
      // unlimited
      if (co.type.value == type && co.limitFixedAmount.value === 0) {
        const fullAmount = roundCurrency(co.amount.value * remainingRevenue);
        remainingRevenue = 0;
        fundingOutflowAmount += -1 * fullAmount;
        currentFundingOutflowTotal += fullAmount;
      }
      // limited but we're still in the limit
      else if (co.type.value == type && co.limitFixedAmount.value > currentFundingOutflowTotal) {
        const remainingAmountToLimit = roundCurrency(co.limitFixedAmount.value - currentFundingOutflowTotal);
        const idealShare = roundCurrency(co.amount.value * remainingRevenue);
        let partialAmount = 0;
        if (idealShare > remainingAmountToLimit) {
          partialAmount = remainingAmountToLimit;
          // subtract amount of revenue we would have evaluated to get this share
          remainingRevenue -= remainingAmountToLimit / co.amount.value;
        }
        else {
          partialAmount = idealShare;
          remainingRevenue = 0;
        }
        fundingOutflowAmount += -1 * partialAmount;
        currentFundingOutflowTotal += partialAmount;
      }
      // type change and we haven't fully satisfied it yet - exit
      else if (co.type.value != type && co.limitFixedAmount.value > currentFundingOutflowTotal) {
        canContinueToNextTier = false;
      }
    }
  });
  return fundingOutflowAmount;
}

export function calculatePublisherOutflow(platform: IEstimatedRevenuePlatform, grossPlatformSales: number, paidSoFar: number): number {
  if (grossPlatformSales === 0) return 0;

  let fundingOutflowAmount = 0;
  let remainingSalesToCalc = grossPlatformSales;
  let currentFundingOutflowTotal = paidSoFar;
  platform.revenueShares.list.forEach(tier => {
    if (remainingSalesToCalc > 0) {
      // unlimited
      if (tier.untilAmount.value === 0) {
        const fullShare = tier.revenueShare.value * remainingSalesToCalc;
        remainingSalesToCalc = 0;
        fundingOutflowAmount += -1 * fullShare;
        currentFundingOutflowTotal += fullShare;
      }
      // limited and we haven't gone over this tier yet
      else if (tier.untilAmount.value > currentFundingOutflowTotal) {
        const remainingAmountToLimit = roundCurrency(tier.untilAmount.value - currentFundingOutflowTotal);
        // ideally we could do this much at this tier
        const idealShare = roundCurrency(tier.revenueShare.value * remainingSalesToCalc);
        let shareAmount = 0;
        // but if that's more then the remaining amount to limit, take the lesser
        if (idealShare > remainingAmountToLimit) {
          shareAmount = -1 * remainingAmountToLimit;
          remainingSalesToCalc -= roundCurrency(remainingAmountToLimit / tier.revenueShare.value);
        }
        else {
          shareAmount = -1 * idealShare;
          remainingSalesToCalc = 0;
        }
        // and apply it
        fundingOutflowAmount += shareAmount;
        // capture against total so far, which is positive
        currentFundingOutflowTotal += -1 * shareAmount;
      }
    }
  });
  return fundingOutflowAmount;
}

// Revenue + funding shares
export function applyPlatformShares(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  fundingOutflowCache: Map<string, number>
): void {
  draftState.GrossRevenue_PlatformShares[i].amount = 0;

  // revenue: platform shares apply to direct sales revenue only
  forecast.revenues.list.forEach(revenue => {
    const salesGrossDetail = draftState.details.get(SubTotalType.GrossRevenue_SalesRevenue).get(revenue.globalId)[i];
    const detail = draftState.details.get(SubTotalType.GrossRevenue_PlatformShares).get(revenue.globalId)[i];
    detail.amount = 0;
    revenue.revenueShare.list.forEach(rs => {
      switch (rs.type.value) {
        case SalesRevenueShareType.GrossRevenueAfterSales:
          detail.amount += roundCurrency(salesGrossDetail.amount * rs.percent.value * -1);
      }
    });
    draftState.GrossRevenue_PlatformShares[i].amount += detail.amount;
  });

  // estimated revenue: platform shares apply to estimated sales revenue only
  forecast.estimatedRevenue.platforms.list.forEach(platform => {
    const sales = draftState.details.get(SubTotalType.GrossRevenue_SalesRevenue).get(platform.globalId)[i];
    const detail = draftState.details.get(SubTotalType.GrossRevenue_PlatformShares).get(platform.globalId)[i];
    const paidSoFar = fundingOutflowCache.get(platform.globalId) ?? 0;
    const newOutflowAmount = calculatePublisherOutflow(platform, sales.amount, paidSoFar);
    detail.amount = newOutflowAmount; //-1 * sales.amount * platform.revenueShares.list[0].revenueShare.value;
    fundingOutflowCache.set(platform.globalId, paidSoFar - newOutflowAmount);  // newOutflowAmount is negative, outflow cache is positive
    draftState.GrossRevenue_PlatformShares[i].amount += detail.amount;
  });

  // funding shares apply to all sales revenue sources (subtotal)
  forecast.funding.list.forEach(funding => {
    // quick/dirty check to see if distribution shares can apply by checking if we created a collection for it
    if (draftState.details.get(SubTotalType.GrossRevenue_PlatformShares).has(funding.globalId)) {
      const paidSoFar = fundingOutflowCache.get(funding.globalId) ?? 0;
      const newOutflowAmount = calculateFundingShareOutflow(
        FundingRepaymentType.GrossRevenueAfterSales,
        funding, draftState.GrossRevenue_SalesRevenue[i].amount,
        paidSoFar
      );
      const detail = draftState.details.get(SubTotalType.GrossRevenue_PlatformShares).get(funding.globalId)[i];
      detail.amount = newOutflowAmount;
      fundingOutflowCache.set(funding.globalId, paidSoFar - newOutflowAmount);  // newOutflowAmount is negative, outflow cache is positive
      draftState.GrossRevenue_PlatformShares[i].amount += detail.amount;
    }
  });
}

// Revenue + funding shares
export function applyDistributionShares(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  fundingOutflowCache: Map<string, number>
): void {
  draftState.GrossRevenue_DistributionShares[i].amount = 0;
  // revenue - applies to direct revenue source only
  forecast.revenues.list.forEach(revenue => {
    // LATER/DOMAIN TODO - does distribution get a slice of sales gross or post platform?
    const salesGrossDetail = draftState.details.get(SubTotalType.GrossRevenue_SalesRevenue).get(revenue.globalId)[i];
    const platformShareDetail = draftState.details.get(SubTotalType.GrossRevenue_PlatformShares).get(revenue.globalId)[i];
    const postPlatformAmount = salesGrossDetail.amount - platformShareDetail.amount;
    const detail = draftState.details.get(SubTotalType.GrossRevenue_DistributionShares).get(revenue.globalId)[i];
    detail.amount = 0;
    revenue.revenueShare.list.forEach(rs => {
      switch (rs.type.value) {
        case SalesRevenueShareType.GrossRevenueAfterPlatform:
          detail.amount += roundCurrency(postPlatformAmount * rs.percent.value * -1);
      }
    });
    draftState.GrossRevenue_DistributionShares[i].amount += detail.amount;
  });
  // funding shares apply to all sales revenue sources (subtotal)
  forecast.funding.list.forEach(funding => {
    // quick/dirty check to see if distribution shares can apply by checking if we created a collection for it
    if (draftState.details.get(SubTotalType.GrossRevenue_DistributionShares).has(funding.globalId)) {
      const paidSoFar = fundingOutflowCache.get(funding.globalId) ?? 0;
      const newOutflowAmount = calculateFundingShareOutflow(
        FundingRepaymentType.GrossRevenueAfterPlatform,
        funding, draftState.GrossRevenue_RevenueAfterPlatform[i].amount,
        paidSoFar
      );
      const detail = draftState.details.get(SubTotalType.GrossRevenue_DistributionShares).get(funding.globalId)[i];
      detail.amount = newOutflowAmount;
      fundingOutflowCache.set(funding.globalId, paidSoFar - newOutflowAmount);  // newOutflowAmount is negative, outflow cache is positive
      draftState.GrossRevenue_DistributionShares[i].amount += detail.amount;
    }
  });
}

// funding shares
export function applyPublisherShares(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  fundingOutflowCache: Map<string, number>
): void {
  draftState.GrossRevenue_PublisherShares[i].amount = 0;
  // funding shares apply to all sales revenue sources (subtotal)
  forecast.funding.list.forEach(funding => {
    // quick/dirty check to see if distribution shares can apply by checking if we created a collection for it
    if (draftState.details.get(SubTotalType.GrossRevenue_PublisherShares).has(funding.globalId)) {
      const paidSoFar = fundingOutflowCache.get(funding.globalId) ?? 0;
      const newOutflowAmount = calculateFundingShareOutflow(
        FundingRepaymentType.GrossRevenueAfterDistributor,
        funding,
        draftState.GrossRevenue_RevenueAfterDistribution[i].amount,
        paidSoFar
      );
      const detail = draftState.details.get(SubTotalType.GrossRevenue_PublisherShares).get(funding.globalId)[i];
      detail.amount = newOutflowAmount;
      fundingOutflowCache.set(funding.globalId, paidSoFar - newOutflowAmount);  // newOutflowAmount is negative, outflow cache is positive
      draftState.GrossRevenue_PublisherShares[i].amount += detail.amount;
    }
  });
}

export function applyFundingFinalProfitShares(
  draftState: WritableDraft<IProjectedCashFlowData>,
  forecast: ICashForecast,
  i: number,
  fundingOutflowCache: Map<string, number>
): void {
  // do not reset, this is reset externally - draftState.TaxesAndProfitSharing_Taxes[i].amount = 0;
  // funding shares apply to all sales revenue sources (subtotal)
  forecast.funding.list.forEach(funding => {
    // quick/dirty check to see if shares can apply by checking if we created a collection for it
    if (draftState.details.get(SubTotalType.TaxesAndProfitSharing_ProfitSharing).has(funding.globalId)) {
      const paidSoFar = fundingOutflowCache.get(funding.globalId) ?? 0;
      const newOutflowAmount =
        calculateFundingShareOutflow(FundingRepaymentType.GrossProfitShare, funding, draftState.GrossProfit[i].amount, paidSoFar) +
        calculateFundingShareOutflow(FundingRepaymentType.NetProfitShare, funding, draftState.NetProfit[i].amount, paidSoFar);
      const detail = draftState.details.get(SubTotalType.TaxesAndProfitSharing_ProfitSharing).get(funding.globalId)[i];
      detail.amount = newOutflowAmount;
      fundingOutflowCache.set(funding.globalId, paidSoFar - newOutflowAmount);  // newOutflowAmount is negative, outflow cache is positive
      draftState.TaxesAndProfitSharing_ProfitSharing[i].amount += detail.amount;
    }
  });
}
