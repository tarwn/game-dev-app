import type { WritableDraft } from "immer/dist/internal";
import { roundCurrency } from "../../../../../../utilities/currency";
import { FundingRepaymentType, ICashForecast, IFundingItem, SalesRevenueShareType } from "../../_types/cashForecast";
import { IProjectedCashFlowData, SubTotalType } from "./types";

// shared logic for calculating funding shares + managing tiers
function calculateFundingShareOutflow(type: FundingRepaymentType, funding: IFundingItem, availableRevenue: number, paidSoFar: number) {
  let fundingOutflowAmount = 0;
  let revenueSubTotal = availableRevenue;
  let currentFundingOutflowTotal = paidSoFar;
  let priorTierCompleted = true;
  funding.repaymentTerms?.cashOut.list.forEach(co => {
    if (priorTierCompleted && revenueSubTotal > 0) {
      const tierLimitNotReached = co.limitFixedAmount.value === 0 || co.limitFixedAmount.value > currentFundingOutflowTotal;
      if (co.type.value == type && tierLimitNotReached) {
        const remainingAmountToLimit = roundCurrency(co.limitFixedAmount.value - currentFundingOutflowTotal);
        let shareAmount = roundCurrency(co.amount.value * revenueSubTotal * -1);
        if (co.limitFixedAmount.value !== 0 && remainingAmountToLimit > 0) {
          shareAmount = Math.max(shareAmount, -1 * remainingAmountToLimit);
        }
        fundingOutflowAmount += shareAmount;
        // reduce remaining sales gross for additional tier percents
        revenueSubTotal += shareAmount;
        // capture the outflow against the funding total for tier checks
        currentFundingOutflowTotal += -1 * shareAmount;
      }
      priorTierCompleted = co.limitFixedAmount.value > 0 && currentFundingOutflowTotal == co.limitFixedAmount.value;
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
  // platform shares apply to direct sales revenue only
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
