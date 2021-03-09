
CREATE TABLE dbo.CashForecastSnapshot (
	Id int NOT NULL IDENTITY(1,1),
	StudioId int NOT NULL,
	GameId int NOT NULL,
	ForecastDate Date NOT NULL,
	LastVersionNumber int NOT NULL,
	ChangeDate DateTime2(3) NOT NULL,

	CONSTRAINT PK_CashForecastSnapshot PRIMARY KEY CLUSTERED (Id ASC),
	CONSTRAINT FK_CashForecastSnapshot_Studio FOREIGN KEY (StudioId) REFERENCES dbo.Studio(Id),
	CONSTRAINT FK_CashForecastSnapshot_Game FOREIGN KEY (GameId) REFERENCES dbo.Game(Id)
);
