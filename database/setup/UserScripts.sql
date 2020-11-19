/*
Instructions:
 Replace USERNAME with tenant username
 Replace PASSWORD with tenant password
 
 Run each section in appropriate place
*/

-- Run in 'master
CREATE LOGIN USERNAME_DEPLOY WITH PASSWORD=N'PASSWORD_DEPLOY';
CREATE LOGIN USERNAME_APP WITH PASSWORD=N'PASSWORD_APP';

-- Run in tenant database
CREATE USER USERNAME_APP FOR LOGIN USERNAME_APP WITH DEFAULT_SCHEMA=[dbo]
EXEC sys.sp_addrolemember 'db_datawriter', 'USERNAME_APP';
EXEC sys.sp_addrolemember 'db_datareader', 'USERNAME_APP';

CREATE USER USERNAME_DEPLOY FOR LOGIN USERNAME_DEPLOY WITH DEFAULT_SCHEMA=[dbo]
EXEC sys.sp_addrolemember 'db_owner', 'USERNAME_DEPLOY';