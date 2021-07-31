# 基本概念

> 消息(Message)

消息是指，消息系统所传输信息的物理载体，生产和消费数据的最小单位，每条消息必须属于一个主题(topic)。  

> 主题（Topic）

1. Topic表示一类消息的集合，每个主题包含若干条消息，每条消息只能属于一个主题，是RocketMQ进行消息订阅的基本单位。 topic:message 1:n  
2. 一个生产者可以同时发送多种Topic的消息；而一个消费者只对某种特定的Topic感兴趣，即只可以订阅和消费一种Topic的消息  

> 队列（Queue） 

存储消息的物理实体。一个Topic中可以包含多个Queue，每个Queue中存放的就是该Topic的消息。一个Topic的Queue也被称为一个Topic中消息的分区（Partition）  

- 同一个topic的queue可以被多个组的消费者消费，但不可以被同一个组的消费者消费
  - 即queue1不能同时被a, b消费，但是queue1和queue2同时被a消费

![image-20210727204517482](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/rokectmq/20210727204517.png)

> 分片

如图：TopicA 在 broker1 broker2 broker3上都有分片

![](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/rokectmq/20210727204746.png)

> 消息标识（MessageId/Key）  

RocketMQ中每个消息拥有唯一的MessageId，且可以携带具有业务标识的Key，以方便对消息的查询。不过需要注意的是，MessageId有两个：**在生产者send()消息时会自动生成一个MessageId（msgId)**，当消息到达Broker后，Broker也会自动生成一个MessageId(offsetMsgId)。msgId offsetMsgId与key都
称为消息标识。  

- msgId：由producer端生成，其生成规则为  
  - producerIp + 进程pid + MessageClientIDSetter类的ClassLoader的hashCode +当前时间 + AutomicInteger自增计数器 (**可能重复**：如,修改了时间，或者自增计数器)
- offsetMsgId：由broker端生成，其生成规则为：
  - brokerIp + 物理分区的offset（Queue中的偏移量）（**重复几率更大**）
- key：由用户指定的业务相关的唯一标识 

# 架构

![](https://gitee.com/apache/rocketmq/raw/master/docs/cn/image/rocketmq_architecture_1.png)

## Producer

消息发布的角色，支持分布式集群方式部署。Producer通过MQ的负载均衡模块选择相应的Broker集群队列进行消息投递，投递的过程支持快速失败并且低延迟。

## Consumer

- 消息消费的角色，支持分布式集群方式部署。支持以push推，pull拉两种模式对消息进行消费。同时也支持集群方式和广播方式的消费，它提供实时消息订阅机制，可以满足大多数用户的需求
- RocketMQ中的消息消费者都是以消费者组（Consumer Group）的形式出现的。消费者组是同一类消费者的集合，这类Consumer消费的是同一个Topic类型的消息  

**以下特点只针对集群消费**

如：如果消费组里只有一个消费者，那么他只能：queue1,queue2轮询的消费

如果他一个消费组有两个消费者，那么它会一人一个queue来消费

![image-20210727211728103](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/rokectmq/20210727211728.png)

**消费者组中Consumer的数量应该小于等于订阅Topic的Queue数量。如果超出Queue数量，则多出的
Consumer将不能消费消息。 **

> 注意

1. 消费者组只能消费一个Topic的消息，不能同时消费多个Topic消息  
2. 一个消费者组中的消费者必须订阅完全相同的Topic

## Name Server  

NameServer是一个Broker与Topic路由的注册中心，支持Broker的动态注册与发现  

主要功能：

- Broker管理：接受Broker集群的注册信息并且保存下来作为路由信息的基本数据；提供心跳检测机制，检查Broker是否还存活。
- 路由信息管理：每个NameServer中都保存着Broker集群的整个路由信息和用于客户端查询的队列信息。Producer和Conumser通过NameServer可以获取整个Broker集群的路由信息，从而进行消息的投递和消费。

> > 路由注册 

NameServer通常也是以集群的方式部署，不过，NameServer是无状态的，即NameServer集群中的各个节点间是无差异的，各节点间**相互不进行信息通讯**。那各节点中的数据是如何进行数据同步的呢？**在Broker节点启动时，轮询NameServer列表，与每个NameServer节点建立长连接**，发起注册请求。在NameServer内部维护着⼀个Broker列表，用来动态存储Broker的信息  

如图:将broker注册到每一个nameserver中

![image-20210727221803424](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/rokectmq/20210727221803.png)

> > 路由剔除  

由于Broker关机、宕机或网络抖动等原因，NameServer没有收到Broker的心跳，NameServer可能会将其从Broker列表中剔除  

- 对于RocketMQ日常运维工作，例如Broker升级，需要停掉Broker的工作。OP需要怎么做？  

OP需要将Broker的**读写权限禁掉**。一旦client(Consumer或Producer)向broker发送请求，都会收到broker的NO_PERMISSION响应，然后client会进行对其它Broker的重试  

当OP观察到这个Broker没有流量后，再关闭它，实现Broker从NameServer的移除 

> > 路由发现  

RocketMQ的路由发现采用的是Pull模型。当Topic路由信息出现变化时，NameServer不会主动推送给客户端，而是客户端定时拉取主题最新的路由。默认客户端每30秒会拉取一次最新的路由。  

1. Push模型：推送模型。其实时性较好，是一个“发布-订阅”模型，需要维护一个长连接。而长连接的维护是需要资源成本的。该模型适合于的场景：
   - 实时性要求较高
   - Client数量不多，Server数据变化较频繁  

2. Pull模型：拉取模型。存在的问题是，实时性较差  
3. Long Polling模型：长轮询模型。其是对Push与Pull模型的整合，充分利用了这两种模型的优势，屏蔽了它们的劣势。  

> > 客户端NameServer选择策略  

客户端(Producer与Consumer)在配置时必须要写上NameServer集群的地址，那么客户端到底连接的是哪个NameServer节点呢？

客户端首先会生产一个随机数，然后再与NameServer节点数量取模，此时得到的就是所要连接的节点索引，然后就会进行连接。

如果连接失败，则会采用round-robin策略，逐个尝试着去连接其它节点。  

## Broker 

Broker充当着消息中转角色，负责存储消息、转发消息。Broker在RocketMQ系统中负责接收并存储从生产者发送来的消息，同时为消费者的拉取请求作准备。Broker同时也存储着消息相关的元数据（**非message数据**），包括消费者组消费进度偏移offset、主题、队列等。  

> 结构

![](https://gitee.com/apache/rocketmq/raw/master/docs/cn/image/rocketmq_architecture_2.png)

- Remoting Module：整个Broker的实体，负责处理来自clients端的请求。而这个Broker实体则由以下模块构成  
- Client Manager：客户端管理器。负责接收、解析客户端(Producer/Consumer)请求，管理客户端。例如，维护Consumer的Topic订阅信息  
- Store Service：存储服务。提供方便简单的API接口，处理消息存储到物理硬盘和消息查询功能。  
- HA Service：高可用服务，提供Master Broker 和 Slave Broker之间的数据同步功能。  
- Index Service：索引服务。根据特定的Message key（用户指定的Key），对投递到Broker的消息进行索引服务，同时也提供根据Message Key对消息进行快速查询的功能。  

## 工作流程

1. 启动NameServer，NameServer启动后开始监听端口，等待Broker、Producer、Consumer连接。  
2. 启动NameServer，NameServer启动后开始监听端口，等待Broker、Producer、Consumer连接。
3. 发送消息前，可以先创建Topic，创建Topic时需要指定**该Topic要存储在哪些Broker上**，当然，在创建Topic时也会将Topic与Broker的关系写入到NameServer中。不过，这步是可选的，也可以在发送消息时自动创建Topic。  

4. Producer发送消息，启动时先跟NameServer集群中的其中一台建立长连接，并从NameServer中获取路由信息，即当前发送的Topic消息的Queue与Broker的地址（IP+Port）的映射关系。然后根据算法策略从队选择一个Queue，与队列所在的Broker建立长连接从而向Broker发消息。当然，在获取到路由信息后，Producer会首先将**路由信息缓存到本地**，再每30秒从NameServer更新一次路由信息。  
5. Consumer跟Producer类似，跟其中一台NameServer建立长连接，获取其所订阅Topic的路由信息，
   然后根据算法策略从路由信息中获取到其所要消费的Queue，然后直接跟Broker建立长连接，开始消费其中的消息。Consumer在获取到路由信息后，同样也会每30秒从NameServer更新一次路由信息。不过不同于Producer的是，**Consumer还会向Broker发送心跳**，以确保Broker的存活状态  

> Topic的创建模式

手动创建Topic时，有两种模式：

1. 集群模式：该模式下创建的Topic在该集群中，所有Broker中的Queue数量是相同的。
2. Broker模式：该模式下创建的Topic在该集群中，每个Broker中的Queue数量可以不同。

自动创建Topic时，默认采用的是Broker模式，会为每个Broker默认创建4个Queue。  

> 读/写队列  

从物理上来讲，读/写队列是同一个队列。所以，不存在读/写队列数据同步问题。读/写队列是逻辑上进行区分的概念。一般情况下，读/写队列数量是相同的。  

```tex
例如，创建Topic时设置的写队列数量为8，读队列数量为4，此时系统会创建8个Queue，分别是0 1 2 3 4 5 6 7。Producer会将消息写入到这8个队列，但Consumer只会消费0 1 2 3这4个队列中的消息，4 5 6 7中的消息是不会被消费到的。
```

perm用于设置对当前创建Topic的操作权限：2表示只写，4表示只读，6表示读写。  

![](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/rokectmq/20210728212224.png)

# 安装

## 单机安装

1. 下载

```shell
[root@node1 rocketmq]# wget https://mirrors.bfsu.edu.cn/apache/rocketmq/4.9.0/rocketmq-all-4.9.0-bin-release.zip

```

2. 修改默认的内存(改成-Xms256m -Xmx256m -Xmn128m)
   1. 修改[root@node1 bin]# vim runserver.sh

```shell
JAVA_OPT="${JAVA_OPT} -server -Xms4g -Xmx4g -Xmn2g -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m"
```

修改[root@node1 bin]# vim runbroker.sh

```shell
JAVA_OPT="${JAVA_OPT} -server -Xms8g -Xmx8g -Xmn4g"
```

> 启动

1. Start Name Server

```shell
[root@node1 rocketmq]# nohup sh bin/mqnamesrv &
[root@node1 rocketmq]# tail -f ~/logs/rocketmqlogs/namesrv.log
  The Name Server boot success...
```

2. Start Broker

```shell
[root@node1 rocketmq]# nohup sh bin/mqbroker -n localhost:9876 &
[root@node1 rocketmq]# tail -f ~/logs/rocketmqlogs/broker.log
```

> 使用官方提供脚本测试

1. 设置全局的环境变量

```shell
[root@node1 rocketmq]#  export NAMESRV_ADDR=localhost:9876
```

2. 发送消息

```shell
[root@node1 rocketmq]# sh bin/tools.sh org.apache.rocketmq.example.quickstart.Producer

## 看到类似日志
SendResult [sendStatus=SEND_OK, msgId=7F00000141EC28D93B308CEBA02E03E7, offsetMsgId=C0A8018300002A9F00000000000317BF, messageQueue=MessageQueue [topic=TopicTest, brokerName=node1, queueId=0], queueOffset=249]

```

3. 消费数据

```shell
[root@node1 rocketmq]# sh bin/tools.sh org.apache.rocketmq.example.quickstart.Consumer
```

> 关闭服务（先关broker再关namesrv）

```shell
> sh bin/mqshutdown broker
The mqbroker(36695) is running...
Send shutdown request to mqbroker(36695) OK

> sh bin/mqshutdown namesrv
The mqnamesrv(36664) is running...
Send shutdown request to mqnamesrv(36664) OK
```

## 控制台安装

前往：https://github.com/apache/rocketmq-externals/releases，下载[rocketmq-console](https://github.com/apache/rocketmq-externals/releases/tag/rocketmq-console-1.0.0)

1. 修改端口和namesrv

![image-20210728210758131](C:\Users\lonelyxiao\AppData\Roaming\Typora\typora-user-images\image-20210728210758131.png)

2. 添加依赖

```xml
<dependency>
    <groupId>javax.xml.bind</groupId>
    <artifactId>jaxb-api</artifactId>
    <version>2.3.0</version>
</dependency>
<dependency>
    <groupId>com.sun.xml.bind</groupId>
    <artifactId>jaxb-impl</artifactId>
    <version>2.3.0</version>
</dependency>
<dependency>
    <groupId>com.sun.xml.bind</groupId>
    <artifactId>jaxb-core</artifactId>
    <version>2.3.0</version>
</dependency>
<dependency>
    <groupId>javax.activation</groupId>
    <artifactId>activation</artifactId>
    <version>1.1.1</version>
</dependency>
```

# 消息生产

## 生产过程

1. Producer发送消息之前，会先向NameServer发出获取**消息Topic的路由信息**的请求  
2. NameServer返回该Topic的**路由表**及**Broker列表 **
   1. 路由表 ：实际是一个Map，key为**Topic名称**，value是一个QueueData实例列表。QueueData并不是一个Queue对应一个QueueData，而是一个Broker中该Topic的所有Queue对应一个QueueData  
   2. Broker列表 ：其实际也是一个Map。key为brokerName，value为BrokerData。一套brokerName名称相同的Master-Slave小集群对应一个BrokerData  BrokerData中包含brokerName及一个map。该map的key为brokerId，value为该broker对应的地址。brokerId为0表示该broker为Master，非0表示Slave。 
   3. Producer根据代码中指定的Queue选择策略，从Queue列表中选出一个队列，用于后续存储消息 
   4. Producer根据代码中指定的Queue选择策略，从Queue列表中选出一个队列，用于后续存储消息 
   5. Producer向选择出的Queue所在的Broker发出RPC请求，将消息发送到选择出的Queue  

## Queue选择算法 

对于无序消息，其Queue选择算法，也称为消息投递算法，常见的有两种  

> 轮询算法

默认选择算法。该算法保证了每个Queue中可以均匀的获取到消息。

生产者对topic里面的queue一个一个轮询的投递

- 如果一个queue投递延迟过高， 会导致Producer的缓存队列中出现较大的消息积压，影响消息的投递性能。  

> 最小投递延迟算法  

该算法会统计每次消息投递的时间延迟，然后根据统计出的结果将消息投递到时间延迟最小的Queue。如果延迟相同，则采用轮询算法投递。该算法可以有效提升消息的投递性能。  

- 投递延迟小的Queue其可能会存在大量的消息。而对该Queue的消费者压力会增大，降低消息的消费能力，可能会导致MQ中消息的堆积。  

## store目录

broker启动后，会在${userhome}目录下产生一个store目录

```shell
[root@node1 store]# pwd
/root/store
```

```shell
[root@node1 store]# ll
总用量 8
## 如果broker正常关闭，则这个文件会被删除
-rw-r--r--. 1 root root    0 7月  28 08:41 abort
# 其中存储着commitlog、consumequeue、index文件的最后刷盘时间戳
-rw-r--r--. 1 root root 4096 7月  28 10:46 checkpoint
# 其中存放着commitlog文件，而消息都是写在commitlog文件中的
drwxr-xr-x. 2 root root   62 7月  28 08:44 commitlog
# 存放着Broker运行期间的一些配置数据
drwxr-xr-x. 2 root root  246 7月  28 10:47 config
# 其中存放着consumequeue文件，队列就存放在这个目录中
drwxr-xr-x. 3 root root   23 7月  28 08:44 consumequeue
# 其中存放着消息索引文件indexFile
drwxr-xr-x. 2 root root   31 7月  28 08:44 index
# 其中存放着消息索引文件indexFile
-rw-r--r--. 1 root root    4 7月  28 08:41 lock
```

> commitlog

commitlog目录中存放着**很多的mappedFile文件**，当前Broker中的所有消息都是落盘到这些mappedFile文件中的。mappedFile文件**最大1G**，文件名由20位十进制数构成，表示当前文件的第一条消息的起始位移偏移量  

**mappedFile文件是顺序读写的文件，所有其访问效率很高**

**一个Broker中仅包含一个commitlog目录，所有的mappedFile文件都是存放在该目录中的。即无论当前Broker中存放着多少Topic的消息，这些消息都是被顺序写入到了mappedFile文件中的  **

> > 消息单元  

mappedFile文件内容由一个个的消息单元构成。每个消息单元中包含消息总长度MsgLen、消息的物理位置physicalOffset、消息体内容Body、消息体长度BodyLength、消息主题Topic、Topic长度TopicLength、消息生产者BornHost、消息发送时间戳BornTimestamp、消息所在的队列QueueId、消息在**Queue中存储的偏移量QueueOffset**等近20余项消息相关属性  

> consumequeue

消息存放在commitlog中，consumequeue存放消息索引

```shell
# 主题目录
[root@node1 store]# ll consumequeue/
总用量 0
drwxr-xr-x. 6 root root 42 7月  28 08:44 TopicTest
## queueid(默认一个topic有4个queue)
[root@node1 store]# ll consumequeue/TopicTest/
0/ 1/ 2/ 3/ 
## queue
[root@node1 store]# ll consumequeue/TopicTest/0/
总用量 12
-rw-r--r--. 1 root root 6000000 7月  28 09:32 00000000000000000000
```

每个consumequeue文件可以包含30w个索引条目，每个索引条目包含了三个消息重要属性：消息在mappedFile文件中的偏移量CommitLog Offset、消息长度、消息Tag的hashcode值  

![image-20210729082512743](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/rokectmq/20210729082519.png)

> > 消息写入

一条消息进入到Broker后经历了以下几个过程才最终被持久化 

1. Broker根据queueId，获取到该消息对应索引条目要在consumequeue目录中的写入偏移量，即QueueOffset  
2. 将queueId、queueOffset等数据，与消息一起封装为消息单元 
3. 将消息单元写入到commitlog ，同时，形成消息索引条目 ，同时，形成消息索引条目  

> > 消息拉取

当Consumer来拉取消息时会经历以下几个步骤 

1. Consumer获取到其要消费消息所在Queue的消费偏移量offset，计算出其要消费消息的消息offset  

`消费offset即消费进度，consumer对某个Queue的消费offset，即消费到了该Queue的第几条消息消息offset = 消费offset + 1  `

2. Consumer向Broker发送拉取请求，其中会包含其要拉取消息的Queue、消息offset及消息Tag。  
3. Broker计算在该consumequeue中的queueOffset。
4. 从该queueOffset处开始向后查找第一个指定Tag的索引条目。解析该索引条目的前8个字节，即可定位到该消息在commitlog中的commitlog offset ,从对应commitlog offset中读取消息单元，并发送给Consumer   

> > 性能问题

1. RocketMQ对文件的读写操作是通过**mmap零拷贝**进行的，将对文件的操作转化为直接对内存地址进行操作，从而极大地提高了文件的读写效率 
2. consumequeue中的数据是顺序存放的，还引入了PageCache的预读取机制，使得对consumequeue文件的读取几乎接近于内存读取，即使在有消息堆积情况下也不会影响性能  
   1. PageCache机制，页缓存机制，是OS对文件的缓存机制，用于加速对文件的读写操作。一般来
      说，程序对文件进行顺序读写 的速度几乎接近于内存读写速度  

> indexFile

除了通过通常的指定Topic进行消息消费外，RocketMQ还提供了根据key进行消息查询的功能。该查询是通过store目录中的index子目录中的indexFile进行索引实现的快速查询。当然，这个indexFile中的索引数据是在包含了key的消息被发送到Broker时写入的。如果消息中没有包含key，则不会写入  

> > 结构

1. 每个Broker中会包含一组indexFile，每个indexFile都是以一个时间戳命名的（这个indexFile被创建时的时间戳）
2. 每个indexFile文件由三部分构成：indexHeader，slots槽位，indexes索引数据 
3. 每个indexFile文件中包含500w个slot槽。而每个slot槽又可能会挂载很多的index索引单元。  

![image-20210729232349132](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/rokectmq/20210729232349.png)

> > index索引单元 

默写20个字节，其中存放着以下四个属性  

![image-20210730082107106](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/rokectmq/20210730082114.png)

# 消息消费

## 消费模式

> Topic模式

广播消费模式下，相同Consumer Group的每个Consumer实例都接收同一个Topic的全量消息。即每条消息都会被发送到Consumer Group中的**每个Consumer **

> 集群模式

集群消费模式下，相同Consumer Group的每个Consumer实例平均分摊同一个Topic的消息。即每条消息只会被发送到Consumer Group中的某个Consumer。  

## Rebalance机制

Rebalance机制讨论的前提是：**集群消费 **

Rebalance机制的本意是为了提升消息的并行消费能力。例如，⼀个Topic下5个队列，在只有1个消费者的情况下，这个消费者将负责消费这5个队列的消息。如果此时我们增加⼀个消费者，那么就可以给其中⼀个消费者分配2个队列，给另⼀个分配3个队列，从而提升消息的并行消费能力  

> Rebalance危害  

消费暂停：在只有一个Consumer时，其负责消费所有队列；在新增了一个Consumer后会触发Rebalance的发生。此时原Consumer就需要暂停部分队列的消费，等到这些队列分配给新的Consumer后，这些暂停消费的队列才能继续被消费。
消费重复：Consumer 在消费新分配给自己的队列时，必须接着之前Consumer 提交的消费进度的offset继续消费。然而默认情况下，offset是异步提交的，这个异步性导致提交到Broker的offset与Consumer实际消费的消息并不一致。这个不一致的差值就是可能会重复消费的消息。  

> Rebalance产生的原因

1. 消费者所订阅Topic的Queue数量发生变化
2. 消费者组中消费者的数量发生变化。  

## Queue分配算法 

消费的时候通过构造器传入的

> 平均分配策略  

该算法是要根据avg = QueueCount / ConsumerCount 的计算结果进行分配的。如果能够整除，则按顺序将avg个Queue逐个分配Consumer；如果不能整除，则将多余出的Queue按照Consumer顺序逐个分配。  

**先计算好每个consumer应该分配几个queue**

> 环形平均策略  

环形平均算法是指，根据消费者的顺序，依次在由queue队列组成的环形图中逐个分配  

**挨个分配给consumer，一个一个分配**

> 一致性hash策略  

该算法会将consumer的hash值作为Node节点存放到hash环上，然后将queue的hash值也放到hash环上，通过顺时针方向，距离queue最近的那个consumer就是该queue要分配的consumer  

**会导致分配不均匀**

> 同机房策略  

## 订阅关系的一致性 

订阅关系的一致性指的是，同一个消费者组（Group ID相同）下所有Consumer实例所订阅的Topic与Tag及对消息的处理逻辑必须完全一致。否则，消息消费的逻辑就会混乱，甚至导致消息丢失  

> 错误订阅关系  

同一个topic订阅了不同Topic 

如图：错误的示例：

![image-20210731105516120](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/rokectmq/20210731105516.png)

## offset管理

`指的是Consumer的消费进度offset。`

---

当消费模式为**广播消费**时，offset使用本地模式存储  

Consumer在广播消费模式下offset相关数据以json的形式持久化到Consumer本地磁盘文件中，默认文件路径为当前用户主目录下的*.rocketmq_offsets/${clientId}/${group}/Offsets.json* 。其中${clientId}为当前消费者id，默认为ip@DEFAULT；${group}为消费者组名称  

---

当消费模式为**集群消费**时，offset使用远程模式管理。因为所有Cosnumer实例对消息采用的是均衡消费，所有Consumer共享Queue的消费进度。
Consumer在集群消费模式下offset相关数据以json的形式持久化到Broker磁盘文件中，文件路径为当前用户主目录下的store/config/consumerOffset.json   

存放的数据未key-value模式，key:queue的id， value: offset

---

## 消费起始位置

```java
public enum ConsumeFromWhere {
    //从queue的当前最后一条消息开始消费
    CONSUME_FROM_LAST_OFFSET,
    //从queue的第一条消息开始消费
    CONSUME_FROM_FIRST_OFFSET,
    
    /**
    从指定的具体时间戳位置的消息开始消费。这个具体时间戳
    是通过另外一个语句指定的 。
    
    consumer.setConsumeTimestamp(“20210701080000”) yyyyMMddHHmmss
    */
    CONSUME_FROM_TIMESTAMP,
}
```

## 重试队列 

当rocketMQ对消息的消费出现异常时，会将发生异常的消息的offset提交到Broker中的重试队列。系统在发生消息消费异常时会为当前的topic@group创建一个重试队列，该队列以**%RETRY%**  开头，到达重试时间后进行消费重试。  

## 同步提交与异步提交

> 同步提交

消费者在消费完一批消息后会向broker提交这些消息的offset，然后等待broker的成功响应。若在等待超时之前收到了成功响应，则继续读取下一批消息进行消费（从ACK中获取nextBeginOffset）。若没有收到响应，则会重新提交，直到获取到响应。而在这个等待过程中，消费者是阻塞的。其严重影响了消费者的吞吐量  

> 异步提交 

消费者在消费完一批消息后向broker提交offset，但无需等待Broker的成功响应，可以继续读取并消费下一批消息。这种方式增加了消费者的吞吐量。但需要注意，broker在收到提交的offset后，还是会向消费者进行响应的。可能还没有收到ACK，此时Consumer会从Broker中直接获取nextBeginOffset。  

## 消费幂等

当出现消费者对某条消息重复消费的情况时，重复消费的结果与消费一次的结果是相同的，并且多次消费并未对业务系统产生任何负面影响，那么这个消费过程就是消费幂等的  

> 消息重复的场景分析

> > 发送时消息重复

当一条消息已被成功发送到Broker并完成持久化，此时出现了网络闪断，从而导致Broker对Producer应答失败。 如果此时Producer意识到消息发送失败并尝试再次发送消息，此时Broker中就可能会出现两条内容相同并且Message ID也相同的消息，那么后续Consumer就一定会消费两次该消息  

> > 消费时消息重复

消息已投递到Consumer并完成业务处理，当Consumer给Broker反馈应答时网络闪断，Broker没有接收到消费成功响应。为了保证消息**至少被消费一次**的原则，Broker将在网络恢复后再次尝试投递之前已被处理过的消息。此时消费者就会收到与之前处理过的内容相同、Message ID也相同的消息  

> > Rebalance时消息重复

当Consumer Group中的Consumer数量发生变化时，或其订阅的Topic的Queue数量发生变化时，会触发Rebalance，此时Consumer可能会收到曾经被消费过的消息。  

---

> 解决方案

幂等解决方案的设计中涉及到两项要素：幂等令牌，与唯一性处理：

幂等令牌：

- 是生产者和消费者两者中的既定协议，通常指具备唯⼀业务标识的字符串。例如，订单号、流水号。一般由Producer随着消息一同发送来的。

唯一性处理：

- 服务端通过采用⼀定的算法策略，保证同⼀个业务逻辑不会被重复执行成功多次。例如，对同一笔订单的多次支付操作，只会成功一次。  

> > 常见方案

1. 首先通过缓存去重。在缓存中如果已经存在了某幂等令牌，则说明本次操作是重复性操作；若缓存没有命中，则进入下一步。  

2. 在唯一性处理之前，先在数据库中查询幂等令牌作为索引的数据是否存在。若存在，则说明本次操作为重复性操作；若不存在，则进入下一步  

3. 在唯一性处理之前，先在数据库中查询幂等令牌作为索引的数据是否存在。若存在，则说明本次操作为重复性操作；若不存在，则进入下一步  

---

## 消息的清理  

commitlog文件存在一个过期时间，默认为72小时，即三天。除了用户手动清理外，在以下情况下也会被自动清理，无论文件中的消息是否被消费过  



对于RocketMQ系统来说，删除一个1G大小的文件，是一个压力巨大的IO操作。在删除过程中，系统性能会骤然下降。所以，其默认清理时间点为凌晨4点，访问量最小的时间。也正因如果，我们要保障磁盘空间的空闲率，不要使系统出现在其它时间点删除commitlog文件的情况  

# RocketMQ应用

## 消息发送

> 同步发送

同步发送消息是指，Producer发出⼀条消息后，会在收到MQ返回的ACK之后才发下⼀条消息。该方式的消息可靠性最高，但消息发送效率太低。  

> 异步发送

异步发送消息是指，Producer发出消息后无需等待MQ返回ACK，直接发送下⼀条消息。该方式的消息可靠性可以得到保障，消息发送效率也可以。  

`可以通过回调异步的收到ACK响应`

> 单向发送消息 

单向发送消息是指，Producer仅负责发送消息，不等待、不处理MQ的ACK。该发送方式时MQ也不返回ACK。该方式的消息发送效率最高，但消息可靠性较差。  

## 简单代码

> 引入对应版本的jar包

```xml
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-client</artifactId>
</dependency>
```

> 同步发送

```java
//定义一个消息
Message msg = new Message(TOPIC /* Topic */,
        "TagA" /* Tag */,
        ("Hello RocketMQ ").getBytes(RemotingHelper.DEFAULT_CHARSET) /* Message body */
);
//会返回同步返回ack状态
SendResult sendResult = producer.send(msg);
System.out.printf("%s%n", sendResult);
producer.shutdown();
```

> 异步发送

```java
Message msg = new Message(TOPIC,
        "TagA",
        "OrderID188",
        "Hello world".getBytes(RemotingHelper.DEFAULT_CHARSET));
producer.send(msg, new SendCallback() {
    @Override
    public void onSuccess(SendResult sendResult) {

        log.debug("消息： {}",  sendResult.getMsgId());
    }
    @Override
    public void onException(Throwable e) {
        e.printStackTrace();
    }
});
Thread.sleep(10000l);
producer.shutdown();
```

> 消息消费

```java
//定义一个push模式的消费者
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("CG");
consumer.setNamesrvAddr(ProductBase.ADDRESS);
consumer.subscribe(ProductBase.TOPIC, "*");
//设置从第一个消息开始消费
consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);
//设置消费模式：默认集群
consumer.setMessageModel(MessageModel.CLUSTERING);
//注册监听
consumer.registerMessageListener(new MessageListenerConcurrently() {

    @Override
    public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> msgs,
                                                    ConsumeConcurrentlyContext context) {
        //如果broker有消息，就会触发这个方法
        log.debug("{} Receive New Messages: {}", Thread.currentThread().getName(), msgs);
        //返回mq需要的消费状态
        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
    }
});
consumer.start();
```

## 顺序消费

指的是严格按照消息的发送顺序进行消费

---

默认情况下生产者会把消息以Round Robin轮询方式发送到不同的Queue分区队列；而消费消息时会从多个Queue上拉取消息，这种情况下的发送和消费是不能保证顺序的。如果将消息仅发送到同一个Queue中，消费时也只从这个Queue上拉取消息，就严格保证了消息的顺序性。  

---

### 有序分类

> 全局有序

当发送和消费参与的Queue只有一个时所保证的有序是整个Topic中消息的顺序， 称为全局有序  

> 分区有序

当发送和消费参与的Queue只有一个时所保证的有序是整个Topic中消息的顺序， 称为全局有序 。

- 在创建producer的时候，我们创建queue选择器，指定投放的queue是哪个

- 可以实现MessageQueueSelector  接口来选择当前生产者投递的队列

## 延迟消息

> 应用场景

当消息写入到Broker后，在指定的时长后才可被消费处理的消息，称为延时消息  

延时消息可以实现定时任务的功能，而无需使用定时器。

典型的应用场景是：

1. 电商交易中超时未支付关闭订单的场景
2. 12306平台订票超时未支付取消订票的场景。  

> 延迟等级

延时消息的延迟时长**不支持随意时长**的延迟，是通过特定的延迟等级来指定的。延时等级定义在RocketMQ服务端的MessageStoreConfig类中的如下变量中  

当然，如果需要自定义的延时等级，可以通过在broker加载的配置中新增如下配置（例如下面增加了1天这个等级1d）。配置文件在RocketMQ安装目录下的conf目录中。  

```
messageDelayLevel = 1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h 1d
```

