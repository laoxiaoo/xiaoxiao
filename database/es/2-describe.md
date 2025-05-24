# 功能

- 分布式的搜索引擎

如：百度等

- 全文检索，结构化检索
  - 文章的关键字检索
  - 电商的分类查询

# 倒排索引

 **词项（Term）** 映射到包含该词项的 **文档列表（Posting List）**,适合搜索场景,

比如说，一个文档，doc1内容是username->"天天向上"

那么，分词将其分为天天，向上，分别指向doc1

## doc_values

ES中，除了倒排索引，还会有正排索引

doc_values和fielddata就是用来给文档建立正排索引的。他俩一个很显著的区别是，前者的工作地盘主要在磁盘，而后者的工作地盘在内存。

对于非text字段类型，doc_values默认情况下是打开的

关闭doc_values

```json
PUT users
{
    "mappings" : {
      "properties" : {
        "name" : {
          "type" : "text"
        },
        "mobile" : {
          "type" : "keyword"
        },
        "age" : {
          "type" : "integer",
          "doc_values": false
        }
      }
    }
}
```

对age搜索排序，发现报错，意思就是`age`字段不支持排序了，需要打开doc_values才行

`原因：`

比如说，所以我们要查找包含`brown`的文档，先在词项列表中找到 brown，然后扫描所有列，可以快速找到包含 brown 的文档。

但是如果是要对搜索结果进行排序或者其它聚合操作，倒排索引这种方式就没真这么容易了，反而是类下面这种正排索引更方便。doc_values其实是Lucene在构建倒排索引时，会额外建立一个有序的正排索引（基于document => field value的映射列表）。

![image-20250523204714168](image/2-describe/image-20250523204714168.png)

# 核心概念

- Document&field

文档，es中的最小数据单元，一个document可以是一条客户数据，一条商品分类数据，一条订单数据，通常用JSON数据结构表示

- type

每个索引都有多个或者一个type，一个type下的document，有着相同的字段

**在7.X后，官方废弃type,默认type为_doc**

故：
ES 的Type 被废弃后，库表合一，Index 既可以被认为对应 MySQL 的 Database，也可以认为对应 table。

- index:索引

包含一堆有相似结构文档的数据，如：订单索引

| es       | 数据库 |
| -------- | ------ |
| document | 行     |
| type     | 表     |
| index    | 数据库 |

## share

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

# ES为什么快

1. 基于 **分布式架构**，查询可以并行执行（跨多个分片/节点），充分利用多核 CPU 和集群资
   1. 如，有多个replica share，一个查询可以同时扫描多个分片，并在内存中合并结果
2.  **倒排索引 + 分词优化**
3. **文件系统缓存（Page Cache）**：倒排索引默认驻留在内存中，查询时直接读取，速度极快
4. **查询缓存（Query Cache）**：[filter](/database/es/3-curd?id=对比)查询结果可缓存，减少重复计算

# ES 写入流程

- 客户端选择一个 node 发送请求过去，这个 node 就是 `coordinating node`（协调节点）。
- `coordinating node` 对 document 进行路由，将请求转发给对应的 node（有 primary shard）。
- 实际的 node 上的 `primary shard` 处理请求，然后将数据同步到 `replica node`。
- `coordinating node` 如果发现 `primary node` 和所有 `replica node` 都搞定之后，就返回响应结果给客户端

![image-20250523233935303](image/2-describe/image-20250523233935303.png)