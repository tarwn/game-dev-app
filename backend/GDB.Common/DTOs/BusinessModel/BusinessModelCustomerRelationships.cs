﻿using GDB.Common.DTOs.Interfaces;

namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelCustomerRelationships : IIdentifiedObject
    {
        public BusinessModelCustomerRelationships() { }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }
        public IdentifiedList<IdentifiedPrimitive<string>> Entries { get; set; }
    }
}