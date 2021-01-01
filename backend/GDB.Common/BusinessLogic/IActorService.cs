using GDB.Common.Context;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.BusinessLogic
{
    public interface IActorService
    {
        Task<int> GetLatestSeqNoAsync(string actor, IAuthContext user);
        Task<string> GetActorAsync(IAuthContext user);
    }
}
