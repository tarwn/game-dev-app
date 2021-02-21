export interface IProjectedCashFlowData {
  lastCalculated: Date;
  calculationTime: number;
  // strongly typed version
  BeginningCash_Balances: Array<ICashValue>;
  BeginningCash_YesterdayEnding: Array<ICashValue>;
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
  elements: Map<string, IDetailDescriptor>;
  hasSubTotals: Set<SubTotalType>;
}

export interface IDetailDescriptor {
  name: string;
  type: DetailType;
}

export enum DetailType {
  BankBalance,
  Loan,
  Funding,
  Employee,
  Contractor,
  Expense,
  Tax,
  Revenue,
}

export enum SubTotalType {
  BeginningCash_Balances,
  BeginningCash_YesterdayEnding,
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
    BeginningCash_YesterdayEnding: new Array<ICashValue>(),
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
    details: new Map<SubTotalType, Map<string, Array<ICashValue>>>(),
    elements: new Map<string, IDetailDescriptor>(),
    hasSubTotals: new Set<SubTotalType>()
  };
}
