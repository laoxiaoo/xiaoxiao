# 基本概念

> 消息(Message)

消息是指，消息系统所传输信息的物理载体，生产和消费数据的最小单位，每条消息必须属于一个主题(topic)。  

> 主题（Topic）

1. Topic表示一类消息的集合，每个主题包含若干条消息，每条消息只能属于一个主题，是RocketMQ进行消息订阅的基本单位。 topic:message 1:n  
2. 一个生产者可以同时发送多种Topic的消息；而一个消费者只对某种特定的Topic感兴趣，即只可以订阅和消费一种Topic的消息  

> 队列（Queue） 

存储消息的物理实体。一个Topic中可以包含多个Queue，每个Queue中存放的就是该Topic的消息。一个Topic的Queue也被称为一个Topic中消息的分区（Partition）  

- 同一个topic的queue可以被多个组的消费者消费，但不可以被同一个组的消费者消费
  - ![20210727204517](1-base/20210727204517.png)即queue1不能同时被a, b消费，但是queue1和queue2同时被a消费



> 分片

如图：TopicA 在 broker1 broker2 broker3上都有分片

![20210727204746](1-base/20210727204746.png)

> 消息标识（MessageId/Key）  

RocketMQ中每个消息拥有唯一的MessageId，且可以携带具有业务标识的Key，以方便对消息的查询。不过需要注意的是，MessageId有两个：**在生产者send()消息时会自动生成一个MessageId（msgId)**，当消息到达Broker后，Broker也会自动生成一个MessageId(offsetMsgId)。msgId offsetMsgId与key都
称为消息标识。  

- msgId：由producer端生成，其生成规则为  
  - producerIp + 进程pid + MessageClientIDSetter类的ClassLoader的hashCode +当前时间 + AutomicInteger自增计数器 (**可能重复**：如,修改了时间，或者自增计数器)
- offsetMsgId：由broker端生成，其生成规则为：
  - brokerIp + 物理分区的offset（Queue中的偏移量）（**重复几率更大**）
- key：由用户指定的业务相关的唯一标识 

