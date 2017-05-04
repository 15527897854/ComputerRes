using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using System.IO;

using ComputerResourceConsole.lib;
using ComputerResourceConsole.common;

namespace ComputerResourceConsole.model
{
    public class ComponentOperaBase : IComponentOpera
    {
        protected string _strFilePath = "";

        protected Process _proc = null;

        protected string _logPath = "";

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
            //process.CreateNoWindow = true;
            process.UseShellExecute = false;
            //process.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;
            this._proc = Process.Start(process);
            if (this._proc == null)
            {
                return -1;
            }
            this._proc.EnableRaisingEvents = true;
            this._proc.Exited += new EventHandler(exit);
            this._proc.OutputDataReceived += new DataReceivedEventHandler(this.onReceiveOutData);
            this._proc.ErrorDataReceived += new DataReceivedEventHandler(this.onReceiveErrData);

            return 1;
        }

        public virtual int stop()
        {
            if (!this._proc.HasExited)
            {
                this._proc.Kill();
            }
            return 1;
        }

        public virtual int bind(Process exist, CommonMethod.CommonEvent exit)
        {
            this._proc = exist;

            try
            {
                this._proc.EnableRaisingEvents = true;
                this._proc.Exited += new EventHandler(exit);
                return 1;
            }
            catch (Exception ex)
            {
                return -1;
            }
        }


        public string LogPath
        {
            get
            {
                return _logPath;
            }
            set
            {
                _logPath = value;
            }
        }

        private void onReceiveOutData(object sender, DataReceivedEventArgs e)
        {
            FileStream fs = new FileStream(CommonMethod.getAppDirection() + this._logPath, FileMode.OpenOrCreate);
            StreamWriter sr = new StreamWriter(fs);

            sr.Write("StandOutput : ");
            sr.Write(e.Data);
            sr.Write("\r\n\r\n");

            sr.Close();
            sr.Dispose();
            fs.Close();
            fs.Dispose();
        }

        private void onReceiveErrData(object sender, DataReceivedEventArgs e)
        {
            FileStream fs = new FileStream(CommonMethod.getAppDirection() + this._logPath, FileMode.OpenOrCreate);
            StreamWriter sr = new StreamWriter(fs);

            sr.Write("ErrorOutput : ");
            sr.Write(e.Data);
            sr.Write("\r\n\r\n");

            sr.Close();
            sr.Dispose();
            fs.Close();
            fs.Dispose();
        }
    }
}
