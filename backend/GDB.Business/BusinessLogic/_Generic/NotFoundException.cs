using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Business.BusinessLogic._Generic
{
    public class NotFoundException : Exception
    {
        public NotFoundException(string gameId, string type) : base($"No {type} found for game id '{gameId}'")
        {
            GameId = gameId;
            Data.Add("DTOType", type);
            Data.Add("GameId", gameId);
        }

        public string GameId { get; set; }
    }
}
