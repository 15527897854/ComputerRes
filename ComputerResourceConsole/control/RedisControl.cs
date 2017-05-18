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
    public class RedisControl :ComponentControl, IRedisControl
    {
        private IRedisOpera _pRedisOpera = null;

        public RedisControl() : base()
        {
            this._pRedisOpera = ComponentOperaFactory.createRedisOpera();

            this._pRedisOpera.FilePath = this._pConfig.RedisPath;
            this._pRedisOpera.LogPath = _pConfig.RedisLogPath;
        }

        public int start(CommonMethod.CommonEvent exit)
        {
            this._status = "Started";
            return this._pRedisOpera.start(exit);
        }

        public int stop()
        {
            this._status = "Stopped";
            return this._pRedisOpera.stop();
        }

        public int restart(CommonMethod.CommonEvent exit)
        {
            this._pRedisOpera.stop();
            return this._pRedisOpera.start(exit);
        }


        public override int init(CommonMethod.CommonEvent exit)
        {
            Process proc = this._pProcAccess.getProcess("redis-server");
            if (proc != null)
            {
                return this._pRedisOpera.bind(proc, exit);
            }
            return 0;
        }
    }
}
