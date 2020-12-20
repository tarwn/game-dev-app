using Dapper;
using GDB.Common.Authentication;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.App.Tests.IntegrationTests.DataSetup.Tables
{
    public class PasswordResetTokens
    {
        private DatabaseHelper _databaseHelper;

        public PasswordResetTokens(DatabaseHelper databaseHelper)
        {
            _databaseHelper = databaseHelper;
        }

        public PasswordResetToken AddToken(int targetUserId, string resetToken, DateTime? createdOn = null, DateTime? goodThrough = null)
        {
            createdOn = createdOn ?? DateTime.UtcNow;
            goodThrough = goodThrough ?? DateTime.UtcNow;

            var sql = @"
                INSERT INTO dbo.PasswordResetToken(TargetUserId, ResetToken, CreatedOn, GoodThrough)
                VALUES(@TargetUserId, @ResetToken, @CreatedOn, @GoodThrough);

                SELECT * FROM PasswordResetToken WHERE Id = scope_identity();
            ";
            using (var conn = _databaseHelper.GetConnection())
            { 
                return conn.QuerySingle<PasswordResetToken>(sql, new { targetUserId, resetToken, createdOn, goodThrough });
            }
        }
    }
}
