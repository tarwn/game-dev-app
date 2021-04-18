/*
	Step 1: Run this script with appropriate values
	Step 2: Do the password reset for the user to get them an invite
	Step 3: They need to create their 1st game
*/

DECLARE @StudioName varchar(40) = 'New User Test';
DECLARE @Username varchar(40) = 'eli@launchready.co';
DECLARE @DisplayName varchar(80) = 'NewUserTestUser';
DECLARE @SystemUserId int = -1;
DECLARE @EarlyAccessPlan int = 1;
DECLARE @ActiveAccessLevel int = 2;
DECLARE @StudioRoleAdmin int = 1;

IF EXISTS (SELECT * FROM Studio WHERE [Name] = @StudioName)
THROW 51000, 'Studio already exists', 1;

IF EXISTS (SELECT * FROM [User] WHERE Username = @Username)
THROW 51000, 'User already exists', 1;

DECLARE @StudioId int;
DECLARE @UserId int;

BEGIN TRAN;

INSERT INTO dbo.[Studio]([Name], CreatedOn, CreatedBy, BillingPlan)
VALUES(@StudioName, GETUTCDATE(), @SystemUserId, @EarlyAccessPlan);
SET @StudioId = scope_identity();

INSERT INTO [User](DisplayName, UserName, PasswordHash, MustResetPassword, CreatedOn, CreatedBy, HasSeenPopup)
VALUES(@DisplayName, @UserName, 'na', 'true', GetUtcDate(), @SystemUserId, 0);
SET @UserId = scope_identity();

INSERT INTO dbo.UserStudioXref(UserId, StudioId, HasAccess, Access, [Role])
VALUES(@UserId, @StudioId, 'true', @ActiveAccessLevel, @StudioRoleAdmin);

--SELECT * FROM Studio
--SELECT * FROM [User]

--ROLLBACK TRAN;
COMMIT TRAN;


