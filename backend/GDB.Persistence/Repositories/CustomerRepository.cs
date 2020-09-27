using Dapper;
using GDB.Common.DTOs.Customer;
using GDB.Common.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Persistence.Repositories
{
    public class CustomerRepository : BaseRepository, ICustomerRepository
    {
        public CustomerRepository(string connectionString) : base(connectionString)
        { }

        public async Task<List<CustomerDTO>> GetAllAsync()
        {
            var sql = @"
                SELECT Id, [Name]
                FROM dbo.Customer;
            ";
            using (var conn = GetConnection())
            {
                return (await conn.QueryAsync<CustomerDTO>(sql)).ToList();
            }
        }
    }
}
