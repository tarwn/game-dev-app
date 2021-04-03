using GDB.Common.Context;
using GDB.Common.DTOs.Studio;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.BusinessLogic
{
    public interface IStudioService
    {
        Task UpdateStudioAsync(UpdateStudioDTO update, IAuthContext auth);
    }
}
