using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using ComputerResourceConsole.lib;
using ComputerResourceConsole.control;

namespace ComputerResourceConsole.factory
{
    public class ComponentControlFactory
    {
        public static IMongoDBControl createMongoDBControl()
        {
            return new MongoDBControl();
        }

        public static IRedisControl createRedisControl()
        {
            return new RedisControl();
        }

        public static IContainerControl createContainerControl()
        {
            return new ContainerControl();
        }
    }
}
