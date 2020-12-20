using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.General.Models
{
    public class ResetPasswordInputModel
    {
        [Required]
        public int UserId { get; set; }
        [Required]
        public string ResetToken { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
