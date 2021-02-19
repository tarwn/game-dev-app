import produce from "immer";
import { enableMapSet } from "immer";
import type { WritableDraft } from "immer/dist/types/types-external";
import { getUtcDate } from "../../../../../../utilities/date";
import { ExpenseCategory, FundingRepaymentType, ICashForecast } from "../../_types/cashForecast";
import { applyBankBalance } from "./inBankBalance";
import { applyFundingIn } from "./inFunding";
import { applyLoansIn } from "./inLoans";
import { applySalesRevenue } from "./inRevenue";
import { applyDirectEmployeesOut } from "./outEmployee";
import { applyLoansOut } from "./outLoans";
import { applyDistributionShares, applyPlatformShares, applyPublisherShares } from "./outRevenueShares";
import type { ICashValue, IProjectedCashFlowData } from "./types";
import { SubTotalType } from "./types";

enableMapSet();

function getEmptyValues(count: number): Array<ICashValue> {
  return Array.from(Array(count).keys()).map(() => ({ amount: 0 }));
}

export function calculate(
  forecast: ICashForecast,
  previousProjection: IProjectedCashFlowData,
  forecastMonthCount: number
): IProjectedCashFlowData {
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
      // funding distribution out
      applyDistributionShares(draftState, forecast, i, fundingPayOuts);
      draftState.GrossRevenue_RevenueAfterDistribution[i] = {
        amount: draftState.GrossRevenue_RevenueAfterPlatform[i].amount +
          draftState.GrossRevenue_DistributionShares[i].amount
      };
      // funding publish out
      applyPublisherShares(draftState, forecast, i, fundingPayOuts);
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
      applyDirectEmployeesOut(draftState, forecast, i, monthStart, monthEnd);
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
    [SubTotalType.GrossProfit_DirectEmployees, new Array<string>()],
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
  appendForInit(SubTotalType.GrossRevenue_PlatformShares, forecast.revenues.list.map(rev => rev.globalId));
  appendForInit(SubTotalType.GrossRevenue_PlatformShares,
    forecast.funding.list
      .filter(f => f.repaymentTerms?.cashOut.list.some(co => co.type.value === FundingRepaymentType.GrossRevenueAfterSales))
      .map(funding => funding.globalId)
  );
  appendForInit(SubTotalType.GrossRevenue_DistributionShares, forecast.revenues.list.map(rev => rev.globalId));
  appendForInit(SubTotalType.GrossRevenue_DistributionShares,
    forecast.funding.list
      .filter(f => f.repaymentTerms?.cashOut.list.some(co => co.type.value === FundingRepaymentType.GrossRevenueAfterPlatform))
      .map(funding => funding.globalId)
  );
  appendForInit(SubTotalType.GrossRevenue_PublisherShares,
    forecast.funding.list
      .filter(f => f.repaymentTerms?.cashOut.list.some(co => co.type.value === FundingRepaymentType.GrossRevenueAfterDistributor))
      .map(funding => funding.globalId)
  );

  // gross profit
  draftState.GrossProfit_DirectEmployees = sizeSubTotal(draftState.GrossProfit_DirectEmployees, forecastMonthCount);
  draftState.GrossProfit_DirectContractors = sizeSubTotal(draftState.GrossProfit_DirectContractors, forecastMonthCount);
  draftState.GrossProfit_DirectExpenses = sizeSubTotal(draftState.GrossProfit_DirectExpenses, forecastMonthCount);
  // gross profit details
  appendForInit(SubTotalType.GrossProfit_DirectEmployees,
    forecast.employees.list.filter(e => e.category.value == ExpenseCategory.DirectExpenses).map(e => e.globalId)
  );

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




