using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.Studio
{
    public class StudioDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public BillingPlan BillingPlan { get; set; }
        public DateTime? TrialStart { get; set; }
        public DateTime? TrialEnd { get; set; }
    }
}
