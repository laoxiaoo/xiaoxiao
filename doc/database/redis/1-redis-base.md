# 基础安装

# 安装

下载、解压、编译

ps:https://redis.io/download  有安装介绍

```shell
wget http://download.redis.io/releases/redis-2.8.18.tar.gz    
tar xzf redis-2.8.18.tar.gz     
cd redis-2.8.１８    
make    
```

注：执行make时可能会出现的错误:

1. 未安装gcc，请先: yum install gcc tcl -y；
2. 安装报错 error: jemalloc/jemalloc.h: No such file or directory；解决方案：make 换==>make MALLOC = libc

```shell
## 在命令行执行
make MALLOC = libc
```



```shell
## 安装
[root@localhost redis-6.2.1]# make install
## 查看安装结果
[root@localhost redis-6.2.1]# cd /usr/local/bin
[root@localhost bin]# ll
总用量 18844
-rwxr-xr-x. 1 root root 4833416 3月  22 10:09 redis-benchmark
lrwxrwxrwx. 1 root root      12 3月  22 10:09 redis-check-aof -> redis-server
lrwxrwxrwx. 1 root root      12 3月  22 10:09 redis-check-rdb -> redis-server
-rwxr-xr-x. 1 root root 5003464 3月  22 10:09 redis-cli
lrwxrwxrwx. 1 root root      12 3月  22 10:09 redis-sentinel -> redis-server
-rwxr-xr-x. 1 root root 9450288 3月  22 10:09 redis-server

## 备份配置文件
[root@localhost redis-6.2.1]# cp redis.conf redis.conf.bak

# 测试启动
cd /usr/local/redis    
./redis-server redis.conf
```

> **redis默认不是后台启动的，如果想要后台启动，一个办法就是修改配置文件**
>
> `进入配置文件`

```shell
## 将其修改为yes
daemonize yes
```

> 关闭redis
>
> `进入cli客户端命令行`

```shell
[root@localhost redis-6.2.1]# redis-cli 
127.0.0.1:6379> shutdown 
```

# 性能测试

*redis-benchmark*

- redis自带的测试

```shell
[root@localhost redis-6.2.1]# redis-benchmark -c 100 -n 100000
```

*日志查看*

```shell
====== SET ======                                                    
  100000 requests completed in 1.01 seconds
  100 parallel clients
  3 bytes payload ## 每次请求3个字节
  keep alive: 1  ## 只一台服务器接收请求
  host configuration "save": 3600 1 300 100 60 10000
  host configuration "appendonly": no
  multi-thread: no

Latency by percentile distribution:
0.000% <= 0.127 milliseconds (cumulative count 1) ##  
50.000% <= 0.463 milliseconds (cumulative count 54809)
```

# 基础知识

1. redis默认16个数据库

> 切换数据库

```shell
127.0.0.1:6379> select 1
OK
127.0.0.1:6379[1]>
```

> 查看数据库大小

```shell
127.0.0.1:6379[1]> DBSIZE
(integer) 1
```

> 查看数据库信息 info



> 清空当前数据库

```shell
127.0.0.1:6379[1]> FLUSHDB
OK
127.0.0.1:6379[1]> DBSIZE
(integer) 0
```

# 配置文件

## 配置端口和ip

*允许哪些ip能访问这个redis，一般学习阶段配置为0.0.0.0*

```shell
## 可以导入多个配置文件
# include /path/to/local.conf
# include /path/to/other.conf

## ip
bind 0.0.0.0 -::1
port 6379
```

## 最大内存配置

1. 默认64位是不限制内存的
2. 一般配置物理内存的3/4

```shell
### 最大内存配置
# maxmemory <bytes>
## 配置内存
maxmemory 1024
```

## 内存满了的策略

*如果超过内存，会报OOM错误*

```shell
# maxmemory-policy noeviction
```

## 持久化配置

```shell
## 如果3600秒内有一个key修改，就进行持久化操作
# save 3600 1
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

## 设置密码

*将密码设置成123456*

```shell
# 在配置文件中设置密码
requirepass 123456
```

## 日志
```shell
## 日志级别
loglevel notice

## 日志文件名
logfile ""

```
## 最大的客户端连接数

```shell
 maxclients 10000
```


## 以守护进程运行

```shell
# 是否以守护进程运行，默认是NO
daemonize yes
## 如果以守护进程运行，则需要指定一个进程文件
pidfile /var/run/redis_6379.pid
```

# 安全配置

## 命令行配置

```shell
## 默认获取密码是为空的
127.0.0.1:6379> config get requirepass
1) "requirepass"
2) ""
## 设置密码
127.0.0.1:6379> config set requirepass 123456
OK
## 再吃执行命令没有权限
127.0.0.1:6379> config set requirepass
(error) ERR Unknown subcommand
## 认证
127.0.0.1:6379> auth 123456
OK
###
127.0.0.1:6379> config get requirepass
1) "requirepass"
2) "123456"
```

## 配置文件配置
```shell
# 在配置文件中设置密码
requirepass 123456
```


# Redis为什么快

1. 首先，采用了多路复用io阻塞机制
2. 然后，数据结构简单，操作节省时间
3. 最后，运行在内存中，自然速度快


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
