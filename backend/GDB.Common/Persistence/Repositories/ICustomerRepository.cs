using GDB.Common.DTOs.Customer;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Persistence.Repositories
{
    public interface ICustomerRepository
    {
        Task<List<CustomerDTO>> GetAllAsync();
    }
}
