using GDB.Common.DTOs.Game;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend.Models.Games
{
    public class UpdateGameRequestModel
    {
        public bool? IsFavorite { get; set; }
        public string? Name { get; set; }
        public DateTime? LaunchDate { get; set; }
        public GameStatus? Status { get; set; }
    }
}
