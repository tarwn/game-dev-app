using Dapper;
using GDB.Common.Authorization;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.App.Tests.IntegrationTests.DataSetup.Tables
{
    public class Actors
    {
        private DatabaseHelper _databaseHelper;

        public Actors(DatabaseHelper databaseHelper)
        {
            _databaseHelper = databaseHelper;
        }

        public ActorRegistration Add(string actor, int userId, int seqNo, DateTime updatedOn)
        {
            using (var conn = _databaseHelper.GetConnection())
            {
                var sql = @"
                    INSERT INTO dbo.Actor(Actor, Seqno, UserId, UpdatedOn)
                    VALUES(@Actor, @SeqNo, @UserId, @UpdatedOn);

                    SELECT *, LatestSeqNo = SeqNo FROM Actor WHERE Actor = @Actor;
                ";
                var param = new
                {
                    actor,
                    seqNo,
                    userId,
                    updatedOn
                };
                return conn.QuerySingle<ActorRegistration>(sql, param);
            }
        }
    }
}
