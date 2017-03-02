using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using ComputerResourceConsole.lib;
using ComputerResourceConsole.common;

namespace ComputerResourceConsole.model
{
    public class ContainerOpera : ComponentOperaBase, IContainerOpera
    {
        private string _strRntryPath = "";

        public ContainerOpera() : base()
        {

        }

        public override string Arguments
        {
            get
            {
                return CommonMethod.getAppDirection() + this._strRntryPath;
            }
        }

        public string EntryPath
        {
            get
            {
                return this._strRntryPath;
            }
            set
            {
                this._strRntryPath = value;
            }
        }
    }
}
