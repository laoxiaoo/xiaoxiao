# 什么是 Canal  

Canal 是用 Java 开发的基于数据库增量日志解析，提供增量数据订阅&消费的中间件。目前。 Canal 主要支持了 MySQL 的 Binlog 解析，解析完成后才利用 Canal Client 来处理获得的相关数据 

# MySQL 的 Binlog  

> Binlog 的分类  

MySQL Binlog 的格式有三种，分别是 STATEMENT,MIXED,ROW。在配置文件中可以选择配置 binlog_format= statement|mixed|row 

# Canal 的工作原理  

读取mysql的binlog，解析获取数据

# 安装

## 配置mysql环境

> 配置mysql

binlog_format: 以row方式写入binlog

binlog-do-db：binlog相关的数据库，如果有多个，可以写多行

如：

binlog-do-db=my_test1

binlog-do-db=my_test2

binlog-do-db=my_test3

```conf
[mysqld]
server_id=1
log_bin=mysql_bin
binlog_format=ROW
binlog-do-db=my_test
expire_logs_days=30
```

> 查看配置是否生效

可以在data下看到对应的文件,在添加相关的表数据后，可以看到对应的mysql_bin文件大小发生变化

```shell
-rw-r-----  1 polkitd input      177 Jan  1 02:11 mysql_bin.000025
-rw-r-----  1 polkitd input      154 Jan  1 02:11 mysql_bin.000026
-rw-r-----  1 polkitd input       38 Jan  1 02:11 mysql_bin.index
```

> 在mysql添加canal只读的权限用户

```shell
GRANT SELECT, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'canal'@'%' IDENTIFIED BY 'canal' ;
```

## 安装canal

> 解压canal

```shell
[root@localhost home]# mkdir canal
[root@localhost home]# cd canal/
[root@localhost canal]# rz
[root@localhost canal]# tar -zxvf canal.deployer-1.1.2.tar.gz
```

> 配置文件解析

example: 一个实例，如果我们需要监控多个mysql，则需要复制一个example，然后修改下文件名

```shell
[root@localhost canal]# cd conf/
[root@localhost conf]# ll
total 12
-rwxrwxrwx 1 root root 4262 Nov 26  2018 canal.properties
drwxrwxrwx 2 root root   33 Jan  1 02:18 example
-rwxrwxrwx 1 root root 3109 Nov 26  2018 logback.xml
drwxrwxrwx 2 root root   39 Jan  1 02:18 metrics
drwxrwxrwx 3 root root  149 Jan  1 02:18 spring
```

> canal.properties

```properties
# tcp, kafka, RocketMQ
# 表示可以以三种方式输出
canal.serverMode = tcp
## 监控的服务目录，就是刚才看到的example目录，可以在后面配置多个，用,分割开来
canal.destinations = example
```

>编辑实例文件

```shell
[root@localhost conf]# vim example/instance.properties
```

1. 打开从节点id配置,这里只要与mysql的server_id配置不一样就行

```properties
## mysql serverId , v1.0.26+ will autoGen 
canal.instance.mysql.slaveId=10
```

2. 数据库配置

```properties
canal.instance.master.address=192.168.1.134:3306
canal.instance.dbUsername=canal
canal.instance.dbPassword=canal
```

> 启动

```shell
[root@localhost canal]# ./bin/startup.sh 
```

# TCP模式

代码地址：com.xiao.tcp.CanalClient

# kafka模式

> 修改配置文件

**注意此处必须要使用域名**

```properties
# tcp, kafka, RocketMQ
canal.serverMode = kafka

canal.mq.servers = node2:9092
```

> 在example/instance配置中配置

```properties
canal.mq.topic=canal_test
```

> 在kafka配置响应的topic
>
> 消费

```shell
 ./bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --from-beginning --topic canal_test
```



# 顺序问题

摘自官方文档

```

binlog本身是有序的

canal目前选择支持的kafka/rocketmq，本质上都是基于本地文件的方式来支持了分区级的顺序消息的能力，
也就是binlog写入mq是可以有一些顺序性保障，这个取决于用户的一些参数选择
canal支持MQ数据的几种路由方式：单topic单分区，单topic多分区、多topic单分区、多topic多分区
canal.mq.dynamicTopic，主要控制是否是单topic还是多topic，针对命中条件的表可以发到表名对应的topic、
库名对应的topic、默认topic name
canal.mq.partitionsNum、canal.mq.partitionHash，主要控制是否多分区以及分区的partition的路由计算，
针对命中条件的可以做到按表级做分区、pk级做分区等
canal的消费顺序性，主要取决于描述2中的路由选择，举例说明：
单topic单分区，可以严格保证和binlog一样的顺序性，缺点就是性能比较慢，
单分区的性能写入大概在2~3k的TPS
多topic单分区，可以保证表级别的顺序性，一张表或者一个库的所有数据都写入到一个topic的单分区中，
可以保证有序性，针对热点表也存在写入分区的性能问题
单topic、多topic的多分区，如果用户选择的是指定table的方式，那和第二部分一样，
保障的是表级别的顺序性(存在热点表写入分区的性能问题)，如果用户选择的是指定pk hash的方式，
那只能保障的是一个pk的多次binlog顺序性 ** pk hash的方式需要业务权衡，这里性能会最好，
但如果业务上有pk变更或者对多pk数据有顺序性依赖，就会产生业务处理错乱的情况. 如果有pk变更，
pk变更前和变更后的值会落在不同的分区里，业务消费就会有先后顺序的问题，需要注意


```