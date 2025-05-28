# 基本概念

## 体系结构

![](./image/20200304201300.jpg)

- producer：消息生存者,负责创建消息，投递kafka

- consumer：消息消费者，连接kafka接收消息，进而进行相应的业务逻辑处理

- Topic: 消息的分类，每条消息都属于一个特定的 Topic。用户可以通过 Topic 来组织和管理消息。

- broker：

  kafka 集群的 server，(其实就是一台机器)负责处理消息读、写请求，存储消息

  一般topic的partion的数量和broker集群数量一致（如果partion数量大于broker，可能会导致一个broker有多个同一topic的partion，导致数据分布不均匀）

- **分区（Partition）**：为了实现扩展性，一个非常大的 topic 可以分布到多个 broker(即服务器)上， 一个 topic 可以分为多个 partition，每个 partition 是一个有序的队列;

  **副本（Replica）**：副本，为保证集群中的某个节点发生故障时，该节点上的 partition 数据不丢失，且 kafka 仍然能够继续工作，kafka 提供了副本机制，一个 topic 的每个分区都有若干个副本， 一个 **leader** 和若干个 **follower**。

## 分区和主题

> topic：主题（抽象概念），kafka消息以主题为单位进行归类

​		     生产值将消息发送特定主题，消费者负责订阅主题进行消费

​			 代表一个类别，如果把Kafka看做为一个数据库，topic可以理解为数据库中的一张表，topic的名字即为表名  

> partition ：分区（物理概念）

一个主题下可以有多个分区，**offset是分区的唯一表示，保证了消息的顺序性**

partition中的数据是有序的,在需要严格保证消息的消费顺序的场景下，需要将partition数目设为1  

![](./image/20200304203436.jpg)

分区可以分布在不同的服务器上（**一个主题可以跨越多个broker**）

# 安装

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

# 基本命令

## 创建一个topic

- replication-factor： 副本因子（表示每一个分区拥有的副本数量）

```shell
[root@node2 kafka]# ./bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic mytest
Created topic mytest.
```

## 查看topic

```shell
[root@node2 kafka]# ./bin/kafka-topics.sh --list --bootstrap-server=127.0.0.1:9092
mytest

# 查看具体描述
[root@node2 kafka]# ./bin/kafka-topics.sh --describe --bootstrap-server=127.0.0.1:9092
Topic: mytest	TopicId: lHL_52IoSSWPJDRecdDctA	PartitionCount: 1	ReplicationFactor: 1	Configs: segment.bytes=1073741824
	Topic: mytest	Partition: 0	Leader: 0	Replicas: 0	Isr: 0

```

## 消费数据

```sh
 ./bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --from-beginning --topic my-replicated-topic
```

# 消息生产

## 发送模式

### 异步发送

对于生产者的异步发送来说就是，我发送完当前消息后，并不需要你将当前消息的发送结果立马告诉我，而是可以随即进行下一条消息的发送。但是我会允许添加一个回调函数，接收你后续返回的发送结果。异步发送这块我们直接调用kafkaProducer的send方法即可实现异步发送。

### 同步发送

如果生产者需要使用同步发送的方式，只需要拿到 send 方法返回的future对象后，调用其 get() 方法即可。此时如果消息还未发送到broker中，get方法会被阻塞，等到 broker 返回消息发送结果后会跳出当前方法并将结果返回。






## 分区策略

所谓分区写入策略，即是生产者将数据写入到kafka主题后，kafka如何将数据分配到不同分区中的策略。

常见的有三种策略，轮询策略，随机策略，和按键保存策略



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
