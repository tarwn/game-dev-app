using GDB.Common.DTOs.Game;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend.Models.Games
{
    public class GameExpSummaryModel
    {
        [Obsolete("Serialization Only", false)]
        public GameExpSummaryModel() { }

        public GameExpSummaryModel(GameDTO game)
        {
            GlobalId = game.GetGlobalId();
            Name = game.Name;
            Status = game.Status;
            LastModified = game.UpdatedOn;
            LaunchDate = game.LaunchDate;
            IsFavorite = game.IsFavorite;
            // modules
            BusinessModelLastUpdatedOn = game.BusinessModelLastUpdatedOn;
            BusinessModelLastUpdatedBy = game.BusinessModelLastUpdatedBy;
            CashForecastLastUpdatedOn = game.CashForecastLastUpdatedOn;
            CashForecastLastUpdatedBy = game.CashForecastLastUpdatedBy;
            ComparablesLastUpdatedOn = game.ComparablesLastUpdatedOn;
            ComparablesLastUpdatedBy = game.ComparablesLastUpdatedBy;
            MarketingPlanLastUpdatedOn = game.MarketingPlanLastUpdatedOn;
            MarketingPlanLastUpdatedBy = game.MarketingPlanLastUpdatedBy;
        }

        public string GlobalId { get; set; }
        public string Name { get; set; }
        public GameStatus Status { get; set; }
        public DateTime LastModified { get; set; }
        public DateTime LaunchDate { get; }
        public bool IsFavorite { get; set; }
        public DateTime? BusinessModelLastUpdatedOn { get; }
        public int? BusinessModelLastUpdatedBy { get; }
        public DateTime? CashForecastLastUpdatedOn { get; }
        public int? CashForecastLastUpdatedBy { get; }
        public DateTime? ComparablesLastUpdatedOn { get; }
        public int? ComparablesLastUpdatedBy { get; }
        public DateTime? MarketingPlanLastUpdatedOn { get; }
        public int? MarketingPlanLastUpdatedBy { get; }
    }
}
