using Dapper;
using GDB.Common.DTOs.Customer;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.App.Tests.IntegrationTests.DataSetup.Tables
{
    public class Customers
    {
        private DatabaseHelper _databaseHelper;

        public Customers(DatabaseHelper databaseHelper)
        {
            _databaseHelper = databaseHelper;
        }

        public CustomerDTO Add(string name)
        {
            using (var conn = _databaseHelper.GetConnection())
            {
                var sql = @"
                    INSERT INTO dbo.Customer(Name)
                    VALUES(@Name);
                    SELECT * FROM dbo.Customer WHERE Id = scope_identity();
                ";
                var param = new
                {
                    name
                };
                return conn.QuerySingle<CustomerDTO>(sql, param);
            }
        }
    }
}
