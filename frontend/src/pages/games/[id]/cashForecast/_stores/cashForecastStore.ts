import { createEventStore } from "../../../../_stores/eventStore/eventStore";
import { createLocalStore } from "../../../../_stores/eventStore/localStore";
import { createImmutableAutomaticEventApplier } from "../../../../_stores/eventStore/eventApplier";
import { Identified, IEvent, ValueType } from "../../../../_stores/eventStore/types";
import { AdditionalEmployeeExpenseFrequency, AdditionalEmployeeExpenseType, ExpenseCategory, ExpenseFrequency, ExpenseUntil, ICashForecast, ICashOut, LoanType, RepaymentType } from "../_types/cashForecast";
import { api } from "./cashForecastApi";
import { createAutomaticEventFactory, opsFactory } from "../../../../_stores/eventStore/eventFactory";

export const eventApplier = createImmutableAutomaticEventApplier<ICashForecast>();
export const cashForecastEventStore = createEventStore(api, eventApplier);
export const cashForecastLocalStore = createLocalStore(cashForecastEventStore, eventApplier);

const ef = createAutomaticEventFactory(cashForecastEventStore);
const of = opsFactory;
export const events = {
  // === bank balance
  "SetBankBalanceName": ef.createPropUpdate<string>("SetBankBalanceName", ValueType.string),
  "SetBankBalanceAmount": ef.createPropUpdate<number>("SetBankBalanceAmount", ValueType.decimal),
  // === loan
  "AddLoan": ef.createObjectInsert<{ date: Date }>("AddLoan", undefined, [
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.string, "", "name"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.integer, LoanType.OneTime, "type"),
    (ids, nextId) => of.insertList(ids[0], nextId, "cashIn"),
    (ids, nextId) => of.insertObject(ids[3], nextId),
    (ids, nextId, args) => of.insertProp(ids[4], nextId, ValueType.date, args.date.toISOString(), "date"),
    (ids, nextId) => of.insertProp(ids[4], nextId, ValueType.decimal, 0, "amount")
  ]),
  "DeleteLoan": ef.createDelete("DeleteLoan", ValueType.object, undefined),
  "SetLoanName": ef.createPropUpdate<string>("SetLoanName", ValueType.string),
  "SetLoanType": ef.createPropUpdate<LoanType>("SetLoanType", ValueType.integer),
  "SetLoanTypeMonthly": (loanType: Identified, loanNumOfMonths: Identified, numberOfMonths: number): IEvent<ICashForecast> => {
    return cashForecastEventStore.createEvent((actor, seqNo) => ({
      type: "SetLoanTypeMonthly",
      operations: [
        of.updateProp(loanType.parentId, loanType.globalId, ValueType.integer, LoanType.Monthly),
        of.insertProp(loanType.parentId, loanNumOfMonths?.globalId ?? `${actor}-${seqNo + 1}`, ValueType.integer, numberOfMonths, "numberOfMonths")
      ]
    }));
  },
  "AddLoanNumberOfMonths": ef.createPropInsert<number>("SetLoanNumberOfMonths", ValueType.integer, "numberOfMonths"),
  "SetLoanNumberOfMonths": ef.createPropUpdate<number>("SetLoanNumberOfMonths", ValueType.integer),
  "AddLoanCashIn": ef.createObjectInsert<{ date: Date }>("AddLoanCashIn", undefined, [
    (ids, nextId, args) => of.insertProp(ids[0], nextId, ValueType.date, args.date.toISOString(), "date"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.decimal, 0, "amount")
  ]),
  "SetLoanCashInDate": ef.createPropUpdate<Date>("SetLoanCashInDate", ValueType.date),
  "SetLoanCashInAmount": ef.createPropUpdate<number>("SetLoanCashInAmount", ValueType.decimal),
  "DeleteLoanCashIn": ef.createDelete("DeleteLoanCashIn", ValueType.object, undefined),
  "AddLoanRepaymentTerms": ef.createObjectInsert<{ date: Date }>("AddLoanRepaymentTerms", "repaymentTerms", [
    (ids, nextId) => of.insertList(ids[0], nextId, "cashOut"),
    (ids, nextId) => of.insertObject(ids[1], nextId),
    (ids, nextId) => of.insertProp(ids[2], nextId, ValueType.integer, RepaymentType.Monthly, "type"),
    (ids, nextId) => of.insertProp(ids[2], nextId, ValueType.decimal, 0, "amount"),
    (ids, nextId, args) => of.insertProp(ids[2], nextId, ValueType.date, args.date.toISOString(), "startDate"),
    (ids, nextId) => of.insertProp(ids[2], nextId, ValueType.decimal, 1, "limitFixedAmount"),
    (ids, nextId) => of.insertProp(ids[2], nextId, ValueType.integer, 1, "numberOfMonths")
  ]),
  "AddLoanRepaymentTermsCashOut": ef.createObjectInsert<{ date: Date }>("AddLoanRepaymentTermsCashOut", undefined, [
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.integer, RepaymentType.OneTime, "type"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.decimal, 0, "amount"),
    (ids, nextId, args) => of.insertProp(ids[0], nextId, ValueType.date, args.date.toISOString(), "startDate"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.decimal, 1, "limitFixedAmount"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.integer, 1, "numberOfMonths")
  ]),
  "DeleteLoanRepaymentTermsCashOut": ef.createDelete("DeleteLoanRepaymentTermsCashOut", ValueType.object, undefined),
  "SetLoanRepaymentTermsCashOutType": (cashOut: ICashOut, repaymentType: RepaymentType, amount: number): IEvent<ICashForecast> => {
    return cashForecastEventStore.createEvent(() => ({
      type: "SetLoanRepaymentTermsCashOutType",
      operations: [
        of.updateProp(cashOut.type.parentId, cashOut.type.globalId, ValueType.integer, repaymentType),
        of.updateProp(cashOut.amount.parentId, cashOut.amount.globalId, ValueType.decimal, amount),
      ]
    }));
  },
  "SetLoanRepaymentTermsCashOutAmount": ef.createPropUpdate<number>("SetLoanRepaymentTermsCashOutAmount", ValueType.decimal),
  "SetLoanRepaymentTermsCashOutStartDate": ef.createPropUpdate<Date>("SetLoanRepaymentTermsCashOutStartDate", ValueType.date),
  "SetLoanRepaymentTermsCashOutLimitFixedAmount":
    ef.createPropUpdate<number>("SetLoanRepaymentTermsCashOutLimitFixedAmount", ValueType.decimal),
  "SetLoanRepaymentTermsCashOutNumberOfMonths":
    ef.createPropUpdate<number>("SetLoanRepaymentTermsCashOutNumberOfMonths", ValueType.integer),
  // === funding
  "AddFunding": ef.createObjectInsert<{ date: Date }>("AddFunding", undefined, [
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.string, "", "name"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.integer, LoanType.OneTime, "type"),
    (ids, nextId) => of.insertList(ids[0], nextId, "cashIn"),
    (ids, nextId) => of.insertObject(ids[3], nextId),
    (ids, nextId, args) => of.insertProp(ids[4], nextId, ValueType.date, args.date.toISOString(), "date"),
    (ids, nextId) => of.insertProp(ids[4], nextId, ValueType.decimal, 0, "amount")
  ]),
  "DeleteFunding": ef.createDelete("DeleteFunding", ValueType.object, undefined),
  "SetFundingName": ef.createPropUpdate<string>("SetFundingName", ValueType.string),
  "SetFundingType": ef.createPropUpdate<LoanType>("SetFundingType", ValueType.integer),
  // no SetFundingTypeMonthly - not a valid option for Funding currently
  // "AddFundingNumberOfMonths": ef.createPropInsert<number>("AddFundingNumberOfMonths", ValueType.integer, "numberOfMonths"),
  // "SetFundingNumberOfMonths": ef.createPropUpdate<number>("SetFundingNumberOfMonths", ValueType.integer),
  "AddFundingCashIn": ef.createObjectInsert<{ date: Date }>("AddFundingCashIn", undefined, [
    (ids, nextId, args) => of.insertProp(ids[0], nextId, ValueType.date, args.date.toISOString(), "date"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.decimal, 0, "amount")
  ]),
  "SetFundingCashInDate": ef.createPropUpdate<Date>("SetFundingCashInDate", ValueType.date),
  "SetFundingCashInAmount": ef.createPropUpdate<number>("SetFundingCashInAmount", ValueType.decimal),
  "DeleteFundingCashIn": ef.createDelete("DeleteFundingCashIn", ValueType.object, undefined),
  "AddFundingRepaymentTerms": ef.createObjectInsert<{ date: Date, amount: number }>("AddFundingRepaymentTerms", "repaymentTerms", [
    (ids, nextId) => of.insertList(ids[0], nextId, "cashOut"),
    (ids, nextId) => of.insertObject(ids[1], nextId),
    (ids, nextId) => of.insertProp(ids[2], nextId, ValueType.integer, RepaymentType.GrossRevenueShare, "type"),
    (ids, nextId) => of.insertProp(ids[2], nextId, ValueType.decimal, 0.8, "amount"),
    (ids, nextId, args) => of.insertProp(ids[2], nextId, ValueType.date, args.date.toISOString(), "startDate"),
    (ids, nextId, args) => of.insertProp(ids[2], nextId, ValueType.decimal, args.amount, "limitFixedAmount"),
    (ids, nextId) => of.insertProp(ids[2], nextId, ValueType.integer, 1, "numberOfMonths")
  ]),
  "AddFundingRepaymentTermsCashOut": ef.createObjectInsert<{ date: Date }>("AddFundingRepaymentTermsCashOut", undefined, [
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.integer, RepaymentType.GrossRevenueShare, "type"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.decimal, 0.0, "amount"),
    (ids, nextId, args) => of.insertProp(ids[0], nextId, ValueType.date, args.date.toISOString(), "startDate"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.decimal, 0, "limitFixedAmount"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.integer, 1, "numberOfMonths")
  ]),
  "DeleteFundingRepaymentTermsCashOut": ef.createDelete("DeleteFundingRepaymentTermsCashOut", ValueType.object, undefined),
  "SetFundingRepaymentTermsCashOutType": (cashOut: ICashOut, repaymentType: RepaymentType, amount: number): IEvent<ICashForecast> => {
    return cashForecastEventStore.createEvent(() => ({
      type: "SetFundingRepaymentTermsCashOutType",
      operations: [
        of.updateProp(cashOut.type.parentId, cashOut.type.globalId, ValueType.integer, repaymentType),
        of.updateProp(cashOut.amount.parentId, cashOut.amount.globalId, ValueType.decimal, amount),
      ]
    }));
  },
  "SetFundingRepaymentTermsCashOutAmount":
    ef.createPropUpdate<number>("SetFundingRepaymentTermsCashOutAmount", ValueType.decimal),
  "SetFundingRepaymentTermsCashOutStartDate":
    ef.createPropUpdate<Date>("SetFundingRepaymentTermsCashOutStartDate", ValueType.date),
  "SetFundingRepaymentTermsCashOutLimitFixedAmount":
    ef.createPropUpdate<number>("SetFundingRepaymentTermsCashOutLimitFixedAmount", ValueType.decimal),
  "SetFundingRepaymentTermsCashOutNumberOfMonths":
    ef.createPropUpdate<number>("SetFundingRepaymentTermsCashOutNumberOfMonths", ValueType.integer),
  // === expense
  "AddExpense": ef.createObjectInsert<{ date: Date, expenseCategory: ExpenseCategory }>("AddExpense", undefined, [
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.string, "", "name"),
    (ids, nextId, args) => of.insertProp(ids[0], nextId, ValueType.integer, args.expenseCategory, "category"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.integer, ExpenseFrequency.OneTime, "frequency"),
    (ids, nextId, args) => of.insertProp(ids[0], nextId, ValueType.date, args.date, "startDate"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.integer, ExpenseUntil.Date, "until"),
    (ids, nextId, args) => of.insertProp(ids[0], nextId, ValueType.date, args.date, "endDate"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.decimal, 0, "amount"),

  ]),
  "DeleteExpense": ef.createDelete("DeleteExpense", ValueType.object, undefined),
  "SetExpenseName": ef.createPropUpdate<string>("SetExpenseName", ValueType.string),
  "SetExpenseFrequency": ef.createPropUpdate<ExpenseFrequency>("SetExpenseFrequency", ValueType.integer),
  "SetExpenseStartDate": ef.createPropUpdate<Date>("SetExpenseStartDate", ValueType.date),
  "SetExpenseUntil": ef.createPropUpdate<ExpenseUntil>("SetExpenseUntil", ValueType.integer),
  "SetExpenseEndDate": ef.createPropUpdate<Date>("SetExpenseEndDate", ValueType.date),
  "SetExpenseAmount": ef.createPropUpdate<number>("SetExpenseAmount", ValueType.decimal),
  // === employee
  "AddEmployee": ef.createObjectInsert<{ date: Date, expenseCategory: ExpenseCategory }>("AddEmployee", undefined, [
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.string, "", "name"),
    (ids, nextId, args) => of.insertProp(ids[0], nextId, ValueType.integer, args.expenseCategory, "category"),
    (ids, nextId, args) => of.insertProp(ids[0], nextId, ValueType.date, args.date, "startDate"),
    (ids, nextId, args) => of.insertProp(ids[0], nextId, ValueType.date, args.date, "endDate"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.decimal, 0, "salaryAmount"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.decimal, 0, "benefitsPercent"),
    (ids, nextId) => of.insertList(ids[0], nextId, "additionalPay"),
  ]),
  "DeleteEmployee": ef.createDelete("DeleteEmployee", ValueType.object, undefined),
  "SetEmployeeName": ef.createPropUpdate<string>("SetEmployeeName", ValueType.string),
  "SetEmployeeCategory": ef.createPropUpdate<ExpenseCategory>("SetEmployeeCategory", ValueType.integer),
  "SetEmployeeStartDate": ef.createPropUpdate<Date>("SetEmployeeStartDate", ValueType.date),
  "SetEmployeeEndDate": ef.createPropUpdate<Date>("SetEmployeeEndDate", ValueType.date),
  "SetEmployeeAmount": ef.createPropUpdate<number>("SetEmployeeAmount", ValueType.decimal),
  "SetEmployeeBenefits": ef.createPropUpdate<number>("SetEmployeeBenefits", ValueType.decimal),
  "AddEmployeeAdditionalPay": ef.createObjectInsert<{ date: Date }>("AddEmployeeAdditionalPay", undefined, [
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.integer, AdditionalEmployeeExpenseType.BonusDollarsOnce, "type"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.decimal, 0, "amount"),
    (ids, nextId) => of.insertProp(ids[0], nextId, ValueType.integer, AdditionalEmployeeExpenseFrequency.Launch, "frequency"),
    (ids, nextId, args) => of.insertProp(ids[0], nextId, ValueType.date, args.date, "date"),
  ]),
  "DeleteEmployeeAdditionalPay": ef.createDelete("DeleteEmployeeAdditionalPay", ValueType.boolean, undefined),
  "SetEmployeeAdditionalPayType": ef.createPropUpdate<AdditionalEmployeeExpenseType>(
    "SetEmployeeAdditionalPayType", ValueType.integer),
  "SetEmployeeAdditionalPayFrequency": ef.createPropUpdate<AdditionalEmployeeExpenseFrequency>(
    "SetEmployeeAdditionalPayFrequency", ValueType.integer),
  "SetAdditionalEmployeePayAmount": ef.createPropUpdate<number>("SetAdditionalEmployeePayAmount", ValueType.decimal),
  "SetEmployeeAdditionalPayDate": ef.createPropUpdate<Date>("SetEmployeeAdditionalPayDate", ValueType.date),
};

