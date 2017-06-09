using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NetFwTypeLib;
using ComputerResourceConsole.lib;
using System.Diagnostics;

namespace ComputerResourceConsole.control
{
    public class SystemControl : ISysControl
    {
        private string _strInbordRuleName;

        private int _iInbordRulePort;

        private crcNetProtocol _eInbordRuleProtocal;

        private INetFwMgr _netFwMgr = null;

        private INetFwOpenPort _objInbordRule = null;

        private void init()
        {
            this._strInbordRuleName = "";
            this._iInbordRulePort = -1;
            this._eInbordRuleProtocal = crcNetProtocol.Unknown;

            //创建firewall管理类的实例  
            this._netFwMgr = (INetFwMgr)Activator.CreateInstance(Type.GetTypeFromProgID("HNetCfg.FwMgr"));
        }

        //入站规则初始化
        private bool inBoundRuleInit()
        {
            if (this._strInbordRuleName.Trim() == "" || this._iInbordRulePort == -1 || this._eInbordRuleProtocal == crcNetProtocol.Unknown)
            {
                return false;
            }

            this._objInbordRule = (INetFwOpenPort)Activator.CreateInstance(Type.GetTypeFromProgID("HNetCfg.FwOpenPort"));

            this._objInbordRule.Name = this._strInbordRuleName;
            this._objInbordRule.Port = this._iInbordRulePort;
            if (this._eInbordRuleProtocal == crcNetProtocol.TCP)
            {
                this._objInbordRule.Protocol = NET_FW_IP_PROTOCOL_.NET_FW_IP_PROTOCOL_TCP;
            }
            else
            {
                this._objInbordRule.Protocol = NET_FW_IP_PROTOCOL_.NET_FW_IP_PROTOCOL_UDP;
            }
            this._objInbordRule.Scope = NET_FW_SCOPE_.NET_FW_SCOPE_ALL;
            this._objInbordRule.Enabled = true;
            return true;
        }

        public SystemControl()
        {
            //Initialize
            this.init();
        }

        public bool AddInboundRulePort()
        {
            if (this._objInbordRule == null)
            {
                bool inited = this.inBoundRuleInit();
                if (!inited)
                {
                    return false;
                }
            }
            if (this.IsInboundRulePortExist())
            {
                return false;
            }
            this._netFwMgr.LocalPolicy.CurrentProfile.GloballyOpenPorts.Add(this._objInbordRule);
            return true;
        }

        public bool IsInboundRulePortExist()
        {
            bool exist = false;
            foreach (INetFwOpenPort mPort in this._netFwMgr.LocalPolicy.CurrentProfile.GloballyOpenPorts)
            {
                if (this._objInbordRule.Name == mPort.Name &&
                    this._objInbordRule.Port == mPort.Port &&
                    this._objInbordRule.Protocol == mPort.Protocol && 
                    this._objInbordRule.Enabled == mPort.Enabled)
                {
                    exist = true;
                    break;
                }
            }
            return exist;
        }

        public bool setInboundRulePort(string name, int port, crcNetProtocol protocol)
        {
            this._strInbordRuleName = name;
            this._iInbordRulePort = port;
            this._eInbordRuleProtocal = protocol;
            return this.inBoundRuleInit();
        }

        public void ApplicationExit()
        {
            System.Environment.Exit(0);
            //Application.Exit();
        }


        public void OpenHelpPage()
        {
            try
            {
                Process.Start(System.AppDomain.CurrentDomain.BaseDirectory + "/help/help.html");
            }
            catch(Exception ex)
            {
                
            }
        }
    }
}
