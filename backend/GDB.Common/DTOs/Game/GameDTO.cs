using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.Game
{
    public class GameDTO
    {
        public GameDTO() { }

        public GameDTO(int id, int studioId, string name, GameStatus status, DateTime launchDate, string logoUrl, 
                       DateTime createdOn, int createdBy, DateTime updatedOn, int updatedBy)
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
        }

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
