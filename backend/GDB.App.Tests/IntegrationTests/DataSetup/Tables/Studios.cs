using Dapper;
using GDB.Common.Authentication;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.App.Tests.IntegrationTests.DataSetup.Tables
{
    public class Studios
    {
        private DatabaseHelper _databaseHelper;

        public Studios(DatabaseHelper databaseHelper)
        {
            _databaseHelper = databaseHelper;
        }

        public AccessibleStudio Add(string name)
        {
            using (var conn = _databaseHelper.GetConnection())
            {
                var sql = @"
                    INSERT INTO dbo.Studio(Name, CreatedOn, CreatedBy)
                    VALUES(@Name, @CreatedOn, @CreatedBy);
                    SELECT * FROM Studio WHERE Id = scope_identity();
                ";
                var param = new
                {
                    name,
                    createdBy = -1,
                    createdOn = DateTime.UtcNow
                };
                return conn.QuerySingle<AccessibleStudio>(sql, param);
            }
        }

        public void AssignUserAccesstoStudio(int userId, int studioId, bool hasAccess)
        {
            using (var conn = _databaseHelper.GetConnection())
            {
                var sql = @"
                    INSERT INTO dbo.UserStudioXref(UserId, StudioId, HasAccess)
                    VALUES(@userId, @studioId, @hasAccess);
                    SELECT * FROM Studio WHERE Id = scope_identity();
                ";
                var param = new
                {
                    userId,
                    studioId,
                    hasAccess
                };
                conn.Execute(sql, param);
            }
        }
    }
}
