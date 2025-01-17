﻿using GDB.Common.Authorization;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Persistence.Repositories
{
    public interface IActorRepository
    {
        Task UpdateActorAsync(string actor, int seqNo, int userId, DateTime updatedOn);
        Task<ActorRegistration> GetActorAsync(string actorId);
        Task<ActorRegistration> RegisterActorAsync(string actorId, int numberOfDaysUnused, int userId, DateTime registeredOn);
    }
}
