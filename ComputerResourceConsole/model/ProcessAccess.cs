using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using ComputerResourceConsole.lib;
using System.Diagnostics;

namespace ComputerResourceConsole.model
{
    public class ProcessAccess : IProcessAccess
    {
        public Process getProcess(int pid)
        {
            Process[] procs = Process.GetProcesses();
            for (int i = 0; i < procs.Length; i++)
            {
                if (procs[i].Id == pid)
                {
                    return procs[i];
                }
            }
            return null;
        }

        public Process getProcess(string name)
        {
            Process[] procs = Process.GetProcesses();
            for (int i = 0; i < procs.Length; i++)
            {
                Debug.WriteLine(procs[i].ProcessName);
                if (procs[i].ProcessName == name)
                {
                    return procs[i];
                }
            }
            return null;
        }
    }
}
