using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ComputerResourceConsole.lib
{
    public interface IMongoDBOpera : IComponentOpera
    {
        string DBPath { get; set; }
    }
}
