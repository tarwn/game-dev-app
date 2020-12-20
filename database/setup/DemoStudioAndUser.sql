
DECLARE @StudioName varchar(40) = 'Clever Snail Games';
DECLARE @DemoUserName varchar(40) = 'demo@launchready.co';
DECLARE @SystemUserId int = -1;

DECLARE @StudioId int;
IF NOT EXISTS (SELECT * FROM Studio WHERE [Name] = @StudioName)
BEGIN
	INSERT INTO dbo.Studio([Name], CreatedOn, CreatedBy)
	VALUES(@StudioName, '2020-09-04 12:00', @SystemUserId);
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
	INSERT INTO dbo.UserStudioXref(UserId, StudioId, HasAccess)
	VALUES(@UserId, @StudioId, 'true');
END
ELSE
BEGIN
	UPDATE dbo.UserStudioXref
	SET HasAccess = 'true'
	WHERE UserId = @UserId
		AND StudioId = @StudioId;
END

