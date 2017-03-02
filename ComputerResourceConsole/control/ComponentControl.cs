using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using ComputerResourceConsole.lib;
using ComputerResourceConsole.factory;
using ComputerResourceConsole.common;

namespace ComputerResourceConsole.control
{
    public class ComponentControl
    {
        protected IConfig _pConfig = null;

        protected IProcessAccess _pProcAccess = null;

        public ComponentControl()
        {
            this._pConfig = ComponentOperaFactory.createConfig();
            _pConfig.loadConfig();
            this._pProcAccess = ComponentOperaFactory.createProcessAccess();
        }

        public virtual int init(CommonMethod.CommonEvent exit)
        {
            return 1;
        }
    }
}
