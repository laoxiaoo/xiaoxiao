

# Java基于Redis实现指定时间段监控value是否变化
Redis提供了对键空间事件的订阅和发布功能，我们可以订阅指定的键，当键的值发生变化时，Redis会发送一个通知给订阅者


1. 订阅要监控的键，keyspace@0:，其中"0"为数据库编号，"*"表示所有键
```java

Jedis jedis = new Jedis("localhost");

// 订阅指定的键
jedis.subscribe(new JedisPubSub() {
    @Override
    public void onMessage(String channel, String message) {
        // 处理键空间通知
        handleKeySpaceNotification(channel, message);
    }
}, "__keyspace@0__:*");

```