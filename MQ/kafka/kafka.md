 #

# 特点

- Kafka高效，可伸缩，消息持久化。支持分区、副本和容错。
- Kafka是Scala和Java开发的，对批处理和异步处理做了大量的设计，因此Kafka可以得到非常高的性能。它的异步消息的发送和接收是三个中最好的，但是跟RocketMQ拉不开数量级，每秒处理几十万的消息。
- 如果是异步消息，并且开启了压缩，Kafka最终可以达到每秒处理2000w消息的级别。
- 但是由于是异步的和批处理的，延迟也会高，不适合电商场景。

# 基本概念

## 体系结构

![](./image/20200304201300.jpg)

- producer：消息生存者,负责创建消息，投递kafka

- consumer：消息消费者，连接kafka接收消息，进而进行相应的业务逻辑处理

  - 同组内，一个消费者对应一个或者多个partition,但是一个partition只能对应一个consumer
  - 这是为了避免同组内的consumer重复消费

- broker：kafka 集群的 server，(其实就是一台机器)负责处理消息读、写请求，存储消息

  - Topic: 消息的分类，每条消息都属于一个特定的 Topic。用户可以通过 Topic 来组织和管理消息。一般topic的partion的数量和broker集群数量一致（如果partion数量大于broker，可能会导致一个broker有多个同一topic的partion，导致数据分布不均匀）

  - **分区（Partition）**：为了实现扩展性，一个非常大的 topic 可以分布到多个 broker(即服务器)上， 一个 topic 可以分为多个 partition，每个 partition 是一个有序的队列;
  - **副本（Replica）**：副本，为保证集群中的某个节点发生故障时，该节点上的 partition 数据不丢失，且 kafka 仍然能够继续工作，kafka 提供了副本机制，一个 topic 的每个分区都有若干个副本， 一个 **leader** 和若干个 **follower**。




## 分区和主题

> topic：主题（逻辑概念），kafka消息以主题为单位进行归类

生产值将消息发送特定主题，消费者负责订阅主题进行消费

 代表一个类别，如果把Kafka看做为一个数据库，topic可以理解为数据库中的一张表，topic的名字即为表名  

> partition ：分区（物理概念）

一个topic下可以有多个分区,每个partition可以进行副本备份，但是，客户端只与主分区进行交互，副本分区一般作为备份





![](./image/20200304203436.jpg)

分区可以分布在不同的服务器上（**一个主题可以跨越多个broker**）

## 保证消息的有序

1. partition中的数据是有序的,在需要严格保证消息的消费顺序的场景下，需要将partition数目设为1  
2. 最消息指定key(消息可以有key,也可以没有key ),对某个key进行取余，保证某个key都进入同一个partition

## 偏移量

消费者通过偏移量来区分已经读过的消息，从而消费消息（通过偏移量来判断从当前partition的哪里消费）

## 消费组

消费组是为了解决重复消费；

1. 消费组可以保证，一个topic多个partition，对于同一个消费组，只会被消费一次
2. 消费者是消费组的一部分。消费组保证每个分区只能被一个消费者使用（比如partition1不能被消费者1,2订阅消费，只能被消费者1或者2进行消费）

## kafka的优势

1. 高吞吐量：单机每秒处理几十上百万的消息量。即使存储了许多TB的消息，它也保持稳定的性能。

2. 高性能：单节点支持上千个客户端，并保证零停机和零数据丢失。
3. 持久化数据存储：将消息持久化到磁盘。通过将数据持久化到硬盘以及replication防止数据丢失。
  1. 零拷贝
  2. 顺序读，顺序写
  3. 利用Linux的页缓存
4. 分布式系统，易于向外扩展。所有的Producer、Broker和Consumer都会有多个，均为分布式的。**无需停机即可扩展机器**。多个Producer、Consumer可能是不同的应用。
5. 可靠性 - Kafka是分布式，分区，复制和容错的。
   1. 比如，每个partition可以有多个或1个副本，这个副本只有partition所在服务挂掉情况下才会启用，
6. 客户端状态维护：消息被处理的状态是在Consumer端维护，而不是由server端维护。当失败时能自动平衡。
  1. 比如，消费的offset，就存储客户端
7. 支持online和offline的场景。
8. 支持多种客户端语言。Kafka支持Java、.NET、PHP、Python等多种语言。

## 集群控制器

1. 每个集群都有一个broker是集群控制器
2. 控制器负责管理工作
   1. 将分区分配给broker
   2. 监控broker，比如，某个broker挂了，就将其他broker的副本分区启动，变为主分区，并且在其他活跃的broker上，创建新的副本broker进行备份
   2. 副本分区只进行备份

## producer

生产者，负责生产消息

一般情况下，一个消息会被发布到一个特定的主题上。
1. 默认情况下通过轮询把消息均衡地分布到主题的所有分区上。
2. 在某些情况下，生产者会把消息直接写到指定的分区。这通常是通过消息键和分区器来实现
的，分区器为键生成一个散列值，并将其映射到指定的分区上。这样可以保证包含同一个键的
消息会被写到同一个分区上。
3. 生产者也可以使用自定义的分区器，根据不同的业务规则将消息映射到分区。
4. 如果一个消费者失效（或者增加），消费组里的其他消费者可以接管失效消费者的工作，再平衡，分区重新分配

## Consumer

消费者读取消息

1. 消费者订阅一个或多个主题，并按照消息生成的顺序（单partition）读取它们。
2. 消费者通过检查消息的偏移量来区分已经读取过的消息， **偏移量**在生产者写入时候生成，一个递增的整数；消费者消费时，会将当前消息的偏移量记录下来
3. 消费者是消费组的一部分。群组保证每个分区只能被一个消费者使用

## broker

kafka 集群的 server

应该避免，一个topic的partition数量大于broker的情况

broker 是集群的组成部分。每个集群都有一个broker 同时充当了集群控制器的角色（自动从集群的活跃成员中选举出来）

## Offset

偏移量，分为生成者偏移量和消费者偏移量

## 副本

Kafka通过副本保证高可用。副本分为首领副本(Leader)和跟随者副本(Follower)。

Follower的复制多多少少会有延迟的

![image-20251013211104073](image/kafka/image-20251013211104073.png)

如图：

1. 我们将LEO称为：它表示了当前日志文件中下一条待写入消息的offset
2. HW是High Watermak的缩写， 俗称高水位，它表示了一个特定消息的偏移量（offset），消费只能拉取到这个offset之前的消息。



# 安装

## 安装方式

> 解压

```shell
-rw-r--r--. 1 root root 86486610 Oct  5 04:41 kafka_2.12-3.0.0.tgz
[root@node2 home]# tar -xzvf kafka_2.12-3.0.0.tgz 
```

> 加上可执行权限

```shell
[root@node2 bin]# cd ..
[root@node2 kafka_2.12-3.0.0]# chmod +x ./bin/*
```

> 修改配置文件

```shell
[root@node2 kafka_2.12-3.0.0]# vim config/server.properties
```

```properties
# 配置好brokerid，集群中，每台id都不一样
broker.id=0
## 这里说是日志，其实就是kafka的数据
log.dirs=/home/kafka/log

# 数据保存日期，默认是7天
log.retention.hours=168

## zookeeper地址
zookeeper.connect=node1:2181,node2:2181,node3:2181
```

> 启动

```shell
[root@node2 kafka_2.12-3.0.0]# nohup ./bin/kafka-server-start.sh  ./config/server.properties  > kafka.log 2>&1 &
[1] 7260
```

## 服务端参数配置

<b id="blue">zookeeper.connect</b>：该参数用于配置Kafka要连接的Zookeeper/集群的地址。

<b id="blue">listeners</b>：用于指定当前Broker向外发布服务的地址和端口。与 advertised.listeners 配合，用于做内外网隔离

# 基本命令

## 创建一个topic

- replication-factor： 副本因子（表示每一个分区拥有的副本数量）
- --partitions：分区个数
- --topic： topic 名字

```shell
[root@node2 kafka]# ./bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic mytest
Created topic mytest.
```

## 查看topic

Partition: 0 Leader: 0   表示 有一个分区，编号为0，在0号服务器上

```shell
[root@node2 kafka]# ./bin/kafka-topics.sh --list --bootstrap-server=127.0.0.1:9092
mytest

# 查看具体描述
[root@node2 kafka]# ./bin/kafka-topics.sh --describe --bootstrap-server=127.0.0.1:9092
Topic: mytest	TopicId: lHL_52IoSSWPJDRecdDctA	PartitionCount: 1	ReplicationFactor: 1	Configs: segment.bytes=1073741824
	Topic: mytest	Partition: 0	Leader: 0	Replicas: 0	Isr: 0

```

## 消费数据

通过脚本消费消息

```sh
 ./bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --from-beginning --topic my-replicated-topic
```

## 消息生产

--broker-list  指定对应的broker

```shell
kafka-console-producer.sh --broker-list localhost:9092 --topic topic_1
```

## 添加分区

通过命令行工具操作，主题的分区只能增加，不能减少。否则报错，通过--alter修改主题的分区数，增加分区。

**2**表示添加后的分区数量

kafka-topics.sh --zookeeper localhost/myKafka --alter --topic myTop1 --partitions 2

# 副本机制

1. Follower分区像普通的Kafka消费者一样，消费来自Leader分区的消息，并将其持久化到自己的日志中。
2. 副本有个同步节点(ISR)的定义
   1. 节点必须能够维持与ZooKeeper的会话（通过ZooKeeper的心跳机制）
   2. 对于Follower副本分区，它复制在Leader分区上的写入，并且不要延迟太多
3. Kafka提供的保证是，只要有至少一个同步副本处于活动状态，提交的消息就不会丢失

## 宕机如何恢复

> 少部分副本宕机

当leader宕机了，会从follower选择一个作为leader。当宕机的重新恢复时，会把之前commit的数据清空，重新从leader里pull数据。

> 全部副本宕机

当全部副本宕机了有两种恢复方式
1、等待ISR中的一个恢复后，并选它作为leader。（等待时间较长，降低可用性）
2、选择第一个恢复的副本作为新的leader，无论是否在ISR中。（并未包含之前leader commit的数据，因此造成数据丢失）

# 消息生产

## 配置信息

bootstrap.servers：设置连接Kafka的初始连接用到的服务器地址，如果是集群，则可以通过此初始连接发现集群中的其他broker

## 发送模式

### 异步发送

对于生产者的异步发送来说就是，我发送完当前消息后，并不需要你将当前消息的发送结果立马告诉我，而是可以随即进行下一条消息的发送。但是我会允许添加一个回调函数，接收你后续返回的发送结果。异步发送这块我们直接调用kafkaProducer的send方法即可实现异步发送。

### 同步发送

如果生产者需要使用同步发送的方式，只需要拿到 send 方法返回的future对象后，调用其 get() 方法即可。此时如果消息还未发送到broker中，get方法会被阻塞，等到 broker 返回消息发送结果后会跳出当前方法并将结果返回。




## 分区策略

所谓分区写入策略，即是生产者将数据写入到kafka主题后，kafka如何将数据分配到不同分区中的策略。

常见的有三种策略，轮询策略，随机策略，和按键保存策略



## 幂等性

1. 生产中，会出现各种不确定的因素，比如在Producer在发送给Broker的时候出现网络异常，此时，Producer端触发重试机制，将消息重新发送给Broker，Broker接收到消息后，再次将该消息追加到消息流中，然后成功返回Ack信号给Producer。这样下来，消息流中就被重复追加了两条相同的消息
2. Kafka为了实现幂等性，它在底层设计架构中引入了ProducerID和SequenceNumber
   1. ProducerID：在每个新的Producer初始化时，会被分配一个唯一的ProducerID，这个ProducerID对客户端使用者是不可见的。
   2. SequenceNumber：对于每个ProducerID，Producer发送数据的每个Topic和Partition都对应一个从0开始单调递增的SequenceNumber值。
   3. 当broker遇到想同的pid和snumber时，就会认为当前消息是重复的，不再写入
3. 其实：客户端在生成Producer时，会实例化如下代码,此时，会生成PID

```java
Producer<String, String> producer = new KafkaProducer<>(props);
```



# 消息消费

## 自动提交

kafka的消息消费位置 offset我们称之为位移

当每一次调用poll()方法时，它返回的是还没有消费过的消息集 ，要做到这一点，就需要记录上一次消费时的消费位移。并且这个消费位移必须做持久化保存（提交） ，默认情况下Kafka的消费位移提交是**自动提交** ，而且**定期提交**，这个定期的周期时间由客户端参数auto.commit.interval.ms配置，默认值为5秒  

所以，这个定期提交就会带来两个问题

1. 重复消费：当我消费到某个位置时，没有定期提交，kafka挂了，这个时候，就会重新消费
2. 消息丢失：当我批量poll某些消息时，只成功消息了一部分，而kafka定期提交，记录消费了全部，则此时就会造成其他一些消息的丢失



### 原生的客户端消费

在单独使用Kafka的java客户端将位移提交的模式更改为手动位移提交，那么我们就需要显示的调用consumer的方法完成位移提交 

> 代码示例

```java
Properties properties = new Properties();
properties.put("key.deserializer", StringDeserializer.class.getName());
properties.put("value.deserializer", StringDeserializer.class.getName());
properties.put("bootstrap.servers", "192.168.1.132:9092");
properties.put("group.id", "laoxiao");
//是否自动提交
properties.put("enable.auto.commit", "false");
KafkaConsumer<Object, Object> consumer = new KafkaConsumer<>(properties);
consumer.subscribe(Collections.singleton("my_test"));
while (true) {
    ConsumerRecords<Object, Object> records = consumer.poll(Duration.ofMillis(1000));
    for(ConsumerRecord record : records) {
        //此刻如果手动提交，则会重复消费
        System.out.println(record.value());
        consumer.commitAsync(new OffsetCommitCallback() {
            @Override
            public void onComplete(Map<TopicPartition, OffsetAndMetadata> offsets, Exception exception) {
                //提交的位移
                System.out.println(offsets);
            }
        });
    }
```

### spring boot配置

```properties
# kafka配置
spring:
  kafka:
    consumer:
      bootstrap-servers: 192.168.1.132:9092
      # 手动提交模式
      enable-auto-commit: false
    listener:
      # listner负责ack，每调用一次，就立即commit
      ack-mode: manual_immediate
```

虽然enable-auto-commit设置为false，当时spring boot 任然有自己的提交模式，具体配置在ack-mode中

常见的提交模式是在ContainerProperties.AckMode这个枚举类中定义。AckMode针对ENABLE_AUTO_COMMIT_CONFIG=false时生效，有以下几种：
RECORD : 每处理一条commit一次
BATCH : 每次poll的时候批量提交一次，频率取决于每次poll的调用频率
TIME : 每次间隔ackTime的时间去commit
COUNT : 累积达到ackCount次的ack去commit
COUNT_TIME: ackTime或ackCount哪个条件先满足，就commit
MANUAL : listener负责ack，但是背后也是批量上去
MANUAL_IMMEDIATE : listner负责ack，每调用一次，就立即commit  

`所以，想要手动ack，还得自己配置 ack-mode: manual_immediate`

> 代码示例

```java
@KafkaListener(topics = "my_test" , groupId = "laoxiao")
public void consumerHandler(String msg , KafkaConsumer consumer) {
    log.info("消费数据：{}", msg);
    consumer.commitAsync(new OffsetCommitCallback() {
        @Override
        public void onComplete(Map<TopicPartition, OffsetAndMetadata> offsets, Exception exception) {
            log.info(offsets.toString());
        }
    });
}
```
## 生产者发送途中出现问题

在消息发送的过程中，涉及到了两个线程——main线程和Sender线程，以及一个线程共享变量RecordAccumulator。main线程将消息发送给RecordAccumulator，Sender线程会根据指定的条件，不断从RecordAccumulator中拉取消息发送到Kafka broker

![image-20220103103409345](./image/20220103103413.png)



Sender线程拉取消息的条件

1. 缓冲区大小达到一定的阈值（默认是16384byte），可以通过spring.kafka.producer.batch-size进行设定  
2. 缓冲区等待的时间达到设置的阈值（默认是0）， 可以通过linger.ms属性进行设定  

### 发送消息的三种方式

> 发送消息的三种方式  

只管往kafka发送消息（消息只发送到缓冲区）而并不关心消息是否正确到达。正常情况没什么问题，不过有些时候（比如不可重试异常）会造成消息的丢失。

```java
kafkaTemplate.send("my_test", "测试java发送数据");
```

> 同步消息发送 
```java
kafkaTemplate.send("my_test", "测试java发送数据").get();
```

> 异步发送

```java
public static void synSendMessage(KafkaTemplate kafkaTemplate) {
    kafkaTemplate.send("my_test" , "测试java发送异步数据").addCallback(obj -> {
        System.out.println("发送成功结果" + ((SendResult)obj).getProducerRecord().value());
    } , t -> System.out.println("失败结果:" + t.getMessage()));
}
```

# 数据生产流程

![image-20251021222431316](image/kafka/image-20251021222431316.png)

1. Producer创建时，会创建一个Sender线程并设置为守护线程。
2. 生产消息时，内部其实是异步流程；生产的消息先经过拦截器->序列化器->分区器，然后将消息缓存在缓冲区（该缓冲区也是在Producer创建时创建）。
3. 批次发送的条件为：缓冲区数据大小达到batch.size或者linger.ms达到上限，哪个先达到就算哪个。
4. 批次发送后，发往指定分区，然后落盘到broker；如果生产者配置了retrires参数大于0并且失败原因允许重试，那么客户端内部会对该消息进行重试。注意，重试的消息会放在缓冲区的队尾，此时消息的有序性会被打乱，所以，有序消息不能分批发送
5. 落盘到broker成功，返回生产元数据给生产者，元数据返回有两种方式：一种是通过阻塞直接返回，另一种是通过回调返回

# 心跳机制

## 什么是心跳机制

Kafka 的心跳机制是一个**健康检查**和**会话维持**机制。消费者客户端会定期向 Group Coordinator（组协调者，通常是某个 Broker）发送一个简短的心跳包，以此来告知协调者：“我还活着，并且仍在活跃地处理消息”。

Group Coordinator 负责管理消费者组的成员关系（如重新平衡 Rebalance）。它通过心跳来判断一个消费者是否已经“死亡”或“僵死”。

所以，客户端和服务端发现心跳超期，都会触发rebalance的过程

# 订阅解析

## 消费者组

- 每个消费者都属于一个消费者组。
- 一个主题的每个分区只能被同一个消费者组内的一个消费者消费。
  - 避免重复消费（用rocketMQ）
- 不同消费者组可以独立消费同一个主题，互不影响。

## 重平衡

当消费者组内的消费者数量发生变化（如消费者加入或离开）时，Kafka会触发重平衡，重新分配分区给消费者。重平衡期间，消费者无法消费消息，因此应尽量避免不必要的重平衡

## 消费方式

consumer 采用 pull 模式从 broker 中读取数据

采用 pull 模式，consumer 可自主控制消费消息的速率， 可以自己控制消费方式（批量消费/逐条消费)，还可以选择不同的提交方式从而实现不同的传输语义。

所以，他的延迟相对rocketMQ高一些

但pull的方式，更适合大批量的数据，因为可以自主的选择pull 哪些数据

所以他的吞吐量更大

# 事务消息

## 特性

- **原子性**：事务性消息要么完全成功，要么完全失败。这确保了消息不会被部分处理。
- **可靠性**：一旦消息被写入Kafka，它们将被视为已经处理，即使发生了应用程序或系统故障。

##  生产者配置

acks：这是有关生产者接收到确认之后才认为消息发送成功的设置。对于事务性消息，通常将其设置为acks=all，以确保消息仅在事务完全提交后才被视为成功发送。

transactional.id：这是用于标识生产者实例的唯一ID。在配置文件中设置transactional.id是启用事务性消息的关键步骤。是生产者级别的全局唯一标识，**一个生产者对应一个固定的 `transactional.id`**，用于标识事务的连续性

enable.idempotence：幂等性是指相同的消息不会被重复发送。对于事务性消息，通常将其设置为enable.idempotence=true，以确保消息不会重复发送。

```java
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.Producer;
import org.apache.kafka.clients.producer.ProducerConfig;
import java.util.Properties;

public class MyKafkaProducer {
    public static Producer<String, String> createProducer() {
        Properties properties = new Properties();
        properties.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        properties.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringSerializer");
        properties.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringSerializer");
        properties.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "my-transactional-id");

        return new KafkaProducer<>(properties);
    }
}

```

```java
//开启事务
producer.beginTransaction();
//发送消息
producer.send(new ProducerRecord<>("my-topic", "key1", "value1"));
producer.send(new ProducerRecord<>("my-topic", "key2", "value2"));

//对事务进行回滚或者提交处理
try {
    producer.commitTransaction();
} catch (ProducerFencedException | OutOfOrderSequenceException | AuthorizationException e) {
    // 处理异常，通常中止事务并重试
    producer.close();
} catch (CommitFailedException e) {
    // 事务提交失败，通常中止事务并重试
    producer.close();
}


```



# 顺序消费

消息的可靠性传输可以保证秒杀业务的公平性。关于秒杀业务的公平性，我们还需要考虑一点：消息的顺序性  

只需要确保**要求顺序性的若干消息发送到同一个** partiton，即可满足其顺序性。并且在进行消息消费的时候，需要确保消费者是进行单线程消费。  

# Kafka秒杀不超卖保证

 ## 生产端消息重复

生产者发送的消息没有收到正确的broke响应，导致producer重试。producer发出一条消息，broker落盘以后因为网络等种种原因发送端得到一个发送失败的响应或者网络中断，然后producer收到一个可恢复的Exception重试消息导致消息重复  

> 解决方案

1. 启动kafka的幂等性  
2. retries=0，不重试 （可能会丢消息(一般不会使用)，适用于吞吐量指标重要性高于数据丢失  ）
   1. 开启幂等性的方式比较简单，我们只需要设置enable.idempotence**参数为**true就可以了  
   2. 幂等性配置不能夸分区实现 

# Kafka生产者幂等性

生产者幂等性主要避免生产者数据重复提交至Kafka broker中并落盘。在正常情况下，Producer向Broker发送消息，Broker将消息追加写到对应的流（即某一Topic的某一Partition）中并落盘，并向Producer返回ACK信号，表示确认收到。但是Producer和Broker之间的通信总有可能出现异常，如果消息已经写入，但ACK在半途丢失了，Producer就会进行retry操作再次发送该消息，造成重复写入

1. PID。每个新的Producer在初始化的时候会被分配一个唯一的PID，这个PID对用户是不可见的
2. Sequence Numbler。对于每个PID，该Producer发送数据的每个都对应一个从0开始单调递增的Sequence Number
3. Broker端在缓存中保存了这seq number,对于接收的每条消息,如果其序号比Broker缓存中序号大于1则接受它,否则将其丢弃,这样就可以实现了消息重复提交了.
   1. 但是如果其他服务也提交了同样的消息，那么就需要业务上处理了

Producer使用幂等性的示例非常简单,与正常情况下Producer使用相比变化不大,只需要 把Producer的配置enable.idempotence设置为true即可,如下所示:

```java
Properties props = new Properties();
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, "true");
//当enable.idempotence为true时acks默认为 all
// props.put("acks", "all");
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
KafkaProducer producer = new KafkaProducer(props);
producer.send(new ProducerRecord(topic, "test");
```

# Kafka缺点

1. 由于是批量发送，数据并非真正的实时
2. 仅支持统一分区内消息有序，无法实现全局消息有序；
3. 监控不完善，需要安装插件；
4. 依赖zookeeper进行元数据管理；3.0版本去除，4.0实现了自己的注册中心
