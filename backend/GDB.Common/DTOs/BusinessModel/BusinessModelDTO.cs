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
        }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string? Field { get; set; }
        public int VersionNumber { get; set; }

        public IdentifiedList<BusinessModelCustomer> Customers { get; set; }
    }
}
