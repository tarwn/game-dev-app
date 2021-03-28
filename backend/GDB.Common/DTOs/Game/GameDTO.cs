using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.Game
{
    public class GameDTO
    {
        public GameDTO() { }

        public GameDTO(int id, int studioId, string name, GameStatus status, DateTime launchDate, string logoUrl,
                       DateTime createdOn, int createdBy, DateTime updatedOn, int updatedBy,
                       DateTime? businessModelLastUpdatedOn = null, int? businessModelLastUpdatedBy = null,
                       DateTime? cashForecastLastUpdatedOn = null, int? cashForecastLastUpdatedBy = null,
                       DateTime? comparablesLastUpdatedOn = null, int? comparablesLastUpdatedBy = null,
                       DateTime? marketingPlanLastUpdatedOn = null, int? marketingPlanLastUpdatedBy = null)
        {
            Id = id;
            StudioId = studioId;
            Name = name;
            LaunchDate = launchDate;
            LogoUrl = logoUrl;
            CreatedOn = createdOn;
            CreatedBy = createdBy;
            UpdatedOn = updatedOn;
            UpdatedBy = updatedBy;
            // modules
            BusinessModelLastUpdatedOn = businessModelLastUpdatedOn;
            BusinessModelLastUpdatedBy = businessModelLastUpdatedBy;
            CashForecastLastUpdatedOn = cashForecastLastUpdatedOn;
            CashForecastLastUpdatedBy = cashForecastLastUpdatedBy;
            ComparablesLastUpdatedOn = comparablesLastUpdatedOn;
            ComparablesLastUpdatedBy = comparablesLastUpdatedBy;
            MarketingPlanLastUpdatedOn = marketingPlanLastUpdatedOn;
            MarketingPlanLastUpdatedBy = marketingPlanLastUpdatedBy;
        }

        public int Id { get; set; }
        public int StudioId { get; set; }
        public string Name { get; set; }
        public GameStatus Status { get; set; }
        public DateTime LaunchDate { get; set; }
        public string LogoUrl { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime UpdatedOn { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime? BusinessModelLastUpdatedOn { get; set; }
        public int? BusinessModelLastUpdatedBy { get; set; }
        public DateTime? CashForecastLastUpdatedOn { get; set; }
        public int? CashForecastLastUpdatedBy { get; set; }
        public DateTime? ComparablesLastUpdatedOn { get; set; }
        public int? ComparablesLastUpdatedBy { get; set; }
        public DateTime? MarketingPlanLastUpdatedOn { get; set; }
        public int? MarketingPlanLastUpdatedBy { get; set; }
    }
}
