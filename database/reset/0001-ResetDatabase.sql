
-- Clear non-system defined data: used for test databases
--	Make sure the order is correct and ignores system-defined data

DELETE FROM dbo.Customer;
DELETE FROM UserSession;
DELETE FROM UserStudioXref;
DELETE FROM Studio;
DELETE FROM PasswordHistory;
DELETE FROM PasswordResetToken;
DELETE FROM [User] WHERE Id > 0;
