using GDB.Common.DTOs.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelDTO : IIdentifiedTopObject
    {
        public BusinessModelDTO()
        {
            Customers = new IdentifiedList<BusinessModelCustomer>();
            ValueProposition = new BusinessModelValueProposition();
            Channels = new BusinessModelChannels();
            CustomerRelationships = new BusinessModelCustomerRelationships();
            Revenue = new BusinessModelRevenue();
            KeyResources = new BusinessModelKeyResources();
            KeyActivities = new BusinessModelKeyActivities();
            KeyPartners = new BusinessModelKeyPartners();
            CostStructure = new BusinessModelCostStructure();
        }

        public BusinessModelDTO(string gameId, string modelId)
        {
            GlobalId = modelId;
            ParentId = gameId;
            VersionNumber = 1;
            Customers = new IdentifiedList<BusinessModelCustomer>(modelId, $"{modelId}:customers", "customers");
            ValueProposition = new BusinessModelValueProposition(modelId, $"{modelId}:vp", "valueProposition");
            Channels = new BusinessModelChannels(modelId, $"{modelId}:chnls", "channels");
            CustomerRelationships = new BusinessModelCustomerRelationships(modelId, $"{modelId}:cr", "customerRelationships");
            Revenue = new BusinessModelRevenue(modelId, $"{modelId}:rev", "revenue");
            KeyResources = new BusinessModelKeyResources(modelId, $"{modelId}:kr", "keyResources");
            KeyActivities = new BusinessModelKeyActivities(modelId, $"{modelId}:ka", "keyActivities");
            KeyPartners = new BusinessModelKeyPartners(modelId, $"{modelId}:kp", "keyPartners");
            CostStructure = new BusinessModelCostStructure(modelId, $"{modelId}:cost", "costStructure");
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
        public BusinessModelKeyActivities KeyActivities { get; set; }
        public BusinessModelKeyPartners KeyPartners { get; set; }
        public BusinessModelCostStructure CostStructure { get; set; }

    }
}
