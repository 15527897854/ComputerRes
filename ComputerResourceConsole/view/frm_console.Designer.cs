namespace ComputerResourceConsole
{
    partial class frm_console
    {
        /// <summary>
        /// 必需的设计器变量。
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// 清理所有正在使用的资源。
        /// </summary>
        /// <param name="disposing">如果应释放托管资源，为 true；否则为 false。</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows 窗体设计器生成的代码

        /// <summary>
        /// 设计器支持所需的方法 - 不要
        /// 使用代码编辑器修改此方法的内容。
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(frm_console));
            this.gb_mongodb = new System.Windows.Forms.GroupBox();
            this.l_mg_status = new System.Windows.Forms.Label();
            this.l_mg_status_tag = new System.Windows.Forms.Label();
            this.bt_mg_stop = new System.Windows.Forms.Button();
            this.bt_mg_start = new System.Windows.Forms.Button();
            this.gb_redis = new System.Windows.Forms.GroupBox();
            this.l_rds_status = new System.Windows.Forms.Label();
            this.l_rds_status_tag = new System.Windows.Forms.Label();
            this.bt_rds_stop = new System.Windows.Forms.Button();
            this.bt_rds_start = new System.Windows.Forms.Button();
            this.gb_container = new System.Windows.Forms.GroupBox();
            this.l_ctn_status = new System.Windows.Forms.Label();
            this.l_ctn_status_tag = new System.Windows.Forms.Label();
            this.bt_ctn_stop = new System.Windows.Forms.Button();
            this.bt_ctn_start = new System.Windows.Forms.Button();
            this.menuStrip1 = new System.Windows.Forms.MenuStrip();
            this.operationToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.openFirewallPortToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.exitToolStripMenuItem1 = new System.Windows.Forms.ToolStripMenuItem();
            this.infoToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.helpToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.aboutToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.notifyIcon1 = new System.Windows.Forms.NotifyIcon(this.components);
            this.contextMenuStrip1 = new System.Windows.Forms.ContextMenuStrip(this.components);
            this.openDiaToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.exitToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.gb_mongodb.SuspendLayout();
            this.gb_redis.SuspendLayout();
            this.gb_container.SuspendLayout();
            this.menuStrip1.SuspendLayout();
            this.contextMenuStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // gb_mongodb
            // 
            this.gb_mongodb.Controls.Add(this.l_mg_status);
            this.gb_mongodb.Controls.Add(this.l_mg_status_tag);
            this.gb_mongodb.Controls.Add(this.bt_mg_stop);
            this.gb_mongodb.Controls.Add(this.bt_mg_start);
            this.gb_mongodb.Location = new System.Drawing.Point(4, 38);
            this.gb_mongodb.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.gb_mongodb.Name = "gb_mongodb";
            this.gb_mongodb.Padding = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.gb_mongodb.Size = new System.Drawing.Size(307, 112);
            this.gb_mongodb.TabIndex = 0;
            this.gb_mongodb.TabStop = false;
            this.gb_mongodb.Text = "模型信息库(mongodb)";
            // 
            // l_mg_status
            // 
            this.l_mg_status.AutoSize = true;
            this.l_mg_status.Location = new System.Drawing.Point(135, 35);
            this.l_mg_status.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.l_mg_status.Name = "l_mg_status";
            this.l_mg_status.Size = new System.Drawing.Size(0, 15);
            this.l_mg_status.TabIndex = 1;
            // 
            // l_mg_status_tag
            // 
            this.l_mg_status_tag.AutoSize = true;
            this.l_mg_status_tag.Location = new System.Drawing.Point(24, 35);
            this.l_mg_status_tag.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.l_mg_status_tag.Name = "l_mg_status_tag";
            this.l_mg_status_tag.Size = new System.Drawing.Size(97, 15);
            this.l_mg_status_tag.TabIndex = 1;
            this.l_mg_status_tag.Text = "数据库状态：";
            // 
            // bt_mg_stop
            // 
            this.bt_mg_stop.Location = new System.Drawing.Point(165, 69);
            this.bt_mg_stop.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.bt_mg_stop.Name = "bt_mg_stop";
            this.bt_mg_stop.Size = new System.Drawing.Size(116, 29);
            this.bt_mg_stop.TabIndex = 0;
            this.bt_mg_stop.Text = "停止";
            this.bt_mg_stop.UseVisualStyleBackColor = true;
            this.bt_mg_stop.Click += new System.EventHandler(this.bt_mg_stop_Click);
            // 
            // bt_mg_start
            // 
            this.bt_mg_start.Location = new System.Drawing.Point(16, 69);
            this.bt_mg_start.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.bt_mg_start.Name = "bt_mg_start";
            this.bt_mg_start.Size = new System.Drawing.Size(116, 29);
            this.bt_mg_start.TabIndex = 0;
            this.bt_mg_start.Text = "启动";
            this.bt_mg_start.UseVisualStyleBackColor = true;
            this.bt_mg_start.Click += new System.EventHandler(this.bt_mg_start_Click);
            // 
            // gb_redis
            // 
            this.gb_redis.Controls.Add(this.l_rds_status);
            this.gb_redis.Controls.Add(this.l_rds_status_tag);
            this.gb_redis.Controls.Add(this.bt_rds_stop);
            this.gb_redis.Controls.Add(this.bt_rds_start);
            this.gb_redis.Location = new System.Drawing.Point(4, 158);
            this.gb_redis.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.gb_redis.Name = "gb_redis";
            this.gb_redis.Padding = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.gb_redis.Size = new System.Drawing.Size(307, 112);
            this.gb_redis.TabIndex = 0;
            this.gb_redis.TabStop = false;
            this.gb_redis.Text = "模型数据库(redis)";
            // 
            // l_rds_status
            // 
            this.l_rds_status.AutoSize = true;
            this.l_rds_status.Location = new System.Drawing.Point(135, 35);
            this.l_rds_status.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.l_rds_status.Name = "l_rds_status";
            this.l_rds_status.Size = new System.Drawing.Size(0, 15);
            this.l_rds_status.TabIndex = 1;
            // 
            // l_rds_status_tag
            // 
            this.l_rds_status_tag.AutoSize = true;
            this.l_rds_status_tag.Location = new System.Drawing.Point(24, 35);
            this.l_rds_status_tag.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.l_rds_status_tag.Name = "l_rds_status_tag";
            this.l_rds_status_tag.Size = new System.Drawing.Size(97, 15);
            this.l_rds_status_tag.TabIndex = 1;
            this.l_rds_status_tag.Text = "数据库状态：";
            // 
            // bt_rds_stop
            // 
            this.bt_rds_stop.Location = new System.Drawing.Point(165, 69);
            this.bt_rds_stop.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.bt_rds_stop.Name = "bt_rds_stop";
            this.bt_rds_stop.Size = new System.Drawing.Size(116, 29);
            this.bt_rds_stop.TabIndex = 0;
            this.bt_rds_stop.Text = "停止";
            this.bt_rds_stop.UseVisualStyleBackColor = true;
            this.bt_rds_stop.Click += new System.EventHandler(this.bt_rds_stop_Click);
            // 
            // bt_rds_start
            // 
            this.bt_rds_start.Location = new System.Drawing.Point(16, 69);
            this.bt_rds_start.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.bt_rds_start.Name = "bt_rds_start";
            this.bt_rds_start.Size = new System.Drawing.Size(116, 29);
            this.bt_rds_start.TabIndex = 0;
            this.bt_rds_start.Text = "启动";
            this.bt_rds_start.UseVisualStyleBackColor = true;
            this.bt_rds_start.Click += new System.EventHandler(this.bt_rds_start_Click);
            // 
            // gb_container
            // 
            this.gb_container.Controls.Add(this.l_ctn_status);
            this.gb_container.Controls.Add(this.l_ctn_status_tag);
            this.gb_container.Controls.Add(this.bt_ctn_stop);
            this.gb_container.Controls.Add(this.bt_ctn_start);
            this.gb_container.Location = new System.Drawing.Point(4, 278);
            this.gb_container.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.gb_container.Name = "gb_container";
            this.gb_container.Padding = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.gb_container.Size = new System.Drawing.Size(307, 112);
            this.gb_container.TabIndex = 0;
            this.gb_container.TabStop = false;
            this.gb_container.Text = "模型服务容器";
            // 
            // l_ctn_status
            // 
            this.l_ctn_status.AutoSize = true;
            this.l_ctn_status.Location = new System.Drawing.Point(169, 35);
            this.l_ctn_status.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.l_ctn_status.Name = "l_ctn_status";
            this.l_ctn_status.Size = new System.Drawing.Size(0, 15);
            this.l_ctn_status.TabIndex = 1;
            // 
            // l_ctn_status_tag
            // 
            this.l_ctn_status_tag.AutoSize = true;
            this.l_ctn_status_tag.Location = new System.Drawing.Point(24, 35);
            this.l_ctn_status_tag.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.l_ctn_status_tag.Name = "l_ctn_status_tag";
            this.l_ctn_status_tag.Size = new System.Drawing.Size(142, 15);
            this.l_ctn_status_tag.TabIndex = 1;
            this.l_ctn_status_tag.Text = "模型服务容器状态：";
            // 
            // bt_ctn_stop
            // 
            this.bt_ctn_stop.Location = new System.Drawing.Point(165, 69);
            this.bt_ctn_stop.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.bt_ctn_stop.Name = "bt_ctn_stop";
            this.bt_ctn_stop.Size = new System.Drawing.Size(116, 29);
            this.bt_ctn_stop.TabIndex = 0;
            this.bt_ctn_stop.Text = "停止";
            this.bt_ctn_stop.UseVisualStyleBackColor = true;
            this.bt_ctn_stop.Click += new System.EventHandler(this.bt_ctn_stop_Click);
            // 
            // bt_ctn_start
            // 
            this.bt_ctn_start.Location = new System.Drawing.Point(16, 69);
            this.bt_ctn_start.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.bt_ctn_start.Name = "bt_ctn_start";
            this.bt_ctn_start.Size = new System.Drawing.Size(116, 29);
            this.bt_ctn_start.TabIndex = 0;
            this.bt_ctn_start.Text = "启动";
            this.bt_ctn_start.UseVisualStyleBackColor = true;
            this.bt_ctn_start.Click += new System.EventHandler(this.bt_ctn_start_Click);
            // 
            // menuStrip1
            // 
            this.menuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.operationToolStripMenuItem,
            this.infoToolStripMenuItem});
            this.menuStrip1.Location = new System.Drawing.Point(0, 0);
            this.menuStrip1.Name = "menuStrip1";
            this.menuStrip1.Padding = new System.Windows.Forms.Padding(8, 2, 0, 2);
            this.menuStrip1.Size = new System.Drawing.Size(327, 28);
            this.menuStrip1.TabIndex = 1;
            this.menuStrip1.Text = "menuStrip1";
            // 
            // operationToolStripMenuItem
            // 
            this.operationToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.openFirewallPortToolStripMenuItem,
            this.exitToolStripMenuItem1});
            this.operationToolStripMenuItem.Name = "operationToolStripMenuItem";
            this.operationToolStripMenuItem.Size = new System.Drawing.Size(51, 24);
            this.operationToolStripMenuItem.Text = "操作";
            // 
            // openFirewallPortToolStripMenuItem
            // 
            this.openFirewallPortToolStripMenuItem.Name = "openFirewallPortToolStripMenuItem";
            this.openFirewallPortToolStripMenuItem.Size = new System.Drawing.Size(183, 24);
            this.openFirewallPortToolStripMenuItem.Text = "打开防火墙端口";
            this.openFirewallPortToolStripMenuItem.Click += new System.EventHandler(this.openFirewallPortToolStripMenuItem_Click);
            // 
            // exitToolStripMenuItem1
            // 
            this.exitToolStripMenuItem1.Name = "exitToolStripMenuItem1";
            this.exitToolStripMenuItem1.Size = new System.Drawing.Size(183, 24);
            this.exitToolStripMenuItem1.Text = "退出";
            this.exitToolStripMenuItem1.Click += new System.EventHandler(this.exitToolStripMenuItem_Click);
            // 
            // infoToolStripMenuItem
            // 
            this.infoToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.helpToolStripMenuItem,
            this.aboutToolStripMenuItem});
            this.infoToolStripMenuItem.Name = "infoToolStripMenuItem";
            this.infoToolStripMenuItem.Size = new System.Drawing.Size(51, 24);
            this.infoToolStripMenuItem.Text = "信息";
            // 
            // helpToolStripMenuItem
            // 
            this.helpToolStripMenuItem.Name = "helpToolStripMenuItem";
            this.helpToolStripMenuItem.Size = new System.Drawing.Size(120, 24);
            this.helpToolStripMenuItem.Text = "帮助...";
            this.helpToolStripMenuItem.Click += new System.EventHandler(this.helpToolStripMenuItem_Click);
            // 
            // aboutToolStripMenuItem
            // 
            this.aboutToolStripMenuItem.Name = "aboutToolStripMenuItem";
            this.aboutToolStripMenuItem.Size = new System.Drawing.Size(120, 24);
            this.aboutToolStripMenuItem.Text = "关于...";
            this.aboutToolStripMenuItem.Click += new System.EventHandler(this.aboutToolStripMenuItem_Click);
            // 
            // notifyIcon1
            // 
            this.notifyIcon1.ContextMenuStrip = this.contextMenuStrip1;
            this.notifyIcon1.Icon = ((System.Drawing.Icon)(resources.GetObject("notifyIcon1.Icon")));
            this.notifyIcon1.Text = "模型服务容器控制台";
            this.notifyIcon1.Visible = true;
            // 
            // contextMenuStrip1
            // 
            this.contextMenuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.openDiaToolStripMenuItem,
            this.exitToolStripMenuItem});
            this.contextMenuStrip1.Name = "contextMenuStrip1";
            this.contextMenuStrip1.Size = new System.Drawing.Size(139, 52);
            // 
            // openDiaToolStripMenuItem
            // 
            this.openDiaToolStripMenuItem.Name = "openDiaToolStripMenuItem";
            this.openDiaToolStripMenuItem.Size = new System.Drawing.Size(138, 24);
            this.openDiaToolStripMenuItem.Text = "打开窗口";
            this.openDiaToolStripMenuItem.Click += new System.EventHandler(this.openDiaToolStripMenuItem_Click);
            // 
            // exitToolStripMenuItem
            // 
            this.exitToolStripMenuItem.Name = "exitToolStripMenuItem";
            this.exitToolStripMenuItem.Size = new System.Drawing.Size(138, 24);
            this.exitToolStripMenuItem.Text = "退出";
            this.exitToolStripMenuItem.Click += new System.EventHandler(this.exitToolStripMenuItem_Click);
            // 
            // frm_console
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(327, 388);
            this.Controls.Add(this.gb_container);
            this.Controls.Add(this.gb_redis);
            this.Controls.Add(this.gb_mongodb);
            this.Controls.Add(this.menuStrip1);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.MainMenuStrip = this.menuStrip1;
            this.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.MaximizeBox = false;
            this.Name = "frm_console";
            this.Text = "模型服务容器控制台";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.frm_console_FormClosing);
            this.gb_mongodb.ResumeLayout(false);
            this.gb_mongodb.PerformLayout();
            this.gb_redis.ResumeLayout(false);
            this.gb_redis.PerformLayout();
            this.gb_container.ResumeLayout(false);
            this.gb_container.PerformLayout();
            this.menuStrip1.ResumeLayout(false);
            this.menuStrip1.PerformLayout();
            this.contextMenuStrip1.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.GroupBox gb_mongodb;
        private System.Windows.Forms.Button bt_mg_start;
        private System.Windows.Forms.Label l_mg_status;
        private System.Windows.Forms.Label l_mg_status_tag;
        private System.Windows.Forms.Button bt_mg_stop;
        private System.Windows.Forms.GroupBox gb_redis;
        private System.Windows.Forms.Label l_rds_status;
        private System.Windows.Forms.Label l_rds_status_tag;
        private System.Windows.Forms.Button bt_rds_stop;
        private System.Windows.Forms.Button bt_rds_start;
        private System.Windows.Forms.GroupBox gb_container;
        private System.Windows.Forms.Label l_ctn_status;
        private System.Windows.Forms.Label l_ctn_status_tag;
        private System.Windows.Forms.Button bt_ctn_stop;
        private System.Windows.Forms.Button bt_ctn_start;
        private System.Windows.Forms.MenuStrip menuStrip1;
        private System.Windows.Forms.ToolStripMenuItem operationToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem infoToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem openFirewallPortToolStripMenuItem;
        private System.Windows.Forms.NotifyIcon notifyIcon1;
        private System.Windows.Forms.ToolStripMenuItem helpToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem aboutToolStripMenuItem;
        private System.Windows.Forms.ContextMenuStrip contextMenuStrip1;
        private System.Windows.Forms.ToolStripMenuItem openDiaToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem exitToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem exitToolStripMenuItem1;
    }
}

