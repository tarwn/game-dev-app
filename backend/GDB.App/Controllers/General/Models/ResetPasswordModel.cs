using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.General.Models
{
    public class ResetPasswordModel
    {

        public ResetPasswordModel(int userId, string resetToken)
        {
            UserId = userId;
            ResetToken = resetToken;
        }

        public int UserId { get; set; }
        public string ResetToken { get; set; }

        public static object From(ResetPasswordInputModel model)
        {
            return new ResetPasswordModel(model.UserId, model.ResetToken);
        }
    }
}
