# 安装ES

国内镜像

<https://thans.cn/mirror/elasticsearch.html>

## 文件目录

- config
  - log4j2 日志文件
  - jvm 
  - elasticsearch.yml 配置文文件

修改配置文件

```yaml
## 集群名字，同一个集群必须相等
cluster.name: myes
## 当前节点名字
node.name: node-1
cluster.initial_master_nodes: ["node-1"]
network.host: 192.168.1.131

## 解决跨域问题
http.cors.enabled: true
http.cors.allow-origin: "*"
```

可能需要修改

**注：这一步是为了防止启动容器时，报出如下错误：bootstrap checks failed max virtual memory areas vm.max_map_count [65530] likely too low, increase to at least [262144]**

```shell
[root@localhost ~]# vim /etc/security/limits.conf
myes soft nofile 65536
myes hard nofile 100000
[root@localhost ~]# vim /etc/sysctl.conf 
vm.max_map_count=655360
##执行让其生效
[root@localhost ~]#sysctl -p
```



```shell
#建立myes用户，es要非root用户启动
[root@localhost home]# adduser myes
[root@localhost home]# passwd myes

[root@localhost home]# chown -R myes:myes elasticsearch-7.3.2
#进入myes启动
[root@localhost home]# su myes
[myes@localhost home]$ ./elasticsearch-7.3.2/bin/elasticsearch
```

访问<http://192.168.1.131:9200/>

## elasticsearch-.yml详解

- 6.x

```yaml
# ======================== Elasticsearch Configuration =========================
#
# NOTE: Elasticsearch comes with reasonable defaults for most settings.
# Before you set out to tweak and tune the configuration, make sure you
# understand what are you trying to accomplish and the consequences.
#
# The primary way of configuring a node is via this file. This template lists
# the most important settings you may want to configure for a production cluster.
#
# Please see the documentation for further information on configuration options:
# <http://www.elastic.co/guide/en/elasticsearch/reference/current/setup-configuration.html>
#
# ---------------------------------- Cluster -----------------------------------
#
# Use a descriptive name for your cluster:
# 集群名称，默认是elasticsearch
# cluster.name: my-application
#
# ------------------------------------ Node ------------------------------------
#
# Use a descriptive name for the node:
# 节点名称，默认从elasticsearch-2.4.3/lib/elasticsearch-2.4.3.jar!config/names.txt中随机选择一个名称
# node.name: node-1
#
# Add custom attributes to the node:
#
# node.rack: r1
#
# ----------------------------------- Paths ------------------------------------
#
# Path to directory where to store the data (separate multiple locations by comma):
# 可以指定es的数据存储目录，默认存储在es_home/data目录下
# path.data: /path/to/data
#
# Path to log files:
# 可以指定es的日志存储目录，默认存储在es_home/logs目录下
# path.logs: /path/to/logs
#
# ----------------------------------- Memory -----------------------------------
#
# Lock the memory on startup:
# 锁定物理内存地址，防止elasticsearch内存被交换出去,也就是避免es使用swap交换分区
# bootstrap.memory_lock: true
#
#
#
# 确保ES_HEAP_SIZE参数设置为系统可用内存的一半左右
# Make sure that the `ES_HEAP_SIZE` environment variable is set to about half the memory
# available on the system and that the owner of the process is allowed to use this limit.
#
# 当系统进行内存交换的时候，es的性能很差
# Elasticsearch performs poorly when the system is swapping the memory.
#
# ---------------------------------- Network -----------------------------------
#
#
# 为es设置ip绑定，默认是127.0.0.1，也就是默认只能通过127.0.0.1 或者localhost才能访问
# es1.x版本默认绑定的是0.0.0.0 所以不需要配置，但是es2.x版本默认绑定的是127.0.0.1，需要配置
# Set the bind address to a specific IP (IPv4 or IPv6):
#
# network.host: 192.168.0.1
#
#
# 为es设置自定义端口，默认是9200
# 注意：在同一个服务器中启动多个es节点的话，默认监听的端口号会自动加1：例如：9200，9201，9202...
# Set a custom port for HTTP:
#
# http.port: 9200
#
# For more information, see the documentation at:
# <http://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html>
#
# --------------------------------- Discovery ----------------------------------
#
# 当启动新节点时，通过这个ip列表进行节点发现，组建集群
# 默认节点列表：
# 127.0.0.1，表示ipv4的回环地址。
# [::1]，表示ipv6的回环地址
#
# 在es1.x中默认使用的是组播(multicast)协议，默认会自动发现同一网段的es节点组建集群，
# 在es2.x中默认使用的是单播(unicast)协议，想要组建集群的话就需要在这指定要发现的节点信息了。
# 注意：如果是发现其他服务器中的es服务，可以不指定端口[默认9300]，如果是发现同一个服务器中的es服务，就需要指定端口了。
# Pass an initial list of hosts to perform discovery when new node is started:
#
# The default list of hosts is ["127.0.0.1", "[::1]"]
#
# discovery.zen.ping.unicast.hosts: ["host1", "host2"]
#
#
#
#
# 通过配置这个参数来防止集群脑裂现象 (集群总节点数量/2)+1
# Prevent the "split brain" by configuring the majority of nodes (total number of nodes / 2 + 1):
#
# discovery.zen.minimum_master_nodes: 3
#
# For more information, see the documentation at:
# <http://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery.html>
#
# ---------------------------------- Gateway -----------------------------------
#
# Block initial recovery after a full cluster restart until N nodes are started:
# 一个集群中的N个节点启动后,才允许进行数据恢复处理，默认是1
# gateway.recover_after_nodes: 3
#
# For more information, see the documentation at:
# <http://www.elastic.co/guide/en/elasticsearch/reference/current/modules-gateway.html>
#
# ---------------------------------- Various -----------------------------------
# 在一台服务器上禁止启动多个es服务
# Disable starting multiple nodes on a single system:
#
# node.max_local_storage_nodes: 1
#
# 设置是否可以通过正则或者_all删除或者关闭索引库，默认true表示必须需要显式指定索引库名称
# 生产环境建议设置为true，删除索引库的时候必须显式指定，否则可能会误删索引库中的索引库。
# Require explicit names when deleting indices:
#
# action.destructive_requires_name: true
```

- 7.x

```yaml
cluster.name: elasticsearch-cluster
node.name: es-node3
network.bind_host: 0.0.0.0
network.publish_host: 192.168.1.134
http.port: 9202
#内部节点通信端口
transport.tcp.port: 9302
#跨域
http.cors.enabled: true
http.cors.allow-origin: "*"
#集群节点
discovery.seed_hosts: ["192.168.1.134:9300","192.168.1.134:9301", "192.168.1.134:9302"]
#有资格成为主节点的节点配置
cluster.initial_master_nodes: ["es-node1","es-node2","es-node3"]

```



# 安装Kibana

国内镜像

<https://www.newbe.pro/Mirrors/Mirrors-Kibana/#toc-heading-1>

修改配置文件

```shell
[root@localhost ~]# vim /home/kibana-7.3.2/config/kibana.yml 
```

```yaml
server.host: "192.168.1.131"
elasticsearch.hosts: ["http://192.168.1.131:9200"]
#语音为中文
i18n.locale: "zh-CN"
```

启动

```shell
myes@localhost home]$ ./kibana-7.3.2/bin/kibana
```

访问dev_tool

<http://192.168.1.131:5601/app/kibana#/dev_tools/console?_g=()>

# 可视化HEAD





# 横向扩容

扩容之后，当个节点的share变少，性能变得更好

---

如果只有6个share（三个primary， 三个replica），怎么突破瓶颈（极限：有多少个share，就多少个机器），增加到9台机器

增加replica share，因为primary share是不能变得， 如：replica=2,

---

# 安装IK分词

## 安装

进入https://github.com/medcl/elasticsearch-analysis-ik/releases下载对应版本

将下载的压缩包。放入插件文件夹下，建立文件夹ik

```shell
[root@localhost plugins]# pwd
/home/elasticsearch-7.3.2/plugins
[root@localhost plugins]# mkdir ik

## 查看插件
[root@localhost bin]# ./elasticsearch-plugin list
ik
```

安装插件后，启动es时，也能看到集群对应有

[node-1] loaded plugin [analysis-ik]

字样

ik分词器提供了两种分词算法：

ik_smart ：最少切分

ik_max_word：最细粒度切分

## 测试
```json
GET /_analyze
{
  "analyzer": "ik_smart",
  "text": "我是帅哥"
}
```

```json
GET /_analyze
{
  "analyzer": "ik_max_word",
  "text": "我是一个帅哥"
}
```


## IK配置

进入配置

```shell
[root@localhost ~]# cd /home/elasticsearch-7.3.2/plugins/ik/config/
[root@localhost config]# vim IKAnalyzer.cfg.xml
```

ext_dict:同目录下一个xx.dic文件，

```xml
<properties>
        <comment>IK Analyzer 扩展配置</comment>
        <!--用户可以在这里配置自己的扩展字典 -->
        <entry key="ext_dict"></entry>
         <!--用户可以在这里配置自己的扩展停止词字典-->
        <entry key="ext_stopwords"></entry>
        <!--用户可以在这里配置远程扩展字典 -->
        <!-- <entry key="remote_ext_dict">words_location</entry> -->
        <!--用户可以在这里配置远程扩展停止词字典-->
        <!-- <entry key="remote_ext_stopwords">words_location</entry> -->
</properties>

```

## 远程分词配置

words_location是指一个 url，比如 `http://yoursite.com/getCustomDict`，该请求只需满足以下两点即可完成分词热更新。

1. 该 http 请求需要返回两个头部(header)，一个是 `Last-Modified`，一个是 `ETag`，这两者都是字符串类型，只要有一个发生变化，该插件就会去抓取新的分词进而更新词库。
2. 该 http 请求返回的内容格式是一行一个分词，换行符用 `\n` 即可。

## 重新分词后数据进行更新

在IK新增热词后，不会去更新历史数据，即新添加的热词只对后续的数据生效。而实际上我们常常需要对历史数据进行更新。

1. 可以指定多个索引多个type。
   http://127.0.0.1:9200/index1,index2/type1,type2/_update_by_query?conflicts=proceed

2. 可以使用通配符*，匹配多个索引
3. 默认批处理的大小是1000，参数设置如下：

POST twitter/_update_by_query?scroll_size=100