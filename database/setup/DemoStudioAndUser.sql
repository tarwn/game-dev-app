
DECLARE @StudioName varchar(40) = 'Clever Snail Games';
DECLARE @DemoUserName varchar(40) = 'demo@launchready.co';
DECLARE @SystemUserId int = -1;
DECLARE @EarlyAccessPlan int = 1;
DECLARE @ActiveAccessLevel int = 2;
DECLARE @StudioRoleAdmin int = 1;

DECLARE @StudioId int;
IF NOT EXISTS (SELECT * FROM Studio WHERE [Name] = @StudioName)
BEGIN
	INSERT INTO dbo.Studio([Name], CreatedOn, CreatedBy, BillingPlan)
	VALUES(@StudioName, '2020-09-04 12:00', @SystemUserId, @EarlyAccessPlan);
	SET @StudioId = scope_identity();
END
ELSE
BEGIN
	SELECT @StudioId = Id from Studio WHERE [Name] = @StudioName;
END

DECLARE @UserId int;
IF NOT EXISTS (SELECT * FROM [User] WHERE UserName = @DemoUserName)
BEGIN 
	INSERT INTO [User](DisplayName, UserName, PasswordHash, MustResetPassword, CreatedOn, CreatedBy)
	VALUES('Demo User', @DemoUserName, 'na', 'true', GetUtcDate(), @SystemUserId);
	SET @UserId = scope_identity();
END
ELSE
BEGIN
	SELECT @UserId = Id from [User] WHERE UserName = @DemoUserName;
END

IF NOT EXISTS (SELECT 1 FROM UserStudioXref WHERE StudioId = @StudioId AND UserId = @UserId)
BEGIN
	INSERT INTO dbo.UserStudioXref(UserId, StudioId, HasAccess, Access, [Role])
	VALUES(@UserId, @StudioId, 'true', @ActiveAccessLevel, @StudioRoleAdmin);
END
ELSE
BEGIN
	UPDATE dbo.UserStudioXref
	SET HasAccess = 'true',
		Access = @ActiveAccessLevel,
		[Role] = @StudioRoleAdmin
	WHERE UserId = @UserId
		AND StudioId = @StudioId;
END

IF NOT EXISTS (SELECT 1 FROM dbo.Game WHERE StudioId = @StudioId)
BEGIN
	INSERT INTO dbo.Game(StudioId, [Name], GameStatusId, LaunchDate, LogoUrl, CreatedBy, CreatedOn, UpdatedBy, UpdatedOn)
	VALUES(@StudioId, 'Snail Run', 3, '2021-06-01 12:00:00.000', NULL, @UserId, GETUTCDATE(), @UserId, GETUTCDATE()),
		(@StudioId, 'Snails in Space', 1, '2021-06-01 12:00:00.000', NULL, @UserId, GETUTCDATE(), @UserId, GETUTCDATE());
END
