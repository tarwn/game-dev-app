import type { IIdentifiedList, IIdentifiedObject, IIdentifiedPrimitive } from "../../../../_stores/eventStore/types";

export enum LoanType {
  OneTime = 1,
  Monthly = 2,
  Multiple = 3
}

export const LoanTypes: { id: LoanType, name: string }[] = Object.keys(LoanType)
  .filter(lt => isNaN(Number(lt)))
  .map(lt => ({ id: LoanType[lt], name: lt }));

export enum RepaymentType {
  OneTime = 1,
  Monthly = 2,
  GrossRevenueShare = 3,
  NetRevenueShare = 4
}

export const RepaymentTypes: { id: LoanType, name: string }[] = Object.keys(RepaymentType)
  .filter(lt => isNaN(Number(lt)))
  .map(lt => ({ id: RepaymentType[lt], name: lt }));

export enum AdditionalEmployeeExpenseType {
  NetRevenueShare = 1,
  GrossRevenueShare = 2,
  BonusPercentOnce = 3,
  BonusPercentAnnual = 4,
  BonusDollarsOnce = 5,
  BonusDollarsAnnual = 6
}

export enum AdditionalEmployeeExpenseFrequency {
  Date = 1,
  Launch = 2,
  Annual = 3
}

export enum IExpenseFrequency {
  Monthly = 1,
  OneTime = 2
}

export interface ICashForecast extends IIdentifiedObject {
  versionNumber: number;
  forecastStartDate: IIdentifiedPrimitive<Date>;
  bankBalance: IBankBalance;
  loans: IIdentifiedList<ILoanItem>;
  funding: IIdentifiedList<IFundingItem>;
  employees: IIdentifiedList<IEmployeeExpense>;
  contractors: IIdentifiedList<IContractorExpense>;
  expenses: IIdentifiedList<IGenericExpense>;
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
  cashIn: IIdentifiedList<ICashIn>[];
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
  startDate: IIdentifiedPrimitive<Date | null>;
  endDate: IIdentifiedPrimitive<Date | null>;
  salaryAmount: IIdentifiedPrimitive<number>;
  benefitsPercents: IIdentifiedPrimitive<number>;
  additionalPay: IIdentifiedList<IAdditionalEmployeeExpense>;
}

export interface IAdditionalEmployeeExpense extends IIdentifiedObject {
  type: IIdentifiedPrimitive<AdditionalEmployeeExpenseType>;
  amount: IIdentifiedPrimitive<number>;
  frequency: IIdentifiedPrimitive<AdditionalEmployeeExpenseFrequency>;
  date?: IIdentifiedPrimitive<Date>;
}

export interface IContractorExpense extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
  payments: IIdentifiedList<IContractorPayment>;
}

export interface IContractorPayment extends IIdentifiedObject {
  type: IIdentifiedPrimitive<IExpenseFrequency>;
  startDate: IIdentifiedPrimitive<Date | null>;
  endDate: IIdentifiedPrimitive<Date | null>;
  amount: IIdentifiedPrimitive<number>;
}

export interface IGenericExpense extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
  frequency: IIdentifiedPrimitive<IExpenseFrequency>;
  startDate: IIdentifiedPrimitive<Date | null>;
  endDate: IIdentifiedPrimitive<Date | null>;
  amount: IIdentifiedPrimitive<number>;
}

export interface IRevenue extends IIdentifiedObject {
  name: IIdentifiedPrimitive<string>;
}
