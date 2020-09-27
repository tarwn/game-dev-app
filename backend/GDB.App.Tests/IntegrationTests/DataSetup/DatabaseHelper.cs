using Dapper;
using GDB.App.Tests.IntegrationTests.DataSetup.Tables;
using GDB.Persistence;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Text;

namespace GDB.App.Tests.IntegrationTests.DataSetup
{
    public class DatabaseHelper
    {
        private readonly string _connectionString;

        public DatabaseHelper(string connectionString)
        {
            _connectionString = connectionString;
            DapperPersistence.PatchDapper();

            Customers = new Customers(this);
        }

        public Customers Customers { get; }

        public string GetConnectionString()
        {
            return _connectionString;
        }

        public SqlConnection GetConnection()
        {
            return new SqlConnection(GetConnectionString());
        }

        internal DatabaseConnectionSettings GetConnectionSettings()
        {
            return new DatabaseConnectionSettings
            {
                Database = _connectionString
            };
        }

        public void ClearDatabase()
        {
            TestContext.Out.WriteLine("ClearDatabase: Resetting database contents");

            var cleanupScript = File.ReadAllText("./IntegrationTests/DataSetup/0001-ResetDatabase.sql");

            using (var conn = GetConnection())
            {
                conn.Execute(cleanupScript, commandType: System.Data.CommandType.Text);
            }

            TestContext.Out.WriteLine("ClearDatabase: Database reset successfully");
        }
    }
}
