using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Business.BusinessLogic.EventStore
{
    public class LockObject : IDisposable
    {
        private Func<object> p;

        public LockObject(Func<object> p)
        {
            this.p = p;
        }

        public void Dispose()
        {
            p?.Invoke();
        }
    }

}
