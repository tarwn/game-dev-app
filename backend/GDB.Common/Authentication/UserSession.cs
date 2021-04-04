using GDB.Common.DTOs.Studio;

namespace GDB.Common.Authentication
{
    public class UserSession
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int StudioId { get; set; }
        public StudioUserRole StudioUserRole { get; set; }

    }
}