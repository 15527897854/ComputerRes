using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Diagnostics;
using System.Windows.Forms;

using ComputerResourceConsole.lib;
using ComputerResourceConsole.common;

namespace ComputerResourceConsole.model
{
    public class MongoDBOpera : ComponentOperaBase, IMongoDBOpera
    {

        protected string _strDBPath = "";

        public string DBPath
        {
            get
            {
                return this._strDBPath;
            }
            set
            {
                this._strDBPath = value;
            }
        }

        public override string Arguments
        {
            get
            {
                return " --dbpath " + CommonMethod.getAppDirection() + "MongoDB/data --logpath " + CommonMethod.getAppDirection() + "Log/mongo.log";
            }
        }

        public MongoDBOpera()
            : base()
        {
            this._showWindow = false;
        }
    }
}
