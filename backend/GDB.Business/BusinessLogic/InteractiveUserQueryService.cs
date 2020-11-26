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
    public class InteractiveUserQueryService : IInteractiveUserQueryService
    {
        private IBusinessServiceOperator _busOp;

        public InteractiveUserQueryService(IBusinessServiceOperator busOp)
        {
            _busOp = busOp;
        }

        public async Task<List<CustomerDTO>> GetAllCustomersAsync()
        {
            return await _busOp.Query(async (persistence) => {
                return await persistence.Customers.GetAllAsync();
            });
        }
    }
}
