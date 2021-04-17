ALTER TABLE dbo.[User] ADD HasSeenPopup int NULL;

Go

UPDATE dbo.[User] SET HasSeenPopup = 0;

Go

ALTER TABLE dbo.[User] ALTER COLUMN HasSeenPopup int NOT NULL;
