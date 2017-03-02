using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;

namespace ComputerResourceConsole.common
{
    public class CommonMethod
    {
        public delegate void CommonEvent(object sender, EventArgs e);

        /// <summary>
        /// 程序所在路径
        /// </summary>
        /// <returns></returns>
        public static string getAppDirection()
        {
            return System.AppDomain.CurrentDomain.SetupInformation.ApplicationBase;
        }
    }
}
