﻿using GDB.Business.BusinessLogic._Generic;
using GDB.Common.DTOs._Events;
using GDB.Common.DTOs.CashForecast;
using GDB.Common.DTOs.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;

namespace GDB.Business.BusinessLogic.CashForecastService
{
    public class CashForecastEventApplier : IEventApplier<CashForecastDTO>
    {
        public const string CreateEventType = "CreateCashForecast";

        public string ObjectType => "CashForecast";
        public string GetRootId(string gameId)
        {
            return $"{gameId}:cf";
        }

        public ChangeEvent GetCreateEvent(string gameId, DateTime createDate)
        {
            var forecastStartDate = new DateTime(createDate.Year, createDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            return new ChangeEvent("System", 1, CreateEventType, 1, 0)
            {
                Operations = new List<EventOperation>()
                {
                    new EventOperation()
                    {
                        Action = OperationType.MakeObject,
                        ParentId = gameId,
                        ObjectId = GetRootId(gameId),
                        Field = "cashForecast",
                        Insert = true
                    },
                    new EventOperation()
                    {
                        Action = OperationType.Set,
                        ParentId = GetRootId(gameId),
                        ObjectId = $"{ GetRootId(gameId) }:fsd",
                        Field = "forecastStartDate",
                        Value = forecastStartDate
        }
                }
            };
        }


        public void ApplyEvent(EventStore<CashForecastDTO, ChangeEvent> modelStore, ChangeEvent change)
        {
            var model = modelStore.Model;

            switch (change.Type)
            {
                case CreateEventType:
                    if (change.Operations.Count == 1)
                    {
                        // initial version, no forecast date so make it a fixed value
                        this.EnsureOperationCount(change, 1);
                        modelStore.Init(new CashForecastDTO(change.Operations[0].ParentId, change.Operations[0].ObjectId, new DateTime(2021, 2, 1, 0, 0, 0, DateTimeKind.Utc)));
                    }
                    else
                    {
                        this.EnsureOperationCount(change, 2);
                        var forecastDate = this.ToDateTime(change.Operations[1].Value);
                        modelStore.Init(new CashForecastDTO(change.Operations[0].ParentId, change.Operations[0].ObjectId, forecastDate));
                    }
                    break;

                // ==== GENERAL
                case "SetForecastStartDate":
                    this.EnsureOperationCount(change, 2);
                    if (model.ForecastStartDate.GlobalId == change.Operations[0].ObjectId && model.ForecastMonthCount.GlobalId == change.Operations[1].ObjectId)
                    {
                        model.ForecastStartDate.Value = this.ToDateTime(change.Operations[0].Value);
                        model.ForecastMonthCount.Value = this.ToInt(change.Operations[1].Value);
                    }
                    break;
                case "AdvanceForecastStartDate":
                    this.EnsureOperationCount(change, 4);
                    if (model.ForecastStartDate.GlobalId == change.Operations[0].ObjectId && model.ForecastMonthCount.GlobalId == change.Operations[1].ObjectId &&
                        model.BankBalance.Date.GlobalId == change.Operations[2].ObjectId && model.BankBalance.Amount.GlobalId == change.Operations[3].ObjectId)
                    {
                        model.ForecastStartDate.Value = this.ToDateTime(change.Operations[0].Value);
                        model.ForecastMonthCount.Value = this.ToInt(change.Operations[1].Value);
                        model.BankBalance.Date.Value = this.ToDateTime(change.Operations[2].Value);
                        model.BankBalance.Amount.Value = this.ToDecimal(change.Operations[3].Value);
                    }
                    break;
                case "SetLaunchDate":
                    this.EnsureOperationCount(change, 2);
                    if (model.LaunchDate.GlobalId == change.Operations[0].ObjectId && model.ForecastMonthCount.GlobalId == change.Operations[1].ObjectId)
                    {
                        model.LaunchDate.Value = this.ToDateTime(change.Operations[0].Value);
                        model.ForecastMonthCount.Value = this.ToInt(change.Operations[1].Value);
                    }
                    break;
                case "SetForecastStage":
                    this.EnsureOperationCount(change, 1);
                    if (model.Stage.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.Stage.Value = this.ToEnum<ForecastStage>(change.Operations[0].Value);
                    }
                    break;
                case "SetForecastLength":
                    this.EnsureOperationCount(change, 2);
                    if (model.Length.GlobalId == change.Operations[0].ObjectId && model.ForecastMonthCount.GlobalId == change.Operations[1].ObjectId)
                    {
                        model.Length.Value = this.ToEnum<ForecastLength>(change.Operations[0].Value);
                        model.ForecastMonthCount.Value = this.ToInt(change.Operations[1].Value);
                    }
                    break;
                case "SetForecastStageAndLength":
                    this.EnsureOperationCount(change, 3);
                    if (model.Stage.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.Stage.Value = this.ToEnum<ForecastStage>(change.Operations[0].Value);
                        model.Length.Value = this.ToEnum<ForecastLength>(change.Operations[1].Value);
                        model.ForecastMonthCount.Value = this.ToInt(change.Operations[2].Value);
                    }
                    break;
                // ==== GOALS
                case "SetYourGoal":
                    this.EnsureOperationCount(change, 1);
                    if (model.Goals.GlobalId == change.Operations[0].ParentId && model.Goals.YourGoal.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.Goals.YourGoal.Value = this.ToDecimal(change.Operations[0].Value);
                    }
                    break;
                case "SetPartnerGoal":
                    this.EnsureOperationCount(change, 1);
                    if (model.Goals.GlobalId == change.Operations[0].ParentId && model.Goals.PartnerGoal.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.Goals.PartnerGoal.Value = this.ToDecimal(change.Operations[0].Value);
                    }
                    break;

                // ==== BANK BALANCE

                case "SetBankBalanceName":
                    this.EnsureOperationCount(change, 1);
                    if (model.BankBalance.Name.ParentId == change.Operations[0].ParentId && model.BankBalance.Name.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.BankBalance.Name.Value = change.Operations[0].Value.ToString();
                    }
                    break;
                case "SetBankBalanceAmount":
                    this.EnsureOperationCount(change, 1);
                    if (model.BankBalance.GlobalId == change.Operations[0].ParentId && model.BankBalance.Amount.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.BankBalance.Amount.Value = this.ToDecimal(change.Operations[0].Value);
                    }
                    break;
                case "SetBankBalanceDate":
                    this.EnsureOperationCount(change, 1);
                    if (model.BankBalance.GlobalId == change.Operations[0].ParentId && model.BankBalance.Date.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.BankBalance.Date.Value = this.ToDateTime(change.Operations[0].Value);
                    }
                    break;

                // ==== LOAN

                case "AddLoan":
                    this.EnsureOperationCount(change, 7);
                    if (model.Loans.GlobalId == change.Operations[0].ParentId)
                    {
                        // skip 0, come back at end
                        var name = new IdentifiedPrimitive<string>(change.Operations[1].ParentId, change.Operations[1].ObjectId, change.Operations[1].Value.ToString());
                        var type = new IdentifiedPrimitive<LoanType>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToEnum<LoanType>(change.Operations[2].Value));
                        var cashIn = new IdentifiedList<CashIn>(change.Operations[3].ParentId, change.Operations[3].ObjectId);
                        // skip 4, come back ater next 2
                        var cashInDate = new IdentifiedPrimitive<DateTime>(change.Operations[5].ParentId, change.Operations[5].ObjectId, this.ToDateTime(change.Operations[5].Value));
                        var cashInAmount = new IdentifiedPrimitive<decimal>(change.Operations[6].ParentId, change.Operations[6].ObjectId, this.ToDecimal(change.Operations[6].Value));
                        // put them together
                        cashIn.List.Add(new CashIn(change.Operations[4].ParentId, change.Operations[4].ObjectId, cashInDate, cashInAmount));
                        model.Loans.List.Add(new LoanItem(change.Operations[0].ParentId, change.Operations[0].ObjectId, name, type, cashIn));
                    }
                    break;
                case "DeleteLoan":
                    this.EnsureOperationCount(change, 1);
                    {
                        var loan = model.Loans.List.FirstOrDefault(loan => loan.GlobalId == change.Operations[0].ObjectId);
                        if (loan != null)
                        {
                            model.Loans.List.Remove(loan);
                        }
                    }
                    break;
                case "SetLoanName":
                    this.EnsureOperationCount(change, 1);
                    {
                        var loan = model.Loans.List.FirstOrDefault(loan => loan.GlobalId == change.Operations[0].ParentId);
                        if (loan != null && loan.Name.GlobalId == change.Operations[0].ObjectId)
                        {
                            loan.Name.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "SetLoanType":
                    this.EnsureOperationCount(change, 1);
                    {
                        var loan = model.Loans.List.FirstOrDefault(loan => loan.GlobalId == change.Operations[0].ParentId);
                        if (loan != null && loan.Type.GlobalId == change.Operations[0].ObjectId)
                        {
                            loan.Type.Value = this.ToEnum<LoanType>(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetLoanTypeMonthly":
                    this.EnsureOperationCount(change, 2);
                    {
                        var loan = model.Loans.List.FirstOrDefault(loan => loan.GlobalId == change.Operations[0].ParentId);
                        if (loan != null && loan.Type.GlobalId == change.Operations[0].ObjectId)
                        {
                            loan.Type.Value = this.ToEnum<LoanType>(change.Operations[0].Value);
                            if (loan.NumberOfMonths == null)
                            {
                                loan.NumberOfMonths = new IdentifiedPrimitive<int>(change.Operations[1].ParentId, change.Operations[1].ObjectId, this.ToInt(change.Operations[1].Value), change.Operations[1].Field);
                            }
                            else if (loan.NumberOfMonths.GlobalId == change.Operations[1].ObjectId)
                            {
                                loan.NumberOfMonths.Value = this.ToInt(change.Operations[1].Value);
                            }
                            else
                            {
                                // no match
                                // TODO - conflict resolution
                            }
                        }
                    }
                    break;
                case "AddLoanNumberOfMonths":
                    this.EnsureOperationCount(change, 1);
                    {
                        var loan = model.Loans.List.FirstOrDefault(loan => loan.GlobalId == change.Operations[0].ParentId);
                        if (loan != null)
                        {
                            if (loan.NumberOfMonths == null)
                            {
                                loan.NumberOfMonths = new IdentifiedPrimitive<int>(change.Operations[0].ParentId, change.Operations[0].ObjectId, this.ToInt(change.Operations[0].Value), change.Operations[0].Field);
                            }
                            else if (loan.NumberOfMonths.GlobalId == change.Operations[0].ObjectId)
                            {
                                loan.NumberOfMonths.Value = this.ToInt(change.Operations[0].Value);
                            }
                            else
                            {
                                // no match
                                // TODO - conflict resolution
                            }
                        }
                    }
                    break;
                case "SetLoanNumberOfMonths":
                    this.EnsureOperationCount(change, 1);
                    {
                        var loan = model.Loans.List.FirstOrDefault(loan => loan.GlobalId == change.Operations[0].ParentId);
                        if (loan != null && loan.NumberOfMonths != null)
                        {
                            if (loan.NumberOfMonths.GlobalId == change.Operations[0].ObjectId)
                            {
                                loan.NumberOfMonths.Value = this.ToInt(change.Operations[0].Value);
                            }
                            else
                            {
                                // no match
                                // TODO - conflict resolution
                            }
                        }
                    }
                    break;
                case "AddLoanCashIn":
                    this.EnsureOperationCount(change, 3);
                    {
                        var loan = model.Loans.List.FirstOrDefault(loan => loan.CashIn.GlobalId == change.Operations[0].ParentId);
                        if (loan != null)
                        {
                            loan.CashIn.List.Add(new CashIn(
                                change.Operations[0].ParentId,
                                change.Operations[0].ObjectId,
                                new IdentifiedPrimitive<DateTime>(change.Operations[1].ParentId, change.Operations[1].ObjectId, this.ToDateTime(change.Operations[1].Value), change.Operations[1].Field),
                                new IdentifiedPrimitive<decimal>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToDecimal(change.Operations[2].Value), change.Operations[2].Field)
                            ));
                        }
                    }
                    break;
                case "SetLoanCashInDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var loan = model.Loans.List.FirstOrDefault(loan => loan.CashIn.List.Any(c => c.GlobalId == change.Operations[0].ParentId));
                        if (loan != null)
                        {
                            var cashIn = loan.CashIn.List.FirstOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                            if (cashIn != null && cashIn.Date.GlobalId == change.Operations[0].ObjectId)
                            {
                                cashIn.Date.Value = this.ToDateTime(change.Operations[0].Value);
                            }
                        }
                    }
                    break;
                case "SetLoanCashInAmount":
                    this.EnsureOperationCount(change, 1);
                    {
                        var loan = model.Loans.List.FirstOrDefault(loan => loan.CashIn.List.Any(c => c.GlobalId == change.Operations[0].ParentId));
                        if (loan != null)
                        {
                            var cashIn = loan.CashIn.List.FirstOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                            if (cashIn != null && cashIn.Amount.GlobalId == change.Operations[0].ObjectId)
                            {
                                cashIn.Amount.Value = this.ToDecimal(change.Operations[0].Value);
                            }
                        }
                    }
                    break;
                case "DeleteLoanCashIn":
                    this.EnsureOperationCount(change, 1);
                    {
                        var loan = model.Loans.List.FirstOrDefault(loan => loan.CashIn.List.Any(c => c.GlobalId == change.Operations[0].ObjectId));
                        if (loan != null)
                        {
                            loan.CashIn.List.RemoveAll(ci => ci.GlobalId == change.Operations[0].ObjectId);
                        }
                    }
                    break;
                case "AddLoanRepaymentTerms":
                    this.EnsureOperationCount(change, 8);
                    {
                        var loan = model.Loans.List.FirstOrDefault(loan => loan.GlobalId == change.Operations[0].ParentId);
                        if (loan.RepaymentTerms == null)
                        {
                            loan.RepaymentTerms = new LoanRepaymentTerms(
                                change.Operations[0].ParentId,
                                change.Operations[0].ObjectId,
                                new IdentifiedList<LoanCashOut>(change.Operations[1].ParentId, change.Operations[1].ObjectId, change.Operations[1].Field),
                                change.Operations[0].Field
                            );
                            loan.RepaymentTerms.CashOut.List.Add(new LoanCashOut(
                                change.Operations[2].ParentId,
                                change.Operations[2].ObjectId,
                                new IdentifiedPrimitive<LoanRepaymentType>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToEnum<LoanRepaymentType>(change.Operations[3].Value), change.Operations[3].Field),
                                new IdentifiedPrimitive<decimal>(change.Operations[4].ParentId, change.Operations[4].ObjectId, this.ToDecimal(change.Operations[4].Value), change.Operations[4].Field),
                                new IdentifiedPrimitive<DateTime>(change.Operations[5].ParentId, change.Operations[5].ObjectId, this.ToDateTime(change.Operations[5].Value), change.Operations[5].Field),
                                new IdentifiedPrimitive<decimal>(change.Operations[6].ParentId, change.Operations[6].ObjectId, this.ToDecimal(change.Operations[6].Value), change.Operations[6].Field),
                                new IdentifiedPrimitive<int>(change.Operations[7].ParentId, change.Operations[7].ObjectId, this.ToInt(change.Operations[7].Value), change.Operations[7].Field
                                ),
                                change.Operations[3].Field
                            ));
                        }
                    }
                    break;
                case "AddLoanRepaymentTermsCashOut":
                    this.EnsureOperationCount(change, 6);
                    {
                        var loan = model.Loans.List.FirstOrDefault(l => l.RepaymentTerms?.CashOut.GlobalId == change.Operations[0].ParentId);
                        if (loan != null)
                        {
                            loan.RepaymentTerms.CashOut.List.Add(new LoanCashOut(
                                change.Operations[0].ParentId,
                                change.Operations[0].ObjectId,
                                new IdentifiedPrimitive<LoanRepaymentType>(change.Operations[1].ParentId, change.Operations[1].ObjectId, this.ToEnum<LoanRepaymentType>(change.Operations[1].Value), change.Operations[1].Field),
                                new IdentifiedPrimitive<decimal>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToDecimal(change.Operations[2].Value), change.Operations[2].Field),
                                new IdentifiedPrimitive<DateTime>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToDateTime(change.Operations[3].Value), change.Operations[3].Field),
                                new IdentifiedPrimitive<decimal>(change.Operations[4].ParentId, change.Operations[4].ObjectId, this.ToDecimal(change.Operations[4].Value), change.Operations[4].Field),
                                new IdentifiedPrimitive<int>(change.Operations[5].ParentId, change.Operations[5].ObjectId, this.ToInt(change.Operations[5].Value), change.Operations[5].Field
                                ),
                                change.Operations[0].Field
                            ));
                        }
                    }
                    break;
                case "DeleteLoanRepaymentTermsCashOut":
                    this.EnsureOperationCount(change, 1);
                    {
                        var loan = model.Loans.List.FirstOrDefault(l => l.RepaymentTerms?.CashOut.GlobalId == change.Operations[0].ParentId);
                        if (loan != null)
                        {
                            loan.RepaymentTerms.CashOut.List.RemoveAll(co => co.GlobalId == change.Operations[0].ObjectId);
                        }
                    }
                    break;
                case "SetLoanRepaymentTermsCashOutType":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cashOut = model.Loans.List.SelectMany(l => l.RepaymentTerms?.CashOut.List.Where(co => co.GlobalId == change.Operations[0].ParentId)).FirstOrDefault(c => c != null);
                        if (cashOut != null)
                        {
                            cashOut.Type.Value = this.ToEnum<LoanRepaymentType>(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetLoanRepaymentTermsCashOutAmount":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cashOut = model.Loans.List.SelectMany(l => l.RepaymentTerms?.CashOut.List.Where(co => co.GlobalId == change.Operations[0].ParentId)).FirstOrDefault(c => c != null);
                        if (cashOut != null)
                        {
                            cashOut.Amount.Value = this.ToDecimal(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetLoanRepaymentTermsCashOutStartDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cashOut = model.Loans.List.SelectMany(l => l.RepaymentTerms?.CashOut.List.Where(co => co.GlobalId == change.Operations[0].ParentId)).FirstOrDefault(c => c != null);
                        if (cashOut != null)
                        {
                            cashOut.StartDate.Value = this.ToDateTime(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetLoanRepaymentTermsCashOutLimitFixedAmount":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cashOut = model.Loans.List.SelectMany(l => l.RepaymentTerms?.CashOut.List.Where(co => co.GlobalId == change.Operations[0].ParentId)).FirstOrDefault(c => c != null);
                        if (cashOut != null)
                        {
                            cashOut.LimitFixedAmount.Value = this.ToDecimal(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetLoanRepaymentTermsCashOutNumberOfMonths":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cashOut = model.Loans.List.SelectMany(l => l.RepaymentTerms?.CashOut.List.Where(co => co.GlobalId == change.Operations[0].ParentId)).FirstOrDefault(c => c != null);
                        if (cashOut != null)
                        {
                            cashOut.NumberOfMonths.Value = this.ToInt(change.Operations[0].Value);
                        }
                    }
                    break;

                // ==== FUNDING

                case "AddFunding":
                    this.EnsureOperationCount(change, 7);
                    if (model.Funding.GlobalId == change.Operations[0].ParentId)
                    {
                        // skip 0, come back at end
                        var name = new IdentifiedPrimitive<string>(change.Operations[1].ParentId, change.Operations[1].ObjectId, change.Operations[1].Value.ToString());
                        var type = new IdentifiedPrimitive<LoanType>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToEnum<LoanType>(change.Operations[2].Value));
                        var cashIn = new IdentifiedList<CashIn>(change.Operations[3].ParentId, change.Operations[3].ObjectId);
                        // skip 4, come back ater next 2
                        var cashInDate = new IdentifiedPrimitive<DateTime>(change.Operations[5].ParentId, change.Operations[5].ObjectId, this.ToDateTime(change.Operations[5].Value));
                        var cashInAmount = new IdentifiedPrimitive<decimal>(change.Operations[6].ParentId, change.Operations[6].ObjectId, this.ToDecimal(change.Operations[6].Value));
                        // put them together
                        cashIn.List.Add(new CashIn(change.Operations[4].ParentId, change.Operations[4].ObjectId, cashInDate, cashInAmount));
                        model.Funding.List.Add(new Funding(change.Operations[0].ParentId, change.Operations[0].ObjectId, name, type, cashIn));
                    }
                    break;
                case "DeleteFunding":
                    this.EnsureOperationCount(change, 1);
                    {
                        var funding = model.Funding.List.FirstOrDefault(f => f.GlobalId == change.Operations[0].ObjectId);
                        if (funding != null)
                        {
                            model.Funding.List.Remove(funding);
                        }
                    }
                    break;
                case "SetFundingName":
                    this.EnsureOperationCount(change, 1);
                    {
                        var funding = model.Funding.List.FirstOrDefault(f => f.GlobalId == change.Operations[0].ParentId);
                        if (funding != null && funding.Name.GlobalId == change.Operations[0].ObjectId)
                        {
                            funding.Name.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "SetFundingType":
                    this.EnsureOperationCount(change, 1);
                    {
                        var funding = model.Funding.List.FirstOrDefault(f => f.GlobalId == change.Operations[0].ParentId);
                        if (funding != null && funding.Type.GlobalId == change.Operations[0].ObjectId)
                        {
                            funding.Type.Value = this.ToEnum<LoanType>(change.Operations[0].Value);
                        }
                    }
                    break;
                // no option for monthly or number of months for Funding
                case "AddFundingCashIn":
                    this.EnsureOperationCount(change, 3);
                    {
                        var funding = model.Funding.List.FirstOrDefault(f => f.CashIn.GlobalId == change.Operations[0].ParentId);
                        if (funding != null)
                        {
                            funding.CashIn.List.Add(new CashIn(
                                change.Operations[0].ParentId,
                                change.Operations[0].ObjectId,
                                new IdentifiedPrimitive<DateTime>(change.Operations[1].ParentId, change.Operations[1].ObjectId, this.ToDateTime(change.Operations[1].Value), change.Operations[1].Field),
                                new IdentifiedPrimitive<decimal>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToDecimal(change.Operations[2].Value), change.Operations[2].Field)
                            ));
                        }
                    }
                    break;
                case "SetFundingCashInDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var funding = model.Funding.List.FirstOrDefault(f => f.CashIn.List.Any(c => c.GlobalId == change.Operations[0].ParentId));
                        if (funding != null)
                        {
                            var cashIn = funding.CashIn.List.FirstOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                            if (cashIn != null && cashIn.Date.GlobalId == change.Operations[0].ObjectId)
                            {
                                cashIn.Date.Value = this.ToDateTime(change.Operations[0].Value);
                            }
                        }
                    }
                    break;
                case "SetFundingCashInAmount":
                    this.EnsureOperationCount(change, 1);
                    {
                        var funding = model.Funding.List.FirstOrDefault(f => f.CashIn.List.Any(c => c.GlobalId == change.Operations[0].ParentId));
                        if (funding != null)
                        {
                            var cashIn = funding.CashIn.List.FirstOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                            if (cashIn != null && cashIn.Amount.GlobalId == change.Operations[0].ObjectId)
                            {
                                cashIn.Amount.Value = this.ToDecimal(change.Operations[0].Value);
                            }
                        }
                    }
                    break;
                case "DeleteFundingCashIn":
                    this.EnsureOperationCount(change, 1);
                    {
                        var funding = model.Funding.List.FirstOrDefault(f => f.CashIn.List.Any(c => c.GlobalId == change.Operations[0].ObjectId));
                        if (funding != null)
                        {
                            funding.CashIn.List.RemoveAll(ci => ci.GlobalId == change.Operations[0].ObjectId);
                        }
                    }
                    break;
                case "AddFundingRepaymentTerms":
                    this.EnsureOperationCount(change, 8);
                    {
                        var funding = model.Funding.List.FirstOrDefault(f => f.GlobalId == change.Operations[0].ParentId);
                        if (funding.RepaymentTerms == null)
                        {
                            funding.RepaymentTerms = new FundingRepaymentTerms(
                                change.Operations[0].ParentId,
                                change.Operations[0].ObjectId,
                                new IdentifiedList<FundingCashOut>(change.Operations[1].ParentId, change.Operations[1].ObjectId, change.Operations[1].Field),
                                change.Operations[0].Field
                            );
                            funding.RepaymentTerms.CashOut.List.Add(new FundingCashOut(
                                change.Operations[2].ParentId,
                                change.Operations[2].ObjectId,
                                new IdentifiedPrimitive<FundingRepaymentType>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToEnum<FundingRepaymentType>(change.Operations[3].Value), change.Operations[3].Field),
                                new IdentifiedPrimitive<decimal>(change.Operations[4].ParentId, change.Operations[4].ObjectId, this.ToDecimal(change.Operations[4].Value), change.Operations[4].Field),
                                new IdentifiedPrimitive<DateTime>(change.Operations[5].ParentId, change.Operations[5].ObjectId, this.ToDateTime(change.Operations[5].Value), change.Operations[5].Field),
                                new IdentifiedPrimitive<decimal>(change.Operations[6].ParentId, change.Operations[6].ObjectId, this.ToDecimal(change.Operations[6].Value), change.Operations[6].Field),
                                new IdentifiedPrimitive<int>(change.Operations[7].ParentId, change.Operations[7].ObjectId, this.ToInt(change.Operations[7].Value), change.Operations[7].Field
                                ),
                                change.Operations[3].Field
                            ));
                        }
                    }
                    break;
                case "AddFundingRepaymentTermsCashOut":
                    this.EnsureOperationCount(change, 6);
                    {
                        var funding = model.Funding.List.FirstOrDefault(f => f.RepaymentTerms?.CashOut.GlobalId == change.Operations[0].ParentId);
                        if (funding != null)
                        {
                            funding.RepaymentTerms.CashOut.List.Add(new FundingCashOut(
                                change.Operations[0].ParentId,
                                change.Operations[0].ObjectId,
                                new IdentifiedPrimitive<FundingRepaymentType>(change.Operations[1].ParentId, change.Operations[1].ObjectId, this.ToEnum<FundingRepaymentType>(change.Operations[1].Value), change.Operations[1].Field),
                                new IdentifiedPrimitive<decimal>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToDecimal(change.Operations[2].Value), change.Operations[2].Field),
                                new IdentifiedPrimitive<DateTime>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToDateTime(change.Operations[3].Value), change.Operations[3].Field),
                                new IdentifiedPrimitive<decimal>(change.Operations[4].ParentId, change.Operations[4].ObjectId, this.ToDecimal(change.Operations[4].Value), change.Operations[4].Field),
                                new IdentifiedPrimitive<int>(change.Operations[5].ParentId, change.Operations[5].ObjectId, this.ToInt(change.Operations[5].Value), change.Operations[5].Field
                                ),
                                change.Operations[0].Field
                            ));
                        }
                    }
                    break;
                case "DeleteFundingRepaymentTermsCashOut":
                    this.EnsureOperationCount(change, 1);
                    {
                        var funding = model.Funding.List.FirstOrDefault(f => f.RepaymentTerms?.CashOut.GlobalId == change.Operations[0].ParentId);
                        if (funding != null)
                        {
                            funding.RepaymentTerms.CashOut.List.RemoveAll(co => co.GlobalId == change.Operations[0].ObjectId);
                        }
                    }
                    break;
                case "SetFundingRepaymentTermsCashOutType":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cashOut = model.Funding.List.SelectMany(f => f.RepaymentTerms?.CashOut.List.Where(co => co.GlobalId == change.Operations[0].ParentId)).FirstOrDefault(c => c != null);
                        if (cashOut != null)
                        {
                            cashOut.Type.Value = this.ToEnum<FundingRepaymentType>(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetFundingRepaymentTermsCashOutAmount":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cashOut = model.Funding.List.SelectMany(f => f.RepaymentTerms?.CashOut.List.Where(co => co.GlobalId == change.Operations[0].ParentId)).FirstOrDefault(c => c != null);
                        if (cashOut != null)
                        {
                            cashOut.Amount.Value = this.ToDecimal(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetFundingRepaymentTermsCashOutStartDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cashOut = model.Funding.List.SelectMany(f => f.RepaymentTerms?.CashOut.List.Where(co => co.GlobalId == change.Operations[0].ParentId)).FirstOrDefault(c => c != null);
                        if (cashOut != null)
                        {
                            cashOut.StartDate.Value = this.ToDateTime(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetFundingRepaymentTermsCashOutLimitFixedAmount":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cashOut = model.Funding.List.SelectMany(f => f.RepaymentTerms?.CashOut.List.Where(co => co.GlobalId == change.Operations[0].ParentId)).FirstOrDefault(c => c != null);
                        if (cashOut != null)
                        {
                            cashOut.LimitFixedAmount.Value = this.ToDecimal(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetFundingRepaymentTermsCashOutNumberOfMonths":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cashOut = model.Funding.List.SelectMany(l => l.RepaymentTerms?.CashOut.List.Where(co => co.GlobalId == change.Operations[0].ParentId)).FirstOrDefault(c => c != null);
                        if (cashOut != null)
                        {
                            cashOut.NumberOfMonths.Value = this.ToInt(change.Operations[0].Value);
                        }
                    }
                    break;

                // ==== EXPENSE

                case "AddExpense":
                    this.EnsureOperationCount(change, 8);
                    if (model.Expenses.GlobalId == change.Operations[0].ParentId)
                    {
                        // skip 0, come back at end
                        var name = new IdentifiedPrimitive<string>(change.Operations[1].ParentId, change.Operations[1].ObjectId, change.Operations[1].Value.ToString());
                        var category = new IdentifiedPrimitive<ExpenseCategory>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToEnum<ExpenseCategory>(change.Operations[2].Value));
                        var frequency = new IdentifiedPrimitive<ExpenseFrequency>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToEnum<ExpenseFrequency>(change.Operations[3].Value));
                        var startDate = new IdentifiedPrimitive<DateTime>(change.Operations[4].ParentId, change.Operations[4].ObjectId, this.ToDateTime(change.Operations[4].Value));
                        var until = new IdentifiedPrimitive<ExpenseUntil>(change.Operations[5].ParentId, change.Operations[5].ObjectId, this.ToEnum<ExpenseUntil>(change.Operations[5].Value));
                        var endDate = new IdentifiedPrimitive<DateTime>(change.Operations[6].ParentId, change.Operations[6].ObjectId, this.ToDateTime(change.Operations[6].Value));
                        var amount = new IdentifiedPrimitive<decimal>(change.Operations[7].ParentId, change.Operations[7].ObjectId, this.ToDecimal(change.Operations[7].Value));
                        // come back to 0 and put it together
                        model.Expenses.List.Add(new GenericExpense(change.Operations[0].ParentId, change.Operations[0].ObjectId, name, category, frequency, startDate, until, endDate, amount));
                    }
                    break;
                case "DeleteExpense":
                    this.EnsureOperationCount(change, 1);
                    {
                        var expense = model.Expenses.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ObjectId);
                        if (expense != null)
                        {
                            model.Expenses.List.Remove(expense);
                        }
                    }
                    break;
                case "SetExpenseName":
                    this.EnsureOperationCount(change, 1);
                    {
                        var expense = model.Expenses.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (expense != null && expense.Name.GlobalId == change.Operations[0].ObjectId)
                        {
                            expense.Name.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "SetExpenseFrequency":
                    this.EnsureOperationCount(change, 1);
                    {
                        var expense = model.Expenses.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (expense != null && expense.Frequency.GlobalId == change.Operations[0].ObjectId)
                        {
                            expense.Frequency.Value = this.ToEnum<ExpenseFrequency>(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetExpenseStartDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var expense = model.Expenses.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (expense != null && expense.StartDate.GlobalId == change.Operations[0].ObjectId)
                        {
                            expense.StartDate.Value = this.ToDateTime(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetExpenseUntil":
                    this.EnsureOperationCount(change, 1);
                    {
                        var expense = model.Expenses.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (expense != null && expense.Until.GlobalId == change.Operations[0].ObjectId)
                        {
                            expense.Until.Value = this.ToEnum<ExpenseUntil>(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetExpenseEndDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var expense = model.Expenses.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (expense != null && expense.EndDate.GlobalId == change.Operations[0].ObjectId)
                        {
                            expense.EndDate.Value = this.ToDateTime(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetExpenseAmount":
                    this.EnsureOperationCount(change, 1);
                    {
                        var expense = model.Expenses.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (expense != null && expense.Amount.GlobalId == change.Operations[0].ObjectId)
                        {
                            expense.Amount.Value = this.ToDecimal(change.Operations[0].Value);
                        }
                    }
                    break;

                // ==== Employee

                case "AddEmployee":
                    this.EnsureOperationCount(change, 8);
                    if (model.Employees.GlobalId == change.Operations[0].ParentId)
                    {
                        // skip 0, come back at end
                        var name = new IdentifiedPrimitive<string>(change.Operations[1].ParentId, change.Operations[1].ObjectId, change.Operations[1].Value.ToString());
                        var category = new IdentifiedPrimitive<ExpenseCategory>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToEnum<ExpenseCategory>(change.Operations[2].Value));
                        var startDate = new IdentifiedPrimitive<DateTime>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToDateTime(change.Operations[3].Value));
                        var endDate = new IdentifiedPrimitive<DateTime>(change.Operations[4].ParentId, change.Operations[4].ObjectId, this.ToDateTime(change.Operations[4].Value));
                        var amount = new IdentifiedPrimitive<decimal>(change.Operations[5].ParentId, change.Operations[5].ObjectId, this.ToDecimal(change.Operations[5].Value));
                        var benefitsPercent = new IdentifiedPrimitive<decimal>(change.Operations[6].ParentId, change.Operations[6].ObjectId, this.ToDecimal(change.Operations[6].Value));
                        var additionalPay = new IdentifiedList<AdditionalEmployeeExpense>(change.Operations[7].ParentId, change.Operations[7].ObjectId, change.Operations[7].Field);
                        // come back to 0 and put it together
                        model.Employees.List.Add(new EmployeeExpense(change.Operations[0].ParentId, change.Operations[0].ObjectId, name, category, startDate, endDate, amount, benefitsPercent, additionalPay));
                    }
                    break;
                case "DeleteEmployee":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ObjectId);
                        if (employee != null)
                        {
                            model.Employees.List.Remove(employee);
                        }
                    }
                    break;
                case "SetEmployeeName":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (employee != null && employee.Name.GlobalId == change.Operations[0].ObjectId)
                        {
                            employee.Name.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "SetEmployeeCategory":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (employee != null && employee.Category.GlobalId == change.Operations[0].ObjectId)
                        {
                            employee.Category.Value = this.ToEnum<ExpenseCategory>(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetEmployeeStartDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (employee != null && employee.StartDate.GlobalId == change.Operations[0].ObjectId)
                        {
                            employee.StartDate.Value = this.ToDateTime(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetEmployeeEndDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (employee != null && employee.EndDate.GlobalId == change.Operations[0].ObjectId)
                        {
                            employee.EndDate.Value = this.ToDateTime(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetEmployeeAmount":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (employee != null && employee.SalaryAmount.GlobalId == change.Operations[0].ObjectId)
                        {
                            employee.SalaryAmount.Value = this.ToDecimal(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetEmployeeBenefits":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (employee != null && employee.BenefitsPercent.GlobalId == change.Operations[0].ObjectId)
                        {
                            employee.BenefitsPercent.Value = this.ToDecimal(change.Operations[0].Value);
                        }
                    }
                    break;
                case "AddEmployeeAdditionalPay":
                    this.EnsureOperationCount(change, 5);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.AdditionalPay.GlobalId == change.Operations[0].ParentId);
                        if (employee != null)
                        {
                            // skip 0 and come back
                            var type = new IdentifiedPrimitive<AdditionalEmployeeExpenseType>(change.Operations[1].ParentId, change.Operations[1].ObjectId, this.ToEnum<AdditionalEmployeeExpenseType>(change.Operations[1].Value));
                            var amount = new IdentifiedPrimitive<decimal>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToDecimal(change.Operations[2].Value));
                            var frequency = new IdentifiedPrimitive<AdditionalEmployeeExpenseFrequency>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToEnum<AdditionalEmployeeExpenseFrequency>(change.Operations[3].Value));
                            var date = new IdentifiedPrimitive<DateTime>(change.Operations[4].ParentId, change.Operations[4].ObjectId, this.ToDateTime(change.Operations[4].Value));
                            // put it together
                            var additionalPay = new AdditionalEmployeeExpense(change.Operations[0].ParentId, change.Operations[0].ObjectId, type, amount, frequency, date);
                            employee.AdditionalPay.List.Add(additionalPay);
                        }
                    }
                    break;
                case "SetEmployeeAdditionalPayType":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.AdditionalPay.List.Any(ap => ap.GlobalId == change.Operations[0].ParentId));
                        if (employee != null)
                        {
                            var ap = employee.AdditionalPay.List.Single(ap => ap.GlobalId == change.Operations[0].ParentId);
                            if (ap.Type.GlobalId == change.Operations[0].ObjectId)
                            {
                                ap.Type.Value = this.ToEnum<AdditionalEmployeeExpenseType>(change.Operations[0].Value);
                            }
                        }
                    }
                    break;
                case "SetAdditionalEmployeePayAmount":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.AdditionalPay.List.Any(ap => ap.GlobalId == change.Operations[0].ParentId));
                        if (employee != null)
                        {
                            var ap = employee.AdditionalPay.List.Single(ap => ap.GlobalId == change.Operations[0].ParentId);
                            if (ap.Amount.GlobalId == change.Operations[0].ObjectId)
                            {
                                ap.Amount.Value = this.ToDecimal(change.Operations[0].Value);
                            }
                        }
                    }
                    break;
                case "SetEmployeeAdditionalPayFrequency":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.AdditionalPay.List.Any(ap => ap.GlobalId == change.Operations[0].ParentId));
                        if (employee != null)
                        {
                            var ap = employee.AdditionalPay.List.Single(ap => ap.GlobalId == change.Operations[0].ParentId);
                            if (ap.Frequency.GlobalId == change.Operations[0].ObjectId)
                            {
                                ap.Frequency.Value = this.ToEnum<AdditionalEmployeeExpenseFrequency>(change.Operations[0].Value);
                            }
                        }
                    }
                    break;
                case "SetEmployeeAdditionalPayDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.AdditionalPay.List.Any(ap => ap.GlobalId == change.Operations[0].ParentId));
                        if (employee != null)
                        {
                            var ap = employee.AdditionalPay.List.Single(ap => ap.GlobalId == change.Operations[0].ParentId);
                            if (ap.Date.GlobalId == change.Operations[0].ObjectId)
                            {
                                ap.Date.Value = this.ToDateTime(change.Operations[0].Value);
                            }
                        }
                    }
                    break;
                case "DeleteEmployeeAdditionalPay":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.AdditionalPay.GlobalId == change.Operations[0].ParentId);
                        if (employee != null)
                        {
                            employee.AdditionalPay.List.RemoveAll(ap => ap.GlobalId == change.Operations[0].ObjectId);
                        }
                    }
                    break;

                // ==== Contractor

                case "AddContractor":
                    this.EnsureOperationCount(change, 9);
                    if (model.Contractors.GlobalId == change.Operations[0].ParentId)
                    {
                        // skip 0, come back at end
                        var name = new IdentifiedPrimitive<string>(change.Operations[1].ParentId, change.Operations[1].ObjectId, change.Operations[1].Value.ToString());
                        var category = new IdentifiedPrimitive<ExpenseCategory>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToEnum<ExpenseCategory>(change.Operations[2].Value));
                        var frequency = new IdentifiedPrimitive<ContractorExpenseFrequency>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToEnum<ContractorExpenseFrequency>(change.Operations[3].Value));
                        // skip 4 + 5, come back
                        var startDate = new IdentifiedPrimitive<DateTime>(change.Operations[6].ParentId, change.Operations[6].ObjectId, this.ToDateTime(change.Operations[6].Value));
                        var amount = new IdentifiedPrimitive<decimal>(change.Operations[7].ParentId, change.Operations[7].ObjectId, this.ToDecimal(change.Operations[7].Value));
                        var endDate = new IdentifiedPrimitive<DateTime>(change.Operations[8].ParentId, change.Operations[8].ObjectId, this.ToDateTime(change.Operations[8].Value));
                        // come back to 4 + 5
                        var payment = new ContractorPayment(change.Operations[5].ParentId, change.Operations[5].ObjectId, startDate, amount, endDate);
                        var payments = new IdentifiedList<ContractorPayment>(change.Operations[4].ParentId, change.Operations[4].ObjectId);
                        payments.List.Add(payment);
                        // come back to 0 and put it together

                        model.Contractors.List.Add(new ContractorExpense(change.Operations[0].ParentId, change.Operations[0].ObjectId, name, category, frequency, payments));
                    }
                    break;
                case "DeleteContractor":
                    this.EnsureOperationCount(change, 1);
                    {
                        var contractor = model.Contractors.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ObjectId);
                        if (contractor != null)
                        {
                            model.Contractors.List.Remove(contractor);
                        }
                    }
                    break;
                case "SetContractorName":
                    this.EnsureOperationCount(change, 1);
                    {
                        var contractor = model.Contractors.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (contractor != null)
                        {
                            contractor.Name.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "SetContractorCategory":
                    this.EnsureOperationCount(change, 1);
                    {
                        var contractor = model.Contractors.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (contractor != null)
                        {
                            contractor.Category.Value = this.ToEnum<ExpenseCategory>(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetContractorFrequency":
                    this.EnsureOperationCount(change, 1);
                    {
                        var contractor = model.Contractors.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (contractor != null)
                        {
                            contractor.Frequency.Value = this.ToEnum<ContractorExpenseFrequency>(change.Operations[0].Value);
                        }
                    }
                    break;
                case "AddContractorPayment":
                    this.EnsureOperationCount(change, 4);
                    {
                        var contractor = model.Contractors.List.FirstOrDefault(e => e.Payments.GlobalId == change.Operations[0].ParentId);
                        if (contractor != null)
                        {
                            // skip 0
                            var startDate = new IdentifiedPrimitive<DateTime>(change.Operations[1].ParentId, change.Operations[1].ObjectId, this.ToDateTime(change.Operations[1].Value));
                            var amount = new IdentifiedPrimitive<decimal>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToDecimal(change.Operations[2].Value));
                            var endDate = new IdentifiedPrimitive<DateTime>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToDateTime(change.Operations[3].Value));
                            // come back to 0
                            var payment = new ContractorPayment(change.Operations[0].ParentId, change.Operations[0].ObjectId, startDate, amount, endDate);
                            contractor.Payments.List.Add(payment);
                        }
                    }
                    break;
                case "SetContractorPaymentStartDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var contractor = model.Contractors.List.FirstOrDefault(e => e.Payments.List.Any(p => p.GlobalId == change.Operations[0].ParentId));
                        if (contractor != null)
                        {
                            var payment = contractor.Payments.List.Single(p => p.GlobalId == change.Operations[0].ParentId);
                            payment.StartDate.Value = this.ToDateTime(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetContractorPaymentAmount":
                    this.EnsureOperationCount(change, 1);
                    {
                        var contractor = model.Contractors.List.FirstOrDefault(e => e.Payments.List.Any(p => p.GlobalId == change.Operations[0].ParentId));
                        if (contractor != null)
                        {
                            var payment = contractor.Payments.List.Single(p => p.GlobalId == change.Operations[0].ParentId);
                            payment.Amount.Value = this.ToDecimal(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetContractorPaymentEndDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var contractor = model.Contractors.List.FirstOrDefault(e => e.Payments.List.Any(p => p.GlobalId == change.Operations[0].ParentId));
                        if (contractor != null)
                        {
                            var payment = contractor.Payments.List.Single(p => p.GlobalId == change.Operations[0].ParentId);
                            payment.EndDate.Value = this.ToDateTime(change.Operations[0].Value);
                        }
                    }
                    break;
                case "DeleteContractorPayment":
                    this.EnsureOperationCount(change, 1);
                    {
                        var contractor = model.Contractors.List.FirstOrDefault(e => e.Payments.GlobalId == change.Operations[0].ParentId);
                        if (contractor != null)
                        {
                            contractor.Payments.List.RemoveAll(p => p.GlobalId == change.Operations[0].ObjectId);
                        }
                    }
                    break;

                // ==== Taxes

                case "AddTax":
                    this.EnsureOperationCount(change, 6);
                    if (model.Taxes.GlobalId == change.Operations[0].ParentId)
                    {
                        // skip 0, come back at end
                        var name = new IdentifiedPrimitive<string>(change.Operations[1].ParentId, change.Operations[1].ObjectId, change.Operations[1].Value.ToString());
                        var basedOn = new IdentifiedPrimitive<NetIncomeCategory>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToEnum<NetIncomeCategory>(change.Operations[2].Value));
                        var amount = new IdentifiedPrimitive<decimal>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToDecimal(change.Operations[3].Value));
                        var schedule = new IdentifiedPrimitive<TaxSchedule>(change.Operations[4].ParentId, change.Operations[4].ObjectId, this.ToEnum<TaxSchedule>(change.Operations[4].Value));
                        var dueDate = new IdentifiedPrimitive<DateTime>(change.Operations[5].ParentId, change.Operations[5].ObjectId, this.ToDateTime(change.Operations[5].Value));
                        // come back to 0 and put it together
                        model.Taxes.List.Add(new Tax(change.Operations[0].ParentId, change.Operations[0].ObjectId, name, basedOn, amount, schedule, dueDate));
                    }
                    break;
                case "DeleteTax":
                    this.EnsureOperationCount(change, 1);
                    {
                        var tax = model.Taxes.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ObjectId);
                        if (tax != null)
                        {
                            model.Taxes.List.Remove(tax);
                        }
                    }
                    break;
                case "SetTaxName":
                    this.EnsureOperationCount(change, 1);
                    {
                        var tax = model.Taxes.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (tax != null)
                        {
                            tax.Name.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "SetTaxBasedOn":
                    this.EnsureOperationCount(change, 1);
                    {
                        var tax = model.Taxes.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (tax != null)
                        {
                            tax.BasedOn.Value = this.ToEnum<NetIncomeCategory>(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetTaxAmount":
                    this.EnsureOperationCount(change, 1);
                    {
                        var tax = model.Taxes.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (tax != null)
                        {
                            tax.Amount.Value = this.ToDecimal(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetTaxSchedule":
                    this.EnsureOperationCount(change, 1);
                    {
                        var tax = model.Taxes.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (tax != null)
                        {
                            tax.Schedule.Value = this.ToEnum<TaxSchedule>(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetTaxDueDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var tax = model.Taxes.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (tax != null)
                        {
                            tax.DueDate.Value = this.ToDateTime(change.Operations[0].Value);
                        }
                    }
                    break;

                // ==== Est Revenues

                case "SetEstRevenueMinPrice":
                    this.EnsureOperationCount(change, 1);
                    if (model.EstimatedRevenue.MinimumPrice.ParentId == change.Operations[0].ParentId && model.EstimatedRevenue.MinimumPrice.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.EstimatedRevenue.MinimumPrice.Value = this.ToDecimal(change.Operations[0].Value);
                    }
                    break;
                case "SetEstRevenueTargetPrice":
                    this.EnsureOperationCount(change, 1);
                    if (model.EstimatedRevenue.TargetPrice.ParentId == change.Operations[0].ParentId && model.EstimatedRevenue.TargetPrice.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.EstimatedRevenue.TargetPrice.Value = this.ToDecimal(change.Operations[0].Value);
                    }
                    break;
                case "SetEstRevenueMaxPrice":
                    this.EnsureOperationCount(change, 1);
                    if (model.EstimatedRevenue.MaximumPrice.ParentId == change.Operations[0].ParentId && model.EstimatedRevenue.MaximumPrice.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.EstimatedRevenue.MaximumPrice.Value = this.ToDecimal(change.Operations[0].Value);
                    }
                    break;
                case "SetEstRevenueLowUnitsSold":
                    this.EnsureOperationCount(change, 1);
                    if (model.EstimatedRevenue.LowUnitsSold.ParentId == change.Operations[0].ParentId && model.EstimatedRevenue.LowUnitsSold.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.EstimatedRevenue.LowUnitsSold.Value = this.ToDecimal(change.Operations[0].Value);
                    }
                    break;
                case "SetEstRevenueTargetUnitsSold":
                    this.EnsureOperationCount(change, 1);
                    if (model.EstimatedRevenue.TargetUnitsSold.ParentId == change.Operations[0].ParentId && model.EstimatedRevenue.TargetUnitsSold.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.EstimatedRevenue.TargetUnitsSold.Value = this.ToDecimal(change.Operations[0].Value);
                    }
                    break;
                case "SetEstRevenueHighUnitsSold":
                    this.EnsureOperationCount(change, 1);
                    if (model.EstimatedRevenue.HighUnitsSold.ParentId == change.Operations[0].ParentId && model.EstimatedRevenue.HighUnitsSold.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.EstimatedRevenue.HighUnitsSold.Value = this.ToDecimal(change.Operations[0].Value);
                    }
                    break;
                case "AddEstRevenuePlatform":
                    this.EnsureOperationCount(change, 9);
                    if (model.EstimatedRevenue.Platforms.GlobalId == change.Operations[0].ParentId)
                    {
                        // skip 0, come back at end
                        var name = new IdentifiedPrimitive<string>(change.Operations[1].ParentId, change.Operations[1].ObjectId, change.Operations[1].Value.ToString());
                        var startDate = new IdentifiedPrimitive<DateTime>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToDateTime(change.Operations[2].Value));
                        var dateType = new IdentifiedPrimitive<BasicDateOption>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToEnum<BasicDateOption>(change.Operations[3].Value));
                        var percentOfSales = new IdentifiedPrimitive<decimal>(change.Operations[4].ParentId, change.Operations[4].ObjectId, this.ToDecimal(change.Operations[4].Value));
                        var revenueShares = new IdentifiedList<EstimatedRevenuePlatformShare>(change.Operations[5].ParentId, change.Operations[5].ObjectId, "revenueShares");
                        // skip 6 and come back
                        var revenueShare = new IdentifiedPrimitive<decimal>(change.Operations[7].ParentId, change.Operations[7].ObjectId, this.ToDecimal(change.Operations[7].Value));
                        var untilAmount = new IdentifiedPrimitive<decimal>(change.Operations[8].ParentId, change.Operations[8].ObjectId, this.ToDecimal(change.Operations[8].Value));
                        // now 6 + add to list
                        revenueShares.List.Add(new EstimatedRevenuePlatformShare(change.Operations[6].ParentId, change.Operations[6].ObjectId, revenueShare, untilAmount));
                        // now add 0
                        model.EstimatedRevenue.Platforms.List.Add(new EstimatedRevenuePlatform(change.Operations[0].ParentId, change.Operations[0].ObjectId, name, dateType, startDate, percentOfSales, revenueShares));
                    }
                    break;
                case "AddEstRevenuePlatformDouble":
                    this.EnsureOperationCount(change, 12);
                    if (model.EstimatedRevenue.Platforms.GlobalId == change.Operations[0].ParentId)
                    {
                        // skip 0, come back at end
                        var name = new IdentifiedPrimitive<string>(change.Operations[1].ParentId, change.Operations[1].ObjectId, change.Operations[1].Value.ToString());
                        var startDate = new IdentifiedPrimitive<DateTime>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToDateTime(change.Operations[2].Value));
                        var dateType = new IdentifiedPrimitive<BasicDateOption>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToEnum<BasicDateOption>(change.Operations[3].Value));
                        var percentOfSales = new IdentifiedPrimitive<decimal>(change.Operations[4].ParentId, change.Operations[4].ObjectId, this.ToDecimal(change.Operations[4].Value));
                        var revenueShares = new IdentifiedList<EstimatedRevenuePlatformShare>(change.Operations[5].ParentId, change.Operations[5].ObjectId, "revenueShares");
                        // skip 6 and come back
                        var revenueShare = new IdentifiedPrimitive<decimal>(change.Operations[7].ParentId, change.Operations[7].ObjectId, this.ToDecimal(change.Operations[7].Value));
                        var untilAmount = new IdentifiedPrimitive<decimal>(change.Operations[8].ParentId, change.Operations[8].ObjectId, this.ToDecimal(change.Operations[8].Value));
                        // now 6 + add to list
                        revenueShares.List.Add(new EstimatedRevenuePlatformShare(change.Operations[6].ParentId, change.Operations[6].ObjectId, revenueShare, untilAmount));
                        // skip 9 and come back
                        var revenueShare1 = new IdentifiedPrimitive<decimal>(change.Operations[10].ParentId, change.Operations[10].ObjectId, this.ToDecimal(change.Operations[10].Value));
                        var untilAmount1 = new IdentifiedPrimitive<decimal>(change.Operations[11].ParentId, change.Operations[11].ObjectId, this.ToDecimal(change.Operations[11].Value));
                        // now 9 + add to list
                        revenueShares.List.Add(new EstimatedRevenuePlatformShare(change.Operations[9].ParentId, change.Operations[9].ObjectId, revenueShare1, untilAmount1));
                        // now add 0
                        model.EstimatedRevenue.Platforms.List.Add(new EstimatedRevenuePlatform(change.Operations[0].ParentId, change.Operations[0].ObjectId, name, dateType, startDate, percentOfSales, revenueShares));
                    }
                    break;
                case "AddEstRevenuePlatformTriple":
                    this.EnsureOperationCount(change, 15);
                    if (model.EstimatedRevenue.Platforms.GlobalId == change.Operations[0].ParentId)
                    {
                        // skip 0, come back at end
                        var name = new IdentifiedPrimitive<string>(change.Operations[1].ParentId, change.Operations[1].ObjectId, change.Operations[1].Value.ToString());
                        var startDate = new IdentifiedPrimitive<DateTime>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToDateTime(change.Operations[2].Value));
                        var dateType = new IdentifiedPrimitive<BasicDateOption>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToEnum<BasicDateOption>(change.Operations[3].Value));
                        var percentOfSales = new IdentifiedPrimitive<decimal>(change.Operations[4].ParentId, change.Operations[4].ObjectId, this.ToDecimal(change.Operations[4].Value));
                        var revenueShares = new IdentifiedList<EstimatedRevenuePlatformShare>(change.Operations[5].ParentId, change.Operations[5].ObjectId, "revenueShares");
                        // skip 6 and come back
                        var revenueShare = new IdentifiedPrimitive<decimal>(change.Operations[7].ParentId, change.Operations[7].ObjectId, this.ToDecimal(change.Operations[7].Value));
                        var untilAmount = new IdentifiedPrimitive<decimal>(change.Operations[8].ParentId, change.Operations[8].ObjectId, this.ToDecimal(change.Operations[8].Value));
                        // now 6 + add to list
                        revenueShares.List.Add(new EstimatedRevenuePlatformShare(change.Operations[6].ParentId, change.Operations[6].ObjectId, revenueShare, untilAmount));
                        // skip 9 and come back
                        var revenueShare1 = new IdentifiedPrimitive<decimal>(change.Operations[10].ParentId, change.Operations[10].ObjectId, this.ToDecimal(change.Operations[10].Value));
                        var untilAmount1 = new IdentifiedPrimitive<decimal>(change.Operations[11].ParentId, change.Operations[11].ObjectId, this.ToDecimal(change.Operations[11].Value));
                        // now 9 + add to list
                        revenueShares.List.Add(new EstimatedRevenuePlatformShare(change.Operations[9].ParentId, change.Operations[9].ObjectId, revenueShare1, untilAmount1));
                        // skip 12 and come back
                        var revenueShare2 = new IdentifiedPrimitive<decimal>(change.Operations[13].ParentId, change.Operations[13].ObjectId, this.ToDecimal(change.Operations[13].Value));
                        var untilAmount2 = new IdentifiedPrimitive<decimal>(change.Operations[14].ParentId, change.Operations[14].ObjectId, this.ToDecimal(change.Operations[14].Value));
                        // now 12 + add to list
                        revenueShares.List.Add(new EstimatedRevenuePlatformShare(change.Operations[12].ParentId, change.Operations[12].ObjectId, revenueShare2, untilAmount2));
                        // now add 0
                        model.EstimatedRevenue.Platforms.List.Add(new EstimatedRevenuePlatform(change.Operations[0].ParentId, change.Operations[0].ObjectId, name, dateType, startDate, percentOfSales, revenueShares));
                    }
                    break;
                case "DeleteEstRevenuePlatform":
                    this.EnsureOperationCount(change, 1);
                    {
                        var platform = model.EstimatedRevenue.Platforms.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ObjectId);
                        if (platform != null)
                        {
                            model.EstimatedRevenue.Platforms.List.Remove(platform);
                        }
                    }
                    break;
                case "SetEstRevenuePlatformName":
                    this.EnsureOperationCount(change, 1);
                    {
                        var platform = model.EstimatedRevenue.Platforms.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (platform != null && platform.Name.GlobalId == change.Operations[0].ObjectId)
                        {
                            platform.Name.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "SetEstRevenuePlatformStartDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var platform = model.EstimatedRevenue.Platforms.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (platform != null && platform.StartDate.GlobalId == change.Operations[0].ObjectId)
                        {
                            platform.StartDate.Value = this.ToDateTime(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetEstRevenuePlatformDateType":
                    this.EnsureOperationCount(change, 1);
                    {
                        var platform = model.EstimatedRevenue.Platforms.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (platform != null && platform.DateType.GlobalId == change.Operations[0].ObjectId)
                        {
                            platform.DateType.Value = this.ToEnum<BasicDateOption>(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetEstRevenuePlatformPercentOfSales":
                    this.EnsureOperationCount(change, 1);
                    {
                        var platform = model.EstimatedRevenue.Platforms.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (platform != null && platform.PercentOfSales.GlobalId == change.Operations[0].ObjectId)
                        {
                            platform.PercentOfSales.Value = this.ToDecimal(change.Operations[0].Value);
                        }
                    }
                    break;
                case "AddEstRevenuePlatformRevShare":
                    this.EnsureOperationCount(change, 3);
                    {
                        var platform = model.EstimatedRevenue.Platforms.List.FirstOrDefault(e => e.RevenueShares.GlobalId == change.Operations[0].ParentId);
                        if (platform != null)
                        {
                            // skip 0
                            var revenueShare = new IdentifiedPrimitive<decimal>(change.Operations[1].ParentId, change.Operations[1].ObjectId, this.ToDecimal(change.Operations[1].Value));
                            var untilAmount = new IdentifiedPrimitive<decimal>(change.Operations[2].ParentId, change.Operations[2].ObjectId, this.ToDecimal(change.Operations[2].Value));
                            // now 0 + add to list
                            platform.RevenueShares.List.Add(new EstimatedRevenuePlatformShare(change.Operations[0].ParentId, change.Operations[0].ObjectId, revenueShare, untilAmount));
                        }
                    }
                    break;
                case "DeleteEstRevenuePlatformRevShare":
                    this.EnsureOperationCount(change, 1);
                    {
                        var platform = model.EstimatedRevenue.Platforms.List.FirstOrDefault(e => e.RevenueShares.GlobalId == change.Operations[0].ParentId);
                        if (platform != null)
                        {
                            platform.RevenueShares.List.RemoveAll(rs => rs.GlobalId == change.Operations[0].ObjectId);
                        }
                    }
                    break;
                case "SetEstRevenuePlatformRevRevenueShare":
                    this.EnsureOperationCount(change, 1);
                    {
                        var platform = model.EstimatedRevenue.Platforms.List.FirstOrDefault(e => e.RevenueShares.List.Any(rs => rs.GlobalId == change.Operations[0].ParentId));
                        if (platform != null)
                        {
                            var revShare = platform.RevenueShares.List.Single(rs => rs.GlobalId == change.Operations[0].ParentId);
                            if (revShare.RevenueShare.GlobalId == change.Operations[0].ObjectId)
                            {
                                revShare.RevenueShare.Value = this.ToDecimal(change.Operations[0].Value);
                            }
                        }
                    }
                    break;
                case "SetEstRevenuePlatformRevUntilAmount":
                    this.EnsureOperationCount(change, 1);
                    {
                        var platform = model.EstimatedRevenue.Platforms.List.FirstOrDefault(e => e.RevenueShares.List.Any(rs => rs.GlobalId == change.Operations[0].ParentId));
                        if (platform != null)
                        {
                            var revShare = platform.RevenueShares.List.Single(rs => rs.GlobalId == change.Operations[0].ParentId);
                            if (revShare.UntilAmount.GlobalId == change.Operations[0].ObjectId)
                            {
                                revShare.UntilAmount.Value = this.ToDecimal(change.Operations[0].Value);
                            }
                        }
                    }
                    break;

                default:
                    throw new ArgumentException($"Unexpected event type: {change.Type}", nameof(change));
            }
            modelStore.Events.Add(change);
        }


    }
}
