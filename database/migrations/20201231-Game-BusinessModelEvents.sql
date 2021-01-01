
CREATE TABLE dbo.EventStore (
	Id int NOT NULL IDENTITY(1,1),
	StudioId int NOT NULL,
	GameId int NOT NULL,
	ObjectType varchar(30) NOT NULL,
	VersionNumber int NOT NULL,
	RawEvent varchar(MAX),

	CONSTRAINT PK_EventStore PRIMARY KEY CLUSTERED (Id ASC),
	CONSTRAINT FK_EventStore_Studio FOREIGN KEY (StudioId) REFERENCES dbo.Studio(Id),
	CONSTRAINT FK_EventStore_Game FOREIGN KEY (GameId) REFERENCES dbo.Game(Id)
);

CREATE TABLE dbo.Actor (
	Actor varchar(20) NOT NULL,
	SeqNo int NOT NULL,
	UserId int NOT NULL,
	UpdatedOn DateTime2(3) NOT NULL,

	CONSTRAINT PK_Actor PRIMARY KEY CLUSTERED (Actor ASC),
	CONSTRAINT FK_Actor_User FOREIGN KEY (UserId) REFERENCES dbo.[User](Id)
);
