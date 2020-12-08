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
                    GlobalId = $"{modelId}:vo:entries",
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
    }
}
