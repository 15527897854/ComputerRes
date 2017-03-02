using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;

using ComputerResourceConsole.lib;
using ComputerResourceConsole.common;

namespace ComputerResourceConsole.model
{
    public class ComponentOperaBase : IComponentOpera
    {
        protected string _strFilePath = "";

        protected Process _proc = null;


        public virtual string FilePath
        {
            get
            {
                return _strFilePath;
            }
            set
            {
                _strFilePath = value;
            }
        }

        public virtual string Arguments
        {
            get
            {
                return ""; 
            }
        }

        public virtual int start(CommonMethod.CommonEvent exit)
        {
            //一些判断
            //没有设置文件
            if (this._strFilePath == "")
            {
                return -1;
            }
            ProcessStartInfo process = new ProcessStartInfo();
            process.FileName = CommonMethod.getAppDirection() + this._strFilePath;
            process.Arguments = this.Arguments;
            this._proc = Process.Start(process);
            this._proc.EnableRaisingEvents = true;
            this._proc.Exited += new EventHandler(exit);

            return 1;
        }

        public virtual int stop()
        {
            _proc.Kill();
            return 1;
        }

        public virtual int bind(Process exist, CommonMethod.CommonEvent exit)
        {
            this._proc = exist;
            this._proc.EnableRaisingEvents = true;
            this._proc.Exited += new EventHandler(exit);
            return 1;
        }
    }
}
