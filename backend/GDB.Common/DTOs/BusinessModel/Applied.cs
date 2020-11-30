using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.BusinessModel
{
    public class Applied<T> where T: BusinessModelChangeEvent
    {
        public Applied(string gameId, int previousVersionNumber, int versionNumber, T newEvent)
        {
            GameId = gameId;
            PreviousVersionNumber = previousVersionNumber;
            VersionNumber = versionNumber;
            Event = newEvent;
        }

        public string GameId { get; }
        public int VersionNumber { get; set; }
        public int PreviousVersionNumber { get; set; }
        public T Event { get; set; }
    }
}
