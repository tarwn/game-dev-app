using GDB.Business.BusinessLogic._Generic;
using GDB.Common.DTOs._Events;
using GDB.Common.DTOs.CashForecast;
using System;
using System.Collections.Generic;
using System.Text;

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
                case "SetBankBalanceAmount":
                    this.EnsureOperationCount(change, 1);
                    if (model.BankBalance.GlobalId == change.Operations[0].ParentId && model.BankBalance.Amount.GlobalId == change.Operations[0].ObjectId)
                    {
                        model.BankBalance.Amount.Value = Convert.ToDecimal(change.Operations[0].Value);
                    }
                    break;
                default:
                    throw new ArgumentException($"Unexpected event type: {change.Type}", nameof(change));
            }
            modelStore.Events.Add(change);
        }
    }
}
