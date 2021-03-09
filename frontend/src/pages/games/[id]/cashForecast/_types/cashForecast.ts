import type { IIdentifiedList, IIdentifiedObject, IIdentifiedPrimitive } from "../../../../_stores/eventStore/types";

export enum LoanType {
  OneTime = 1,
  Monthly = 2,
  Multiple = 3
}

export const LoanTypes: { id: LoanType, name: string }[] = [
  { id: LoanType.OneTime, name: "Single payment" },
  { id: LoanType.Monthly, name: "Monthly" },
  { id: LoanType.Multiple, name: "Multiple payments" },
];

export const FundingTypes: { id: LoanType, name: string }[] = LoanTypes.filter(lt => lt.id != LoanType.Monthly);

export enum LoanRepaymentType {
  OneTime = 1,
  Monthly = 2
}

export const LoanRepaymentTypes: { id: LoanRepaymentType, name: string }[] = [
  { id: LoanRepaymentType.OneTime, name: "Single payment" },
  { id: LoanRepaymentType.Monthly, name: "Monthly" }
];

export enum FundingRepaymentType {
  GrossRevenueAfterSales = 1,
  GrossRevenueAfterPlatform = 2,
  GrossRevenueAfterDistributor = 3,
  GrossRevenueAfterPublisher = 4,
  GrossProfitShare = 5,
  NetProfitShare = 6
}

export const FundingRepaymentTypes: { id: FundingRepaymentType, name: string }[] = [
  { id: FundingRepaymentType.GrossRevenueAfterSales, name: "Gross After Sales" },
  { id: FundingRepaymentType.GrossRevenueAfterPlatform, name: "Gross After Platform" },
  { id: FundingRepaymentType.GrossRevenueAfterDistributor, name: "Gross After Distributor" },
  { id: FundingRepaymentType.GrossRevenueAfterPublisher, name: "Gross After Publisher" },
  { id: FundingRepaymentType.GrossProfitShare, name: "Gross Profit" },
  { id: FundingRepaymentType.NetProfitShare, name: "Net Profit" },
];

export enum AdditionalEmployeeExpenseType {
  NetProfitShare = 3,
  BonusPercentOnce = 4,
  BonusPercentAnnual = 5,
  BonusDollarsOnce = 6,
  BonusDollarsAnnual = 7
}

/*
  NetProfitShare: no freq, no date
  BonusPercentOnce: freq + maybe date
  BonusPercentAnnual: freq + maybe date
  BonusDollarsOnce: freq + maybe date
  BonusDollarsAnnual: freq + maybe date
*/

export const AdditionalEmployeeExpenseTypes: { id: AdditionalEmployeeExpenseType, name: string }[] =
  Object.keys(AdditionalEmployeeExpenseType)
    .filter(lt => isNaN(Number(lt)))
    .map(lt => ({ id: AdditionalEmployeeExpenseType[lt], name: lt }));

export function isCurrencyAdditionalEmployeeExpenseType(type: AdditionalEmployeeExpenseType): boolean {
  return type == AdditionalEmployeeExpenseType.BonusDollarsOnce ||
    type == AdditionalEmployeeExpenseType.BonusDollarsAnnual;
}

export function isPercentAdditionalEmployeeExpenseType(type: AdditionalEmployeeExpenseType): boolean {
  return type == AdditionalEmployeeExpenseType.BonusPercentOnce ||
    type == AdditionalEmployeeExpenseType.BonusPercentAnnual ||
    type == AdditionalEmployeeExpenseType.NetProfitShare;
}

export function isDatedAdditionalEmployeeExpenseType(type: AdditionalEmployeeExpenseType): boolean {
  return type == AdditionalEmployeeExpenseType.BonusPercentOnce ||
    type == AdditionalEmployeeExpenseType.BonusPercentAnnual ||
    type == AdditionalEmployeeExpenseType.BonusDollarsOnce ||
    type == AdditionalEmployeeExpenseType.BonusDollarsAnnual;
}

export enum AdditionalEmployeeExpenseFrequency {
  Date = 1,
  Launch = 2
}

export const AdditionalEmployeeExpenseFrequencys: { id: AdditionalEmployeeExpenseFrequency, name: string }[] =
  Object.keys(AdditionalEmployeeExpenseFrequency)
    .filter(lt => isNaN(Number(lt)))
    .map(lt => ({ id: AdditionalEmployeeExpenseFrequency[lt], name: lt }));

export enum ExpenseFrequency {
  Monthly = 1,
  OneTime = 2,
  Annual = 3
}

export const ExpenseFrequencies: { id: ExpenseFrequency, name: string }[] = Object.keys(ExpenseFrequency)
  .filter(lt => isNaN(Number(lt)))
  .map(lt => ({ id: ExpenseFrequency[lt], name: lt }));

export function isFrequencyRecurring(frequency: ExpenseFrequency): boolean {
  return frequency !== ExpenseFrequency.OneTime;
}

export enum ExpenseCategory {
  DirectExpenses = 1,
  MarketingAndSales = 2,
  General = 3
}

export const ExpenseCategories: { id: ExpenseCategory, name: string }[] = Object.keys(ExpenseCategory)
  .filter(lt => isNaN(Number(lt)))
  .map(lt => ({ id: ExpenseCategory[lt], name: lt }));

export enum ExpenseUntil {
  Date = 1,
  Launch = 2
}

export const ExpenseUntils: { id: ExpenseUntil, name: string }[] = Object.keys(ExpenseUntil)
  .filter(lt => isNaN(Number(lt)))
  .map(lt => ({ id: ExpenseUntil[lt], name: lt }));

export enum ContractorExpenseFrequency {
  Monthly = 1,
  Custom = 2
}

export const ContractorExpenseFrequencys: { id: ContractorExpenseFrequency, name: string }[] = Object.keys(ContractorExpenseFrequency)
  .filter(lt => isNaN(Number(lt)))
  .map(lt => ({ id: ContractorExpenseFrequency[lt], name: lt }));

export enum NetIncomeCategory {
  GrossRevenueShare = 1,
  GrossProfitShare = 2,
  NetProfitShare = 3,
}

export const NetIncomeCategorys: { id: NetIncomeCategory, name: string }[] = Object.keys(NetIncomeCategory)
  .filter(lt => isNaN(Number(lt)))
  .map(lt => ({ id: NetIncomeCategory[lt], name: lt }));

export enum TaxSchedule {
  Annual = 1
}

export const TaxSchedules: { id: TaxSchedule, name: string }[] = Object.keys(TaxSchedule)
  .filter(lt => isNaN(Number(lt)))
  .map(lt => ({ id: TaxSchedule[lt], name: lt }));

export enum ForecastStage {
  ViabilityCost = 1,
  ViabilitySales = 2,
  Execution = 3,
  PostLaunch = 4
}

export const ForecastStages: { id: ForecastStage, name: string }[] = [
  { id: ForecastStage.ViabilityCost, name: "Viability (Cost)" },
  { id: ForecastStage.ViabilitySales, name: "Viability (Sales)" },
  { id: ForecastStage.Execution, name: "Executing" },
  { id: ForecastStage.PostLaunch, name: "Post-Launch" }
];

export enum ForecastLength {
  ToLaunch = 1,
  EighteenMonths = 2,
  ThreeYears = 3,
  FiveYears = 3
}

export const ForecastLengths: { id: ForecastLength, name: string }[] = [
  { id: ForecastLength.ToLaunch, name: "To Launch" },
  { id: ForecastLength.EighteenMonths, name: "Launch + 18mos" },
  { id: ForecastLength.ThreeYears, name: "Launch + 3yrs" },
  { id: ForecastLength.FiveYears, name: "Launch + 5yrs" }
];

export const getForecastMonths = (length: ForecastLength): number => {
  switch (length) {
    case ForecastLength.ToLaunch:
      return 0;
    case ForecastLength.EighteenMonths:
      return 18;
    case ForecastLength.ThreeYears:
      return 36;
    case ForecastLength.FiveYears:
      return 60;
    default:
      throw new Error(`Cannot return number of mnths for unidentified forecast length: ${length}`);
  }
};

export interface ICashForecast extends IIdentifiedObject {
  versionNumber: number;
  forecastStartDate: IIdentifiedPrimitive<Date>;
  launchDate: IIdentifiedPrimitive<Date>;
  stage: IIdentifiedPrimitive<ForecastStage>;
  length: IIdentifiedPrimitive<ForecastLength>;
  forecastMonthCount: IIdentifiedPrimitive<number>;
  bankBalance: IBankBalance;
  goals: IGoals;
  loans: IIdentifiedList<ILoanItem>;
  funding: IIdentifiedList<IFundingItem>;
  employees: IIdentifiedList<IEmployeeExpense>;
  contractors: IIdentifiedList<IContractorExpense>;
  expenses: IIdentifiedList<IGenericExpense>;
  taxes: IIdentifiedList<ITax>;
  revenues: IIdentifiedList<IRevenue>;
}

export interface IGoals extends IIdentifiedObject {
  yourGoal: IIdentifiedPrimitive<number>;
  partnerGoal: IIdentifiedPrimitive<number>;
}

export interface IBankBalance extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
  date: IIdentifiedPrimitive<Date>;
  amount: IIdentifiedPrimitive<number>;
  monthlyInterestRate: IIdentifiedPrimitive<number>;
}

export interface ILoanItem extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
  type: IIdentifiedPrimitive<LoanType>;
  cashIn: IIdentifiedList<ICashIn>;
  numberOfMonths: IIdentifiedPrimitive<number> | null;
  repaymentTerms: ILoanRepaymentTerms | null;
}

export interface ILoanRepaymentTerms extends IIdentifiedObject {
  cashOut: IIdentifiedList<ILoanCashOut>;
}

export interface ILoanCashOut extends IIdentifiedObject {
  type: IIdentifiedPrimitive<LoanRepaymentType>;
  amount: IIdentifiedPrimitive<number>;
  startDate: IIdentifiedPrimitive<Date>;
  limitFixedAmount: IIdentifiedPrimitive<number | null>;
  numberOfMonths: IIdentifiedPrimitive<number | null>;
}

export interface IFundingItem extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
  type: IIdentifiedPrimitive<LoanType>;
  cashIn: IIdentifiedList<ICashIn>;
  repaymentTerms: IFundingRepaymentTerms | null;
}

export interface ICashIn extends IIdentifiedObject {
  date: IIdentifiedPrimitive<Date>;
  amount: IIdentifiedPrimitive<number>;
}

export interface IFundingRepaymentTerms extends IIdentifiedObject {
  cashOut: IIdentifiedList<IFundingCashOut>;
}


export interface IFundingCashOut extends IIdentifiedObject {
  type: IIdentifiedPrimitive<FundingRepaymentType>;
  amount: IIdentifiedPrimitive<number>;
  startDate: IIdentifiedPrimitive<Date>;
  limitFixedAmount: IIdentifiedPrimitive<number | null>;
  // deprecated?
  numberOfMonths: IIdentifiedPrimitive<number | null>;
}

export interface IEmployeeExpense extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
  category: IIdentifiedPrimitive<ExpenseCategory>;
  startDate: IIdentifiedPrimitive<Date | null>;
  endDate: IIdentifiedPrimitive<Date | null>;
  salaryAmount: IIdentifiedPrimitive<number>;
  benefitsPercent: IIdentifiedPrimitive<number>;
  additionalPay: IIdentifiedList<IAdditionalEmployeeExpense>;
}

export interface IAdditionalEmployeeExpense extends IIdentifiedObject {
  type: IIdentifiedPrimitive<AdditionalEmployeeExpenseType>;
  amount: IIdentifiedPrimitive<number>;
  frequency: IIdentifiedPrimitive<AdditionalEmployeeExpenseFrequency>;
  date: IIdentifiedPrimitive<Date>;
}

export interface IContractorExpense extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
  category: IIdentifiedPrimitive<ExpenseCategory>;
  frequency: IIdentifiedPrimitive<ContractorExpenseFrequency>;
  payments: IIdentifiedList<IContractorPayment>;
}

export interface IContractorPayment extends IIdentifiedObject {
  startDate: IIdentifiedPrimitive<Date | null>;
  endDate: IIdentifiedPrimitive<Date | null>;
  amount: IIdentifiedPrimitive<number>;
}

export interface IGenericExpense extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
  category: IIdentifiedPrimitive<ExpenseCategory>;
  frequency: IIdentifiedPrimitive<ExpenseFrequency>;
  startDate: IIdentifiedPrimitive<Date>;
  until: IIdentifiedPrimitive<ExpenseUntil>;
  endDate: IIdentifiedPrimitive<Date>;
  amount: IIdentifiedPrimitive<number>;
}

export interface ITax extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
  basedOn: IIdentifiedPrimitive<NetIncomeCategory>;
  amount: IIdentifiedPrimitive<number>;
  schedule: IIdentifiedPrimitive<TaxSchedule>;
  dueDate: IIdentifiedPrimitive<Date>;
}

export enum RevenueModelType {
  ExplicitValues = 1
}


export enum SalesRevenueShareType {
  GrossRevenueAfterSales = 1,
  GrossRevenueAfterPlatform = 2,
}

export interface ISalesRevenueItem extends IIdentifiedObject {
  amount: IIdentifiedPrimitive<number>;
  date: IIdentifiedPrimitive<Date>;
}

export interface ISalesRevenueShareItem extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
  type: IIdentifiedPrimitive<SalesRevenueShareType>;
  percent: IIdentifiedPrimitive<number>;
}

export interface IRevenue extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
  type: IIdentifiedPrimitive<RevenueModelType>;
  values: IIdentifiedList<ISalesRevenueItem>;
  revenueShare: IIdentifiedList<ISalesRevenueShareItem>;
}
