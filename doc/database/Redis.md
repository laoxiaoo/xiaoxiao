 

# 数据结构







### 应用场景


## HASH(哈希)











##





# 事务

## 基本操作

- Redis单条命令保证原子性，但是事务不保证原子性
- Redis事务没有隔离级别概念
- Redis事务本质：一组命令，在队列中，按照顺序执行

- Redis事务
  - 开启事务：MULTI 
  - 命令入队
  - 执行事务

```shell
## 事务开启
127.0.0.1:6379> MULTI
OK
## 入队操作
127.0.0.1:6379(TX)> set k1 v1
QUEUED
127.0.0.1:6379(TX)> set k2 v2
QUEUED
## 执行命令
127.0.0.1:6379(TX)> EXEC
1) OK
2) OK

```

- 放弃事务
  - 事务里的命令不会执行

```shell
127.0.0.1:6379> MULTI
OK
127.0.0.1:6379(TX)> set k3 v3
QUEUED
127.0.0.1:6379(TX)> DISCARD
OK
```

- 错误
  - 命令错误，其他命令不会执行
  - 运行时异常，其他命令照样执行

## Redis乐观锁

- 乐观锁的实现，必须基于WATCH，然后利用redis的事务。

1. 开启监控money
   1. 监控了这个键后，如果其他线程修改了这个键，那么事务执行的时候就会失败
2. 开启事务

```shell
127.0.0.1:6379> set money 100
OK
## 监控money
127.0.0.1:6379> WATCH money
OK
127.0.0.1:6379> MULTI
OK
## 执行新增的时候，在另一个线程执行加20
127.0.0.1:6379(TX)> INCRBY money 10
QUEUED
##执行命令的时候发现money值改了，不再进行修改
127.0.0.1:6379(TX)> EXEC
(nil)
127.0.0.1:6379> get money
"120"
## 解除监控 （ps：执行失败要先解锁，再执行watch）
127.0.0.1:6379> UNWATCH
OK
```

## 秒杀案例

- 秒杀场景：库存-1， 人数+1

### 基于乐观锁

**错误示例**

1. 查验库存还够不够
2. 开启乐观锁监听，然后开启事务
3. 扣除库存
4. 执行事务命令，如果成功返回的不是null，则将用户设置进入用户set集合

```java
sendUserNumber.incrementAndGet();
String userId = IdUtil.simpleUUID();
redisTemplate.setEnableTransactionSupport(true);
long inventory = Long.parseLong(redisTemplate.opsForValue().get("px:inventory").toString());
if(inventory <= 0) {
    log.debug("==>库存不够....");
    return;
}
redisTemplate.watch("px:inventory");
redisTemplate.multi();
try {
    redisTemplate.opsForValue().decrement("px:inventory");
} finally {
    List list = redisTemplate.exec();
    Optional.ofNullable(list).filter(var -> var.size()>0).ifPresent( var -> {
        log.debug("用户 {} 抢到商品", userId);
        getUserNumber.incrementAndGet();
        redisTemplate.opsForSet().add("px:user", userId);
    });
}
```

- 问题：

1. 库存问题，即有200个库存，2000个用户抢，可是只消耗了30个
2. 并发问题，虽然执行操作是乐观锁，但是，获取和执行库存-1不是原子操作

### lua脚本模式

1. 通过lua脚本保证原子性，在脚本里对库存-1 和 对用户集合的添加

```java
String userId = IdUtil.simpleUUID();
String lua = "local num = redis.call('get', KEYS[1])\n" +
    "if tonumber(num) <= 0 then\n" +
    "\treturn -1\n" +
    "else\n" +
    "\tredis.call('decr', KEYS[1])\n" +
    "redis.call(\"sadd\", KEYS[2], KEYS[3])\n" +
    "\treturn 1\n" +
    "end";
Object obj = redisTemplate.execute((RedisCallback) (connection) -> {
    return connection.eval(lua.getBytes(StandardCharsets.UTF_8), ReturnType.MULTI,
                           3,
                           "px:inventory".getBytes(StandardCharsets.UTF_8),
                           "px:user".getBytes(StandardCharsets.UTF_8),
                           userId.getBytes(StandardCharsets.UTF_8));
});
Optional.ofNullable(obj).map(var -> (List<Long>) var)
    .filter(var -> var.size()>0)
    .map(var -> var.get(0))
    .ifPresent(var -> {
        if(var.compareTo(1L) == 0) {
            getUserNumber.incrementAndGet();
        }
    });
```

- 脚本示例：

```lua
local num = redis.call('get', KEYS[1])
if num == 0 then
	return -1
else
	# 扣减活动库存
	redis.call('decr', KEYS[1])
    # 设置用户信息
    redis.call("sadd", KEYS[2], KEYS[3])
	return 1
end
```





##########APPEND ONLY MODE (另一种持久化模式)
## 默认不开启AOF
appendonly no
## 持久化文件
appendfilename "appendonly.aof"

### 同步机制
## 每次修改都写入（速度慢）
# appendfsync always
## 每一秒同步
appendfsync everysec
## 不执行sync， 操作系统自己同步
# appendfsync no





# Redis 持久化

## RDB模式



- bgsave
  - 执行该命令时，Redis会在后台异步进行快照操作，快照同时还可以响应客户端请求
  - 具体操作是Redis进程执行fork操作创建子进程，RDB持久化过程由子进程负责，完成后自动结束。阻塞只发生在fork阶段，一般时间很短。基本上 Redis 内部所有的RDB操作都是采用 bgsave 命令

```shell
127.0.0.1:6379> BGSAVE
Background saving started
```

- 自动触发
  - 自动触发是由我们的配置文件来完成的
- 如何恢复
  - 将rdb文件放到对应文件下，redis启动会自动检查

```shell
127.0.0.1:6379> config get dir
1) "dir"
2) "/root"  ### 这个目录下存在rdb文件，就会恢复
```

- 优点
  - 适合大规模的数据恢复
  - 数据完整性要求不高，（在没有触发save规则的时候宕机，数据就没了）
- 缺点
  - 数据可能丢失（在没有触发save规则的时候宕机，数据就没了）
  - fork进程会占用空间

## AOP

- AOF持久化是通过保存Redis所执行的写命令来记录数据库状态的

# 主从复制

- 只一个redis服务器的数据，复制到其他redis服务器
- 数据复制是单向的，只能 master -> slave
- 主从复制作用
  - 数据热备份，数据故障修复
  - 负载均衡，主节点写，从节点进行读操作
  - 高可用（防止一台服务器宕机）

## 环境配置

- 查看当前库信息

```shell
127.0.0.1:6379> info replication
# Replication
role:master
connected_slaves:0
master_failover_state:no-failover
master_replid:413efdc5cccbb10f3430d1d012b52fed3209db1c
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:0
second_repl_offset:-1
repl_backlog_active:0
repl_backlog_size:1048576
repl_backlog_first_byte_offset:0
repl_backlog_histlen:0
```

- 复制三个配置文件

```shell
[root@localhost redis-6.2.1]# cp redis.conf redis79.conf
[root@localhost redis-6.2.1]# cp redis.conf redis80.conf
[root@localhost redis-6.2.1]# cp redis.conf redis81.conf
```

- 修改每个配置文件

```conf
port 6380
pidfile /var/run/redis_6380.pid
logfile "log-80.log"
dbfilename dump80.rdb
dir ./data/
```

## 一主二从

### 通过命令配置

- 不是永久的

- 从机找主机，配置

```shell
127.0.0.1:6380> SLAVEOF 192.168.1.131 6379
OK
### 能够看到6379有两个从机
127.0.0.1:6379> info replication
# Replication
role:master
connected_slaves:2
slave0:ip=192.168.1.131,port=6381,state=online,offset=42,lag=0
slave1:ip=192.168.1.131,port=6380
```

### 配置文件配置

```shell
### 配置主机的ip 和端口
# replicaof <masterip> <masterport>
### 配置主机的密码
# masterauth <master-password>

```

### 特性

- 主机可以写，从机不能写只能读
- 所有主机的信息都会被从机保存

```shell
## 从机只能读
127.0.0.1:6380> set name laoxiao1
(error) READONLY You can't write against a read only replica.
```

- 第一次连接主机，slave会发生全量复制，接收master的数据库文件数据
- 后面的新增，则发生的是增量复制

### 手动的从机变主机

```shell
127.0.0.1:6379> SLAVEOF no one
```

# 哨兵模式

- 通过发送命令，让Redis服务器返回监控其运行状态，包括主服务器和从服务器
- 当哨兵监测到**master宕机，会自动将slave切换成master**，然后通过**发布订阅模式**通知其他的从服务器，修改配置文件，让它们切换主机

### 单哨兵模式

![](../image/redis/57a77ca2757d0924.webp)

- 配置sentinel配置
  - port:端口
  -  redis-master:自定义监控主节点名称， 
  - 1：至少有一个sentinel来投票才能成为主节点，这里单哨兵，所以为1

```shell
[root@localhost conf]# vim sentinel.conf

port 26379
Sentinel monitor redis-master 127.0.0.1 6379 1
```

- 启动配置文件，能看到配置文件

```shell
[root@localhost redis-6.2.1]# redis-sentinel conf/sentinel.conf
```

```console
16816:X 27 Mar 2021 00:54:35.398 # +monitor master redis-master 127.0.0.1 6379 quorum 1
16816:X 27 Mar 2021 00:54:35.399 * +slave slave 192.168.1.131:6381 192.168.1.131 6381 @ redis-master 127.0.0.1 6379
16816:X 27 Mar 2021 00:54:35.400 * +slave slave 192.168.1.131:6380 192.168.1.131 6380 @ redis-master 127.0.0.1 6379
```

- 关闭主节点，稍等能看到从节点有一个选举为主节点

```
16816:X 27 Mar 2021 00:56:35.055 * +slave slave 127.0.0.1:6379 127.0.0.1 6379 @ redis-master 192.168.1.131 6381
```



### 多哨兵模式

![](../image/redis/3f40b17c0412116c.webp)

### 常用配置

```shell
## 告诉sentinel去监听地址为ip:port的一个master，这里的master-name可以自定义，quorum是一个数字，指明当有多少个sentinel认为一个master失效时，master才算真正失效
sentinel monitor <master-name> <ip> <redis-port> <quorum>

## 设置连接master和slave时的密码，注意的是sentinel不能分别为master和slave设置不同的密码，因此master和slave的密码应该设置相同
sentinel auth-pass <master-name> <password>

## 这个配置项指定了需要多少失效时间，一个master才会被这个sentinel主观地认为是不可用的。 单位是毫秒，默认为30秒
sentinel down-after-milliseconds <master-name> <milliseconds> 

## 发生failover主备切换时最多可以有多少个slave同时对新的master进行 同步，这个数字越小，完成failover所需的时间就越长，但是如果这个数字越大，就意味着越 多的slave因为replication而不可用。可以通过将这个值设为 1 来保证每次只有一个slave 处于不能处理命令请求的状态
sentinel parallel-syncs <master-name> <numslaves> 

##  同一个sentinel对同一个master两次failover之间的间隔时间
##  当一个slave从一个错误的master那里同步数据开始计算时间。直到slave被纠正为向正确的master那里同步数据时
## 默认3分钟
sentinel failover-timeout <master-name> <milliseconds>
```

# Redis 缓存过期淘汰策略

- 定期删除： 每隔一段时间，去随机抽取，看有没有需要删除的key
- 惰性删除：被使用的时候，如果需要删除则删除

如果内存快满了，则还有兜底策略，就是上面提到的内存配置策略

 volatile-lru ->对所有设置了过期时间的key使用LRu算法进行删除
 allkeys-lru -> **对所有key使用LRU算法进行删除**（一般生产使用）
 volatile-lfu -> Evict using approximated LFU, only keys with an expire set.
 allkeys-lfu -> 对所有key使用LRu算法进行删除
 volatile-random -> 对所有过期key随机删除
 allkeys-random -> 对所有key随机删除
 volatile-ttl -> 对所有设置了过期时间的key随机删除
 noeviction ->不会驱逐任何key

# 源码解析

- 每个链表都是用adlist.h来表示

```c
typedef struct listNode {
    //上一个节点
    struct listNode *prev;
    //后置节点
    struct listNode *next;
    //节点值
    void *value;
} listNode;
```



# Redis为什么快

**首先，采用了多路复用io阻塞机制**
**然后，数据结构简单，操作节省时间**
**最后，运行在内存中，自然速度快**

# Redis Cluster（集群）

Redis的哨兵模式基本已经可以实现高可用，读写分离 ，但是在这种模式下每台redis服务器都存储相同的数据，很浪费内存，因为一个master节点并不能放海量数据，而且单个Redis的实例过大时，会导致rdb文件过大，当执行主从同步时时间过长，所以在redis3.0上加入了cluster模式，实现的redis的分布式存储，也就是说每台redis节点上存储不同的内容。

> Redis-Cluster采用无中心结构,它的特点如下

- 所有的redis节点彼此互联(PING-PONG机制),内部使用二进制协议优化传输速度和带宽。
- 节点的fail是通过集群中超过半数的节点检测失效时才生效。
- 客户端与redis节点直连,不需要中间代理层.客户端不需要连接集群所有节点,连接集群中任何一个可用节点即可。