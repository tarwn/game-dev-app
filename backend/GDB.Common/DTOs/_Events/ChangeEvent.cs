using System;
using System.Text;

namespace GDB.Common.DTOs._Events
{
    public class ChangeEvent : IncomingChangeEvent
    {
        public ChangeEvent() : base()
        { }

        public ChangeEvent(int versionNumber, IncomingChangeEvent change)
            : base(change.Actor, change.SeqNo, change.Type, change.PreviousVersionNumber)
        {
            VersionNumber = versionNumber;
            Operations = change.Operations;
        }

        public ChangeEvent(string actor, int seqNo, string type, int versionNumber, int previousVersionNumber)
            : base(actor, seqNo, type, previousVersionNumber)
        {
            VersionNumber = versionNumber;
        }

        public int VersionNumber { get; set; }
    }
}
