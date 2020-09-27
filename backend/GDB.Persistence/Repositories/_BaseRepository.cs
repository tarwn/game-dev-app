using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Text;

namespace GDB.Persistence.Repositories
{
    public abstract class BaseRepository
    {
        string _connectionString;

        public BaseRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public SqlConnection GetConnection()
        {
            return new SqlConnection(_connectionString);
        }
    }
}
