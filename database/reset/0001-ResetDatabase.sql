
-- Clear non-system defined data: used for test databases
--	Make sure the order is correct and ignores system-defined data

DELETE FROM dbo.Customer;
DELETE FROM dbo.Actor;
DELETE FROM dbo.UserSession;
DELETE FROM dbo.UserStudioXref;
DELETE FROM dbo.GameTaskAssignment;
DELETE FROM dbo.GameTask;
DELETE FROM dbo.Game;
DELETE FROM dbo.Studio;
DELETE FROM dbo.PasswordHistory;
DELETE FROM dbo.PasswordResetToken;
DELETE FROM dbo.[User] WHERE Id > 0;
