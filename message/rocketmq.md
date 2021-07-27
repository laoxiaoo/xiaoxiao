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

