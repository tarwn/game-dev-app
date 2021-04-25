using GDB.Common.Authorization;
using GDB.Common.BusinessLogic;
using GDB.Common.Context;
using GDB.Common.Persistence;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic
{
    public class ActorService : IActorService
    {
        private IBusinessServiceOperator _busOp;
        private IPersistence _persistence;
        private ILogger<ActorService> _logger;
        private Random _random;

        public ActorService(IBusinessServiceOperator busOp, IPersistence persistence, ILogger<ActorService> logger)
        {
            _busOp = busOp;
            _persistence = persistence;
            _logger = logger;
            _random = new Random();
        }

        public async Task<string> GetActorAsync(IAuthContext user)
        {
            ActorRegistration actor = null;
            int attemptCount = 0;
            // find a non-recently used actor
            do
            {
                attemptCount++;
                actor = await _busOp.Query(async (p) =>
                {
                    var randomActorId = RandomString(5);
                    _logger.LogDebug($"Attempting to register actorId {randomActorId} for user {user.UserId}, attempt {attemptCount}");
                    return await _persistence.Actors.RegisterActorAsync(randomActorId, 30, user.UserId, DateTime.UtcNow);
                });
                if (actor == null)
                {
                    await Task.Delay((int)(5 * _random.NextDouble()));
                }
            } while (actor == null && attemptCount < 20);

            return actor.Actor;
        }

        public async Task<int> GetLatestSeqNoAsync(string actor, IAuthContext user)
        {
            return await _busOp.Query(async (p) =>
            {
                var actorReg = await _persistence.Actors.GetActorAsync(actor);
                if (actorReg.UserId != user.UserId)
                {
                    throw new AccessDeniedException("Actor id does not exist or is not registered to this user", $"Actor id '{actor}' is registered to user {actorReg.UserId}, not registered to this user: {user.UserId}");
                }
                return actorReg.LatestSeqNo;
            });
        }

        // temporary
        //  https://stackoverflow.com/questions/1122483/random-string-generator-returning-same-string
        private static Random random = new Random((int)DateTime.Now.Ticks);//thanks to McAden
        private string RandomString(int size)
        {
            StringBuilder builder = new StringBuilder();
            char ch;
            for (int i = 0; i < size; i++)
            {
                ch = Convert.ToChar(Convert.ToInt32(Math.Floor(26 * random.NextDouble() + 65)));
                builder.Append(ch);
            }

            return builder.ToString();
        }


    }
}
