 
# 基本操作

- Redis单条命令保证原子性，但是事务不保证原子性
- Redis事务没有隔离级别概念
- Redis事务本质：一组命令，在队列中，按照顺序执行

- Redis事务
  - 开启事务：MULTI 
  - 命令入队
  - 执行事务

```shell
# 事务开启
127.0.0.1:6379> MULTI
OK
# 入队操作
127.0.0.1:6379(TX)> set k1 v1
QUEUED
127.0.0.1:6379(TX)> set k2 v2
QUEUED
# 执行命令
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

# Redis乐观锁

- 乐观锁的实现，必须基于WATCH，然后利用redis的事务。

Redis Watch 命令用于监视一个(或多个) key ，如果在事务执行之前这个(或这些) key 被其他命令所改动，那么事务将被打断

1. 开启监控money
   1. 监控了这个键后，如果其他线程修改了这个键，那么事务执行的时候就会失败
2. 开启事务

```shell
127.0.0.1:6379> set money 100
OK
# 监控money
127.0.0.1:6379> WATCH money
OK
127.0.0.1:6379> MULTI
OK
# 执行新增的时候，在另一个线程执行加20
127.0.0.1:6379(TX)> INCRBY money 10
QUEUED
#执行命令的时候发现money值改了，不再进行修改
127.0.0.1:6379(TX)> EXEC
(nil)
127.0.0.1:6379> get money
"120"
# 解除监控 （ps：执行失败要先解锁，再执行watch）
127.0.0.1:6379> UNWATCH
OK
```

# 秒杀案例

- 秒杀场景：库存-1， 人数+1

## 基于乐观锁

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

## lua脚本模式

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



