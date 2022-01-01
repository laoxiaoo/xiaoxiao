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

