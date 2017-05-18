using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NetFwTypeLib;

namespace ComputerResourceConsole.lib
{
    public enum crcNetProtocol 
    {
        Unknown = 0,
        TCP = 1,
        UDP = 2
    };

    public interface ISysControl
    {
        bool setInboundRulePort(string name, int port, crcNetProtocol protocol);

        bool IsInboundRulePortExist();

        bool AddInboundRulePort();

        void OpenHelpPage();

        void ApplicationExit();
    }
}
