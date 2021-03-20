import type { IIdentifiedList } from "../pages/_stores/eventStore/types";
import type {
  AdditionalEmployeeExpenseFrequency,
  AdditionalEmployeeExpenseType,
  BasicDateOption,
  ContractorExpenseFrequency,
  ExpenseCategory,
  ExpenseFrequency,
  FundingRepaymentType,
  IAdditionalEmployeeExpense,
  ICashIn,
  IContractorExpense,
  IContractorPayment,
  IEmployeeExpense,
  IEstimatedRevenuePlatform,
  IEstimatedRevenuePlatformShare,
  IFundingCashOut,
  IFundingItem,
  IFundingRepaymentTerms,
  IGenericExpense,
  ILoanCashOut,
  ILoanItem,
  ILoanRepaymentTerms,
  IRevenue,
  ISalesRevenueItem,
  ISalesRevenueShareItem,
  ITax,
  LoanRepaymentType,
  LoanType,
  NetIncomeCategory,
  RevenueModelType,
  SalesRevenueShareType,
  TaxSchedule
} from "../pages/games/[id]/cashForecast/_types/cashForecast";
import {
  ExpenseUntil
} from "../pages/games/[id]/cashForecast/_types/cashForecast";
import { createIdentifiedPrimitive, createObjectList } from "../pages/_stores/eventStore/helpers";

export function createRevenue(revenues: IIdentifiedList<IRevenue>, type: RevenueModelType): IRevenue {
  const globalId = revenues.globalId + ":" + (revenues.list.length + 1);
  const revenue = {
    parentId: revenues.globalId,
    globalId,
    name: createIdentifiedPrimitive<string>(globalId, globalId + 'n', 'unit test revenue'),
    type: createIdentifiedPrimitive<RevenueModelType>(globalId, globalId + 'n', type),
    values: createObjectList<ISalesRevenueItem>(globalId, globalId + 'v'),
    revenueShare: createObjectList<ISalesRevenueShareItem>(globalId, globalId + 'rs'),
  };
  return revenue;
}

export function createRevenueValue(revenueValues: IIdentifiedList<ISalesRevenueItem>, amount: number, date: Date): ISalesRevenueItem {
  const globalId = revenueValues.globalId + "_" + (revenueValues.list.length + 1);
  return {
    parentId: revenueValues.globalId,
    globalId: globalId,
    amount: createIdentifiedPrimitive<number>(globalId, globalId + 'a', amount),
    date: createIdentifiedPrimitive<Date>(globalId, globalId + 'd', date)
  };
}

export function createRevenueShare(
  revenueShare: IIdentifiedList<ISalesRevenueShareItem>,
  type: SalesRevenueShareType,
  percent: number
): ISalesRevenueShareItem {
  const globalId = revenueShare.globalId + "_" + (revenueShare.list.length + 1);
  return {
    parentId: revenueShare.globalId,
    globalId,
    name: createIdentifiedPrimitive<string>(globalId, globalId + 'n', "unit test"),
    type: createIdentifiedPrimitive<SalesRevenueShareType>(globalId, globalId + 't', type),
    percent: createIdentifiedPrimitive<number>(globalId, globalId + 'p', percent)
  };
}

// eslint-disable-next-line max-len
export function createLoan(loans: IIdentifiedList<ILoanItem>, type: LoanType, date: Date, amount: number, numberOfMonths?: number): ILoanItem {
  const globalId = loans.globalId + ":" + (loans.list.length + 1);
  const loan = {
    parentId: loans.globalId,
    globalId,
    name: createIdentifiedPrimitive<string>(globalId, globalId + 'n', 'unit test loan'),
    type: createIdentifiedPrimitive<LoanType>(globalId, globalId + 't', type),
    numberOfMonths: createIdentifiedPrimitive<number>(globalId, globalId + 'nu', numberOfMonths ?? 1),
    cashIn: createObjectList<ICashIn>(globalId, globalId + 'ci'),
    repaymentTerms: null
  };
  loan.cashIn.list.push(createLoanCashIn(loan.cashIn, date, amount));
  return loan;
}

export function createLoanCashIn(cashIns: IIdentifiedList<ICashIn>, date: Date, amount: number): ICashIn {
  const ciGlobalId = cashIns.globalId + ':' + (cashIns.list.length + 1);
  return {
    parentId: cashIns.globalId,
    globalId: ciGlobalId,
    date: createIdentifiedPrimitive<Date>(ciGlobalId, ciGlobalId + "d", date),
    amount: createIdentifiedPrimitive<number>(ciGlobalId, ciGlobalId + "a", amount)
  };
}

// eslint-disable-next-line max-len
export function createLoanRepaymentTerms(loan: ILoanItem, type: LoanRepaymentType, date: Date, amount: number, numberOfMonths?: number): ILoanRepaymentTerms {
  const repaymentTerms = {
    parentId: loan.globalId,
    globalId: loan.globalId + "r",
    cashOut: createObjectList<ILoanCashOut>(loan.globalId + "r", loan.globalId + "rl")
  };
  repaymentTerms.cashOut.list.push(
    createLoanRepaymentCashOut(repaymentTerms.cashOut, type, date, amount, numberOfMonths)
  );
  return repaymentTerms;
}

// eslint-disable-next-line max-len
export function createLoanRepaymentCashOut(cashOuts: IIdentifiedList<ILoanCashOut>, type: LoanRepaymentType, date: Date, amount: number, numberOfMonths?: number): ILoanCashOut {
  const coGlobalId = cashOuts.globalId + (cashOuts.list.length + 1);
  return {
    parentId: cashOuts.globalId,
    globalId: coGlobalId,
    type: createIdentifiedPrimitive<LoanRepaymentType>(coGlobalId, coGlobalId + "t", type),
    startDate: createIdentifiedPrimitive<Date>(coGlobalId, coGlobalId + "d", date),
    amount: createIdentifiedPrimitive<number>(coGlobalId, coGlobalId + "a", amount),
    limitFixedAmount: createIdentifiedPrimitive<number>(coGlobalId, coGlobalId + "l", 0),
    numberOfMonths: createIdentifiedPrimitive<number>(coGlobalId, coGlobalId + "n", numberOfMonths ?? 1)
  };
}

export function createFunding(fundings: IIdentifiedList<IFundingItem>, type: LoanType, date: Date, amount: number): IFundingItem {
  const globalId = fundings.globalId + ":" + (fundings.list.length + 1);
  const funding = {
    parentId: fundings.globalId,
    globalId,
    name: createIdentifiedPrimitive<string>(globalId, globalId + 'n', 'unit test funding'),
    type: createIdentifiedPrimitive<LoanType>(globalId, globalId + 't', type),
    cashIn: createObjectList<ICashIn>(globalId, globalId + 'ci'),
    repaymentTerms: null
  };
  funding.cashIn.list.push(createFundingCashIn(funding.cashIn, date, amount));
  return funding;
}

export function createFundingCashIn(cashIns: IIdentifiedList<ICashIn>, date: Date, amount: number): ICashIn {
  const ciGlobalId = cashIns.globalId + ':' + (cashIns.list.length + 1);
  return {
    parentId: cashIns.globalId,
    globalId: ciGlobalId,
    date: createIdentifiedPrimitive<Date>(ciGlobalId, ciGlobalId + "d", date),
    amount: createIdentifiedPrimitive<number>(ciGlobalId, ciGlobalId + "a", amount)
  };
}

// eslint-disable-next-line max-len
export function createFundingRepaymentTerms(funding: IFundingItem, type: FundingRepaymentType, date: Date, amount: number, limit?: number): IFundingRepaymentTerms {
  const repaymentTerms = {
    parentId: funding.globalId,
    globalId: funding.globalId + "r",
    cashOut: createObjectList<IFundingCashOut>(funding.globalId + "r", funding.globalId + "rl")
  };
  repaymentTerms.cashOut.list.push(
    createFundingRepaymentCashOut(repaymentTerms.cashOut, type, date, amount, limit)
  );
  return repaymentTerms;
}

// eslint-disable-next-line max-len
export function createFundingRepaymentCashOut(cashOuts: IIdentifiedList<IFundingCashOut>, type: FundingRepaymentType, date: Date, amount: number, limit?: number): IFundingCashOut {
  const coGlobalId = cashOuts.globalId + (cashOuts.list.length + 1);
  return {
    parentId: cashOuts.globalId,
    globalId: coGlobalId,
    type: createIdentifiedPrimitive<FundingRepaymentType>(coGlobalId, coGlobalId + "t", type),
    startDate: createIdentifiedPrimitive<Date>(coGlobalId, coGlobalId + "d", date),
    amount: createIdentifiedPrimitive<number>(coGlobalId, coGlobalId + "a", amount),
    limitFixedAmount: createIdentifiedPrimitive<number>(coGlobalId, coGlobalId + "l", limit ?? 0),
    numberOfMonths: createIdentifiedPrimitive<number>(coGlobalId, coGlobalId + "n", 0)
  };
}

export function createEmployee(
  employees: IIdentifiedList<IEmployeeExpense>,
  expenseCategory: ExpenseCategory,
  startDate: Date,
  endDate: Date,
  salaryAmount: number,
  benefitsPercent: number
): IEmployeeExpense {
  const globalId = employees.globalId + "_" + (employees.list.length + 1);
  return {
    parentId: employees.globalId,
    globalId,
    category: createIdentifiedPrimitive<ExpenseCategory>(globalId, globalId + "c", expenseCategory),
    name: createIdentifiedPrimitive<string>(globalId, globalId + "n", "unit test"),
    startDate: createIdentifiedPrimitive<Date>(globalId, globalId + "sd", startDate),
    endDate: createIdentifiedPrimitive<Date>(globalId, globalId + "ed", endDate),
    salaryAmount: createIdentifiedPrimitive<number>(globalId, globalId + "s", salaryAmount),
    benefitsPercent: createIdentifiedPrimitive<number>(globalId, globalId + "s", benefitsPercent),
    additionalPay: createObjectList<IAdditionalEmployeeExpense>(globalId, globalId + "a")
  };
}

export function createEmployeeAdditionalPay(
  additionalPay: IIdentifiedList<IAdditionalEmployeeExpense>,
  type: AdditionalEmployeeExpenseType,
  frequency: AdditionalEmployeeExpenseFrequency,
  amount: number,
  date: Date
): IAdditionalEmployeeExpense {
  const globalId = additionalPay.globalId + "_" + (additionalPay.list.length + 1);
  return {
    parentId: additionalPay.globalId,
    globalId,
    type: createIdentifiedPrimitive<AdditionalEmployeeExpenseType>(globalId, globalId + "t", type),
    frequency: createIdentifiedPrimitive<AdditionalEmployeeExpenseFrequency>(globalId, globalId + "f", frequency),
    amount: createIdentifiedPrimitive<number>(globalId, globalId + "a", amount),
    date: createIdentifiedPrimitive<Date>(globalId, globalId + "d", date)
  };
}

export function createContractor(
  contractors: IIdentifiedList<IContractorExpense>,
  expenseCategory: ExpenseCategory,
  frequency: ContractorExpenseFrequency
): IContractorExpense {
  const globalId = contractors.globalId + "_" + (contractors.list.length + 1);
  const contractor = {
    parentId: contractors.globalId,
    globalId,
    category: createIdentifiedPrimitive<ExpenseCategory>(globalId, globalId + "c", expenseCategory),
    name: createIdentifiedPrimitive<string>(globalId, globalId + "n", "unit test"),
    frequency: createIdentifiedPrimitive<ContractorExpenseFrequency>(globalId, globalId + "f", frequency),
    payments: createObjectList<IContractorPayment>(globalId, globalId + 'p')
  };
  return contractor;
}

export function createContractorPayment(
  payments: IIdentifiedList<IContractorPayment>,
  startDate: Date,
  amount: number,
  endDate?: Date
): IContractorPayment {
  // end date is only required for monthly, it is unused for custom (they are a list of one-time payments)
  const globalId = payments.globalId + "_" + (payments.list.length + 1);
  return {
    parentId: payments.globalId,
    globalId,
    startDate: createIdentifiedPrimitive<Date>(globalId, globalId + 'sd', startDate),
    amount: createIdentifiedPrimitive<number>(globalId, globalId + 'a', amount),
    endDate: createIdentifiedPrimitive<Date>(globalId, globalId + 'ed', endDate ?? startDate),
  };
}


export function createExpense(
  expenses: IIdentifiedList<IGenericExpense>,
  category: ExpenseCategory,
  frequency: ExpenseFrequency,
  amount: number,
  startDate: Date,
  until?: ExpenseUntil,
  endDate?: Date
): IGenericExpense {
  // until is only required w/ recurring
  // endDate is only required if until != LaunchDate
  const globalId = expenses.globalId + "_" + (expenses.list.length + 1);
  return {
    parentId: expenses.globalId,
    globalId,
    category: createIdentifiedPrimitive<ExpenseCategory>(globalId, globalId + "c", category),
    name: createIdentifiedPrimitive<string>(globalId, globalId + "n", "unit test"),
    frequency: createIdentifiedPrimitive<ExpenseFrequency>(globalId, globalId + "f", frequency),
    amount: createIdentifiedPrimitive<number>(globalId, globalId + "a", amount),
    startDate: createIdentifiedPrimitive<Date>(globalId, globalId + "s", startDate),
    until: createIdentifiedPrimitive<ExpenseUntil>(globalId, globalId + "u", until ?? ExpenseUntil.Date),
    endDate: createIdentifiedPrimitive<Date>(globalId, globalId + "e", endDate ?? startDate)
  };
}

export function createTax(
  taxes: IIdentifiedList<ITax>,
  basedOn: NetIncomeCategory,
  amount: number,
  schedule: TaxSchedule,
  dueDate: Date
): ITax {
  const globalId = taxes.globalId + "_" + (taxes.list.length + 1);
  return {
    parentId: taxes.globalId,
    globalId,
    name: createIdentifiedPrimitive<string>(globalId, globalId + "n", "unit test"),
    basedOn: createIdentifiedPrimitive<NetIncomeCategory>(globalId, globalId + "bo", basedOn),
    amount: createIdentifiedPrimitive<number>(globalId, globalId + "a", amount),
    schedule: createIdentifiedPrimitive<TaxSchedule>(globalId, globalId + "s", schedule),
    dueDate: createIdentifiedPrimitive<Date>(globalId, globalId + "d", dueDate)
  };
}

export function createEstRevPlatform(
  list: IIdentifiedList<IEstimatedRevenuePlatform>,
  dateType: BasicDateOption,
  date: Date,
  percentOfSales: number
): IEstimatedRevenuePlatform {
  const globalId = list.globalId + "_" + (list.list.length + 1);
  return {
    parentId: list.globalId,
    globalId,
    name: createIdentifiedPrimitive<string>(globalId, globalId + "n", "unit test"),
    dateType: createIdentifiedPrimitive<BasicDateOption>(globalId, globalId + "dt", dateType),
    startDate: createIdentifiedPrimitive<Date>(globalId, globalId + "d", date),
    percentOfSales: createIdentifiedPrimitive<number>(globalId, globalId + "pos", percentOfSales),
    revenueShares: createObjectList<IEstimatedRevenuePlatformShare>(globalId, globalId + "rs")
  };
}

export function createEstRevShare(
  platform: IEstimatedRevenuePlatform,
  revenueShare: number,
  untilAmount: number
): IEstimatedRevenuePlatformShare {
  const globalId = platform.revenueShares.globalId + "_" + (platform.revenueShares.list.length + 1);
  return {
    parentId: platform.revenueShares.globalId,
    globalId,
    revenueShare: createIdentifiedPrimitive<number>(globalId, globalId + "_rs", revenueShare),
    untilAmount: createIdentifiedPrimitive<number>(globalId, globalId + "_ua", untilAmount),
  };
}
