
ALTER TABLE dbo.Game ADD BusinessModelLastUpdatedOn DateTime2(3) NULL;
ALTER TABLE dbo.Game ADD BusinessModelLastUpdatedBy int NULL;
ALTER TABLE dbo.Game ADD CashForecastLastUpdatedOn DateTime2(3) NULL;
ALTER TABLE dbo.Game ADD CashForecastLastUpdatedBy int NULL;
ALTER TABLE dbo.Game ADD ComparablesLastUpdatedOn DateTime2(3) NULL;
ALTER TABLE dbo.Game ADD ComparablesLastUpdatedBy int NULL;
ALTER TABLE dbo.Game ADD MarketingPlanLastUpdatedOn DateTime2(3) NULL;
ALTER TABLE dbo.Game ADD MarketingPlanLastUpdatedBy int NULL;

ALTER TABLE dbo.Game ADD CONSTRAINT FK_Game_User_BusinessModelLastUpdatedBy FOREIGN KEY (BusinessModelLastUpdatedBy) REFERENCES dbo.[User](Id);
ALTER TABLE dbo.Game ADD CONSTRAINT FK_Game_User_CashForecastLastUpdatedBy FOREIGN KEY (CashForecastLastUpdatedBy) REFERENCES dbo.[User](Id);
ALTER TABLE dbo.Game ADD CONSTRAINT FK_Game_User_ComparablesLastUpdatedBy FOREIGN KEY (ComparablesLastUpdatedBy) REFERENCES dbo.[User](Id);
ALTER TABLE dbo.Game ADD CONSTRAINT FK_Game_User_MarketingPlanLastUpdatedBy FOREIGN KEY (MarketingPlanLastUpdatedBy) REFERENCES dbo.[User](Id);

ALTER TABLE dbo.EventStore ADD RegisteredDate DateTime2(3) NULL;