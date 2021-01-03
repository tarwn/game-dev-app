
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'GameStatus')
BEGIN

CREATE TABLE dbo.GameStatus (
	Id tinyint NOT NULL,
	[Name] varchar(20) NOT NULL,

	CONSTRAINT PK_GameStatus PRIMARY KEY CLUSTERED (Id ASC)
);

INSERT INTO dbo.GameStatus(Id, [Name])
VALUES(1, 'Idea'),
		(2, 'Planning'),
		(3, 'Developing'),
		(4, 'Live'),
		(5, 'Retired'),
		(6, 'Archived');

CREATE TABLE dbo.Game (
	Id int NOT NULL IDENTITY(1,1),
	StudioId int NOT NULL,
	[Name] varchar(80) NOT NULL,
	GameStatusId tinyint NOT NULL,
	LaunchDate Date NULL,
	LogoUrl varchar(250) NULL,
	CreatedOn DateTime2(3) NOT NULL,
	CreatedBy int NOT NULL,
	UpdatedOn DateTime2(3) NOT NULL,
	UpdatedBy int NOT NULL,

	CONSTRAINT PK_Game PRIMARY KEY CLUSTERED (Id ASC),
	CONSTRAINT FK_Game_Studio FOREIGN KEY (StudioId) REFERENCES dbo.Studio(Id),
	CONSTRAINT FK_Game_GameStatus FOREIGN KEY (GameStatusId) REFERENCES dbo.GameStatus(Id),
	CONSTRAINT FK_Game_User_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.[User](Id),
	CONSTRAINT FK_Game_User_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES dbo.[User](Id)
);

END
