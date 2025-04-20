



# 安装




# 索引

```shell
# 查看所有索引相关信息
GET /_cat/indices?v

# 查看索引数量
GET table_4182d99ae22f4c55a487d886d71f42df/_count
## 查看索引前十条了解索引结构
POST table_4182d99ae22f4c55a487d886d71f42df/_search
{
}
```



# 简单的CRUD

**在7.X后，官方废弃type,默认type为_doc**

故：
ES 的Type 被废弃后，库表合一，Index 既可以被认为对应 MySQL 的 Database，也可以认为对应 table。

## 简单的集群管理

- 快速检查进群的健康状态

```
GET /_cat/health?v
```

- 查看集群index

```
GET /_cat/indices?v
```

## 新增操作

```
PUT /index/type/documentid
{
	json 数据
}
```

新增一条数据
```shell
PUT /order/product/1
{
  "name":"iphone",
  "price":"3000",
  "desc": "Simple to use and cheap to use"
}
```

不指定documentid 新增(采用GUID算法生成)

```shell
POST /order/product/
{
  "name":"phone",
  "price":"2000",
  "ooprice":2000,
  "desc": "Simple to use and cheap to use"
}
```

- PUT 和POST用法

```
PUT是幂等方法，POST不是。
– PUT，DELETE操作是幂等的。所谓幂等是指不管进行多少次操作，结果都一样。比如我用PUT修改一篇文章，然后在做同样的操作，每次操作后的结果并没有不同，DELETE也是一样。
– POST操作不是幂等的，比如常见的POST重复加载问题：当我们多次发出同样的POST请求后，其结果是创建出了若干的资源。
– 还有一点需要注意的就是，创建操作可以使用POST，也可以使用PUT，区别在于POST是作用在一个集合资源之上的（/articles），而PUT操作是作用在一个具体资源之上的（/articles/123），比如说很多资源使用数据库自增主键作为标识信息，而创建的资源的标识信息到底是什么只能由服务端提供，这个时候就必须使用POST。
```

## 修改操作

- 替换的方式

这有一点不好，就是需要将所有字段都带上

```
PUT /order/product/1
{
  "name":"iphone",
  "price":"4000",
  "desc": "Simple to use and cheap to use"
}
```

返回

```json
"_index" : "order",
"_type" : "product",
"_id" : "5", //可以不手动设置，es会自动设置
```

- 修改的方式（post）

```
POST /order/product/1/_update
{
  "doc":{
    "name":"huawei iphone"
  }
}
```

## 查询

```
GET /order/product/1
```

## 删除

不是物理删除，只是标记，如果数据越来越多，则会后台自动物理删除

```shell
DELETE /order/product/1
```

- 带查询方式的删除

```json
POST /sys_org_company/_delete_by_query
{
   "query": {
        "match_all": {
        }
    }
}
```



# 结构化查询

## 基本知识

> 结构化查询（Query DSL）  

query的时候，会先比较查询条件，然后计算分值，最后返回文档结果  

```json
GET /test_index/test_type/_search?scroll=1m
{
  "query": {
    "match_all": {}
  }
}
```

> 结构化过滤（Filter DSL）  

过滤器，对查询结果进行缓存，不会计算相关度，避免计算分值，执行速度非常快  

```json
GET /order/product/_search
{
  "query":{
    "bool": {
      "must": [
        {"match":{"name": "iphone"}}
      ],
      "filter": [
      {"range":{"price":{"gt":"3000"}}}  
      ]
    }
  }
```

## 结构化过滤（Filter DSL）  



> bool 过滤  

用来合并多个过滤条件查询结果的布尔逻辑：

1. must：多个查询条件的完全匹配，相当于 and。

2. must_not： 多个查询条件的相反匹配，相当于 not；

3. should：至少有一个查询条件匹配，相当于 or；

   相当于sql and 和or  

```json
{
    "bool": {
        "must": { "term": { "folder": "inbox" }},
        "must_not": { "term": { "tag": "spam" }},
        "should": [
                { "term": { "starred": true }},
                { "term": { "unread": true }}
            ]
    }
}
```

## 结构化查询（Query DSL）  







# 多重查询方式

## search

- 查询全部

```shell
GET /order/product/_search
```

返回参数解释

took： 消耗时间

timed_out:是否超时

hits.total : 查询结果数量

hits.max_score: 相关度匹配

- 查询全部(带查询条件)

```shell
GET /order/product/_search?q=name:iphone
关键字必须包含
GET /order/product/_search?q=name:+iphone
关键字必须不包含
GET /order/product/_search?q=name:-iphone
任意的字段都包含关键字
GET /order/product/_search?q=iphone
```

- 默认的情况下是没有timeout的，所以如果查询时间慢，那么会一直等待，timeout机制，指定每个shard，在指定的时间内，返回搜索到的数据

```json
GET /_search?timeout=10m
```



## query DSL


- 带条件查询

```json
GET /order/product/_search
{
  "query":{
    "match": {
      "name":"iphone"
    }
  }
}
```

- 查指定字段
  - 只包含name，price两个字段
  - source指定查询的字段

```json
GET /order/product/_search
{
  "query":{
    "match": {
      "name":"iphone"
    }
  },
  "_source":["name", "price"]
}
```


### 分页

- 从0开始，一页2条

```
GET /order/product/_search
{
  "query":{
    "match_all": {}
  },
  "from": 0,
  "size": 2
}
```





## query filter

- 多个组合条件搜索

must:必须满足

should：里面有一个条件满足就可以

filter： 过滤要求

filter只会过滤数据，不会计算相关度，所以，性能要高些

```shell
GET /order/product/_search
{
  "query":{
    "bool": {
      "must": [
        {"match":{"name": "iphone"}}
      ],
      "filter": [
      {"range":{"price":{"gt":"3000"}}}  
      ]
    }
  }
}
```

### 全文检索

他会将搜索的词进行拆分，然后在进行匹配

当然，如果想一个字段多个条件，也可以用空格隔开，只要有一个结果，就会被查出来

```shell
GET /order/product/_search
{
  "query":{
    "match": {
      "desc":"simple use"
    }
  }
}
```

### phrase query（短语检索）

搜索的词不会进行拆分,并且对desc字段进行高亮

```json
GET /order/product/_search
{
  "query":{
    "match_phrase": {
      "desc":"simple"
    }
  },
  "highlight":{
    "fields": {
      "desc": {}
    }
  }
}
```

### 字段不分词

**term**表示字段不能进行分词，一定要全部匹配

```json
GET /order/_search
{
  "query": {
    "term": {
      "desc": {
        "value": "Simple to use"
      }
    }
  }
}
```

## 不合法查询定位

```json
GET /order/_search?explain
{
  "query": {
    "range1": {
      "ooprice": {
        "gte": 1000,
        "lte": 2000
      }
    }
  }
}
```

### 排序

在使用 ElasticSearch 的时候，如果索引中的字段是 text 类型，针对该字段聚合、排序和查询的时候常会出现 `Fielddata is disabled on text fields by default. Set fielddata=true` 的错误

所以一般排序字段，不使用text类型

```json
POST index/_search
{
  "sort": [
    {
      "field": {
        "order": "desc"
      }
    }
  ]
}
```



## 聚合查询

### 聚合的概念

```text
Metric(指标)：指标分析类型，如计算最大值、最小值、平均值等（对桶内的文档进行聚合分析的操作）
Bucket(桶)：分桶类型，类似sql中的group by语法（满足特定条件的文档的集合）
Pipeline(管道)：管道分析类型，基于上一级的聚合分析结果进行再分析
Matrix(矩阵)：矩阵分析类型（聚合是一种面向数值型的聚合，用于计算一组文档字段中的统计信息）
```

### 指标（Metric）

- Metric聚合分析分为单值分析和多值分析两类

```text
#1、单值分析，只输出一个分析结果
min, max, avg, sum, cardinality

#2、多值分析，输出多个分析结果
stats, extended_stats, percentile_rank, top hits
```

### 基本语法

- 常见报错
  - 执行完后会报错： Set fielddata=true on [price]，是因为**默认es不支持对text字段聚合** ，这个时候，我们需要修改这个字段的属性

```json
PUT /order/_mapping
{
  "properties":{
    "price":{
      "type":"text",
      "fielddata":true
    }
  }
}
```

### 分组聚合

- 按照价格分组查询每个价格的数量

group_by_price:给聚合起个名字

size：指定size的个数，默认为10，即返回10条聚合查询结果，**这里size=0表示普通查询的字段不显示出来**

结果按照聚合信息返回price的数量

![](../image/es/20210422182646.png)

- 查询出不同价格种类的数量

![](../image/es/20210422183107.png)

- **stats 关键字**: 统计，请求后会直接显示各种聚合结果

![](../image/es/20210422225902.png)

- **Percentiles 关键字**: 对指定字段的值按从小到大累计每个值对应的文档数的占比，返回指定占比比例对应的值，默认按照[1,5,25,50,75,95,99]来统计

![](../image/es/20210422230912.png)

### 嵌套聚合

- 先分组，再计算查询平均值

先按照name分组，然后在按照ooprice进行算平均值，然后在按照平均值进行排序

```json
GET /order/product/_search
{
  "size": 0,
  "aggs":{
    "group_by_price":{
      "terms": {
        "field": "name",
        "order": {
          "avg_price": "desc"
        }
      },
      "aggs": {
        "avg_price": {
          "avg": {
            "field": "ooprice"
          }
        }
      }
    }
  }
}
```

## 批量查询

### 多个index查询

```json
GET /_mget
{
  "docs":[
    {"_index": "order", "_type": "product", "_id": "1"}
  ]
}
```

### 同一个index查询

```json
GET /order/_mget
{
  "docs":[
    {"_type": "product", "_id": "1"}
  ]
}
```

## Search查询

| 语法                       | 描述                      |
| -------------------------- | ------------------------- |
| GET /_search               | 查询所有index             |
| GET /index1,index2/_search | 查询index1, index2的index |
| GET /index*/_search        | 查询index开头的           |

- 忽略错误索引，查询两个索引，一个不存在则忽略
- ignore_unavailable=true表示不存在的索引会忽略

```json
POST /test_index,404_index/_search?ignore_unavailable=true
{
    "profile": true,
    "query": {
        "match_all": {}
    }
}
```

## 嵌套查询

https://blog.csdn.net/weixin_40341116/article/details/80778599

## 如何定制排序

默认情况下，是按照score排序的

sort可以定制查询

```shell
GET /order/_search?explain
{
  "query": {
    "match": {
      "desc": "use"
    }
  }
  , "sort": [
    {
      "_id": {
        "order": "desc"
      }
    }
  ]
}
```

## 对已经分词的字符串排序

默认情况下，排序会按照分词后的某个词来排序

如果我们想安装完整的字符串排序，可以建立两个field，一个分词用来搜索，一个不分词用来排序

建立：

"fields": {
            "raw": {
              "type": "string",
              "index": "not_analyzed"
            }
          },
          "fielddata": true

来进行不分词

```json
PUT /website 
{
  "mappings": {
    "article": {
      "properties": {
        "title": {
          "type": "text",
          "fields": {
            "raw": {
              "type": "string",
              "index": "not_analyzed"
            }
          },
          "fielddata": true
        },
        "content": {
          "type": "text"
        },
        "post_date": {
          "type": "date"
        },
        "author_id": {
          "type": "long"
        }
      }
    }
  }
}
```

查询的时候

```json
GET /website/article/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "title.raw": {
        "order": "desc"
      }
    }
  ]
}

```

## bouncing results问题

## 使用scoll滚动查询大量数据

使用scoll搜索一批又一批数据

```
GET /test_index/test_type/_search?scroll=1m
{
  "query": {
    "match_all": {}
  },
  "sort": [ "_doc" ],
  "size": 3
}
```

第二次搜去带scorell_id

```json
GET /_search/scroll
{
    "scroll": "1m", 
    "scroll_id" : ""
}
```

## 高亮查询

- 通过对查询的字段加对应的标签，来进行前端的高亮

```json
GET /sys_org_company/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {
          "companyName": "腾讯"
        }}
      ]
    }
  },
  "highlight": {
    "fields": {
      "companyName": {"pre_tags": "<tag>", "post_tags": "</tag>"}
    }
  }
}
```

## 通过http请求查询

![1607563675460](../image/es\1607563675460.png)



# 批量增删改

1）delete:删除，只需要一个json串

2）create 相当于put  /_create， 强制创建

3）index 相当于put， 可创建可全量替换

4)  update 相当于 partial update， 修改

**除了delete，其他语法必须两个json串**

{“action”: {metadata}}

{data}

**bulk api 每个json串不能换行，但json串和json串之间，必须换行**,执行过程，有一个报错，不影响其他执行

```json
POST /_bulk
{"delete":{"_index" : "order","_type" : "product","_id" : "1"}}
{"create":{"_index" : "order_test","_type" : "product","_id" : "1"}}
{"name":"test_create_bulk"}
```



# ES REST风格总结

| method | URL                    | DESC                            |
| ------ | ---------------------- | ------------------------------- |
| PUT    | /index/type/id         | 创建文档（指定文档id）/替换文档 |
| POST   | /index/type            | 创建文档（随机文档id）          |
| POST   | /index/type/id/_update | 修改文档（修改某个字段）        |
| POST   | /index/type/_search    | 查询所有数据                    |
| DELETE | /index/type/id         | s删除                           |
| GET    | /index/type/id         | c查询                           |



# 并发处理方案

ES中用的是乐观锁并发方案

每次修改，ES都会去修改_version

如果A线程操作数据，version=1，回写数据后version=2

B线程修改数据，version=1，回写数据发现version不相等，则会将这条数据扔掉，不会让后修改的数据覆盖



## 乐观锁

A线程操作数据，A拿到vesion1的数据，B线程拿到的也是vesion1的数据

A线程修改数据后，判断库中vesion与自己拿到的数据是否一致，如果一致则回写成功，数据vesion+1

B线程修改数据，回写发现vesion不一致，重新读取数据，再次操作，判断版本号，进行回写

## 悲观锁

A线程操作数据，其他线程无法获取数据，其他线程阻塞，直到A线程操作完并且将数据回写之后

## ES乐观锁处理

- 手动处理

如果执行失败，则我们需要去重新获取version,再次执行，_version=1时，修改才能成功

```json
PUT /order/product/4?version=1
```

- 只有当你提供的version比es中的_version大的时候，才能完成修改

```json
?version=1&version_type=external
```

- partial update会内置乐观锁,下面的语句表示乐观锁重试5次

```json
post、index/type/id/_update?retry_on_conflict=5
```

## ES写一致性原理

consistency，one（primary shard），all（all shard），quorum（default）

- 我们在发送任何一个增删改操作的时候，比如说put /index/type/id，都可以带上一个consistency参数，指明我们想要的写一致性是什么？

```bash
put /index/type/id?consistency=quorum
```

one：要求我们这个写操作，只要有一个primary shard是active活跃可用的，就可以执行
 all：要求我们这个写操作，必须所有的primary shard和replica shard都是活跃的，才可以执行这个写操作
 quorum：默认的值，要求所有的shard中，必须是大部分的shard都是活跃的，可用的，才可以执行这个写操作

# 深入查询

## 搜索模式

告诉你如何一次性搜索多个index和多个type下的数据

/_search：所有索引，所有type下的所有数据都搜索出来
/index1/_search：指定一个index，搜索其下所有type的数据
/index1,index2/_search：同时搜索两个index下的数据
/*1,*2/_search：按照通配符去匹配多个索引
/index1/type1/_search：搜索一个index下指定的type的数据
/index1/type1,type2/_search：可以搜索一个index下多个type的数据
/index1,index2/type1,type2/_search：搜索多个index下的多个type的数据
/_all/type1,type2/_search：_all，可以代表搜索所有index下的指定type的数据

## 分页搜索

从第二页查询，每页2条数据

```json
GET /order*/_search?from=2&size=2
```

- deep paging问题（深度分页）

# Mapping（映射规则）

当我们PUT /order/product/1一条数据时，es会自动给我们建立一个dynamic mapping，里面包括了分词或者搜索的行为,mapping会自定义每个field的数据类型

在es中，搜索分两种

-  exact value
  - 搜索的时候，搜索词必须全部匹配，才能搜索出来
- full text （全文检索）
  - 缩写：如cn=china
  - 格式转化: 日like，也可以将likes搜索出来
  - 大小写
  - 同义词：如果like，也可以将love搜索出来

分词之后，会将exact 或full建立到倒排索引中(**不同类型的filed会有不同的搜索类型**)

搜索时候，搜索的词根据的类型，进行分词，搜索到对应的doc中

## 字段类型

text会被分词解析，keyword不会被分词

- 一个字段多个分词设置
  - 将**name**字段设置成既ik分词，又不分词

```json
POST /test_index/_mapping
{
  "properties": {
      "name": {
          "type": "text",
          "fields": {
              "name": {
                  "type": "text",
                  "analyzer": "ik_smart"
              },
              "name1": {
                  "type": "keyword"
              }
          }
      }
   }
}
```

## 插入不允许有多余字段

- 设置mapping，当插入超出mapping多余字段之后，就会报错

```json
PUT /sys_org_company
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
```



## 倒排索引分析

通俗的说，就是通过value找key 首先，会分词，分词后做同义词等处理，这时，查找时，先搜索到value，再找到key

## 测试分词

```json
GET /_analyze
{
  "analyzer": "standard", //分词类型
  "text": ["test the analyze"] //待分的词
}
```

返回

```json
{
  "tokens" : [
    {
      "token" : "test",
      "start_offset" : 0,
      "end_offset" : 4,
      "type" : "<ALPHANUM>",
      "position" : 0
    },
    {
      "token" : "the",
      "start_offset" : 5,
      "end_offset" : 8,
      "type" : "<ALPHANUM>",
      "position" : 1
    },
    {
      "token" : "analyze",
      "start_offset" : 9,
      "end_offset" : 16,
      "type" : "<ALPHANUM>",
      "position" : 2
    }
  ]
}
```

## 手动建立mapping

**只能创建index时手动建立mapping，或者新增field mapping，但是不能update field mapping**

type:字段类型

analyzer;分词类型

"index": false 不分词

```json
PUT /website
{
  "mappings": {
    "properties": {
       "author_id": {
          "type": "long"
        },
        "title": {
          "type": "text",
          "analyzer": "english"
        },
        "content": {
          "type": "text"
        },
        "post_date": {
          "type": "date"
        },
        "publisher_id": {
          "type": "text",
          "index": false
        }
    }
  }
}
```

新增已存在的mapping字段

```json
PUT /website/_mapping
{
  "properties":{
    "name" : {
        "type" : "text"
    }
  }
}
```

测试建立的mapping

```JSON
GET /website/_analyze
{
  "field": "title",
  "text": "my-dogs" 
}
```

## dynamic mapping

## 手动创建索引

创建一个my_index的索引

shard数量为1，副本数量为0

```json
PUT /my_index
{
  "settings": {
    "number_of_shards": 1
    , "number_of_replicas": 0
  }
  , "mappings": {
    "properties": {
      "my_field":{
        "type": "text"
      }
    }
  }
}
```

## 自定义dynamic策略

**elasticsearch7默认不在支持指定索引类型，默认索引类型是_doc**

true：遇到陌生字段，就进行dynamic mapping
false：遇到陌生字段，就忽略
strict：遇到陌生字段，就报错

```json
PUT /my_index
{
  "mappings": {
    "dynamic": "strict",
      "properties": {
        "name":{
          "type": "text"
        }
      }
  }
}
```

- put数据，如果超过字段就会报错(mapping set to strict)

```json
PUT /my_index/_doc/1
{
  "name":"xiaoxiao"
}
```



## 定制mapping策略

- date_detection

默认会按照一定格式识别date，比如yyyy-MM-dd。但是如果某个field先过来一个2017-01-01的值，就会被自动dynamic mapping成date，后面如果再来一个"hello world"之类的值，就会报错。可以手动关闭某个type的date_detection，如果有需要，自己手动指定某个field为date类型。

```json
PUT /my_index
{
  "mappings": {
    "date_detection": false
  }
}
```

- 通配符来匹配不同的模板

当某个字段是*en时，用下面这个模板，分词用English

```json
PUT /my_index
{
  "mappings": {
    "dynamic_templates":[
      {
        "en":{
          "match":"*en",
          "match_mapping_type":"string",
          "mapping":{
            "type":"text",
            "analyzer":"english"
          }
        }
      }  
    ] 
  }
}
```

插入数据

```json
PUT /my_index/_doc/1
{
  "name_en":"my name is xiaoxiao",
  "name":"my name is xiaoxiao"
}
```

 如果查询，name_en，is是停用词，是查询不到的，而name是可以查询到的

## 修改索引setting

## 定制自己的分词器

默认的分词器

standard

standard tokenizer：以单词边界进行切分
standard token filter：什么都不做
lowercase token filter：将所有字母转换为小写
stop token filer（默认被禁用）：移除停用词，比如a the it等等

## 修改分词器

```json
PUT /my_indexs
{
  "settings": {
    "analysis": {
      "es_sta":{
        "type": "standard",
         "stopwords": "_english_"
      }
    }
  }
}
```

## 重建索引

索引是不能修改的，如果想要修改，。则需要重新建立索引，然后将旧索引数据导入新的索引

- 建立新索引

```json
PUT /my_index_new
{
  "mappings": {
    "properties": {
      "name":{
        "type": "text"
      }
    }  
  }
}
```

- 采用scoll查询出批量数据，然后再采用bulk将数据批量插入

- 先给新索引取别名，删除旧索引的别名，让java应用能无缝切换新索引

```json
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "my_index_new",
        "alias": "goodindex"
      },
      "remove": {
        "index": "my_index",
        "alias": "goodindex"
      }
    }
  ]
}
```



# TF/IDF算法相关度评分

- 搜索的词条在文本中出现的次数越多，相关度越高
- 搜索的的词条，在整个索引中，所有文档中，次数越多，越不相关



# 优化

数据写入os cache，并被打开搜索的过程，叫做refresh，默认是1秒

如果我们对数据的时效性要求比较低，那么可以时间设长

```json
PUT /my_index
{
  "settings": {
    "refresh_interval": "30s" 
  }
}

```

fsync+清空translog，将os cache数据写入disk，这就是flush，默认30异常，或者translog过大执行一次

tanslog每隔5s会写入磁盘，当且是同步的

如果，我我们允许部分数据丢失，可以设置异步的写入

```json
PUT /my_index/_settings
{
    "index.translog.durability": "async",
    "index.translog.sync_interval": "5s"
}
```

# java 操作

- 引入pom

```xml
<dependency>
    <groupId>org.elasticsearch.client</groupId>
    <artifactId>elasticsearch-rest-high-level-client</artifactId>
</dependency>
```

## insert

```json
 public static void main(String[] args) throws Exception {
        RestHighLevelClient client = new RestHighLevelClient(
                RestClient.builder(
                        new HttpHost("192.168.1.131", 9200, "http")));

        Test test = new Test();
        test.sourceIndex(client);
        client.close();
    }

    public IndexResponse sourceIndex(RestHighLevelClient client) {
        try{
            IndexRequest request = new IndexRequest("post");
            Map map = new HashMap();
            map.put("user", "laoxiao");
            request.index("test_index").id("1").source(map, XContentType.JSON);
            IndexResponse response = client.index(request, RequestOptions.DEFAULT);
            return response;
        }catch (Exception e){
        }
        return null;
    }
```

# ELK

ELK是Elasticsearch、Logstash、Kibana的简称，这三者是核心套件，但并非全部

Logstash是一个用来搜集、分析、过滤日志的工具

# 安装ik分词器

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

- 测试

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



# 快照

## 备份

- 每个节点都要配置
- 修改配置文件

```
[root@localhost ES]# vim node3/es3.yml 
```

```yaml
path.repo: ["/usr/share/elasticsearch/data/backups/my_backup"]
```

- 建立备份目录

```shell
[root@localhost ES]# mkdir -p data/backups/my_backup
[root@localhost ES]# chmod -R 777 data
```

- 重启每一个节点
- 查看是否生效

```shell
GET _snapshot?pretty
## 注册仓库
POST _snapshot/myback_up
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/data/backups/my_backup"
  }
}
```

```json
{
  "myback_up" : {
    "type" : "fs",
    "settings" : {
      "location" : "/usr/share/elasticsearch/data/backups/my_backup"
    }
  }
}

```

- 执行备份,执行完后会返回备份的索引

```shell
PUT /_snapshot/myback_up/snapshot_1?wait_for_completion=true
```



# Spring Boot Api

## 基础配置

```java
@Bean
public RestHighLevelClient restHighLevelClient(){
    return new RestHighLevelClient(
        RestClient.builder(
            new HttpHost("192.168.1.131",9200, "http")
        )
    );
}
```

## RequestOptions

- 请求的设置项
- 如一些安全的头需要设置
- 官方推荐使用静态的方式进行配置

```java
private static final RequestOptions COMMON_OPTIONS;
static {
    RequestOptions.Builder builder = RequestOptions.DEFAULT.toBuilder();
    builder.addHeader("Authorization", "Bearer " + TOKEN); 
    builder.setHttpAsyncResponseConsumerFactory(           
        new HttpAsyncResponseConsumerFactory
            .HeapBufferedResponseConsumerFactory(30 * 1024 * 1024 * 1024));
    COMMON_OPTIONS = builder.build();
}
```

## 创建索引

```java
@Test
void creatIndex() throws IOException {
    //创建索引
    CreateIndexRequest request = new CreateIndexRequest(INDEX_NAME);
//指向客户端请求，获取响应
CreateIndexResponse response = restHighLevelClient.indices().create(request, RequestOptions.DEFAULT);
}
```

## 删除索引

```java
@Test
void deleteIndex() throws IOException {
    DeleteIndexRequest request = new DeleteIndexRequest(INDEX_NAME);
    AcknowledgedResponse response = restHighLevelClient.indices().delete(request, RequestOptions.DEFAULT);
    System.out.println(response.isAcknowledged());
}
```

## 判断索引是否存在

```java
@Test
void getIndex() throws IOException {
   //判断索引是否存在
   GetIndexRequest request = new GetIndexRequest(INDEX_NAME);
   Boolean response = restHighLevelClient.indices().exists(request, RequestOptions.DEFAULT);
   System.out.println(response);
}
```

## 新增文档

```java
@Test
void addDocument() throws IOException {
   User user = new User("小肖", "123456");
   //put /index/_doc/1
   IndexRequest request = new IndexRequest(INDEX_NAME);
   request.id("1")//id
         .timeout(TimeValue.timeValueSeconds(1));//超时时间
   request.source(JSONUtil.toJsonStr(user), XContentType.JSON);
   IndexResponse response = restHighLevelClient.index(request, RequestOptions.DEFAULT);
   System.out.println(response.status());
}
```

## 批量新增

```java
@Test
void bulkDocument() throws IOException {
   BulkRequest bulkRequest = new BulkRequest();
   bulkRequest.timeout(TimeValue.timeValueSeconds(1));
   for(int i=0; i<10; i++){
      bulkRequest.add(new IndexRequest(INDEX_NAME)
      .source(JSONUtil.toJsonStr(new User("name+"+i, String.valueOf(i))),XContentType.JSON));
   }
   restHighLevelClient.bulk(bulkRequest, RequestOptions.DEFAULT);
}
```

## 检索

## 普通查询

- 创建一个分页的检索**order**索引的查询

```java
SearchRequest searchRequest = new SearchRequest("order");
SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
sourceBuilder.from(1);
sourceBuilder.size(3);
sourceBuilder.timeout(new TimeValue(30, TimeUnit.SECONDS));
//检索条件
searchRequest.source(sourceBuilder);
SearchResponse search = restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);
List<Map<String, Object>> list = Arrays.stream(search.getHits().getHits()).map(SearchHit::getSourceAsMap).collect(Collectors.toList());
System.out.println(list);
```

## 聚合查询

