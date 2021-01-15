using System.Collections.Generic;

namespace GDB.Common.DTOs._Events
{
    public class IncomingChangeEvent
    {
        public IncomingChangeEvent()
        {
            Operations = new List<EventOperation>();
        }

        public IncomingChangeEvent(string actor, int seqNo, string type, int previousVersionNumber)
            : this()
        {
            Actor = actor;
            SeqNo = seqNo;
            Type = type;
            PreviousVersionNumber = previousVersionNumber;
        }

        public string Actor { get; set; }
        public int SeqNo { get; set; }
        public string Type { get; set; }
        public int PreviousVersionNumber { get; set; }
        public List<EventOperation> Operations { get; set; }
    }
}
