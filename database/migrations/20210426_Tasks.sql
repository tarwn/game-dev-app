
CREATE TABLE dbo.TaskType (
	Id int NOT NULL,
	[Name] varchar(30),
	GameStatusId tinyint NOT NULL,

	CONSTRAINT PK_TaskType PRIMARY KEY CLUSTERED (Id ASC),
	CONSTRAINT FK_TaskType_GameStatus FOREIGN KEY (GameStatusId) REFERENCES dbo.GameStatus(Id),
);

INSERT INTO dbo.TaskType(Id, [Name], GameStatusId)
VALUES(1, 'Concept', 1),
	(2, 'Goals', 1),
	(3, 'Groundwork', 1),
	(4, 'Business Model', 1),
	(5, 'Risk Analysis', 2),
	(6, 'Project Plan', 2),
	(7, 'Cost Forecast', 2),
	(8, 'Comparables', 2),
	(9, 'Profit Forecast', 2),
	(10, 'Marketing Strategy', 2);

CREATE TABLE dbo.TaskState (
	Id int NOT NULL,
	[Name] varchar(30)

	CONSTRAINT PK_TaskState PRIMARY KEY CLUSTERED (Id ASC),
);

INSERT INTO dbo.TaskState(Id, [Name])
VALUES(1, 'Open'),
	(2, 'Closed-Complete'),
	(3, 'Closed-Skipped');

CREATE TABLE dbo.GameTask (
	Id int NOT NULL IDENTITY(1,1),
	TaskTypeId int NOT NULL,
	GameId int NOT NULL,
	TaskStateId int NOT NULL,
	DueDate Date NULL,
	CreatedOn DateTime2(3) NOT NULL,
	CreatedBy int NOT NULL,
	UpdatedOn DateTime2(3) NULL,
	UpdatedBy int NULL,
	ClosedOn DateTime2(3) NULL,
	ClosedBy int NULL,
	
	CONSTRAINT PK_GameTask PRIMARY KEY CLUSTERED (Id ASC),
	CONSTRAINT FK_GameTask_TaskType FOREIGN KEY (TaskTypeId) REFERENCES dbo.TaskType(Id),
	CONSTRAINT FK_GameTask_Game FOREIGN KEY (GameId) REFERENCES dbo.Game(Id),
	CONSTRAINT FK_GameTask_TaskState FOREIGN KEY (TaskStateId) REFERENCES dbo.TaskState(Id),
	CONSTRAINT FK_GameTask_User_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.[User](Id),
	CONSTRAINT FK_GameTask_User_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES dbo.[User](Id),
	CONSTRAINT FK_GameTask_User_ClosedBy FOREIGN KEY (ClosedBy) REFERENCES dbo.[User](Id),
);

CREATE TABLE dbo.GameTaskAssignment (
	UserId int NOT NULL,
	GameId int NOT NULL,
	GameTaskId int NULL,

	CONSTRAINT PK_GameTaskAssignment PRIMARY KEY CLUSTERED (UserId ASC, GameId ASC),
	CONSTRAINT FK_GameTaskAssignment_User FOREIGN KEY (UserId) REFERENCES dbo.[User](Id),
	CONSTRAINT FK_GameTaskAssignment_Game FOREIGN KEY (GameId) REFERENCES dbo.Game(Id),
	CONSTRAINT FK_GameTaskAssignment_GameTask FOREIGN KEY (GameTaskId) REFERENCES dbo.GameTask(Id),
);

Go

-- backfill
INSERT INTO dbo.GameTask(TaskTypeId, GameId, TaskStateId, DueDate, CreatedOn, CreatedBy)
SELECT TT.Id, G.Id, 1 /* Open */, NULL, GetUtcDate(), -1
FROM dbo.TaskType TT
	CROSS JOIN dbo.Game G
WHERE G.DeletedBy IS NULL;

