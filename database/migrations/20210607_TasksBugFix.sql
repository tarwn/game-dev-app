

-- backfill
INSERT INTO dbo.GameTask(TaskTypeId, GameId, TaskStateId, DueDate, CreatedOn, CreatedBy)
SELECT TT.Id, G.Id, 1 /* Open */, NULL, GetUtcDate(), -1
-- SELECT *
FROM dbo.TaskType TT
	CROSS JOIN dbo.Game G
WHERE G.DeletedBy IS NULL
	AND NOT EXISTS (SELECT 1 FROM dbo.GameTask GT WHERE GameId = G.Id);

