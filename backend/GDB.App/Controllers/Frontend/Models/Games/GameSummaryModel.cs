﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend.Models.Games
{
    public class GameSummaryModel
    {
        public string GlobalId { get; set; }
        public string Name { get; set; }
        public string Status { get; set; }
        public string LastModified { get; set; }
    }
}
