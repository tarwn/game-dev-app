using Dapper;
using GDB.Common.Authentication;
using GDB.Common.DTOs.Studio;
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

        public AccessibleStudio Add(string name, BillingPlan billingPlan = BillingPlan.EarlyAccessFlatFee, DateTime? trialStart = null, DateTime? trialEnd = null)
        {
            using (var conn = _databaseHelper.GetConnection())
            {
                var sql = @"
                    INSERT INTO dbo.Studio(Name, BillingPlan, TrialStart, TrialEnd, CreatedOn, CreatedBy)
                    VALUES(@Name, @BillingPlan, @TrialStart, @TrialEnd, @CreatedOn, @CreatedBy);
                    SELECT * FROM Studio WHERE Id = scope_identity();
                ";
                var param = new
                {
                    name,
                    billingPlan,
                    trialStart,
                    trialEnd,
                    createdBy = -1,
                    createdOn = DateTime.UtcNow
                };
                return conn.QuerySingle<AccessibleStudio>(sql, param);
            }
        }

        public void AssignUserAccesstoStudio(int userId, int studioId, bool hasAccess, StudioUserAccess access, StudioUserRole role, DateTime? inviteGoodThrough = null)
        {
            var isInvited = access == StudioUserAccess.PendingActivation;
            using (var conn = _databaseHelper.GetConnection())
            {
                var sql = @"
                    INSERT INTO dbo.UserStudioXref(UserId, StudioId, HasAccess, Access, [Role], InvitedBy, InvitedOn, InviteGoodThrough)
                    VALUES(@userId, @studioId, @hasAccess, @Access, @Role, @InvitedBy, @InvitedOn, @InviteGoodThrough);
                    SELECT * FROM Studio WHERE Id = scope_identity();
                ";
                var param = new
                {
                    userId,
                    studioId,
                    hasAccess,
                    access,
                    role,
                    InvitedBy = isInvited ? -1 : (int?) null,
                    InvitedOn = isInvited ? DateTime.UtcNow.AddDays(-1) : (DateTime?) null,
                    inviteGoodThrough
                };
                conn.Execute(sql, param);
            }
        }
    }
}
