using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.Authorization
{
    public class ActorRegistration
    {
        public ActorRegistration() { }

        public ActorRegistration(string actor, int latestSeqNo, int userId, DateTime updatedOn)
        {
            Actor = actor;
            LatestSeqNo = latestSeqNo;
            UserId = userId;
            UpdatedOn = updatedOn;
        }

        public string Actor { get; set; }
        public int LatestSeqNo { get; set; }
        public DateTime UpdatedOn { get; set; }
        public int UserId { get; set; }
    }
}
