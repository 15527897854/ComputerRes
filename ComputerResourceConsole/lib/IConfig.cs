using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ComputerResourceConsole.lib
{
    public interface IConfig
    {
        int loadConfig();

        string MongoDBPath { get; }

        string MongoDBData { get; }

        string RedisPath { get; }

        string NodejsPath { get; }

        string ContainerPath { get; }

        string MongoDBLogPath { get; }

        string RedisLogPath { get; }

        string ContainerLogPath { get; }
    }
}
