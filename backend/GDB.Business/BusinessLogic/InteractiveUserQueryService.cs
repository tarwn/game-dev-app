using GDB.Common.BusinessLogic;
using GDB.Common.DTOs.Customer;
using GDB.Common.Persistence;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices.ComTypes;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic
{
    public class InteractiveUserQueryService : BusinessServiceBase, IInteractiveUserQueryService
    {
        private IPersistence _persistence;

        public InteractiveUserQueryService(IPersistence persistence)
        {
            _persistence = persistence;
        }

        public async Task<List<CustomerDTO>> GetAllCustomersAsync()
        {
            return await BusinessQuery(async () => {
                return await _persistence.Customers.GetAllAsync();
            });
        }
    }
}
