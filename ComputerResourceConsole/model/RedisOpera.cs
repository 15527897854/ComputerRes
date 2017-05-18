using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;

using ComputerResourceConsole.lib;

namespace ComputerResourceConsole.model
{
    public class RedisOpera : ComponentOperaBase, IRedisOpera
    {
        public RedisOpera()
            : base()
        {
            this._showWindow = false;
        }
    }
}
