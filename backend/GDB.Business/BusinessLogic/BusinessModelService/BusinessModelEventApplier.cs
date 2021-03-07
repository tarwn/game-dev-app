using GDB.Business.BusinessLogic._Generic;
using GDB.Common.DTOs._Events;
using GDB.Common.DTOs.BusinessModel;
using GDB.Common.DTOs.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace GDB.Business.BusinessLogic.BusinessModelService
{
    public class BusinessModelEventApplier : IEventApplier<BusinessModelDTO>
    {
        public const string CreateEventType = "CreateBusinessModel";
        public string ObjectType => "BusinessModel";

        public string GetRootId(string gameId)
        {
            return $"{gameId}:bm";
        }

        public ChangeEvent GetCreateEvent(string gameId, DateTime createDate)
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
                        Field = "businessModel",
                        Insert = true
                    }
                }
            };
        }

        public void ApplyEvent(EventStore<BusinessModelDTO, ChangeEvent> modelStore, ChangeEvent change)
        {
            var model = modelStore.Model;

            switch (change.Type)
            {
                case CreateEventType:
                    this.EnsureOperationCount(change, 1);
                    modelStore.Init(new BusinessModelDTO(change.Operations[0].ParentId, change.Operations[0].ObjectId));
                    break;
                case "AddNewCustomer":
                    this.EnsureOperationCount(change, 4);
                    model.Customers.List.Add(new BusinessModelCustomer()
                    {
                        GlobalId = change.Operations[0].ObjectId,
                        ParentId = change.Operations[0].ParentId,
                        Field = change.Operations[0].Field,
                        Name = new IdentifiedPrimitive<string>()
                        {
                            GlobalId = change.Operations[1].ObjectId,
                            ParentId = change.Operations[1].ParentId,
                            Field = change.Operations[1].Field,
                            Value = change.Operations[1].Value.ToString()
                        },
                        Entries = new IdentifiedList<IdentifiedPrimitive<string>>()
                        {
                            GlobalId = change.Operations[2].ObjectId,
                            ParentId = change.Operations[2].ParentId,
                            Field = change.Operations[2].Field,
                            List = new List<IdentifiedPrimitive<string>>()
                        },
                        Type = new IdentifiedPrimitive<string>()
                        {
                            GlobalId = change.Operations[3].ObjectId,
                            ParentId = change.Operations[3].ParentId,
                            Field = change.Operations[3].Field,
                            Value = change.Operations[3].Value.ToString()
                        }
                    });
                    break;
                case "DeleteCustomer":
                    this.EnsureOperationCount(change, 1);
                    model.Customers.List.RemoveAll(c => c.GlobalId == change.Operations[0].ObjectId);
                    break;
                case "AddCustomerEntry":
                    ApplyBasicListAdd(model, change, m => {
                        var customer = model.Customers.List.SingleOrDefault(c => c.Entries.GlobalId == change.Operations[0].ParentId);
                        if (customer != null)
                            return customer.Entries;
                        else
                            return null;
                    });
                    break;
                case "UpdateCustomerEntry":
                    ApplyBasicListUpdate(model, change, m => {
                        var customer = model.Customers.List.SingleOrDefault(c => c.Entries.GlobalId == change.Operations[0].ParentId);
                        if (customer != null)
                            return customer.Entries;
                        else
                            return null;
                    });
                    break;
                case "DeleteCustomerEntry":
                    ApplyBasicListDelete(model, change, m => {
                        var customer = model.Customers.List.SingleOrDefault(c => c.Entries.GlobalId == change.Operations[0].ParentId);
                        if (customer != null)
                            return customer.Entries;
                        else
                            return null;
                    });
                    break;
                case "UpdateCustomerType":
                    this.EnsureOperationCount(change, 1);
                    {
                        var customer = model.Customers.List.SingleOrDefault(c => c.Entries.GlobalId == change.Operations[0].ParentId);
                        if (customer != null)
                        {
                            customer.Type.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "UpdateCustomerName":
                    this.EnsureOperationCount(change, 1);
                    {
                        var customer = model.Customers.List.SingleOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                        if (customer != null)
                        {
                            customer.Name.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "AddValuePropGenre":
                    ApplyBasicListAdd(model, change, m => model.ValueProposition.Genres);
                    break;
                case "DeleteValuePropGenre":
                    ApplyBasicListDelete(model, change, m => model.ValueProposition.Genres);
                    break;
                case "AddValuePropPlatform":
                    ApplyBasicListAdd(model, change, m => model.ValueProposition.Platforms);
                    break;
                case "DeleteValuePropPlatform":
                    ApplyBasicListDelete(model, change, m => model.ValueProposition.Platforms);
                    break;
                case "AddValuePropEntry":
                    ApplyBasicListAdd(model, change, m => model.ValueProposition.Entries);
                    break;
                case "UpdateValuePropEntry":
                    ApplyBasicListUpdate(model, change, m => model.ValueProposition.Entries);
                    break;
                case "DeleteValuePropEntry":
                    ApplyBasicListDelete(model, change, m => model.ValueProposition.Entries);
                    break;
                case "AddChannelsAwarenessEntry":
                    ApplyBasicListAdd(model, change, m => model.Channels.Awareness);
                    break;
                case "UpdateChannelsAwarenessEntry":
                    ApplyBasicListUpdate(model, change, m => model.Channels.Awareness);
                    break;
                case "DeleteChannelsAwarenessEntry":
                    ApplyBasicListDelete(model, change, m => model.Channels.Awareness);
                    break;
                case "AddChannelsConsiderationEntry":
                    ApplyBasicListAdd(model, change, m => model.Channels.Consideration);
                    break;
                case "UpdateChannelsConsiderationEntry":
                    ApplyBasicListUpdate(model, change, m => model.Channels.Consideration);
                    break;
                case "DeleteChannelsConsiderationEntry":
                    ApplyBasicListDelete(model, change, m => model.Channels.Consideration);
                    break;
                case "AddChannelsPurchaseEntry":
                    ApplyBasicListAdd(model, change, m => model.Channels.Purchase);
                    break;
                case "UpdateChannelsPurchaseEntry":
                    ApplyBasicListUpdate(model, change, m => model.Channels.Purchase);
                    break;
                case "DeleteChannelsPurchaseEntry":
                    ApplyBasicListDelete(model, change, m => model.Channels.Purchase);
                    break;
                case "AddChannelsPostPurchaseEntry":
                    ApplyBasicListAdd(model, change, m => model.Channels.PostPurchase);
                    break;
                case "UpdateChannelsPostPurchaseEntry":
                    ApplyBasicListUpdate(model, change, m => model.Channels.PostPurchase);
                    break;
                case "DeleteChannelsPostPurchaseEntry":
                    ApplyBasicListDelete(model, change, m => model.Channels.PostPurchase);
                    break;
                case "AddCustomerRelationshipsEntry":
                    ApplyBasicListAdd(model, change, m => model.CustomerRelationships.Entries);
                    break;
                case "UpdateCustomerRelationshipsEntry":
                    ApplyBasicListUpdate(model, change, m => model.CustomerRelationships.Entries);
                    break;
                case "DeleteCustomerRelationshipsEntry":
                    ApplyBasicListDelete(model, change, m => model.CustomerRelationships.Entries);
                    break;
                case "AddRevenueEntry":
                    ApplyBasicListAdd(model, change, m => model.Revenue.Entries);
                    break;
                case "UpdateRevenueEntry":
                    ApplyBasicListUpdate(model, change, m => model.Revenue.Entries);
                    break;
                case "DeleteRevenueEntry":
                    ApplyBasicListDelete(model, change, m => model.Revenue.Entries);
                    break;
                case "AddKeyResourcesEntry":
                    ApplyBasicListAdd(model, change, m => model.KeyResources.Entries);
                    break;
                case "UpdateKeyResourcesEntry":
                    ApplyBasicListUpdate(model, change, m => model.KeyResources.Entries);
                    break;
                case "DeleteKeyResourcesEntry":
                    ApplyBasicListDelete(model, change, m => model.KeyResources.Entries);
                    break;
                case "AddKeyActivitiesEntry":
                    ApplyBasicListAdd(model, change, m => model.KeyActivities.Entries);
                    break;
                case "UpdateKeyActivitiesEntry":
                    ApplyBasicListUpdate(model, change, m => model.KeyActivities.Entries);
                    break;
                case "DeleteKeyActivitiesEntry":
                    ApplyBasicListDelete(model, change, m => model.KeyActivities.Entries);
                    break;
                case "AddKeyPartnersEntry":
                    ApplyBasicListAdd(model, change, m => model.KeyPartners.Entries);
                    break;
                case "UpdateKeyPartnersEntry":
                    ApplyBasicListUpdate(model, change, m => model.KeyPartners.Entries);
                    break;
                case "DeleteKeyPartnersEntry":
                    ApplyBasicListDelete(model, change, m => model.KeyPartners.Entries);
                    break;
                case "AddCost":
                    this.EnsureOperationCount(change, 5);
                    model.CostStructure.List.Add(new BusinessModelCost()
                    {
                        GlobalId = change.Operations[0].ObjectId,
                        ParentId = change.Operations[0].ParentId,
                        Field = change.Operations[0].Field,
                        Type = new IdentifiedPrimitive<string>()
                        {
                            GlobalId = change.Operations[1].ObjectId,
                            ParentId = change.Operations[1].ParentId,
                            Field = change.Operations[1].Field,
                            Value = change.Operations[1].Value.ToString()
                        },
                        Summary = new IdentifiedPrimitive<string>()
                        {
                            GlobalId = change.Operations[2].ObjectId,
                            ParentId = change.Operations[2].ParentId,
                            Field = change.Operations[2].Field,
                            Value = change.Operations[2].Value.ToString()
                        },
                        IsPreLaunch = new IdentifiedPrimitive<bool>()
                        {
                            GlobalId = change.Operations[3].ObjectId,
                            ParentId = change.Operations[3].ParentId,
                            Field = change.Operations[3].Field,
                            Value = this.ToBoolean(change.Operations[3].Value)
                        },
                        IsPostLaunch = new IdentifiedPrimitive<bool>()
                        {
                            GlobalId = change.Operations[4].ObjectId,
                            ParentId = change.Operations[4].ParentId,
                            Field = change.Operations[4].Field,
                            Value = this.ToBoolean(change.Operations[4].Value)
                        },
                    });
                    break;
                case "DeleteCost":
                    this.EnsureOperationCount(change, 1);
                    model.CostStructure.List.RemoveAll(c => c.GlobalId == change.Operations[0].ObjectId);
                    break;
                case "UpdateCostType":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cost = model.CostStructure.List.SingleOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                        if (cost != null)
                        {
                            cost.Type.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "UpdateCostSummary":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cost = model.CostStructure.List.SingleOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                        if (cost != null)
                        {
                            cost.Summary.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "UpdateCostIsPreLaunch":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cost = model.CostStructure.List.SingleOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                        if (cost != null)
                        {
                            cost.IsPreLaunch.Value = this.ToBoolean(change.Operations[0].Value);
                        }
                    }
                    break;
                case "UpdateCostIsPostLaunch":
                    this.EnsureOperationCount(change, 1);
                    {
                        var cost = model.CostStructure.List.SingleOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                        if (cost != null)
                        {
                            cost.IsPostLaunch.Value = this.ToBoolean(change.Operations[0].Value);
                        }
                    }
                    break;
                default:
                    throw new ArgumentException($"Unexpected event type: {change.Type}", nameof(change));
            }
            modelStore.Events.Add(change);
        }

        private void ApplyBasicListDelete(BusinessModelDTO model, IncomingChangeEvent change, Func<BusinessModelDTO, IdentifiedList<IdentifiedPrimitive<string>>> getParent)
        {
            this.EnsureOperationCount(change, 1);
            {
                var parent = getParent(model);
                if (parent != null)
                {
                    parent.List.RemoveAll(e => e.GlobalId == change.Operations[0].ObjectId);
                }
            }
        }

        private void ApplyBasicListUpdate(BusinessModelDTO model, IncomingChangeEvent change, Func<BusinessModelDTO, IdentifiedList<IdentifiedPrimitive<string>>> getParent)
        {
            this.EnsureOperationCount(change, 1);
            {
                var parent = getParent(model);
                if (parent != null)
                {
                    var entry = parent.List.SingleOrDefault(e => e.GlobalId == change.Operations[0].ObjectId);
                    if (entry != null)
                    {
                        entry.Value = change.Operations[0].Value.ToString();
                    }
                }
            }
        }

        private void ApplyBasicListAdd(BusinessModelDTO model, IncomingChangeEvent change, Func<BusinessModelDTO, IdentifiedList<IdentifiedPrimitive<string>>> getParent)
        {
            this.EnsureOperationCount(change, 1);
            {
                var parent = getParent(model);
                if (parent != null)
                {
                    parent.List.Add(new IdentifiedPrimitive<string>()
                    {
                        GlobalId = change.Operations[0].ObjectId,
                        ParentId = change.Operations[0].ParentId,
                        Field = change.Operations[0].Field,
                        Value = change.Operations[0].Value.ToString()
                    });
                }
            }
        }

        

    }
}
