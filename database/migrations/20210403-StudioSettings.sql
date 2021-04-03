
ALTER TABLE dbo.Studio ADD BillingPlan int NULL;
ALTER TABLE dbo.Studio ADD TrialStart DateTime2(3) NULL;
ALTER TABLE dbo.Studio ADD TrialEnd DateTime2(3) NULL;

GO

UPDATE dbo.Studio SET BillingPlan = 1;

ALTER TABLE dbo.Studio ALTER COLUMN BillingPlan int NOT NULL;

GO

ALTER TABLE dbo.UserStudioXref ADD Access int NULL;
ALTER TABLE dbo.UserStudioXref ADD [Role] int NULL;
ALTER TABLE dbo.UserStudioXref ADD InvitedBy int NULL;
ALTER TABLE dbo.UserStudioXref ADD InvitedOn DateTime2(3) NULL;
ALTER TABLE dbo.UserStudioXref ADD InviteGoodThrough DateTime2(3) NULL;

ALTER TABLE dbo.UserStudioXref ADD CONSTRAINT FK_UserStudioXref_User_InvitedBy FOREIGN KEY (InvitedBy) REFERENCES dbo.[User](Id);

GO

UPDATE dbo.UserStudioXref 
SET Access = 2, -- active
	[Role] = 1; -- admin

ALTER TABLE dbo.UserStudioXref ALTER COLUMN Access int NOT NULL;
ALTER TABLE dbo.UserStudioXref ALTER COLUMN [Role] int NOT NULL;

