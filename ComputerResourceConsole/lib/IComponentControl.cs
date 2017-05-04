using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using ComputerResourceConsole.common;

namespace ComputerResourceConsole.lib
{
    public interface IComponentControl
    {
        string Status { get; set; }

        int start(CommonMethod.CommonEvent exit);

        int stop();

        int restart(CommonMethod.CommonEvent exit);

        int init(CommonMethod.CommonEvent exit);
    }
}
