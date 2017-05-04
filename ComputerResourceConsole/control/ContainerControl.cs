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
            this._pContainOpera.LogPath = this._pConfig.ContainerLogPath;
        }

        public int start(CommonMethod.CommonEvent exit)
        {
            this._status = "Started";
            return this._pContainOpera.start(exit);
        }

        public int stop()
        {
            this._status = "Stopped";
            return this._pContainOpera.stop();
        }

        public int restart(CommonMethod.CommonEvent exit)
        {
            this._pContainOpera.stop();
            int flag = this._pContainOpera.start(exit);
            this._status = "Started";
            return flag;
        }

        public override int init(CommonMethod.CommonEvent exit)
        {
            Process proc = this._pProcAccess.getProcess("container_node");
            if (proc != null)
            {
                this._status = "Started";
                return this._pContainOpera.bind(proc, exit);
            }
            return 0;
        }
    }
}
