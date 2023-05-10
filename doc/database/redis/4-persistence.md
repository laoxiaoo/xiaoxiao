#



#  RDB模式

1. RDB持久化是指在指定的时间间隔内将内存中的数据集快照写入磁盘。也是默认的持久化方式，这种方式是就是将内存中数据以快照的方式写入到二进制文件中,默认的文件名为dump.rdb
2. 既然RDB机制是通过把某个时刻的所有数据生成一个快照来保存，那么就应该有一种触发机制，是实现这个过程。对于RDB来说，提供了三种机制：save、bgsave、自动化

## 自动化

save:表示自动的执行，否则需要相关命令才执行


```shell
## 如果3600秒内有一个key修改，就进行持久化操作
save 3600 1
# save 300 100
## 60秒内有一个key修改，就进行持久化
# save 60 10000
##持久化出错，是否继续工作
stop-writes-on-bgsave-error yes

## 是否压缩持久化（rdb）文件（会消耗cpu资源）
rdbcompression yes

## 是否校验rdb文件
rdbchecksum yes
# rdb保存文件
dbfilename dump.rdb
```

## save模式（手动触发）

1. 该命令会阻塞当前Redis服务器，执行save命令期间，Redis不能处理其他命令，直到RDB过程完成为止

2. 执行完成时候如果存在老的RDB文件，就把新的替代掉旧的。我们的客户端可能都是几万或者是几十万，**这种方式显然不可取**

```shell
127.0.0.1:6379> save
OK
```

## bgsave（手动触发）

1. 执行该命令时，Redis会在后台异步进行快照操作，快照同时还可以响应客户端请求

2. 具体操作是Redis进程执行fork操作创建子进程，RDB持久化过程由子进程负责，完成后自动结束。阻塞只发生在fork阶段，一般时间很短。**基本上 Redis 内部所有的RDB操作都是采用 bgsave 命令**

```shell
127.0.0.1:6379> BGSAVE
Background saving started
```

### 触发操作

1. save 或者bgsave命令手动执行
2. 根据配置文件自动执行（save 配置）
3. 客户端发送shutdown，系统会先save，阻塞执行
4. 主从架构，从节点发送psyn

自动触发是由我们的配置文件来完成的

### 恢复操作

 将rdb文件放到对应文件下，redis启动会自动检查,然后重新加载到内存中

```shell
127.0.0.1:6379> config get dir
1) "dir"
2) "/root"  ### 这个目录下存在rdb文件，就会恢复
```

## 优点

1. 适合大规模的数据恢复
2. 紧凑的二进制文件，fork子进程性能最大化，启动效率高
3. 数据完整性要求不高，（在没有触发save规则的时候宕机，数据就没了）

## 缺点

1. 数据可能丢失（在没有触发save规则的时候宕机，数据就没了）

2. fork进程会占用空间

# AOF

AOF持久化是通过保存Redis所执行的<b id="blue">写命令</b>来记录数据库状态的

## 开启AOF的配置

```shell
## 默认不开启AOF
appendonly yes
## 持久化文件
appendfilename "appendonly.aof"
```

## 同步策略

1. 每秒同步（默认，每秒调用一次fsync，这种模式性能并不是很糟糕)
2. 每修改同步（会极大消弱Redis 的性能，因为这种模式下每次 write后都会调用fsync)
3. 不主动同步（由操作系统自动调度刷磁盘, 性能是最好的)

```shell
## 每次修改都写入（速度慢）
# appendfsync always
## 每一秒同步
appendfsync everysec
## 不执行sync， 操作系统自己同步
# appendfsync no

```

## 工作原理

![image-20230505232227915](./image/image-20230505232227915.png)

## 写入与恢复

AOF文件是一个只进行append操作的日志文件，因此在写入过程中即使出现宕机现象，也不会破坏日志文件中已经存在的内容。假如一次操作只是写入了一半数据就出现了系统崩溃问题，不用担心，在Redis下一次启动之前，我们可以通过redischeck-aof工具来帮助我们修复问题。

AOE文件有序地保存了对数据库执行的所有写入操作，这些写入操作以Redis协议的格式保存，因此AOF文件的内容非常容易被人读懂，对文件进行分析（ parse)也很轻松。
导出 (export)AOF文件也非常简单:举个例子，如果你不小心执行了FLUSHALL 命令，但只要AOE文件未被重写，那么只要停止服务器，移除AQE文件末尾的 FLUSHALL 命令，并重启Redis，就可以将数据集恢复到ELUSHALl 执行之前的状态。

## 重写

Redis 可以在AOEF文件体积变得过大时，自动地在后台对AOE进行rewrite。即Redis以append模式不断的将修改数据写入到老的磁盘文件中，同时Redis还会创建一个新的文件用于记录此期间有哪些修改命令被执行。

因为Redis在创建新AoE文件的过程中，会继续将命令追加到现有的AOF文件里面，即使重写过程中发生停机，现有的 AOF文件也不会丢失。

而一旦新 AOF文件创建完毕，Redis就会从旧AOF文件切换到新AOF文件，并开始对新AOF文件进行追加操作。\

重写操作会把冗余命令进行重写

### 触发条件

1. 客户端执行bgrewriteaof命令
2. auto-aof-rewrite-min-size 64mb  ## 文件超过64M
3. auto-aof-rewrite-percentage 100   ## 当前写入日志文件的大小超过上一次rewrite之后的文件大小的百分之108时，也就是2倍时触发Rewrite

# 混合模式

Redis在重启时通常是加载AOF文件，但加载速度慢。因为RDB数据不完整，所以加载AOF

## 开始方式

```shell
aof-use-rdb-preamble true
```



## 数据恢复

当我们开启了混合持久化时，启动Redis依然优先加载aof文件，aof文件加载可能有两种情况如下

1. aof文件开头是rdb的格式,先加载 rdb内容再加载剩余的aof
2. aof文件开头不是rdb的格式，直接以aof格式加载整个文件