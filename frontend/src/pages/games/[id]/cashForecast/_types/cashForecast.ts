import type { IIdentifiedList, IIdentifiedObject, IIdentifiedPrimitive } from "../../../../_stores/eventStore/types";

export enum LoanType {
  OneTime = 1,
  Monthly = 2,
  Multiple = 3
}

export const LoanTypes: { id: LoanType, name: string }[] = Object.keys(LoanType)
  .filter(lt => isNaN(Number(lt)))
  .map(lt => ({ id: LoanType[lt], name: lt }));

export const FundingTypes: { id: LoanType, name: string }[] = LoanTypes.filter(lt => lt.id != LoanType.Monthly);

export enum RepaymentType {
  OneTime = 1,
  Monthly = 2,
  GrossRevenueShare = 3,
  GrossProfitShare = 4,
  NetProfitShare = 5
}

export const RepaymentTypes: { id: RepaymentType, name: string }[] = Object.keys(RepaymentType)
  .filter(lt => isNaN(Number(lt)))
  .map(lt => ({ id: RepaymentType[lt], name: lt }));

export function isShareRepayment(type: RepaymentType): boolean {
  return type === RepaymentType.GrossRevenueShare || type === RepaymentType.GrossProfitShare || type == RepaymentType.NetProfitShare;
}

export function isCurrencyRepayment(type: RepaymentType): boolean {
  return type === RepaymentType.Monthly || type === RepaymentType.OneTime;
}

export enum AdditionalEmployeeExpenseType {
  GrossRevenueShare = 1,
  GrossProfitShare = 2,
  NetProfitShare = 3,
  BonusPercentOnce = 4,
  BonusPercentAnnual = 5,
  BonusDollarsOnce = 6,
  BonusDollarsAnnual = 7
}

/*
  GrossRevShare: no freq, no date
  GrossProfitShare: no freq, no date
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
    type == AdditionalEmployeeExpenseType.GrossRevenueShare ||
    type == AdditionalEmployeeExpenseType.GrossProfitShare ||
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

export interface ICashForecast extends IIdentifiedObject {
  versionNumber: number;
  forecastStartDate: IIdentifiedPrimitive<Date>;
  bankBalance: IBankBalance;
  loans: IIdentifiedList<ILoanItem>;
  funding: IIdentifiedList<IFundingItem>;
  employees: IIdentifiedList<IEmployeeExpense>;
  contractors: IIdentifiedList<IContractorExpense>;
  expenses: IIdentifiedList<IGenericExpense>;
  taxes: IIdentifiedList<ITax>;
  revenues: IIdentifiedList<IRevenue>;
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
  repaymentTerms: IRepaymentTerms | null;
}

export interface IFundingItem extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
  type: IIdentifiedPrimitive<LoanType>;
  cashIn: IIdentifiedList<ICashIn>;
  repaymentTerms: IRepaymentTerms | null;
}

export interface ICashIn extends IIdentifiedObject {
  date: IIdentifiedPrimitive<Date>;
  amount: IIdentifiedPrimitive<number>;
}

export interface IRepaymentTerms extends IIdentifiedObject {
  cashOut: IIdentifiedList<ICashOut>;
}

export interface ICashOut extends IIdentifiedObject {
  type: IIdentifiedPrimitive<RepaymentType>;
  amount: IIdentifiedPrimitive<number>;
  startDate: IIdentifiedPrimitive<Date>;
  limitFixedAmount: IIdentifiedPrimitive<number | null>;
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

export interface IRevenue extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
}
