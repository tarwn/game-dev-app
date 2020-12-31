using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.Game
{
    public class GameDTO
    {
        public int Id { get; set; }
        public int StudioId { get; set; }
        public string Name { get; set; }
        public GameStatus Status { get; set; }
        public DateTime LaunchDate { get; set; }
        public string LogoUrl { get;set;}
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime UpdatedOn{ get; set; }
        public int UpdatedBy { get; set; }
    }
}
