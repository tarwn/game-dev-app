using Dapper;
using GDB.Common.Authorization;
using GDB.Common.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Persistence.Repositories
{
    public class ActorRepository : BaseRepository, IActorRepository
    {
        public ActorRepository(string connectionString) : base(connectionString)
        { }

        public async Task<ActorRegistration> GetActorAsync(string actorId)
        {
            var param = new { actorId };
            var sql = @"
                SELECT Actor, LatestSeqNo = SeqNo, UserId, UpdatedOn
                FROM dbo.Actor
                WHERE Actor = @ActorId;
            ";
            using (var conn = GetConnection())
            {
                var actor = await conn.QuerySingleOrDefaultAsync<ActorRegistration>(sql, param);
                if (actor == null)
                {
                    return new ActorRegistration(actorId, 0, -1, DateTime.UtcNow.AddYears(-10));
                }
                return actor;
            }
        }

        public async Task<ActorRegistration> RegisterActorAsync(string actorId, int numberOfDaysUnused, int userId, DateTime registeredOn)
        {
            var param = new { 
                actorId,
                userId,
                UpdatedOn = registeredOn,
                LastUnused = DateTime.UtcNow.AddDays(-1 * numberOfDaysUnused)
            };
            var sql = @"
                IF NOT EXISTS(SELECT * FROM dbo.Actor WHERE Actor = @ActorId AND UpdatedOn > @LastUnused)
                BEGIN
                    UPDATE dbo.Actor WITH (UPDLOCK, SERIALIZABLE) 
                    SET UserId = @UserId,
                        UpdatedOn = @UpdatedOn
                    WHERE Actor = @ActorId;
 
                    IF @@ROWCOUNT = 0
                    BEGIN
                        INSERT INTO dbo.Actor(Actor, Seqno, UserId, UpdatedOn)
                        VALUES(@ActorId, 0, @UserId, @UpdatedOn);
                    END

                    SELECT Actor, Seqno, UserId, UpdatedOn
                    FROM dbo.Actor 
                    WHERE Actor = @ActorId
                END
                ELSE
                BEGIN
                    SELECT Actor, Seqno, UserId, UpdatedOn
                    FROM dbo.Actor 
                    WHERE 0 = 1;
                END
            ";
            using (var conn = GetConnection())
            {
                return await conn.QuerySingleOrDefaultAsync<ActorRegistration>(sql, param);
            }
        }

        public async Task UpdateActorAsync(string actor, int seqNo, int userId, DateTime updatedOn)
        {
            // UPSERT pattern from Aaron Bertrand: https://sqlperformance.com/2020/09/locking/upsert-anti-pattern
            var param = new { actor, seqNo, userId, updatedOn };
            var sql = @"
                UPDATE dbo.Actor WITH (UPDLOCK, SERIALIZABLE) 
                SET SeqNo = @SeqNo,
                    UserId = @UserId,
                    UpdatedOn = @UpdatedOn
                WHERE Actor = @Actor;
 
                IF @@ROWCOUNT = 0
                BEGIN
                    INSERT INTO dbo.Actor(Actor, Seqno, UserId, UpdatedOn)
                    VALUES(@Actor, @SeqNo, @UserId, @UpdatedOn);
                END
            ";
            using (var conn = GetConnection())
            {
                await conn.ExecuteAsync(sql, param);
            }
        }
    }
}
