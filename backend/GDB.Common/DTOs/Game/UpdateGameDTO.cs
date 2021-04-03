using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.Game
{
    public class UpdateGameDTO
    {
        public bool? IsFavorite { get; set; }
        public string? Name { get; set; }
        public DateTime? LaunchDate { get; set; }
        public GameStatus? Status { get; set; }
    }
}
