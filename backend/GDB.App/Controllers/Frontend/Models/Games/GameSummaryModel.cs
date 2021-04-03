using GDB.Common.DTOs.Game;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend.Models.Games
{
    public class GameSummaryModel
    {
        [Obsolete("Serialization Only", false)]
        public GameSummaryModel() { }

        public GameSummaryModel(GameDTO game)
        {
            GlobalId = game.GetGlobalId();
            Name = game.Name;
            Status = game.Status;
            LastModified = game.UpdatedOn;
            IsFavorite = game.IsFavorite;
        }

        public string GlobalId { get; set; }
        public string Name { get; set; }
        public GameStatus Status { get; set; }
        public DateTime LastModified { get; set; }
        public bool IsFavorite { get; set; }
    }
}
