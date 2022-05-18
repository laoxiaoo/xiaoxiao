# 常用规则

1. *键命名规范*：通常，公司用：：来代表一个级别

2. redis key 值是二进制安全的，这意味着可以用任何二进制序列作为key值

*key取值原则*：

1. 键值不需要过长，会消耗内存
2. 键值不宜太短，可读性差
3. 一个字符类型的值最多能存512M字节的内容

# 分布式锁

1. 利用过期的键，可以做分布式的锁

*设置一个锁，过期时间为10秒*

*NX: 如果存在则为nil，不存在则插入*

```shell
SET lock1 1 ex 10 NX
```

如：当前锁的线程id=1 锁的过期时间=10

```shell
## 当前锁
127.0.0.1:6379> set lock1 1 ex 10
OK
127.0.0.1:6379> ttl lock1
(integer) 4
```

## 简单的锁实现

> 存在问题
>
> 1. 业务时间大于锁时间问题
> 2. redis异步复制造成的锁丢失,比如:主节点没来的及把刚刚set进来这条数据给从节点，就挂了。
>    1. 一主多从的情况(`如果Master挂了，此时没有将当前值推送slaves，则此时会有问题`)
>    2. 因为redis集群是ap原则

```java
public static final String KEY = "lock:key";

/**
 * 加锁操作，value可以添加自己的线程 <br/>
 * 目的是为了能够在将来，防止其他线程删除本线程的锁
 */
public  String lock() {
    String value = UUID.randomUUID().toString()+Thread.currentThread().getId();
    Boolean bool = redisTemplate.opsForValue().setIfAbsent(KEY, value, 60L, TimeUnit.SECONDS);
    if(bool) {
        return value;
    } else {
        return "";
    }

}

public void  unlock(String value) {
    String script = "local value = redis.call('get', KEYS[1])\n" +
            "if value == KEYS[2] then\n" +
            "\tredis.call('del', KEYS[1])\n" +
            "\treturn 1\n" +
            "else \n" +
            "\treturn 0 end";
    Object res = redisTemplate.execute(new RedisCallback<Long>() {
        @Override
        public Long doInRedis(RedisConnection connection) throws DataAccessException {
            return connection.eval(script.getBytes(StandardCharsets.UTF_8), ReturnType.INTEGER, 2, KEY.getBytes(StandardCharsets.UTF_8), value.getBytes(StandardCharsets.UTF_8));
        }
    });
    System.out.println(res);
}	
```

> lock为什么要存入线程id?
>
> `当unlock删除的时候，如果不判断是否是当前线程key,可能就会删除其他线程加锁的`
>
> unlock为什么要使用lua脚本
>
> `为了保证判断线程id和删除key是原子操作`

# 某个文章进行点赞

- 利用*set* 的INCR count自增
- 点一次赞执行下命令

# 集合的应用场景

## 队列

LPUSH  RPOP



## 栈

LPUSH LPOP



## 订阅的文章推送

*如果订阅了某个公众号，则这个公众号发布文章时*

往当前用户的可以阅读文章list里push这个文章id，当用户打开公众号时，从当前集合中pop出来文章id

```shell
lpush article:用户id 文章id
```

# Set集合的应用场景

## 用户之间的共同关注

- A用户的关注放一个集合，粉丝放一个集合
- A用户和B用户的关注求交集就是共同关注

## 抽奖活动

```shell
# 抽取某个人，还可以继续抽奖
srandmember key [count]

# 随机抽奖，删除抽奖的
SPOP key [count]
```

## 朋友圈点赞

要求：点一次是新增，点两次是取消

```shell
## 点赞
sadd 用户id:文章id  点赞用户1 点赞用户2
## 删除点赞
SREM myset 点赞用户
```

# Feed流模式

> 主要模式

*推（Push）*: **主动将数据推送到用户表中**

1. 当一个用户触发行为（比如发微博），自身行为记录到行为表中，同时也对应到这个用户的粉丝表，为每个粉丝插入一条feed
2. 但是对于粉丝过万的大V，为每个粉丝插入一条feed对存储数据成本很大。

*拉（Pull）*: **用户主动去拉取数据**

1. 当一个用户（特别是关注了很多人的）触发行为的时，拉取自己动态，检索用户的关注表，然后根据关注表检索新发的feed。
2. 如果一个用户关注过多的时候，查询该用户的关注列表也是有很大数据成本。

*推拉结合模式*:

1. 大V发动态，只同步发布动态给同时在线的粉丝

2. 离线的粉丝上线后，再去拉取动态。来完成推与拉。

# 购物车功能

`如果需要考虑购物车顺序等操作，则可以往hash里存入对象`

这样的操作性能会低一点

```shell
## 新增商品
hset shopcar:用户id 商品id 数量
## 增加某个商品的数量
hincrby shopcar:用户id 商品id
##获取商品总数
hlen shopcar:用户id
## 获取全部商品
hgetall shopcar:用户id
```

# 经纬度的应用

## 获取城市距离

```shell
127.0.0.1:6379> GEODIST china:city changsha liuyang
"65197.3795"

##计算的距离单位（km）
127.0.0.1:6379> GEOdist china:city changsha liuyang km
"65.1974"
```

## 求附近人，（以半径为中心）

- 经度， 维度：longitude， latitude
- radius：半径
- withcoord：显示经度维度
- withdist：直线距离
- COUNT：查出来的数量

*先往经纬度中设置值，利用*`GEORADIUS`求值

```shell

GEORADIUS key longitude latitude radius m|km|ft|mi [WITHCOORD] [WITHDIST] [WITHHASH] [COUNT count [ANY]] [ASC|DESC] [STORE key] [STOREDIST key]

127.0.0.1:6379> GEORADIUS china:city 112 28 200 km
1) "changsha"
2) "liuyang"
```

## 以元素为中心寻找周围城市

```shell
GEORADIUSBYMEMBER key member radius m|km|ft|mi [WITHCOORD] [WITHDIST] [WITHHASH] [COUNT count [ANY]] [ASC|DESC] [STORE key] [STOREDIST key]

# 获取长沙100km的城市
127.0.0.1:6379> GEORADIUSBYMEMBER china:city changsha 100 km withdist
1) 1) "changsha"
   2) "0.0000"
2) 1) "liuyang"
   2) "65.1974"
```

