using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;

namespace GDB.Common.DTOs.BusinessModel
{

    public class BusinessModelChangeEvent : IncomingBusinessModelChangeEvent
    {
        public BusinessModelChangeEvent() : base()
        { }

        public BusinessModelChangeEvent(int versionNumber, IncomingBusinessModelChangeEvent change)
            : base(change.Actor, change.SeqNo, change.Type, change.PreviousVersionNumber)
        {
            VersionNumber = versionNumber;
            Operations = change.Operations;
        }

        public BusinessModelChangeEvent(string actor, int seqNo, string type, int versionNumber, int previousVersionNumber)
            : base(actor, seqNo, type, previousVersionNumber)
        {
            VersionNumber = versionNumber;
        }

        public int VersionNumber { get; set; }
    }

    public class IncomingBusinessModelChangeEvent
    {
        public IncomingBusinessModelChangeEvent()
        {
            Operations = new List<BusinessModelEventOperation>();
        }

        public IncomingBusinessModelChangeEvent(string actor, int seqNo, string type, int previousVersionNumber)
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
        public List<BusinessModelEventOperation> Operations { get; set; }
    }
}
