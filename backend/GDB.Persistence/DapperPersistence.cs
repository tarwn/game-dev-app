using Dapper;
using GDB.Common.Persistence;
using GDB.Common.Persistence.Repositories;
using GDB.Persistence.Conversions;
using GDB.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Text;

namespace GDB.Persistence
{
    public class DapperPersistence : IPersistence
    {
        private DatabaseConnectionSettings _settings;

        public DapperPersistence(DatabaseConnectionSettings settings)
        {
            _settings = settings;

            PatchDapper();

            Customers = new CustomerRepository(_settings.Database);
        }

        public ICustomerRepository Customers { get; }

        public static void PatchDapper()
        {
            SqlMapper.AddTypeHandler(new DateTimeHandler());
        }

    }
}
