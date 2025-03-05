# 

 ES的聚合操作







# 分组查询并取最大值

```sql
select t.user_id,max(t.time) as time
from t_usern t
group by t.user_id
order by time desc limit 10
```

通过userId 进行分组，然后查询出分组里面的最大值，按照这个最大值时间进行排序，查询前10个

转换为ES

```json
{  
  "size": 0,  
  "query": {  
    "match_all": {}  
  },  
  "aggs": {  
    "user_actions": {  
      "terms": {  
        "field": "user_id",  
        "size": 10,  
        "order": {  
          "max_action_time": "desc"  
        }  
      },  
      "aggs": {  
        "max_action_time": {  
          "max": {  
            "field": "action_time"  
          }  
        }  
      }  
    }  
  }  
}
```

size: 设置为0，因为我们只关心聚合结果，不关心具体文档。
query: 使用match_all查询来匹配索引中的所有文档。
aggs: 定义聚合操作。
user_actions: 聚合名称。
terms: 使用terms聚合按user_id字段分组。
field: 指定分组的字段。
size: 限制返回的聚合桶的数量，这里为10。
order: 定义聚合桶的排序方式，这里按max_action_time降序排序。
aggs: 内部聚合，用于计算每个user_id组的action_time的最大值。
max_action_time: 内部聚合名称。
max: 使用max聚合计算action_time字段的最大值。



# 多个字段分组查询

这里我们需要将字符串拼接成一个字段，进行分组查询

```json
{  
  "size": 0,  
  "query": {  
    "match_all": {}  
  },  
  "aggs": {  
    "userActions": {  
      "terms": {  
        "script": {  
          "source": "doc['userId'].value + '_' + doc['itemId'].value",  
          "lang": "painless"  
        },  
        "order": {  
          "max_actionTime.value": "desc"  
        }  
      },  
      "aggs": {  
        "max_actionTypeSort": {  
          "max": {  
            "field": "actionTypeSort"  
          }  
        },  
        "max_actionTime": {  
          "max": {  
            "field": "actionTime"  
          }  
        }  
      }  
    }  
  }  
}
```

