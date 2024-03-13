#
# 常用规则

1. *键命名规范*：通常，公司用：：来代表一个级别

2. redis key 值是二进制安全的，这意味着可以用任何二进制序列作为key值

*key取值原则*：

1. 键值不需要过长，会消耗内存
2. 键值不宜太短，可读性差
3. 一个字符类型的值最多能存512M字节的内容

# 设置某个文章的阅读量

自增,自减

```
127.0.0.1:6379> INCR count
(integer) 1
127.0.0.1:6379> DECR count
(integer) 0
```

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

*如果订阅了某个公众号，则这个公众号发布文章时推送文章给该用户*

往当前用户的可以阅读文章list里push这个文章id，当用户打开公众号时，从当前集合中pop出来文章id

```shell
lpush article:用户id 文章id
```

# Set集合的应用场景

## 用户之间的共同关注

- A用户的关注放一个SET集合，B用户关注的放到一个set集合
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

# 有序集合应用

## 积分排行

### 数据库的实现方式

> 积分表设计

```sql
CREATE TABLE `t_integral` (
	`id` INT NOT NULL,
	`user_id` INT NOT NULL COMMENT '用户id',
	`integral` INT NOT NULL COMMENT '积分',
	`integral_type` INT NOT NULL COMMENT '积分类型'
)
COMMENT='积分表'
COLLATE='utf8mb4_general_ci'
;
```

> 实现排行版

*8.0版本*：

```sql
SELECT user_id, SUM(integral) integral 
,RANK() OVER(ORDER BY SUM(integral) DESC) ranks 
FROM t_integral
GROUP BY user_id
ORDER BY ranks desc
```

*低版本*:

```sql
SELECT user_id, SUM(integral) integral 
,@rank_num := @rank_num + 1 AS rank_num 
FROM t_integral,(SELECT @rank_num := 0) r
GROUP BY user_id
ORDER BY rank_num desc
```

> 查询当前用户的排行榜

```sql
SELECT * FROM 
(SELECT user_id, SUM(integral) integral 
,@rank_num := @rank_num + 1 AS rank_num 
FROM t_integral,(SELECT @rank_num := 0) r
GROUP BY user_id
ORDER BY rank_num DESC) A
WHERE A.user_id=1
```

### Redis实现方式

在数据库插入口，插入redis(当有积分时，往这个用户上添加积分)

```shell
ZINCRBY test_sort sort 积分 user_id
```

> 取前20的积分

就是取某个范围

```shell
ZRANGE test_sort 0 19
```

> 获取成员的积分

```shell
 ZSCORE test_sort user_id
```

> 查询当前用户排多少名

```shell
ZREVRANK test_sort user_id
```



`如果取倒数的排行咋办?`

这种需求很少见，但是，可以将积分取值负数，然后就是倒叙了

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



# HashMap应用

## 购物车功能

`如果需要考虑购物车顺序等操作，则可以往hash里存入对象`这样的操作性能会低一点

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

# 用户签到功能

> 数据库设计

| 字段            | 描述         |
| --------------- | ------------ |
| user_id         | 用户id       |
| sign_date       | 签到日期     |
| continuous_date | 连续签到天数 |

> Redis设计

采用 Bitmap 位运算的操作来存储签到的数据

可以按按月来存储， 哪天签到=1

```shell
## 设置第一天 第三天签到（设置第几个index=1）
127.0.0.1:6379> SETBIT u1:month 0 1
(integer) 0
127.0.0.1:6379> SETBIT u1:month 2 1
(integer) 0
##获取第二天和第三天有没有签到（默认0）
127.0.0.1:6379> GETBIT u1:month 1
(integer) 0
127.0.0.1:6379> GETBIT u1:month 2
(integer) 1
## 获取用户签到天数
127.0.0.1:6379> BITCOUNT u1:month 
(integer) 2
```

## 获取连续签到次数

> 判断自己是否有没有**签到**

有一种方式就是， 将取到的二进制，右移一位，再左移一位，和自己进行比较，如果相等，表示未签到

如：

```shell
## 这里有七天签到
1001110
## 右移一位
0100111
## 再左移一位
1001110
### 1001110 和 1001110 发现相等，表示最后一位不是1,没有签到
```

> 连续签到伪代码

```java
int getCount(int day, int userid) {
    //通过BITFIELD 获取day天的签到数据
    var data = "BITFIELD userid 0 day";
    //循环比对
    int sign = 0;
    for(int i=day; i>0; i--) {
        if(data>>1<<1 == data ) {
            //如果不是今天，则跳出循环，表示断签了
            if(i!=data) break;
        } else {
            sign++;
        }
        //右移一位,计算昨天有没有签到
        data = data >>1
    }
}
```



# 网站用户的上线次数统计

> （活跃用户），统计用户的活跃信息， 活跃 0 不活跃 1

- 网站用户的上线次数统计（活跃用户）

- 用户id作为key，天作为offset，上线置为1

- 例如：id为500的用户，今年第1天上线、第30天上线

  setbit u500 1 1

  setbit u500 30 1

  *获取上线次数*：bitcount u500



# 网页的UV

基数：一组集合中，不重复的数据量

- 网页的UV(一个人访问网站多次，但还是算作一个人访问)
  - 传统方式：使用set保存userId---但是用户的数量大，就有弊端
  - Hyperloglog：占用内存固定，2^64不同的元素，只需要12kb，但是有0.81%的错误率

```shell
PFADD key element [element ...]

## 存入用户
127.0.0.1:6379> PFADD uv user1 user2 user3 user4 user5
(integer) 1
## 统计
127.0.0.1:6379> PFCOUNT uv
(integer) 5

##合并两个集合
127.0.0.1:6379> PFADD uv2 user3 user 5 user6
(integer) 1
127.0.0.1:6379> PFMERGE uv3 uv uv2
OK

```

# List 分页

Redis 的列表索引是从 0 开始的，也就是说，列表的第一个元素的索引是 0，第二个元素的索引是 1，依此类推。这是 LRANGE 命令的起始索引的计算方式。

LRANGE 命令也支持负数索引，表示从列表的右边开始计算索引。例如，-1 表示列表的最后一个元素，-2 表示倒数第二个元素，依此类推。

当进行分页时，可以通过计算每页的元素数量和当前页码来确定起始索引和结束索引。
例如，如果每页显示 10 个元素，
当前是第 2 页，那么起始索引就是 (页码 - 1) * 每页元素数量，即 (2 - 1) * 10 = 10，
结束索引则是 起始索引 + 每页元素数量 - 1，即 10 + 10 - 1 = 19。
所以，要获取第 2 页的数据，可以使用 LRANGE list 10 19 命令。