using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelDTO
    {
        public BusinessModelDTO()
        {
            Customers = new List<FreeFormCollection>();
        }

        public BusinessModelDTO(string gameId, string modelId)
            : this()
        {
            GlobalId = modelId;
            GlobalGameId = gameId;
            VersionId = 1;
        }

        public string GlobalId { get; set; }
        public string GlobalGameId { get; set; }
        public int VersionId { get; set; }

        public List<FreeFormCollection> Customers { get; set; }
    }
}
