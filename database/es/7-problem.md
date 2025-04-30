# 一些生产问题记录

# 深度翻页问题

ES提供了3中解决深度翻页的操作，分别是scroll、sliced scroll 和 search after

## scroll

scroll api提供了一个全局深度翻页的操作，  首次请求会返回一个scroll_id，使用该scroll_id可以顺序获取下一批次的数据

scroll 请求不能用来做用户端的实时请求，只能用来做线下大量数据的翻页处理，例如数据的导出、迁移和_reindex操作，还有同一个scroll_id无法并行处理数据，所以处理完全部的数据执行时间会稍长一些

举例：scroll=1m是指scroll_id保留上下文的时间

```json
POST /twitter/_search?scroll=1m {
    "size": 100,
    "query": {
        "match" : {
            "title" : "elasticsearch"
        }
    }
}
```

首次请求会返回一个scroll_id，我们根据这个值去不断拉取下一页直至没有结果返回

```json
POST /_search/scroll{
    "scroll" : "1m",
    "scroll_id" : "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAD4WYm9laVYtZndUQlNsdDcwakFMNjU1QQ=="
}
```

## sliced scroll

sliced scroll api 除指定上下文保留时间外，还需要指定最大切片和当前切片，最大切片数据一般和shard数一致或者小于shard数，每个切片的scroll操作和scroll api的操作是一致的

```json
GET /twitter/_search?scroll=1m
 
 
{
    "slice": {
        "id": 0,
        "max": 2
    },
    "query": {
        "match" : {
            "title" : "elasticsearch"
        }
    }
}
GET /twitter/_search?scroll=1m
{
    "slice": {
        "id": 1,
        "max": 2
    },
    "query": {
        "match" : {
            "title" : "elasticsearch"
        }
    }
}
```

## search after

上面两种翻页的方式都无法支撑用户在线高并发操作，search_after提供了一种动态指针的方案，即基于上一页排序值检索下一页实现动态分页

1. 首次查询

```json
GET twitter/_search{
    "size": 10,
    "query": {
        "match" : {
            "title" : "elasticsearch"
        }
    },
    "sort": [
        {"date": "asc"},
        {"tie_breaker_id": "asc"}
    ]
}
```

2. 通过上一页返回的date + tie_breaker_id最后一个值做为这一页的search_after

```json
GET twitter/_search{
    "size": 10,
    "query": {
        "match" : {
            "title" : "elasticsearch"
        }
    },
    "search_after": [1463538857, "654323"],
    "sort": [
        {"_score": "desc"},
        {"tie_breaker_id": "asc"}
    ]
}
```

