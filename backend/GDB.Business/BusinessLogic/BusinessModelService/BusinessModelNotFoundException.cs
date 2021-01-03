using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Business.BusinessLogic.BusinessModelService
{

    public class BusinessModelNotFoundException : Exception
    {
        public BusinessModelNotFoundException(string gameId) : base($"No business model found for game id '{gameId}'")
        {
            GameId = gameId;
        }

        public string GameId { get; set; }
    }
}
