using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using ComputerResourceConsole.lib;
using ComputerResourceConsole.model;

namespace ComputerResourceConsole.factory
{
    public class ComponentOperaFactory
    {
        public static IMongoDBOpera createMongoDBOpera()
        {
            return new MongoDBOpera();
        }

        public static IRedisOpera createRedisOpera()
        {
            return new RedisOpera();
        }

        public static IContainerOpera createContainerOpera()
        {
            return new ContainerOpera();
        }

        public static IConfig createConfig()
        {
            return new ConfigModel();
        }

        public static IProcessAccess createProcessAccess()
        {
            return new ProcessAccess();
        }
    }
}
