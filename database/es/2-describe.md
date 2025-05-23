# 功能

- 分布式的搜索引擎

如：百度等

- 全文检索，结构化检索
  - 文章的关键字检索
  - 电商的分类查询


# 核心概念

- Document&field

文档，es中的最小数据单元，一个document可以是一条客户数据，一条商品分类数据，一条订单数据，通常用JSON数据结构表示

- type

每个索引都有多个或者一个type，一个type下的document，有着相同的字段

- index:索引

包含一堆有相似结构文档的数据，如：订单索引

| es       | 数据库 |
| -------- | ------ |
| document | 行     |
| type     | 表     |
| index    | 数据库 |

- share

如果一个index有3t的数据，它把他分为三份，每一个share存1t，这样，查询就增加了速度

share是最小的工作单元

每个share其实就是一个Lucene实例

share分为primary share和replica share，每个document只能存在于某个primary share以及对应的replica share中

- replica share

其实就是share的一个副本

优点：查询的时候，也可以查到replica上面

​			share挂了，可以让replica顶上

**share不能和replica同一个服务器，所以es一般两个服务器以上**

- master

master 选举，将一个node变为master

新master间隔primary share的replica 变为primary

# 特性

- 对复杂的分布式机制的透明隐藏特性
  - 我们不需要考虑数据怎么进行分片，数据分配到了哪个shard占用，
  - 集群可以自己发现node
  - shard复杂均衡

- 垂直扩容和水平扩容，扩容对应用程序透明
  - 垂直扩容：购置强大的服务器，将新的服务器代替老服务器
  - 水平扩容：购置服务器，加入老的集群之中
- 增加或者减少节点，会自动将数据平衡
- master节点
  - 创建、删除索引；增加删除节点
  - 默认自动选择一台节点作为master
- 节点平等的分布式架构
  - 每个节点都可以接受所有请求
  - 可能请求a share，但a可以发给b，让b给数据给a，最后返回

# Es分片数据刷新策略

Es分片默认刷新频率为1s

刷新频率越高越耗资源（刷新即写入硬盘，并会产生记录）

Mapping结构默认会是1s刷新

```json
{
  "settings": {},
  "defaults": {
    "index": {
      "refresh_interval": "1s"
    }
  }
}
```

 

为保证数据实时性，es提供手动刷新方法，以Java为例

```Java
org.elasticsearch.action.support.WriteRequest.RefreshPolicy
```

- `RefreshPolicy#IMMEDIATE:`
  请求向ElasticSearch提交了数据，立即进行数据刷新，然后再结束请求。
  优点：实时性高、操作延时短。
  缺点：资源消耗高。
- `RefreshPolicy#WAIT_UNTIL:`
  请求向ElasticSearch提交了数据，等待数据完成刷新，然后再结束请求。
  优点：资源消耗低。
  缺点：操作延时长，一般刷新时间都是1s。
- `RefreshPolicy#NONE:`
  默认策略。
  请求向ElasticSearch提交了数据，不关系数据是否已经完成刷新，直接结束请求。
  优点：操作延时短、资源消耗低。
  缺点：实时性低。

如：

```Java
UpdateRequest request = new UpdateRequest(tableName, id);
Map<String, Object> value = columnValue.getValue();
request.doc(value);
// ES数据立即刷新
request.setRefreshPolicy(WriteRequest.RefreshPolicy.IMMEDIATE);
UpdateResponse response = highLevelClient.update(request, RequestOptions.DEFAULT);
```

或者Es语法调用：

```bash
PUT /test/_doc/2?refresh=true
{"test": "test"}
```