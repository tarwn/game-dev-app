
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

