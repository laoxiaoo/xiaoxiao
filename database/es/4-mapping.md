# 

# 简介

当我们PUT /order/product/1一条数据时，es会自动给我们建立一个dynamic mapping，里面包括了分词或者搜索的行为,mapping会自定义每个field的数据类型

在es中，搜索分两种

-  exact value
   - 搜索的时候，搜索词必须全部匹配，才能搜索出来
-  full text （全文检索）
   - 缩写：如cn=china
   - 格式转化: 日like，也可以将likes搜索出来
   - 大小写
   - 同义词：如果like，也可以将love搜索出来

分词之后，会将exact 或full建立到倒排索引中(**不同类型的filed会有不同的搜索类型**)

搜索时候，搜索的词根据的类型，进行分词，搜索到对应的doc中



# 字段类型

## text 和 keyword类型的区别

text会被分词解析，keyword不会被分词

## 一个字段多分词设置

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


# 插入不允许有多余字段

- 设置mapping，当插入超出mapping多余字段之后，就会报错

```json
PUT /sys_org_company
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
```



# 倒排索引分析

通俗的说，就是通过value找key 首先，会分词，分词后做同义词等处理，这时，查找时，先搜索到value，再找到key

# 测试分词

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

# 手动建立mapping

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

# 新增已存在的mapping字段

## 直接新增模式

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

## 新建一个mapping模式

