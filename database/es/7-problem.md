# 一些生产问题记录

# 深度翻页问题

ES提供了3中解决深度翻页的操作，分别是scroll、sliced scroll 和 search after

## scroll
scroll 分为初始化和遍历两步，初始化时将所有符合搜索条件的搜索结果缓存起来，可以想象成快照，在遍历时，从这个快照里取数据，也就是说，在初始化后对索引插入、删除、更新数据都不会影响遍历结果。因此，scroll 并不适合用来做实时搜索，而更适用于后台批处理任务，比如群发

scroll api提供了一个全局深度翻页的操作，  首次请求会返回一个scroll_id，使用该scroll_id可以顺序获取下一批次的数据
scroll 请求不能用来做用户端的实时请求，只能用来做线下大量数据的翻页处理，例如数据的导出、迁移和_reindex操作，还有同一个scroll_id无法并行处理数据，所以处理完全部的数据执行时间会稍长一些

举例：scroll=1m是指scroll_id保留上下文的时间
1. 初始化阶段
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
2. 遍历

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
    1. date=1463538857， tie_breaker_id=654323

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

