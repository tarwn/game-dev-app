using Dapper;
using GDB.Common.Authentication;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.App.Tests.IntegrationTests.DataSetup.Tables
{
    public class Users
    {
        private DatabaseHelper _databaseHelper;

        public Users(DatabaseHelper databaseHelper)
        {
            _databaseHelper = databaseHelper;
        }

        public User Add(string displayName, string username, string passwordHash, bool mustResetPassword)
        {
            using (var conn = _databaseHelper.GetConnection())
            {
                var sql = @"
                    INSERT INTO dbo.[User](DisplayName, Username, PasswordHash, MustResetPassword, CreatedOn, CreatedBy, HasSeenPopup)
                    VALUES(@DisplayName, @Username, @PasswordHash, @MustResetPassword, @CreatedOn, @CreatedBy, 0);
                    SELECT * FROM [User] WHERE Id = scope_identity();
                ";
                var param = new
                {
                    displayName,
                    username,
                    passwordHash,
                    mustResetPassword,
                    createdBy = -1,
                    createdOn = DateTime.UtcNow
                };
                return conn.QuerySingle<User>(sql, param);
            }
        }
    }
}
