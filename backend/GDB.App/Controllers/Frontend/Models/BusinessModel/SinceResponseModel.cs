using GDB.Common.DTOs.BusinessModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend.Models.BusinessModel
{
    public class SinceResponseModel
    {
        public SinceResponseModel(string gameId, List<BusinessModelChangeEvent> events)
        {
            GameId = gameId;
            Events = events;
        }

        public string GameId { get; set; }
        public List<BusinessModelChangeEvent> Events { get; set; }
    }
}
