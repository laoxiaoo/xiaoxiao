# 简介

Zookeeper是一个开源的分布式的，为分布式框架提供协调服务的Apache项目。

> 工作机制

是一个基于观察者模式设计的分布式服务管理框架，它负责存储和管理大家都关心的数据，然后接受观察者的注册，一旦这些数据的状态发生变化，Zookeeper就将负责通知已经在Zookeeper上注册的那些观察者做出相应的反应。

> 特点

1. Zookeeper:一个领导者(Leader)，多个跟随者（Follower）组成的集群
2. 集群中只要有半数以上节点存活，Zookeeper集群就能正常服务。所以Zookeeper适合安装奇数台服务器。
3. 全局数据一致:每个Server保存一份相同的数据副本，Client无论连接到哪个Server数据都是一致的（CP原则）
4. 更新请求顺序执行，来自同一个Client的更新请求按其发送顺序依次执行。
5. 数据更新原子性，一次数据更新要么成功，要么失败。
6. 实时性，在一定时间范围内，Client能读到最新数据。

# 安装

## 配置文件创建

1. 在**数据目录下**创建myid文件，server1机器的内容为：1，server2
   机器的内容为：2，server3机器的内容为：3

```shell
vim /opt/zookeeper/myid
```

2. 在conf目录下创建一个配置文件

```tex
tickTime=2000
dataDir=/opt/zookeeper
clientPort=2181
initLimit=5
syncLimit=2
server.1=node1:2888:3888
server.2=node3:2888:3888
server.3=node4:2888:3888
```

## 参数解释

tickTime：发送心跳的间隔时间，单位：毫秒
• dataDir：zookeeper保存数据的目录。
• clientPort：客户端连接 Zookeeper 服务器的端口，Zookeeper 会监听这个端口，接受客
户端的访问请求。
• initLimit： 这个配置项是用来配置 Zookeeper 接受客户端（这里所说的客户端不是用户连
接 Zookeeper 服务器的客户端，而是 Zookeeper 服务器集群中连接到 Leader 的
Follower 服务器）初始化连接时最长能忍受多少个心跳时间间隔数。 当已经超过 5 个心跳的
时间（也就是 tickTime）长度后 Zookeeper 服务器还没有收到客户端的返回信息，那么表
明这个客户端连接失败。总的时间长度就是 5*2000=10 秒
• syncLimit：这个配置项标识 Leader 与 Follower 之间发送消息，请求和应答时间长度，最
长不能超过多少个 tickTime 的时间长度，总的时间长度就是 2*2000=4 秒
• server.A=B：C：D：其 中 A 是一个数字，表示这个是第几号服务器；B 是这个服务器的 ip
地址；C 表示的是这个服务器与集群中的 Leader 服务器交换信息的端口；D 表示的是万一
集群中的 Leader 服务器挂了，需要一个端口来重新进行选举，选出一个新的 Leader，而这
个端口就是用来执行选举时服务器相互通信的端口。如果是伪集群的配置方式，由于 B 都是
一样，所以不同的 Zookeeper 实例通信端口号不能一样，所以要给它们分配不同的端口号

## 启动

```shell
[root@localhost apache-zookeeper-3.6.0-bin]# ./bin/zkServer.sh start
```

