using GDB.Business.BusinessLogic._Generic;
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

        public ChangeEvent GetCreateEvent(string gameId)
        {
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
                    this.EnsureOperationCount(change, 1);
                    modelStore.Init(new CashForecastDTO(change.Operations[0].ParentId, change.Operations[0].ObjectId));
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
                            loan.RepaymentTerms = new RepaymentTerms(
                                change.Operations[0].ParentId,
                                change.Operations[0].ObjectId,
                                new IdentifiedList<CashOut>(change.Operations[1].ParentId, change.Operations[1].ObjectId, change.Operations[1].Field),
                                change.Operations[0].Field
                            );
                            loan.RepaymentTerms.CashOut.List.Add(new CashOut(
                                change.Operations[2].ParentId,
                                change.Operations[2].ObjectId,
                                new IdentifiedPrimitive<RepaymentType>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToEnum<RepaymentType>(change.Operations[3].Value), change.Operations[3].Field),
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
                            loan.RepaymentTerms.CashOut.List.Add(new CashOut(
                                change.Operations[0].ParentId,
                                change.Operations[0].ObjectId,
                                new IdentifiedPrimitive<RepaymentType>(change.Operations[1].ParentId, change.Operations[1].ObjectId, this.ToEnum<RepaymentType>(change.Operations[1].Value), change.Operations[1].Field),
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
                    this.EnsureOperationCount(change, 2);
                    {
                        var cashOut = model.Loans.List.SelectMany(l => l.RepaymentTerms?.CashOut.List.Where(co => co.GlobalId == change.Operations[0].ParentId)).FirstOrDefault(c => c != null);
                        if (cashOut != null)
                        {
                            cashOut.Type.Value = this.ToEnum<RepaymentType>(change.Operations[0].Value);
                            cashOut.Amount.Value = this.ToDecimal(change.Operations[1].Value);
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
                            funding.RepaymentTerms = new RepaymentTerms(
                                change.Operations[0].ParentId,
                                change.Operations[0].ObjectId,
                                new IdentifiedList<CashOut>(change.Operations[1].ParentId, change.Operations[1].ObjectId, change.Operations[1].Field),
                                change.Operations[0].Field
                            );
                            funding.RepaymentTerms.CashOut.List.Add(new CashOut(
                                change.Operations[2].ParentId,
                                change.Operations[2].ObjectId,
                                new IdentifiedPrimitive<RepaymentType>(change.Operations[3].ParentId, change.Operations[3].ObjectId, this.ToEnum<RepaymentType>(change.Operations[3].Value), change.Operations[3].Field),
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
                            funding.RepaymentTerms.CashOut.List.Add(new CashOut(
                                change.Operations[0].ParentId,
                                change.Operations[0].ObjectId,
                                new IdentifiedPrimitive<RepaymentType>(change.Operations[1].ParentId, change.Operations[1].ObjectId, this.ToEnum<RepaymentType>(change.Operations[1].Value), change.Operations[1].Field),
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
                    this.EnsureOperationCount(change, 2);
                    {
                        var cashOut = model.Funding.List.SelectMany(f => f.RepaymentTerms?.CashOut.List.Where(co => co.GlobalId == change.Operations[0].ParentId)).FirstOrDefault(c => c != null);
                        if (cashOut != null)
                        {
                            cashOut.Type.Value = this.ToEnum<RepaymentType>(change.Operations[0].Value);
                            cashOut.Amount.Value = this.ToDecimal(change.Operations[1].Value);
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
                        if (employee != null && employee.Name.GlobalId == change.Operations[0].ObjectId)
                        {
                            employee.Category.Value = this.ToEnum<ExpenseCategory>(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetEmployeeStartDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (employee != null && employee.Name.GlobalId == change.Operations[0].ObjectId)
                        {
                            employee.StartDate.Value = this.ToDateTime(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetEmployeeEndDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (employee != null && employee.Name.GlobalId == change.Operations[0].ObjectId)
                        {
                            employee.EndDate.Value = this.ToDateTime(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetEmployeeAmount":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (employee != null && employee.Name.GlobalId == change.Operations[0].ObjectId)
                        {
                            employee.SalaryAmount.Value = this.ToDecimal(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetEmployeeBenefits":
                    this.EnsureOperationCount(change, 1);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (employee != null && employee.Name.GlobalId == change.Operations[0].ObjectId)
                        {
                            employee.BenefitsPercent.Value = this.ToDecimal(change.Operations[0].Value);
                        }
                    }
                    break;
                case "AddEmployeeAdditionalPay":
                    this.EnsureOperationCount(change, 5);
                    {
                        var employee = model.Employees.List.FirstOrDefault(e => e.GlobalId == change.Operations[0].ParentId);
                        if (employee != null && employee.Name.GlobalId == change.Operations[0].ObjectId)
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

                default:
                    throw new ArgumentException($"Unexpected event type: {change.Type}", nameof(change));
            }
            modelStore.Events.Add(change);
        }


    }
}
