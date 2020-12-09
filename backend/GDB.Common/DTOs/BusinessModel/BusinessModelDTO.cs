using GDB.Common.DTOs.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelDTO : IIdentifiedObject
    {
        public BusinessModelDTO()
        {
            Customers = new IdentifiedList<BusinessModelCustomer>();
            ValueProposition = new BusinessModelValueProposition();
            Channels = new BusinessModelChannels();
            CustomerRelationships = new BusinessModelCustomerRelationships();
            Revenue = new BusinessModelRevenue();
            KeyResources = new BusinessModelKeyResources();
        }

        public BusinessModelDTO(string gameId, string modelId)
        {
            GlobalId = modelId;
            ParentId = gameId;
            VersionNumber = 1;
            Customers = new IdentifiedList<BusinessModelCustomer>()
            {
                ParentId = modelId,
                GlobalId = $"{modelId}:customers",
                Field = "customers",
                List = new List<BusinessModelCustomer>()
            };
            ValueProposition = new BusinessModelValueProposition()
            {
                ParentId = modelId,
                GlobalId = $"{modelId}:vp",
                Field = "value-proposition",
                Genres = new IdentifiedList<IdentifiedPrimitive<string>>() {
                    ParentId = $"{modelId}:vp",
                    GlobalId = $"{modelId}:vp:genres",
                    Field = "genres",
                    List = new List<IdentifiedPrimitive<string>>()
                },
                Platforms = new IdentifiedList<IdentifiedPrimitive<string>>() {
                    ParentId = $"{modelId}:vp",
                    GlobalId = $"{modelId}:bp:platforms",
                    Field = "platforms",
                    List = new List<IdentifiedPrimitive<string>>()
                },
                Entries = new IdentifiedList<IdentifiedPrimitive<string>>() {
                    ParentId = $"{modelId}:vp",
                    GlobalId = $"{modelId}:vp:entries",
                    Field = "entries",
                    List = new List<IdentifiedPrimitive<string>>()
                }
            };
            Channels = new BusinessModelChannels() {
                ParentId = modelId,
                GlobalId = $"{modelId}:channels",
                Field = "channels",
                Awareness = new IdentifiedList<IdentifiedPrimitive<string>>()
                {
                    ParentId = $"{modelId}:channels",
                    GlobalId = $"{modelId}:channels:awareness",
                    Field = "awareness",
                    List = new List<IdentifiedPrimitive<string>>()
                },
                Consideration = new IdentifiedList<IdentifiedPrimitive<string>>()
                {
                    ParentId = $"{modelId}:channels",
                    GlobalId = $"{modelId}:channels:consider",
                    Field = "consideration",
                    List = new List<IdentifiedPrimitive<string>>()
                },
                Purchase = new IdentifiedList<IdentifiedPrimitive<string>>()
                {
                    ParentId = $"{modelId}:channels",
                    GlobalId = $"{modelId}:channels:purch",
                    Field = "purchase",
                    List = new List<IdentifiedPrimitive<string>>()
                },
                PostPurchase = new IdentifiedList<IdentifiedPrimitive<string>>()
                {
                    ParentId = $"{modelId}:channels",
                    GlobalId = $"{modelId}:channels:postpurch",
                    Field = "postPurchase",
                    List = new List<IdentifiedPrimitive<string>>()
                }
            };
            CustomerRelationships = new BusinessModelCustomerRelationships()
            {
                ParentId = modelId,
                GlobalId = $"{modelId}:cr",
                Field = "customerRelationships",
                Entries = new IdentifiedList<IdentifiedPrimitive<string>>()
                {
                    ParentId = $"{modelId}:cr",
                    GlobalId = $"{modelId}:cr:entries",
                    Field = "entries",
                    List = new List<IdentifiedPrimitive<string>>()
                }
            };
            Revenue = new BusinessModelRevenue()
            {
                ParentId = modelId,
                GlobalId = $"{modelId}:rev",
                Field = "revenue",
                Entries = new IdentifiedList<IdentifiedPrimitive<string>>()
                {
                    ParentId = $"{modelId}:rev",
                    GlobalId = $"{modelId}:rev:entries",
                    Field = "entries",
                    List = new List<IdentifiedPrimitive<string>>()
                }
            };
            KeyResources = new BusinessModelKeyResources()
            {
                ParentId = modelId,
                GlobalId = $"{modelId}:kr",
                Field = "keyResources",
                Entries = new IdentifiedList<IdentifiedPrimitive<string>>()
                {
                    ParentId = $"{modelId}:kr",
                    GlobalId = $"{modelId}:kr:entries",
                    Field = "entries",
                    List = new List<IdentifiedPrimitive<string>>()
                }
            };
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string? Field { get; set; }
        public int VersionNumber { get; set; }

        public IdentifiedList<BusinessModelCustomer> Customers { get; set; }
        public BusinessModelValueProposition ValueProposition { get; set; }
        public BusinessModelChannels Channels { get; set; }
        public BusinessModelCustomerRelationships CustomerRelationships { get; set; }
        public BusinessModelRevenue Revenue { get; set; }
        public BusinessModelKeyResources KeyResources { get; set; }
    }
}
