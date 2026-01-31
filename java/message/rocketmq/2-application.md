 # 消息发送

*同步发送*:

同步发送消息是指，Producer发出⼀条消息后，会在收到MQ返回的ACK之后才发下⼀条消息。该方式的消息可靠性最高，但消息发送效率太低。  

*异步发送*:

异步发送消息是指，Producer发出消息后无需等待MQ返回ACK，直接发送下⼀条消息。该方式的消息可靠性可以得到保障，消息发送效率也可以。  

`可以通过回调异步的收到ACK响应`

*单向发送消息*:

单向发送消息是指，Producer仅负责发送消息，不等待、不处理MQ的ACK。该发送方式时MQ也不返回ACK。该方式的消息发送效率最高，但消息可靠性较差。  

## 简单代码

1. jar包引入

```xml
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-client</artifactId>
</dependency>
```

*同步发送*:

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

*异步发送*: 当成功时，会调用<b id="blue">onSuccess</b>的方法

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

# 消息消费

## 示例代码

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

## 消费模式

*Topic模式*:

广播消费模式下，`相同`Consumer Group的每个Consumer实例都接收同一个Topic的全量消息。即每条消息都会被发送到Consumer Group中的**每个Consumer **

*集群模式*

集群消费模式下，相同Consumer Group的每个Consumer实例平均分摊同一个Topic的消息。即每条消息只会被发送到Consumer Group中的某个Consumer。  不同的Group则，都会收到topic的消息

