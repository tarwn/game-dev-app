using GDB.Common.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.Persistence
{
    public interface IPersistence
    {
        ICustomerRepository Customers { get; }
    }
}
