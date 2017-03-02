using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using ComputerResourceConsole.lib;
using ComputerResourceConsole.factory;
using ComputerResourceConsole.common;
using System.Diagnostics;

namespace ComputerResourceConsole.control
{
    public class ContainerControl :ComponentControl, IContainerControl
    {
        private IContainerOpera _pContainOpera = null;

        public ContainerControl() : base()
        {
            this._pContainOpera = ComponentOperaFactory.createContainerOpera();
            this._pContainOpera.FilePath = this._pConfig.NodejsPath;
            this._pContainOpera.EntryPath = this._pConfig.ContainerPath;
        }

        public string status
        {
            get { return ""; }
        }

        public int start(CommonMethod.CommonEvent exit)
        {
            return this._pContainOpera.start(exit);
        }

        public int stop()
        {
            return this._pContainOpera.stop();
        }

        public int restart(CommonMethod.CommonEvent exit)
        {
            this._pContainOpera.stop();
            return this._pContainOpera.start(exit);
        }

        public override int init(CommonMethod.CommonEvent exit)
        {
            Process proc = this._pProcAccess.getProcess("container_node");
            if (proc != null)
            {
                return this._pContainOpera.bind(proc, exit);
            }
            return 0;
        }
    }
}
