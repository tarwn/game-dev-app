using Dapper;
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

        public async Task UpdateActorAsync(string actor, int seqNo, int userId, DateTime updatedOn)
        {
            // UPSERT pattern from Aaron Bertrand: https://sqlperformance.com/2020/09/locking/upsert-anti-pattern
            var param = new { actor, seqNo, userId, updatedOn };
            var sql = @"
                    UPDATE dbo.Actor WITH (UPDLOCK, SERIALIZABLE) 
                    SET SeqNo = @SeqNo
                        AND UserId = @UserId
                        AND UpdatedOn = @UpdatedOn
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
