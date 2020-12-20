using GDB.Common.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.General.Models
{
    public class StudioChoiceModel
    {
        public StudioChoiceModel(int userId, List<AccessibleStudio> studios, string returnUrl)
        {
            UserId = userId;
            Studios = studios;
            ReturnUrl = returnUrl;
        }

        public int UserId { get; }
        public List<AccessibleStudio> Studios { get; }
        public string ReturnUrl { get; }
    }
}
