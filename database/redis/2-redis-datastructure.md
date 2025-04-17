# 命令操作

# 字符串操作

## Set

*设置值*

```shell
127.0.0.1:6379> set name laoxiao
OK
```

*设置过期时间,查看过期时间*

```shell
127.0.0.1:6379> EXPIRE name 10
(integer) 1
127.0.0.1:6379> ttl name
(integer) 2
```

*设置过期的key*

1. 在SET命令中，有很多选项可用来修改命令的行为。 以下是SET命令可用选项的基本语法。

- EX seconds − 设置指定的到期时间(以秒为单位)。
- PX milliseconds - 设置指定的到期时间(以毫秒为单位)。
- NX - 仅在键不存在时设置键。
- XX - 只有在键已存在时才设置。

```shell
redis 127.0.0.1:6379> SET KEY VALUE [EX seconds] [PX milliseconds] [NX|XX]
```

*判断key是否存在*

```shell
127.0.0.1:6379> EXISTS name
(integer) 0
```

*移除key*

```shell
127.0.0.1:6379> MOVE name 1
(integer) 1
```

*value的自增,自减*

```shell
127.0.0.1:6379> INCR count
(integer) 1
127.0.0.1:6379> DECR count
(integer) 0
```

*替换value的内容*

```shell
127.0.0.1:6379> SETRANGE name 2 zy
(integer) 7
127.0.0.1:6379> get name
"lazyiao"
```

## mset

*表示一次可以设置多个键值对*

msetnx 是原子性的，如果一个没有设置成功，则其他键值对都设置不成功

```shell
redis 127.0.0.1:6379> MSET key1 value1 key2 value2 .. keyN valueN
```

## 替换
将下班为2开始的字符替换成zy

```shell
127.0.0.1:6379> SETRANGE name 2 zy
(integer) 7
127.0.0.1:6379> get name
"lazyiao"
```

## Redis的CAS

*getset*

- 如果存在值则进行替换

```shell
127.0.0.1:6379> GETSET key value
```

## 字符串类型的扩容

Redis的字符串是一个由字节组成的序列，跟java里面的ArrayList有点类似，采用预分配冗余空间的方式来减少内存的频繁分配，内部为当前字符串实际分配的空间capacity一般要高于实际字符串长度len。当字符串长度小于1M时，扩容都是加倍现有的空间，**如果超过1M**，扩容时一次只会多扩1M的空间。需要注意的是字符串最大长度为512M。

## 底层实现结构

Redis 中没有直接使用 C 语言的字符串，而是构建了一套自己的抽象类型，名为简单动态字符串，简称 *SDS*

![image-20230410111618376](image/image-20230410111618376.png)

*len*: 记录 buf 数组中已经使用字节的数量，也就是 SDS 类型所保存的字符串的长度。
*free*: 记录了 buf 数组中未使用的字节数量
*buf*: 是存储字节的数组

体现了用**空间换时间**的算法思想。牺牲了一些空间，来换取更快的查询效率。比如说结构体中 len 的值 5 表示这个 SDS 保存了一个五个字节长的字符串，O (1) 的时间复杂度就可以查询出结果

# List

## 基本操作

1. list命令都是L或者R开头的
2. 元素时字符串类型，列表头部和尾部增删快、元素可以重复，最多存2^32-1个元素
3. push操作,往key里面设置值，放入列表的头部

```shell
127.0.0.1:6379> LPUSH list one
(integer) 1
127.0.0.1:6379> LPUSH list 2
(integer) 2
127.0.0.1:6379> lpush list 3
(integer) 3
```

## 获取值

```shell
127.0.0.1:6379> LRANGE list 0 1
1) "3"
2) "2"
```

## 将值push到列表尾部

```shell
127.0.0.1:6379> RPush list rpu
(integer) 4
127.0.0.1:6379> LRANGE list 0 -1
1) "3"
2) "2"
3) "one"
4) "rpu"
```

## 从左边弹出值

```shell
127.0.0.1:6379> LPOP list
"3"
## 查看当前list
127.0.0.1:6379> LRANGE list 0 -1
1) "2"
2) "one"
3) "rpu"
```

## 移除

*移除指定值*

- count > 0 : 从表头开始向表尾搜索，移除与 VALUE 相等的元素，数量为 COUNT 。
- count < 0 : 从表尾开始向表头搜索，移除与 VALUE 相等的元素，数量为 COUNT 的绝对值。
- count = 0 : 移除表中所有与 VALUE 相等的值。

```shell
127.0.0.1:6379> LREM key count element
```

*移除一个值*

- 移除1个指定的值
- 可以用来如:取消某个人的关注

```shell
127.0.0.1:6379> LREM list 1 one
(integer) 1
```

## 截断

1. 设置 0 1 2 3四个元素

2. 截取index =1  2的元素(`只取下表为1，2的值`)

3. 可以看到四个元素只剩下1 2了

```shell
127.0.0.1:6379> LTRIM mylist 1 2
OK
127.0.0.1:6379> LRANGE mylist 0 -1
1) "2"
2) "1"
```

## 弹入弹出

从右边弹出一个元素，从左边push到一个新的元素中

```shell
127.0.0.1:6379> RPOPLPUSH mylist mylist2
"1"
```

# SET集合

## 基本操作

无序的、去重的、元素是字符串类型

```shell
# 添加一个或者多个成员
SADD key member1 [member2]
# 返回集合中的所有成员
smembers key
# 判断 member 元素是否是集合 key 的成员
## key中存在member返回1
sismember key member
# 返回集合中一个或多个随机数
srandmember key [count]
# 获取集合的成员数
scard key
# 移除并返回集合中的一个随机元素

```

*获取集合个数*

```shell
127.0.0.1:6379> SCARD myset
(integer) 4
```

*移除指定元素*

```shell
127.0.0.1:6379> SREM myset 3
(integer) 1
```

## 多个集合操作

*将一个集合中的指定元素移动到另一个集合*

```shell
127.0.0.1:6379> SMOVE myset myset2 2
(integer) 1
```

*求差集*

```shell
127.0.0.1:6379> SDIFF myset myset2
1) "1"
2) "1,"
```

*求交集(用户之间的共同关注)*

- A用户的关注放一个集合，粉丝放一个集合
- A用户和B用户的关注求交集就是共同关注

```shell
127.0.0.1:6379> sadd myset laoxiao
(integer) 1
127.0.0.1:6379> sadd myset2 laoxiao
(integer) 1
127.0.0.1:6379> SINTER myset myset2
1) "laoxiao"
```

*求并集*

```shell
127.0.0.1:6379> SUNION myset myset2
1) "1"
2) "laoxiao"
3) "2,"
4) "1,"
```

# HASH(哈希)

## 基本操作

- 由field和关联的value组成的map键值对
- field和value是字符串类型
- 一个hash中最多包含2^32-1个键值对

```shell
set key field value
```

*存入/获取*

```shell
127.0.0.1:6379> hset myhash name laoxiao
(integer) 1
127.0.0.1:6379> hget myhash name
"laoxiao"
```

*获取所有的键或者值* 

```shell
127.0.0.1:6379> HKEYS myhash
1) "name"
127.0.0.1:6379> HVALS myhash
1) "laoxiao"
```

## 不适用hash的情况

1. 使用二进制位操作命令
2. 使用过期键功能

# 有序集合

## 基本操作

*添加语法*

数据按照score进行排序

```shell
127.0.0.1:6379> ZADD key [NX|XX] [GT|LT] [CH] [INCR] score member [score member ...]
```

*返回指定下标区间*

```shell
127.0.0.1:6379> ZRANGE key min max [BYSCORE|BYLEX] [REV] [LIMIT offset count] [WITHSCORES]
## 查询下标的元素
127.0.0.1:6379> zrange myz 1 2
1) "lisi"
2) "wangwu"
```

*获取分数2-3*

```shell
127.0.0.1:6379> ZRANGEBYSCORE myz 2 3
1) "lisi"
2) "wangwu"
```

*从负无穷到正无穷查询（升序查找）*

```shell
127.0.0.1:6379> ZRANGEBYSCORE myz -inf +inf
1) "laoxiao"
2) "lisi"
3) "wangwu"
```

*降序查询*

```shell
127.0.0.1:6379> ZREVRANGEBYSCORE key max min [WITHSCORES] [LIMIT offset count]
```

*给member增加increment*

```shell
ZINCRBY key increment member
```



# 经纬度

> `3.2版本推出`
>
> *可以计算地理位置的距离*

1. longitude 经度
2. latitude 纬度

```shell
GEOADD key [NX|XX] [CH] longitude latitude member [longitude latitude member
## 插入地理位置
## 两级无法添加
127.0.0.1:6379> GEOADD china:city 112.98626 28.25591 changsha
(integer) 1
127.0.0.1:6379> GEOADD china:city 113.64317 28.16378 liuyang
(integer) 1
```

*获取经纬度*

```shell
127.0.0.1:6379> GEOPOS china:city changsha
1) 1) "112.98626035451889038"
   2) "28.25590931465907119"
```

*获取城市距离*

```shell
127.0.0.1:6379> GEODIST china:city changsha liuyang
"65197.3795"

##计算的距离单位（km）
127.0.0.1:6379> GEOdist china:city changsha liuyang km
"65.1974"
```

*删除地理位置*

```shell
127.0.0.1:6379> ZREM china:city liuyang
```

# 发布订阅

*发布*：

`channel`：管道名称

`message`：消息

```shell
127.0.0.1:6379> PUBLISH channel message
```

*订阅*：

```shell
127.0.0.1:6379> SUBSCRIBE laoxiao 
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "laoxiao"
```

