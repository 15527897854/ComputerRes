using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NetFwTypeLib;
using ComputerResourceConsole.lib;

namespace ComputerResourceConsole.control
{
    public class SystemControl : ISysControl
    {
        public SystemControl()
        {

        }

        public INetFwOpenPort getInboundRule(string name)
        {
            throw new NotImplementedException();
        }

        public bool AddNetFwPort(string name, int port, crcNetProtocol protocol)
        {
            //创建firewall管理类的实例  
            INetFwMgr netFwMgr = (INetFwMgr)Activator.CreateInstance(Type.GetTypeFromProgID("HNetCfg.FwMgr"));

            INetFwOpenPort objPort = (INetFwOpenPort)Activator.CreateInstance(
                Type.GetTypeFromProgID("HNetCfg.FwOpenPort"));

            objPort.Name = name;
            objPort.Port = port;
            if (protocol == crcNetProtocol.TCP)
            {
                objPort.Protocol = NET_FW_IP_PROTOCOL_.NET_FW_IP_PROTOCOL_TCP;
            }
            else
            {
                objPort.Protocol = NET_FW_IP_PROTOCOL_.NET_FW_IP_PROTOCOL_UDP;
            }
            objPort.Scope = NET_FW_SCOPE_.NET_FW_SCOPE_ALL;
            objPort.Enabled = true;

            bool exist = false;
            //加入到防火墙的管理策略  
            foreach (INetFwOpenPort mPort in netFwMgr.LocalPolicy.CurrentProfile.GloballyOpenPorts)
            {
                if (objPort == mPort)
                {
                    exist = true;
                    break;
                }
            }
            if (!exist) netFwMgr.LocalPolicy.CurrentProfile.GloballyOpenPorts.Add(objPort);
            return true;
        }
    }
}
