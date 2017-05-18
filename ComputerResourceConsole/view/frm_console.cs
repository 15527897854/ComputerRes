using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

using ComputerResourceConsole.factory;
using ComputerResourceConsole.lib;
using ComputerResourceConsole.common;
using ComputerResourceConsole.view;

namespace ComputerResourceConsole
{
    public partial class frm_console : Form
    {
        private IMongoDBControl _pMgCtrl = null;
        private IRedisControl _pRdsCtrl = null;
        private ComputerResourceConsole.lib.IContainerControl _pCtnCtrl = null;
        private ISysControl _pSysCtrl = null;
        private frm_about _frm_about = null;

        public frm_console()
        {
            InitializeComponent();
            this._pMgCtrl = ComponentControlFactory.createMongoDBControl();
            this._pRdsCtrl = ComponentControlFactory.createRedisControl();
            this._pCtnCtrl = ComponentControlFactory.createContainerControl();
            this._pSysCtrl = ComponentControlFactory.createSysControl();

            int mgmark = _pMgCtrl.init(onMongoExit);
            if (mgmark == 1)
            {
                this.setMongoView(false, true, true, "已启动", Color.Green);
            }
            else if (mgmark == -1)
            {
                this.setMongoView(false, false, false, "已启动（无法修改）", Color.Orange);
            }
            else
            {
                this.setMongoView(true, false, false, "未启动", Color.Red);
            }

            int rdsmark = _pRdsCtrl.init(onRedisExit);
            if (rdsmark == 1)
            {
                this.setRedisView(false, true, true, "已启动", Color.Green);
            }
            else if (rdsmark == -1)
            {
                this.setRedisView(false, false, false, "已启动（无法修改）", Color.Orange);
            }
            else
            {
                this.setRedisView(true, false, false, "未启动", Color.Red);
            }

            int ctnmark = _pCtnCtrl.init(onContainerExit);
            if (ctnmark == 1)
            {
                this.setContainerView(false, true, true, "已启动", Color.Green);
            }
            else if (ctnmark == -1)
            {
                this.setContainerView(false, false, false, "已启动（无法修改）", Color.Orange);
            }
            else
            {
                this.setContainerView(true, false, false, "未启动", Color.Red);
            }

            this._pSysCtrl.setInboundRulePort("ComputerRes", 8060, crcNetProtocol.TCP);
            if (this._pSysCtrl.IsInboundRulePortExist())
            {
                this.openFirewallPortToolStripMenuItem.Checked = true;
            }

            this._frm_about = new frm_about();
        }

        //设置MongoDB的界面
        private void setMongoView(bool startenable, bool stopenable, bool restartenabel, string status, Color txtColor)
        {
            this.bt_mg_start.Enabled = startenable;
            this.bt_mg_stop.Enabled = stopenable;
            this.l_mg_status.Text = status;
            this.l_mg_status.ForeColor = txtColor;
        }

        //设置Redis的界面
        private void setRedisView(bool startenable, bool stopenable, bool restartenabel, string status, Color txtColor)
        {
            this.bt_rds_start.Enabled = startenable;
            this.bt_rds_stop.Enabled = stopenable;
            this.l_rds_status.Text = status;
            this.l_rds_status.ForeColor = txtColor;
        }

        //设置Container的界面
        private void setContainerView(bool startenable, bool stopenable, bool restartenabel, string status, Color txtColor)
        {
            this.bt_ctn_start.Enabled = startenable;
            this.bt_ctn_stop.Enabled = stopenable;
            this.l_ctn_status.Text = status;
            this.l_ctn_status.ForeColor = txtColor;
        }

        //MongoDB退出事件
        private void onMongoExit(object sender, EventArgs e)
        {
            if (this.bt_mg_start.InvokeRequired)
            {
                this._pMgCtrl.Status = "Stopped";
                CommonMethod.CommonEvent stcb = new CommonMethod.CommonEvent(onMongoExit);
                this.Invoke(stcb, new object[] { sender, e });
            }
            else
            {
                if (_pMgCtrl.Status == "Stopped")
                {
                    this.setMongoView(true, false, false, "未启动", Color.Red);
                }
                else
                {
                    this.setMongoView(false, true, true, "已启动", Color.Green);
                }
            }
        }

        //Redis退出事件
        private void onRedisExit(object sender, EventArgs e)
        {
            if (this.bt_rds_start.InvokeRequired)
            {
                this._pRdsCtrl.Status = "Stopped";
                CommonMethod.CommonEvent stcb = new CommonMethod.CommonEvent(onRedisExit);
                this.Invoke(stcb, new object[] { sender, e });
            }
            else
            {
                if (_pRdsCtrl.Status == "Stopped")
                {
                    this.setRedisView(true, false, false, "未启动", Color.Red);
                }
                else
                {
                    this.setRedisView(false, true, true, "已启动", Color.Green);
                }
            }
        }

        //Container退出事件
        private void onContainerExit(object sender, EventArgs e)
        {
            if (this.bt_ctn_start.InvokeRequired)
            {
                this._pCtnCtrl.Status = "Stopped";
                CommonMethod.CommonEvent stcb = new CommonMethod.CommonEvent(onContainerExit);
                this.Invoke(stcb, new object[] { sender, e });
            }
            else
            {
                if (this._pCtnCtrl.Status == "Stopped")
                {
                    this.setContainerView(true, false, false, "未启动", Color.Red);
                }
                else
                {
                    this.setContainerView(false, true, true, "已启动", Color.Green);
                }
            }
        }

        private void bt_mg_start_Click(object sender, EventArgs e)
        {
            this._pMgCtrl.start(onMongoExit);
            this.setMongoView(false, true, true, "已启动", Color.Green);
        }

        private void bt_mg_stop_Click(object sender, EventArgs e)
        {
            this._pMgCtrl.stop();
        }

        private void bt_rds_start_Click(object sender, EventArgs e)
        {
            this._pRdsCtrl.start(onRedisExit);
            this.setRedisView(false, true, true, "已启动", Color.Green);
        }

        private void bt_rds_stop_Click(object sender, EventArgs e)
        {
            this._pRdsCtrl.stop();
        }

        private void bt_ctn_start_Click(object sender, EventArgs e)
        {
            this._pCtnCtrl.start(onContainerExit);
            this.setContainerView(false, true, true, "已启动", Color.Green);
        }

        private void bt_ctn_stop_Click(object sender, EventArgs e)
        {
            this._pCtnCtrl.stop();
        }

        private void openFirewallPortToolStripMenuItem_Click(object sender, EventArgs e)
        {
            this._pSysCtrl.AddInboundRulePort();
        }

        private void helpToolStripMenuItem_Click(object sender, EventArgs e)
        {
            this._pSysCtrl.OpenHelpPage();
        }

        private void aboutToolStripMenuItem_Click(object sender, EventArgs e)
        {
            this._frm_about.ShowDialog();
        }

        private void exitToolStripMenuItem_Click(object sender, EventArgs e)
        {
            this.notifyIcon1.Visible = false;
            this._pSysCtrl.ApplicationExit();
        }

        private void openDiaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            this.Show();
            this.WindowState = FormWindowState.Normal;
        }

        private void frm_console_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (e.CloseReason == CloseReason.UserClosing)
            {
                e.Cancel = true; 
                this.WindowState = FormWindowState.Minimized; 
                this.Hide();
                return;
            }
        }
    }
}
