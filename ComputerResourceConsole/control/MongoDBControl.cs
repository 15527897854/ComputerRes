using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;

using ComputerResourceConsole.lib;
using ComputerResourceConsole.factory;
using ComputerResourceConsole.common;

namespace ComputerResourceConsole.control
{
    public class MongoDBControl : ComponentControl, IMongoDBControl
    {
        private IMongoDBOpera _pMongoOpera = null;

        public MongoDBControl() : base()
        {
            this._pMongoOpera = ComponentOperaFactory.createMongoDBOpera();
            this._pProcAccess = ComponentOperaFactory.createProcessAccess();

            this._pMongoOpera.FilePath = _pConfig.MongoDBPath;
            this._pMongoOpera.DBPath = _pConfig.MongoDBData;
            this._pMongoOpera.LogPath = _pConfig.MongoDBLogPath;
        }

        public int start(CommonMethod.CommonEvent exit)
        {
            this._status = "Started";
            return this._pMongoOpera.start(exit);
        }

        public int stop()
        {
            this._status = "Stopped";
            return this._pMongoOpera.stop();
        }


        public int restart(CommonMethod.CommonEvent exit)
        {
            this._pMongoOpera.stop();
            return _pMongoOpera.start(exit);
        }

        public override int init(CommonMethod.CommonEvent exit)
        {
            Process proc = this._pProcAccess.getProcess("mongod");
            if (proc != null)
            {
                return this._pMongoOpera.bind(proc, exit);
            }
            return 0;
        }
    }
}
