﻿using GDB.Common.Authentication;
using GDB.Common.Context;
using GDB.Common.DTOs.Customer;
using GDB.Common.DTOs.Studio;
using GDB.Common.DTOs.User;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.BusinessLogic
{
    public interface IInteractiveUserQueryService
    {
        Task<List<CustomerDTO>> GetAllCustomersAsync();
        Task<StudioDTO> GetStudioAsync(int studioId, IAuthContext userAuth);
        Task<UserDTO> GetUserAsync(int userId, IAuthContext userAuth);
    }
}
