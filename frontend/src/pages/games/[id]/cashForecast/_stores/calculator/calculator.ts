import produce from "immer";
import { enableMapSet } from "immer";
import type { WritableDraft } from "immer/dist/types/types-external";
import { getUtcDate, monthDiff } from "../../../../../../utilities/date";
import {
  AdditionalEmployeeExpenseType,
  EstimatedRevenueDelay,
  ExpenseCategory,
  FundingRepaymentType
} from "../../_types/cashForecast";
import type { ICashForecast } from "../../_types/cashForecast";
import { applyBankBalance } from "./inBankBalance";
import { applyFundingIn } from "./inFunding";
import { applyLoansIn } from "./inLoans";
import { applySalesRevenue } from "./inRevenue";
import { applyDirectContractorsOut, applyIndirectContractorsOut } from "./outContractors";
import { applyDirectEmployeesOut, applyIndirectEmployeesOut } from "./outEmployee";
import { applyEmployeeSharesOut } from "./outEmployeeShares";
import { applyDirectExpensesOut, applyIndirectExpensesOut } from "./outExpenses";
import { applyLoansOut } from "./outLoans";
import { applyDistributionShares, applyFundingFinalProfitShares, applyPlatformShares, applyPublisherShares } from "./outRevenueShares";
import { applyTaxesOut } from "./outTaxes";
import type { ICashValue, IProjectedCashFlowData } from "./types";
import { DetailType, SubTotalType } from "./types";

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
      // Currently we require launch date to be the last day of month, which makes launch month the following month
      const monthNumAfterLaunch = monthDiff(forecast.launchDate.value, monthStart);

      // - Beginning Cash
      // bank balance
      applyBankBalance(draftState, forecast, i, monthStart, monthEnd);
      draftState.BeginningCash_YesterdayEnding[i].amount = (
        i === 0
          ? 0
          : draftState.EndingCash[i - 1].amount
      );
      draftState.BeginningCash[i].amount =
        draftState.BeginningCash_Balances[i].amount +
        draftState.BeginningCash_YesterdayEnding[i].amount;

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
      const platformDelay = EstimatedRevenueDelay.NextMonth;  // [ch1123]
      applySalesRevenue(draftState, forecast, i, monthStart, monthEnd, monthNumAfterLaunch, platformDelay);
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
      applyDirectContractorsOut(draftState, forecast, i, monthStart, monthEnd);
      // expenses
      applyDirectExpensesOut(draftState, forecast, i, monthStart, monthEnd);
      // subtotal
      draftState.GrossProfit[i] = {
        amount: draftState.GrossRevenue[i].amount +
          draftState.GrossProfit_DirectEmployees[i].amount +
          draftState.GrossProfit_DirectContractors[i].amount +
          draftState.GrossProfit_DirectExpenses[i].amount
      };

      // - net profit
      // people.employees
      applyIndirectEmployeesOut(draftState, forecast, i, monthStart, monthEnd);
      // people.contractors
      applyIndirectContractorsOut(draftState, forecast, i, monthStart, monthEnd);
      // expenses
      applyIndirectExpensesOut(draftState, forecast, i, monthStart, monthEnd);
      // subtotal
      draftState.NetProfit[i] = {
        amount: draftState.GrossProfit[i].amount +
          draftState.NetProfit_IndirectEmployees[i].amount +
          draftState.NetProfit_IndirectContractors[i].amount +
          draftState.NetProfit_IndirectExpenses[i].amount
      };

      // - taxes + profit sharing
      // taxes
      applyTaxesOut(draftState, forecast, i, monthStart);
      // profit sharing: people.employees + funding net/gross profit shares
      draftState.TaxesAndProfitSharing_ProfitSharing[i].amount = 0;
      applyFundingFinalProfitShares(draftState, forecast, i, fundingPayOuts);
      applyEmployeeSharesOut(draftState, forecast, i);
      // subtotal
      draftState.TaxesAndProfitSharing[i] = {
        amount: draftState.TaxesAndProfitSharing_Taxes[i].amount +
          draftState.TaxesAndProfitSharing_ProfitSharing[i].amount
      };

      // - ending cash
      draftState.EndingCash[i] = {
        amount: draftState.BeginningCash[i].amount +
          draftState.OtherCash[i].amount +
          draftState.NetProfit[i].amount +
          draftState.TaxesAndProfitSharing[i].amount
      };

      // check subtotals + mark if relevant/value
      markSubTotal(draftState, "OtherCash_LoanIn", SubTotalType.OtherCash_LoanIn, i);
      markSubTotal(draftState, "OtherCash_LoanOut", SubTotalType.OtherCash_LoanOut, i);
      markSubTotal(draftState, "OtherCash_FundingIn", SubTotalType.OtherCash_FundingIn, i);
      markSubTotal(draftState, "OtherCash", SubTotalType.OtherCash, i);
      markSubTotal(draftState, "GrossRevenue_SalesRevenue", SubTotalType.GrossRevenue_SalesRevenue, i);
      markSubTotal(draftState, "GrossRevenue_PlatformShares", SubTotalType.GrossRevenue_PlatformShares, i);
      markSubTotal(draftState, "GrossRevenue_RevenueAfterPlatform", SubTotalType.GrossRevenue_RevenueAfterPlatform, i);
      markSubTotal(draftState, "GrossRevenue_DistributionShares", SubTotalType.GrossRevenue_DistributionShares, i);
      markSubTotal(draftState, "GrossRevenue_RevenueAfterDistribution", SubTotalType.GrossRevenue_RevenueAfterDistribution, i);
      markSubTotal(draftState, "GrossRevenue_PublisherShares", SubTotalType.GrossRevenue_PublisherShares, i);
      markSubTotal(draftState, "GrossRevenue_RevenueAfterPublisher", SubTotalType.GrossRevenue_RevenueAfterPublisher, i);
      markSubTotal(draftState, "GrossRevenue", SubTotalType.GrossRevenue, i);
      markSubTotal(draftState, "GrossProfit_DirectEmployees", SubTotalType.GrossProfit_DirectEmployees, i);
      markSubTotal(draftState, "GrossProfit_DirectContractors", SubTotalType.GrossProfit_DirectContractors, i);
      markSubTotal(draftState, "GrossProfit_DirectExpenses", SubTotalType.GrossProfit_DirectExpenses, i);
      markSubTotal(draftState, "GrossProfit", SubTotalType.GrossProfit, i);
      markSubTotal(draftState, "NetProfit_IndirectEmployees", SubTotalType.NetProfit_IndirectEmployees, i);
      markSubTotal(draftState, "NetProfit_IndirectContractors", SubTotalType.NetProfit_IndirectContractors, i);
      markSubTotal(draftState, "NetProfit_IndirectExpenses", SubTotalType.NetProfit_IndirectExpenses, i);
      markSubTotal(draftState, "NetProfit", SubTotalType.NetProfit, i);
      markSubTotal(draftState, "TaxesAndProfitSharing_Taxes", SubTotalType.TaxesAndProfitSharing_Taxes, i);
      markSubTotal(draftState, "TaxesAndProfitSharing_ProfitSharing", SubTotalType.TaxesAndProfitSharing_ProfitSharing, i);
      markSubTotal(draftState, "TaxesAndProfitSharing", SubTotalType.TaxesAndProfitSharing, i);
      markSubTotal(draftState, "EndingCash", SubTotalType.EndingCash, i);
    }

    draftState.lastCalculated = new Date();
    draftState.calculationTime = performance.now() - t0;
  });
  return nextState;
}

function markSubTotal(draftState: WritableDraft<IProjectedCashFlowData>, groupName: string, group: SubTotalType, i: number) {
  if (!draftState.hasSubTotals.has(group) && (draftState[groupName][i].amount !== 0 || draftState.details.get(group)?.size > 0))
    draftState.hasSubTotals.add(group);
}

function resizeProjection(draftState: WritableDraft<IProjectedCashFlowData>, forecast: ICashForecast, forecastMonthCount: number) {
  const subTotalDetailIds = new Map<SubTotalType, string[]>([
    // [SubTotalType.BeginningCash_YesterdayEnding, new Array<string>()],
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
    [SubTotalType.GrossProfit_DirectContractors, new Array<string>()],
    [SubTotalType.GrossProfit_DirectExpenses, new Array<string>()],
    // [SubTotalType.GrossProfit, new Array<string>()],
    [SubTotalType.NetProfit_IndirectEmployees, new Array<string>()],
    [SubTotalType.NetProfit_IndirectContractors, new Array<string>()],
    [SubTotalType.NetProfit_IndirectExpenses, new Array<string>()],
    // [SubTotalType.NetProfit, new Array<string>()],
    [SubTotalType.TaxesAndProfitSharing_Taxes, new Array<string>()],
    [SubTotalType.TaxesAndProfitSharing_ProfitSharing, new Array<string>()],
    // [SubTotalType.TaxesAndProfitSharing, new Array<string>()],
    // [SubTotalType.EndingCash, new Array<string>()],
  ]);
  function initDetails(type: SubTotalType, detailType: DetailType, elements: { globalId: string, name: { value: string } }[]) {
    subTotalDetailIds.set(type, subTotalDetailIds.get(type).concat(elements.map(e => e.globalId)));
    elements.forEach(e => {
      if (!draftState.elements.has(e.globalId)) {
        draftState.elements.set(e.globalId, {
          name: e.name.value,
          type: detailType
        });
      }
    });
  }
  // function initSingleDetail(type: SubTotalType, detailType: DetailType, globalId: string, name: string) {
  //   subTotalDetailIds.set(type, subTotalDetailIds.get(type).concat([globalId]));
  //   if (!draftState.elements.has(globalId)) {
  //     draftState.elements.set(globalId, {
  //       name: name,
  //       type: detailType
  //     });
  //   }
  // }

  // beginning cash
  draftState.BeginningCash = sizeSubTotal(draftState.BeginningCash, forecastMonthCount);
  draftState.BeginningCash_Balances = sizeSubTotal(draftState.BeginningCash_Balances, forecastMonthCount);
  draftState.BeginningCash_YesterdayEnding = sizeSubTotal(draftState.BeginningCash_YesterdayEnding, forecastMonthCount);
  initDetails(SubTotalType.BeginningCash_Balances, DetailType.BankBalance, [forecast.bankBalance]);

  // loan in
  draftState.OtherCash_LoanIn = sizeSubTotal(draftState.OtherCash_LoanIn, forecastMonthCount);
  initDetails(SubTotalType.OtherCash_LoanIn, DetailType.Loan, forecast.loans.list);

  // loan out
  draftState.OtherCash_LoanOut = sizeSubTotal(draftState.OtherCash_LoanOut, forecastMonthCount);
  initDetails(SubTotalType.OtherCash_LoanOut, DetailType.Loan, forecast.loans.list);

  // funding in
  draftState.OtherCash_FundingIn = sizeSubTotal(draftState.OtherCash_FundingIn, forecastMonthCount);
  initDetails(SubTotalType.OtherCash_FundingIn, DetailType.Funding, forecast.funding.list);

  // gross revenue
  draftState.GrossRevenue_SalesRevenue = sizeSubTotal(draftState.GrossRevenue_SalesRevenue, forecastMonthCount);
  initDetails(SubTotalType.GrossRevenue_SalesRevenue, DetailType.Revenue, forecast.revenues.list);
  initDetails(SubTotalType.GrossRevenue_SalesRevenue, DetailType.Revenue, forecast.estimatedRevenue.platforms.list);
  // initSingleDetail(SubTotalType.GrossRevenue_SalesRevenue, DetailType.Revenue, forecast.estimatedRevenue.globalId, "Estimated Sales");
  draftState.GrossRevenue_PlatformShares = sizeSubTotal(draftState.GrossRevenue_PlatformShares, forecastMonthCount);
  initDetails(SubTotalType.GrossRevenue_PlatformShares, DetailType.Revenue, forecast.estimatedRevenue.platforms.list);
  initDetails(SubTotalType.GrossRevenue_PlatformShares, DetailType.Revenue, forecast.revenues.list);
  initDetails(SubTotalType.GrossRevenue_PlatformShares, DetailType.Funding,
    forecast.funding.list
      .filter(f => f.repaymentTerms?.cashOut.list.some(co => co.type.value === FundingRepaymentType.GrossRevenueAfterSales))
  );
  draftState.GrossRevenue_RevenueAfterPlatform = sizeSubTotal(draftState.GrossRevenue_RevenueAfterPlatform, forecastMonthCount);
  draftState.GrossRevenue_DistributionShares = sizeSubTotal(draftState.GrossRevenue_DistributionShares, forecastMonthCount);
  initDetails(SubTotalType.GrossRevenue_DistributionShares, DetailType.Revenue, forecast.revenues.list);
  initDetails(SubTotalType.GrossRevenue_DistributionShares, DetailType.Funding,
    forecast.funding.list
      .filter(f => f.repaymentTerms?.cashOut.list.some(co => co.type.value === FundingRepaymentType.GrossRevenueAfterPlatform))
  );
  draftState.GrossRevenue_RevenueAfterDistribution = sizeSubTotal(draftState.GrossRevenue_RevenueAfterDistribution, forecastMonthCount);
  draftState.GrossRevenue_PublisherShares = sizeSubTotal(draftState.GrossRevenue_PublisherShares, forecastMonthCount);
  initDetails(SubTotalType.GrossRevenue_PublisherShares, DetailType.Funding,
    forecast.funding.list
      .filter(f => f.repaymentTerms?.cashOut.list.some(co => co.type.value === FundingRepaymentType.GrossRevenueAfterDistributor))
  );
  draftState.GrossRevenue_RevenueAfterPublisher = sizeSubTotal(draftState.GrossRevenue_RevenueAfterPublisher, forecastMonthCount);
  draftState.GrossRevenue = sizeSubTotal(draftState.GrossRevenue, forecastMonthCount);

  // gross profit
  draftState.GrossProfit_DirectEmployees = sizeSubTotal(draftState.GrossProfit_DirectEmployees, forecastMonthCount);
  initDetails(SubTotalType.GrossProfit_DirectEmployees, DetailType.Employee,
    forecast.employees.list.filter(e => e.category.value == ExpenseCategory.DirectExpenses)
  );
  draftState.GrossProfit_DirectContractors = sizeSubTotal(draftState.GrossProfit_DirectContractors, forecastMonthCount);
  initDetails(SubTotalType.GrossProfit_DirectContractors, DetailType.Contractor,
    forecast.contractors.list.filter(c => c.category.value == ExpenseCategory.DirectExpenses)
  );
  draftState.GrossProfit_DirectExpenses = sizeSubTotal(draftState.GrossProfit_DirectExpenses, forecastMonthCount);
  initDetails(SubTotalType.GrossProfit_DirectExpenses, DetailType.Expense,
    forecast.expenses.list.filter(e => e.category.value == ExpenseCategory.DirectExpenses)
  );

  // net profit
  draftState.NetProfit_IndirectEmployees = sizeSubTotal(draftState.NetProfit_IndirectEmployees, forecastMonthCount);
  initDetails(SubTotalType.NetProfit_IndirectEmployees, DetailType.Employee,
    forecast.employees.list.filter(e => e.category.value !== ExpenseCategory.DirectExpenses)
  );
  draftState.NetProfit_IndirectContractors = sizeSubTotal(draftState.NetProfit_IndirectContractors, forecastMonthCount);
  initDetails(SubTotalType.NetProfit_IndirectContractors, DetailType.Contractor,
    forecast.contractors.list.filter(c => c.category.value !== ExpenseCategory.DirectExpenses)
  );
  draftState.NetProfit_IndirectExpenses = sizeSubTotal(draftState.NetProfit_IndirectExpenses, forecastMonthCount);
  initDetails(SubTotalType.NetProfit_IndirectExpenses, DetailType.Expense,
    forecast.expenses.list.filter(e => e.category.value !== ExpenseCategory.DirectExpenses)
  );

  // taxes + profit sharing
  draftState.TaxesAndProfitSharing = sizeSubTotal(draftState.TaxesAndProfitSharing, forecastMonthCount);
  draftState.TaxesAndProfitSharing_Taxes = sizeSubTotal(draftState.TaxesAndProfitSharing_Taxes, forecastMonthCount);
  initDetails(SubTotalType.TaxesAndProfitSharing_Taxes, DetailType.Tax, forecast.taxes.list);
  draftState.TaxesAndProfitSharing_ProfitSharing = sizeSubTotal(draftState.TaxesAndProfitSharing_ProfitSharing, forecastMonthCount);
  initDetails(SubTotalType.TaxesAndProfitSharing_ProfitSharing, DetailType.Funding,
    forecast.funding.list
      .filter(f => f.repaymentTerms?.cashOut.list.some(co =>
        co.type.value === FundingRepaymentType.GrossProfitShare ||
        co.type.value === FundingRepaymentType.NetProfitShare)
      )
  );
  initDetails(SubTotalType.TaxesAndProfitSharing_ProfitSharing, DetailType.Employee,
    forecast.employees.list
      .filter(e => e.additionalPay.list.some(ap => ap.type.value === AdditionalEmployeeExpenseType.NetProfitShare))
  );

  // Ending Cash
  draftState.EndingCash = sizeSubTotal(draftState.EndingCash, forecastMonthCount);

  // add in all the details
  subTotalDetailIds.forEach((ids, type) => {
    sizeSubTotalDetails(draftState, type, ids, forecastMonthCount);
  });

  // clear has sub totals
  draftState.hasSubTotals.clear();
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




