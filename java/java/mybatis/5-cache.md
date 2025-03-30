# 缓存

## 一级缓存

- sqlSession级别的缓存。一级缓存是一直开启的

- 与数据库同一次会话期间查询到的数据会放在本地缓存中。以后如果需要获取相同的数据，直接从缓存中拿，没必要再去查询数据库；

`一级缓存失效情况`:

没有使用到当前一级缓存的情况，效果就是，还需要再向数据库发出查询

1. sqlSession不同。
2. sqlSession相同，查询条件不同.(当前一级缓存中还没有这个数据)
3. sqlSession相同，两次查询之间执行了增删改操作(这次增删改可能对当前数据有影响), **调用了增删改的操作就会直接清空缓存**
4. sqlSession相同，手动清除了一级缓存（缓存清空）

```java
sqlSession.clearCache();
```

5. localCacheScope设置成*STATEMENT*(缓存作用于作用于statement)

`一级缓存命中的情况`:

1. sql 和参数必须相同
2. 必须是相同的statementid（方法名）
3. sqlsession 必须相同
4. RowBound 必须相同（返回行范围必须相同）

> **在分布式环境下，务必将MyBatis的localCacheScope属性设置为STATEMENT，避免其他应用节点执行SQL更新语句后，本节点缓存得不到刷新而导致的数据一致性问题。**

## 二级缓存

> 使用步骤

1. 开启全局二级缓存配置

```xml
<setting name="cacheEnabled" value="true"/>
```

2. 去mapper.xml中配置使用二级缓存

```xml
<cache></cache>
```

3. 我们的POJO需要实现序列化接口