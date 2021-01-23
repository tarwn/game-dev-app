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
                        if (loan != null && loan.Name.GlobalId == change.Operations[0].ObjectId)
                        {
                            loan.Type.Value = this.ToEnum<LoanType>(change.Operations[0].Value);
                        }
                    }
                    break;
                case "SetLoanCashInDate":
                    this.EnsureOperationCount(change, 1);
                    {
                        var loan = model.Loans.List.FirstOrDefault(loan => loan.CashIn.GlobalId == change.Operations[0].ParentId);
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
                        var loan = model.Loans.List.FirstOrDefault(loan => loan.CashIn.GlobalId == change.Operations[0].ParentId);
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
                default:
                    throw new ArgumentException($"Unexpected event type: {change.Type}", nameof(change));
            }
            modelStore.Events.Add(change);
        }

        private T ToEnum<T>(object input)
            where T : struct
        {
            if (input is JsonElement)
            {
                var asJson = (JsonElement)input;
                if (asJson.ValueKind == JsonValueKind.Number)
                {
                    return (T)(object)asJson.GetInt32();
                }
                if (asJson.ValueKind == JsonValueKind.String)
                {
                    return Enum.Parse<T>(asJson.GetString());
                }
            }
            return Enum.Parse<T>(input.ToString());
        }
    }
}
