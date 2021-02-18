import produce from "immer";
import { enableMapSet } from "immer";
import type { WritableDraft } from "immer/dist/types/types-external";
import { roundCurrency } from "../../../../../utilities/currency";
import { getUtcDate } from "../../../../../utilities/date";
import { FundingRepaymentType, ICashForecast, IFundingItem, LoanRepaymentType, LoanType, RevenueModelType, SalesRevenueShareType } from "../_types/cashForecast";

enableMapSet();

export interface IProjectedCashFlowData {
  lastCalculated: Date;
  calculationTime: number;
  // strongly typed version
  BeginningCash_Balances: Array<ICashValue>;
  BeginningCash: Array<ICashValue>;
  OtherCash_LoanIn: Array<ICashValue>;
  OtherCash_LoanOut: Array<ICashValue>;
  OtherCash_FundingIn: Array<ICashValue>;
  OtherCash: Array<ICashValue>;
  GrossRevenue_SalesRevenue: Array<ICashValue>;
  GrossRevenue_PlatformShares: Array<ICashValue>;
  GrossRevenue_RevenueAfterPlatform: Array<ICashValue>;
  GrossRevenue_DistributionShares: Array<ICashValue>;
  GrossRevenue_RevenueAfterDistribution: Array<ICashValue>;
  GrossRevenue_PublisherShares: Array<ICashValue>;
  GrossRevenue_RevenueAfterPublisher: Array<ICashValue>;
  GrossRevenue: Array<ICashValue>;
  GrossProfit_DirectEmployees: Array<ICashValue>;
  GrossProfit_DirectContractors: Array<ICashValue>;
  GrossProfit_DirectExpenses: Array<ICashValue>;
  GrossProfit: Array<ICashValue>;
  NetProfit_IndirectEmployees: Array<ICashValue>;
  NetProfit_IndirectContractors: Array<ICashValue>;
  NetProfit_IndirectExpenses: Array<ICashValue>;
  NetProfit: Array<ICashValue>;
  TaxesAndProfitSharing_Taxes: Array<ICashValue>;
  TaxesAndProfitSharing_ProfitSharing: Array<ICashValue>;
  TaxesAndProfitSharing: Array<ICashValue>;
  EndingCash: Array<ICashValue>;
  // line items by SubType + GlobalId
  details: Map<SubTotalType, Map<string, Array<ICashValue>>>;
}

export enum SubTotalType {
  BeginningCash_Balances,
  BeginningCash,
  OtherCash_LoanIn,
  OtherCash_LoanOut,
  OtherCash_FundingIn,
  OtherCash,
  GrossRevenue_SalesRevenue,
  GrossRevenue_PlatformShares,
  GrossRevenue_RevenueAfterPlatform,
  GrossRevenue_DistributionShares,
  GrossRevenue_RevenueAfterDistribution,
  GrossRevenue_PublisherShares,
  GrossRevenue_RevenueAfterPublisher,
  GrossRevenue,
  GrossProfit_DirectEmployees,
  GrossProfit_DirectContractors,
  GrossProfit_DirectExpenses,
  GrossProfit,
  NetProfit_IndirectEmployees,
  NetProfit_IndirectContractors,
  NetProfit_IndirectExpenses,
  NetProfit,
  TaxesAndProfitSharing_Taxes,
  TaxesAndProfitSharing_ProfitSharing,
  TaxesAndProfitSharing,
  EndingCash
}

export interface ICashValue {
  amount: number;
  note?: string;
}

export function getEmptyProjection(): IProjectedCashFlowData {
  return {
    lastCalculated: new Date(),
    calculationTime: -1,
    BeginningCash_Balances: new Array<ICashValue>(),
    BeginningCash: new Array<ICashValue>(),
    OtherCash_LoanIn: new Array<ICashValue>(),
    OtherCash_LoanOut: new Array<ICashValue>(),
    OtherCash_FundingIn: new Array<ICashValue>(),
    OtherCash: new Array<ICashValue>(),
    GrossRevenue_SalesRevenue: new Array<ICashValue>(),
    GrossRevenue_PlatformShares: new Array<ICashValue>(),
    GrossRevenue_RevenueAfterPlatform: new Array<ICashValue>(),
    GrossRevenue_DistributionShares: new Array<ICashValue>(),
    GrossRevenue_RevenueAfterDistribution: new Array<ICashValue>(),
    GrossRevenue_PublisherShares: new Array<ICashValue>(),
    GrossRevenue_RevenueAfterPublisher: new Array<ICashValue>(),
    GrossRevenue: new Array<ICashValue>(),
    GrossProfit_DirectEmployees: new Array<ICashValue>(),
    GrossProfit_DirectContractors: new Array<ICashValue>(),
    GrossProfit_DirectExpenses: new Array<ICashValue>(),
    GrossProfit: new Array<ICashValue>(),
    NetProfit_IndirectEmployees: new Array<ICashValue>(),
    NetProfit_IndirectContractors: new Array<ICashValue>(),
    NetProfit_IndirectExpenses: new Array<ICashValue>(),
    NetProfit: new Array<ICashValue>(),
    TaxesAndProfitSharing_Taxes: new Array<ICashValue>(),
    TaxesAndProfitSharing_ProfitSharing: new Array<ICashValue>(),
    TaxesAndProfitSharing: new Array<ICashValue>(),
    EndingCash: new Array<ICashValue>(),
    // line items by SubType + GlobalId
    details: new Map<SubTotalType, Map<string, Array<ICashValue>>>()
  };
}

function getEmptyValues(count: number): Array<ICashValue> {
  return Array.from(Array(count).keys()).map(() => ({ amount: 0 }));
}

export function calculate(forecast: ICashForecast, previousProjection: IProjectedCashFlowData, forecastMonthCount: number): IProjectedCashFlowData {
  const nextState = produce(previousProjection, draftState => {
    const t0 = performance.now();

    const startDate = forecast.forecastStartDate.value;

    // ensures all subtotals + details from latest forecast are setup
    //  also removes details from prior forecasts that have been deleted
    //  and resizes all arrays if forecast length has changed
    resizeProjection(draftState, forecast, forecastMonthCount);

    // cache payments against funding shares to hit tier limits
    const fundingPayOuts = new Map<string, number>();

    // update all values
    for (let i = 0; i < forecastMonthCount; i++) {
      const monthStart = getUtcDate(startDate.getUTCFullYear(), startDate.getUTCMonth() + i, 1);
      const monthEnd = getUtcDate(startDate.getUTCFullYear(), startDate.getUTCMonth() + i + 1, 1);
      // - Beginning Cash
      // bank balance
      applyBankBalance(draftState, forecast, i, monthStart, monthEnd);

      // - cash
      // loans - in + out
      applyLoansIn(draftState, forecast, i, monthStart, monthEnd);
      applyLoansOut(draftState, forecast, i, monthStart, monthEnd);
      // funding - in
      applyFundingIn(draftState, forecast, i, monthStart, monthEnd);
      // other cash subtotal
      draftState.OtherCash[i] = {
        amount: draftState.OtherCash_LoanIn[i].amount +
          draftState.OtherCash_LoanOut[i].amount +
          draftState.OtherCash_FundingIn[i].amount
      };

      // - gross rev
      // revenues - in
      applySalesRevenue(draftState, forecast, i, monthStart, monthEnd);
      applyPlatformShares(draftState, forecast, i, fundingPayOuts);
      draftState.GrossRevenue_RevenueAfterPlatform[i] = {
        amount: draftState.GrossRevenue_SalesRevenue[i].amount +
          draftState.GrossRevenue_PlatformShares[i].amount
      };
      // revenues distribution out
      // TODO: funding distribution out
      applyDistributionShares(draftState, forecast, i);
      draftState.GrossRevenue_RevenueAfterDistribution[i] = {
        amount: draftState.GrossRevenue_RevenueAfterPlatform[i].amount +
          draftState.GrossRevenue_DistributionShares[i].amount
      };
      // funding publish out
      draftState.GrossRevenue_PublisherShares[i] = { amount: 0 };
      draftState.GrossRevenue_RevenueAfterPublisher[i] = {
        amount: draftState.GrossRevenue_RevenueAfterDistribution[i].amount +
          draftState.GrossRevenue_PublisherShares[i].amount
      };
      // gross revenue subtotal
      draftState.GrossRevenue[i] = {
        amount: draftState.GrossRevenue_RevenueAfterPublisher[i].amount
      };

      // - gross profit
      // people.employees
      draftState.GrossProfit_DirectEmployees[i] = { amount: 0 };
      // people.contractors
      draftState.GrossProfit_DirectContractors[i] = { amount: 0 };
      // expenses
      draftState.GrossProfit_DirectExpenses[i] = { amount: 0 };
      // subtotal
      draftState.GrossProfit[i] = {
        amount: draftState.GrossRevenue[i].amount +
          draftState.GrossProfit_DirectEmployees[i].amount +
          draftState.GrossProfit_DirectContractors[i].amount +
          draftState.GrossProfit_DirectExpenses[i].amount
      };

      // - net profit
      // people.employees
      draftState.NetProfit_IndirectEmployees[i] = { amount: 0 };
      // people.contractors
      draftState.NetProfit_IndirectContractors[i] = { amount: 0 };
      // expenses
      draftState.NetProfit_IndirectExpenses[i] = { amount: 0 };
      // subtotal
      draftState.NetProfit[i] = {
        amount: draftState.GrossProfit[i].amount +
          draftState.NetProfit_IndirectEmployees[i].amount +
          draftState.NetProfit_IndirectContractors[i].amount +
          draftState.NetProfit_IndirectExpenses[i].amount
      };

      // - taxes + profit sharing
      // taxes
      draftState.TaxesAndProfitSharing_Taxes[i] = { amount: 0 };
      // people.employees
      draftState.TaxesAndProfitSharing_ProfitSharing[i] = { amount: 0 };
      // subtotal
      draftState.TaxesAndProfitSharing[i] = {
        amount: draftState.TaxesAndProfitSharing_Taxes[i].amount +
          draftState.TaxesAndProfitSharing_ProfitSharing[i].amount
      };

      // - ending cash
      draftState.EndingCash[i] = {
        amount: draftState.BeginningCash[i].amount +
          draftState.OtherCash[i].amount +
          draftState.NetProfit[i].amount
      };

      // debug
      // console.log({
      //   detail: draftState.details.get(SubTotalType.BeginningCash_Balances).get(forecast.bankBalance.globalId)[i].amount,
      //   subB: draftState.BeginningCash_Balances[i].amount,
      //   sub: draftState.BeginningCash[i].amount,
      //   end: draftState.EndingCash[i].amount
      // });

    }

    draftState.lastCalculated = new Date();
    draftState.calculationTime = performance.now() - t0;
  });
  return nextState;
}



function resizeProjection(draftState: WritableDraft<IProjectedCashFlowData>, forecast: ICashForecast, forecastMonthCount: number) {
  const subTotalDetailIds = new Map<SubTotalType, string[]>([
    [SubTotalType.BeginningCash_Balances, new Array<string>()],
    // [SubTotalType.BeginningCash, new Array<string>()],
    [SubTotalType.OtherCash_LoanIn, new Array<string>()],
    [SubTotalType.OtherCash_LoanOut, new Array<string>()],
    [SubTotalType.OtherCash_FundingIn, new Array<string>()],
    // [SubTotalType.OtherCash, new Array<string>()],
    [SubTotalType.GrossRevenue_SalesRevenue, new Array<string>()],
    [SubTotalType.GrossRevenue_PlatformShares, new Array<string>()],
    // [SubTotalType.GrossRevenue_RevenueAfterPlatform, new Array<string>()],
    [SubTotalType.GrossRevenue_DistributionShares, new Array<string>()],
    // [SubTotalType.GrossRevenue_RevenueAfterDistribution, new Array<string>()],
    [SubTotalType.GrossRevenue_PublisherShares, new Array<string>()],
    // [SubTotalType.GrossRevenue_RevenueAfterPublisher, new Array<string>()],
    // [SubTotalType.GrossRevenue, new Array<string>()],
    // [SubTotalType.GrossProfit_DirectEmployees, new Array<string>()],
    // [SubTotalType.GrossProfit_DirectContractors, new Array<string>()],
    // [SubTotalType.GrossProfit_DirectExpenses, new Array<string>()],
    // [SubTotalType.GrossProfit, new Array<string>()],
    // [SubTotalType.NetProfit_IndirectEmployees, new Array<string>()],
    // [SubTotalType.NetProfit_IndirectContractors, new Array<string>()],
    // [SubTotalType.NetProfit_IndirectExpenses, new Array<string>()],
    // [SubTotalType.NetProfit, new Array<string>()],
    // [SubTotalType.TaxesAndProfitSharing_Taxes, new Array<string>()],
    // [SubTotalType.TaxesAndProfitSharing_ProfitSharing, new Array<string>()],
    // [SubTotalType.TaxesAndProfitSharing, new Array<string>()],
    // [SubTotalType.EndingCash, new Array<string>()],
  ]);
  function appendForInit(type: SubTotalType, ids: string[]) {
    subTotalDetailIds.set(type, subTotalDetailIds.get(type).concat(ids));
  }

  // beginning cash
  draftState.BeginningCash = sizeSubTotal(draftState.BeginningCash, forecastMonthCount);
  draftState.BeginningCash_Balances = sizeSubTotal(draftState.BeginningCash_Balances, forecastMonthCount);
  appendForInit(SubTotalType.BeginningCash_Balances, [forecast.bankBalance.globalId]);

  // gross revenue sub-totals
  draftState.GrossRevenue_SalesRevenue = sizeSubTotal(draftState.GrossRevenue_SalesRevenue, forecastMonthCount);
  draftState.GrossRevenue_PlatformShares = sizeSubTotal(draftState.GrossRevenue_PlatformShares, forecastMonthCount);
  draftState.GrossRevenue_RevenueAfterPlatform = sizeSubTotal(draftState.GrossRevenue_RevenueAfterPlatform, forecastMonthCount);
  draftState.GrossRevenue_DistributionShares = sizeSubTotal(draftState.GrossRevenue_DistributionShares, forecastMonthCount);
  draftState.GrossRevenue_RevenueAfterDistribution = sizeSubTotal(draftState.GrossRevenue_RevenueAfterDistribution, forecastMonthCount);
  draftState.GrossRevenue_PublisherShares = sizeSubTotal(draftState.GrossRevenue_PublisherShares, forecastMonthCount);
  draftState.GrossRevenue_RevenueAfterPublisher = sizeSubTotal(draftState.GrossRevenue_RevenueAfterPublisher, forecastMonthCount);
  draftState.GrossRevenue = sizeSubTotal(draftState.GrossRevenue, forecastMonthCount);
  // gross revenue details
  //  SalesRevenue
  appendForInit(SubTotalType.GrossRevenue_SalesRevenue, forecast.revenues.list.map(rev => rev.globalId));
  appendForInit(SubTotalType.GrossRevenue_PlatformShares,
    forecast.funding.list
      .filter(f => f.repaymentTerms?.cashOut.list.some(co => co.type.value === FundingRepaymentType.GrossRevenueAfterSales))
      .map(funding => funding.globalId)
  );
  appendForInit(SubTotalType.GrossRevenue_PlatformShares, forecast.revenues.list.map(rev => rev.globalId));
  appendForInit(SubTotalType.GrossRevenue_DistributionShares, forecast.revenues.list.map(rev => rev.globalId));
  appendForInit(SubTotalType.GrossRevenue_DistributionShares,
    forecast.funding.list
      .filter(f => f.repaymentTerms?.cashOut.list.some(co => co.type.value === FundingRepaymentType.GrossRevenueAfterPlatform))
      .map(funding => funding.globalId)
  );

  // gross profit


  // loan in
  draftState.OtherCash_LoanIn = sizeSubTotal(draftState.OtherCash_LoanIn, forecastMonthCount);
  appendForInit(SubTotalType.OtherCash_LoanIn, forecast.loans.list.map(loan => loan.globalId));

  // loan out
  draftState.OtherCash_LoanOut = sizeSubTotal(draftState.OtherCash_LoanOut, forecastMonthCount);
  appendForInit(SubTotalType.OtherCash_LoanOut, forecast.loans.list.map(loan => loan.globalId));

  // funding in
  draftState.OtherCash_FundingIn = sizeSubTotal(draftState.OtherCash_FundingIn, forecastMonthCount);
  appendForInit(SubTotalType.OtherCash_FundingIn, forecast.funding.list.map(funding => funding.globalId));

  // Ending Cash
  draftState.EndingCash = sizeSubTotal(draftState.EndingCash, forecastMonthCount);

  // add in all the details
  subTotalDetailIds.forEach((ids, type) => {
    sizeSubTotalDetails(draftState, type, ids, forecastMonthCount);
  });
}

function sizeSubTotal(subtotal: ICashValue[], forecastMonthCount: number): ICashValue[] {
  if (subtotal.length != forecastMonthCount) {
    return getEmptyValues(forecastMonthCount);
  }
  return subtotal;
}

// eslint-disable-next-line max-len
function sizeSubTotalDetails(draftState: WritableDraft<IProjectedCashFlowData>, type: SubTotalType, relevantIds: string[], forecastMonthCount) {
  if (!draftState.details.has(type)) {
    draftState.details.set(type, new Map<string, Array<ICashValue>>(
      relevantIds.map(id => [id, getEmptyValues(forecastMonthCount)])
    ));
  }
  else {
    const correctIds = new Set<string>(relevantIds);
    const draftDetails = draftState.details.get(type);
    // if we have an item that's not present any more, remove from projection
    Array.from(draftDetails.keys()).forEach(k => {
      if (!correctIds.has(k))
        draftDetails.delete(k);
    });
    // if we're missing one: add it, if it's there: verify size
    relevantIds.forEach(id => {
      sizeDetail(draftDetails, id, forecastMonthCount);
    });
  }
}

function sizeDetail(draftDetails: Map<string, Array<ICashValue>>, globalId: string, forecastMonthCount: number) {
  if (!draftDetails.has(globalId)) {
    draftDetails.set(globalId, getEmptyValues(forecastMonthCount));
  }
  else if (draftDetails.get(globalId).length > forecastMonthCount) {
    draftDetails.set(globalId, getEmptyValues(forecastMonthCount));
  }
  else if (draftDetails.get(globalId).length < forecastMonthCount) {
    draftDetails.set(globalId, getEmptyValues(forecastMonthCount));
  }
}

function applyBankBalance(draftState: WritableDraft<IProjectedCashFlowData>, forecast: ICashForecast,
  i: number, monthStart: Date, monthEnd: Date
) {
  draftState.details.get(SubTotalType.BeginningCash_Balances).get(forecast.bankBalance.globalId)[i].amount =
    (forecast.bankBalance.date.value >= monthStart && forecast.bankBalance.date.value < monthEnd)
      ? forecast.bankBalance.amount.value
      : 0;

  draftState.BeginningCash_Balances[i].amount =
    draftState.details.get(SubTotalType.BeginningCash_Balances).get(forecast.bankBalance.globalId)[i].amount;

  draftState.BeginningCash[i].amount =
    draftState.BeginningCash_Balances[i].amount +
    (i === 0 ? 0 : draftState.EndingCash[i - 1].amount);
}

function applySalesRevenue(draftState: WritableDraft<IProjectedCashFlowData>, forecast: ICashForecast,
  i: number, monthStart: Date, monthEnd: Date
) {
  draftState.GrossRevenue_SalesRevenue[i].amount = 0;
  forecast.revenues.list.forEach(revenue => {
    const detail = draftState.details.get(SubTotalType.GrossRevenue_SalesRevenue).get(revenue.globalId)[i];
    detail.amount = 0;
    switch (revenue.type.value) {
      case RevenueModelType.ExplicitValues:
        detail.amount = revenue.values.list.reduce((ttl, v) => {
          if (v.date.value >= monthStart && v.date.value < monthEnd) {
            return ttl + v.amount.value;
          }
          return ttl;
        }, 0);
        break;
    }
    draftState.GrossRevenue_SalesRevenue[i].amount += detail.amount;
  });
}

function applyPlatformShares(draftState: WritableDraft<IProjectedCashFlowData>, forecast: ICashForecast, i: number, fundingOutflowCache: Map<string, number>) {
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

function calculateFundingShareOutflow(type: FundingRepaymentType, funding: IFundingItem, availableRevenue: number, paidSoFar: number) {
  let fundingOutflowAmount = 0;
  let revenueSubTotal = availableRevenue;
  let currentFundingOutflowTotal = paidSoFar;
  let priorTierCompleted = true;
  funding.repaymentTerms?.cashOut.list.forEach(co => {
    if (priorTierCompleted && revenueSubTotal > 0) {
      const tierLimitNotReached = co.limitFixedAmount.value === 0 || co.limitFixedAmount.value > currentFundingOutflowTotal;
      if (co.type.value == FundingRepaymentType.GrossRevenueAfterSales && tierLimitNotReached) {
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

function applyDistributionShares(draftState: WritableDraft<IProjectedCashFlowData>, forecast: ICashForecast, i: number) {
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
  // funding out - applies to all sales revenue?
  forecast.funding.list.forEach(funding => {
    // quick/dirty check to see if distribution shares can apply by checking if we created a collection for it
    if (draftState.details.get(SubTotalType.GrossRevenue_DistributionShares).has(funding.globalId)) {
      const salesGrossSubTotal = draftState.GrossRevenue_SalesRevenue[i];
      const platformShareDetail = draftState.details.get(SubTotalType.GrossRevenue_DistributionShares).get(funding.globalId)[i];
      const postPlatformAmount = salesGrossSubTotal.amount - platformShareDetail.amount;
      const detail = draftState.details.get(SubTotalType.GrossRevenue_DistributionShares).get(funding.globalId)[i];
      detail.amount = 0;
      funding.repaymentTerms?.cashOut.list.forEach(co => {
        // checking funding SoFarAmt to find cashOut to apply
        //  mark as found so we can exit out of further checks
        //  if it's distribution share
        //    calc share
        //    if funding SoFarAmt + share > cashOut.limit
        //      mark as not found
        //      add difference to detail
        //      add difference to SoFarAmt
        //      add note: "Funding tier limit reached on 'funding'"
        //      // this will allow it to loop to next cashout if applicable
        //    else
        //      add share to detail
        //      add share to SoFarAmt
        // - now do same thing to all the other buckets + test cases where buckets overflow/hit limits
        if (co.type.value == FundingRepaymentType.GrossRevenueAfterSales) {
          detail.amount += roundCurrency(co.amount.value * postPlatformAmount);
        }
      });
      draftState.GrossRevenue_DistributionShares[i].amount += detail.amount;
    }
  });
}

function applyLoansIn(draftState: WritableDraft<IProjectedCashFlowData>, forecast: ICashForecast,
  i: number, monthStart: Date, monthEnd: Date
) {
  draftState.OtherCash_LoanIn[i].amount = 0;
  forecast.loans.list.forEach(loan => {
    const detail = draftState.details.get(SubTotalType.OtherCash_LoanIn).get(loan.globalId)[i];
    const monthlyLoanEnd = getUtcDate(
      loan.cashIn.list[0].date.value.getUTCFullYear(),
      loan.cashIn.list[0].date.value.getUTCMonth() + loan.numberOfMonths.value - 1,
      loan.cashIn.list[0].date.value.getUTCDate()
    );
    detail.amount = 0;

    switch (loan.type.value) {
      case LoanType.OneTime:
        if (loan.cashIn.list[0].date.value >= monthStart && loan.cashIn.list[0].date.value < monthEnd) {
          detail.amount = loan.cashIn.list[0].amount.value;
        }
        break;
      case LoanType.Monthly:
        if (loan.cashIn.list[0].date.value < monthEnd && monthlyLoanEnd >= monthStart) {
          detail.amount = loan.cashIn.list[0].amount.value;
        }
        break;
      case LoanType.Multiple:
        detail.amount = loan.cashIn.list.reduce((ttl, cashIn) => {
          if (cashIn.date.value >= monthStart && cashIn.date.value < monthEnd) {
            return ttl + cashIn.amount.value;
          }
          return ttl;
        }, 0);
        break;
    }

    draftState.OtherCash_LoanIn[i].amount += detail.amount;
  });
}

function applyLoansOut(draftState: WritableDraft<IProjectedCashFlowData>, forecast: ICashForecast,
  i: number, monthStart: Date, monthEnd: Date
) {
  draftState.OtherCash_LoanOut[i].amount = 0;
  forecast.loans.list.forEach(loan => {
    const detail = draftState.details.get(SubTotalType.OtherCash_LoanOut).get(loan.globalId)[i];
    detail.amount = 0;

    loan.repaymentTerms?.cashOut.list.forEach(co => {
      const monthlyLoanEnd = getUtcDate(
        co.startDate.value.getUTCFullYear(),
        co.startDate.value.getUTCMonth() + co.numberOfMonths.value - 1,
        co.startDate.value.getUTCDate()
      );
      switch (co.type.value) {
        case LoanRepaymentType.OneTime:
          if (co.startDate.value >= monthStart && co.startDate.value < monthEnd) {
            detail.amount += 0 - co.amount.value;
          }
          break;
        case LoanRepaymentType.Monthly:
          if (co.startDate.value < monthEnd && monthlyLoanEnd >= monthStart) {
            detail.amount += 0 - co.amount.value;
          }

          break;
      }
    });

    draftState.OtherCash_LoanOut[i].amount += detail.amount;
  });
}

function applyFundingIn(draftState: WritableDraft<IProjectedCashFlowData>, forecast: ICashForecast,
  i: number, monthStart: Date, monthEnd: Date
) {
  draftState.OtherCash_FundingIn[i].amount = 0;
  forecast.funding.list.forEach(funding => {
    const detail = draftState.details.get(SubTotalType.OtherCash_FundingIn).get(funding.globalId)[i];
    detail.amount = 0;

    switch (funding.type.value) {
      case LoanType.OneTime:
        if (funding.cashIn.list[0].date.value >= monthStart && funding.cashIn.list[0].date.value < monthEnd) {
          detail.amount = funding.cashIn.list[0].amount.value;
        }
        break;
      case LoanType.Monthly:
        throw new Error("Monthly is not a valid type for a Funding");
      case LoanType.Multiple:
        detail.amount = funding.cashIn.list.reduce((ttl, cashIn) => {
          if (cashIn.date.value >= monthStart && cashIn.date.value < monthEnd) {
            return ttl + cashIn.amount.value;
          }
          return ttl;
        }, 0);
        break;
    }

    draftState.OtherCash_FundingIn[i].amount += detail.amount;
  });
}
