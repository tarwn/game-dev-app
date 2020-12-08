using GDB.Business.BusinessLogic;
using GDB.Common.DTOs.BusinessModel;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.Tests.BusinessLogic
{
    [TestFixture]
    public class BusinessModelStoreTests
    {
        private string _gameId;
        private TemporaryBusinessModelStore _store;
        private LockObject _lock;
        private BusinessModelDTO _model;

        [SetUp]
        public async Task SetUp()
        {
            _gameId = "unitTest";
            _store = new TemporaryBusinessModelStore();
            _lock = await _store.GetLockAsync();
            _model = _store.Create(_lock, _gameId);
        }

        [TearDown]
        public async Task TearDown()
        {
            _lock.Dispose();
        }
    }
}
