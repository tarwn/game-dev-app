
ALTER TABLE dbo.Game ADD IsFavorite bit NULL;

ALTER TABLE dbo.Game ADD DeletedOn DateTime2(3) NULL;
ALTER TABLE dbo.Game ADD DeletedBy int NULL;

ALTER TABLE dbo.Game ADD CONSTRAINT FK_Game_User_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES dbo.[User](Id);
