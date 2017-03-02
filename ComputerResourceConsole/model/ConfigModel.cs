﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;

using ComputerResourceConsole.lib;
using ComputerResourceConsole.common;

namespace ComputerResourceConsole.model
{
    public class ConfigModel : IConfig
    {
        private string _strMongoDBPath;

        private string _strMongoDBData;

        private string _strRedisPath;

        private string _strNodejsPath;

        private string _strContainerPath;

        public int loadConfig()
        {
            FileStream fs = new FileStream(CommonMethod.getAppDirection() + "CRC.config", FileMode.Open);
            StreamReader sr = new StreamReader(fs);
            string strLine = sr.ReadLine();
            while (strLine != null)
            {
                if (strLine.Trim().ToCharArray()[0] != '#')
                {
                    string[] strInfo = strLine.Split(' ');
                    switch (strInfo[0])
                    {
                        case "MongoDBPath":
                            {
                                this._strMongoDBPath = strInfo[1];
                                break;
                            }
                        case "MongoDBData":
                            {
                                this._strMongoDBData = strInfo[1];
                                break;
                            }
                        case "RedisPath":
                            {
                                this._strRedisPath = strInfo[1];
                                break;
                            }
                        case "NodejsPath":
                            {
                                this._strNodejsPath = strInfo[1];
                                break;
                            }
                        case "ContainerPath":
                            {
                                this._strContainerPath = strInfo[1];
                                break;
                            }
                    }
                }
                strLine = sr.ReadLine();
            }

            sr.Close();
            sr.Dispose();

            fs.Close();
            fs.Dispose();

            return 1;
        }

        public string MongoDBPath
        {
            get { return this._strMongoDBPath; }
        }

        public string MongoDBData
        {
            get { return this._strMongoDBData; }
        }

        public string RedisPath
        {
            get { return this._strRedisPath; }
        }

        public string NodejsPath
        {
            get { return this._strNodejsPath; }
        }

        public string ContainerPath
        {
            get { return this._strContainerPath; }
        }
    }
}
