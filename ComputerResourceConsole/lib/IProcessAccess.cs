using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;

namespace ComputerResourceConsole.lib
{
    public interface IProcessAccess
    {
        Process getProcess(int pid);

        Process getProcess(string name);
    }
}
