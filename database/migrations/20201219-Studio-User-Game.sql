
CREATE TABLE dbo.Studio (
	Id int NOT NULL IDENTITY(1,1),
	[Name] varchar(80) NOT NULL,
	CreatedOn DateTime2(3) NOT NULL,
	CreatedBy int NOT NULL,
	UpdatedOn DateTime2(3) NULL,
	UpdatedBy int NULL,

	CONSTRAINT PK_Studio PRIMARY KEY CLUSTERED (Id ASC)
);

CREATE TABLE dbo.[User] (
	Id int NOT NULL IDENTITY(1,1),
	DisplayName varchar(80) NOT NULL,
	UserName varchar(80) NOT NULL,
	PasswordHash varchar(80) NOT NULL,
	MustResetPassword bit NOT NULL,
	CreatedOn DateTime2(3) NOT NULL,
	CreatedBy int NOT NULL,
	UpdatedOn DateTime2(3) NULL,
	UpdatedBy int NULL,

	CONSTRAINT PK_User PRIMARY KEY CLUSTERED (Id ASC),
	CONSTRAINT AK_UserName UNIQUE(UserName)   
);

CREATE TABLE dbo.UserStudioXref (
	UserId int NOT NULL,
	StudioId int NOT NULL,
	HasAccess bit,

	CONSTRAINT FK_UserStudioXref_User FOREIGN KEY (UserId) REFERENCES dbo.[User](Id),
	CONSTRAINT FK_UserStudioXref_Studio FOREIGN KEY (StudioId) REFERENCES dbo.Studio(Id)
);

CREATE TABLE dbo.UserSession (
	Id int NOT NULL IDENTITY(1,1),
	UserId int NOT NULL,
	StudioId int NOT NULL,
	CreatedOn DateTime2(3) NOT NULL,
	LastSeenOn DateTime2(3) NOT NULL,
	AbsoluteExpirationDate DateTime2(3) NOT NULL,
	IsForcedExpiration bit NOT NULL,

	CONSTRAINT PK_UserSession PRIMARY KEY CLUSTERED (Id ASC),
	CONSTRAINT FK_UserSession_User FOREIGN KEY (UserId) REFERENCES dbo.[User](Id),
	CONSTRAINT FK_UserSession_Studio FOREIGN KEY (StudioId) REFERENCES dbo.Studio(Id),
);

CREATE TABLE dbo.PasswordHistory (
	Id int NOT NULL IDENTITY(1,1),
	UserId int NOT NULL,
	PasswordHash varchar(80) NOT NULL,
	CreatedOn DateTime2(3) NOT NULL,

	CONSTRAINT PK_PasswordHistory PRIMARY KEY CLUSTERED (Id ASC),
	CONSTRAINT FK_PasswordHistory_User FOREIGN KEY (UserId) REFERENCES dbo.[User](Id),
);

CREATE TABLE dbo.PasswordResetToken (
	Id int NOT NULL IDENTITY(1,1),
	TargetUserId int NOT NULL,
	ResetToken varchar(80) NOT NULL,
	CreatedOn DateTime2(3) NOT NULL,
	GoodThrough DateTime2(3) NOT NULL,
	UsedOn DateTime2(3) NULL,

	CONSTRAINT PK_PasswordResetToken PRIMARY KEY CLUSTERED (Id ASC),
	CONSTRAINT FK_PasswordResetToken_User FOREIGN KEY (TargetUserId) REFERENCES dbo.[User](Id),
);

-- System user
SET IDENTITY_INSERT dbo.[User] ON

INSERT INTO dbo.[User] (Id, DisplayName, UserName, PasswordHash, MustResetPassword, CreatedOn, CreatedBy)
VALUES(-1, 'System', 'System', '', 'false', GetUtcDate(), -1);

SET IDENTITY_INSERT dbo.[User] OFF
