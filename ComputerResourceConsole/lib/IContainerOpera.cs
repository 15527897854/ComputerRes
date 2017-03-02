using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ComputerResourceConsole.lib
{
    public interface IContainerOpera : IComponentOpera
    {
        string EntryPath { get; set; }
    }
}
