
#

# GuavaCache

## 常用方式

> Guava Cache缓存的两种加载方式，利用CacheBuilder的builder模式构建

- CacheLoader
  - CacheLoader是按Key统一加载，所有取不到数据，则统一执行一种Load逻辑
- Callable
  - Callable方法允许在get 的时候指定key

## 常用Api

> CacheBuilder:类，缓存构建器

1. 构建缓存的入口，指定缓存配置参数并初始化本地缓存
2. CacheBuilder在 build方法中，会把前面设置的参数，全部传递给LocalCache,它自己实际不参与任何计算。这种**初始化参数**的方法值得借鉴，代码简洁易读。

> CacheLoader:抽象类

1. 用于从数据源加载数据，定义load、reload、loadAll 等操作

> Cache:接口

1. 定义get、put、invalidate等操作，这里只有缓存增删改的操作，没有数据加载的操作

> AbstractCache:抽象类，实现Cache接口

1. 其中批量操作都是循环执行单次行为，而单次行为都没有具体定义 

> LoadingCache:接口，继承自Cache

1. 定义get、getUnchecked、getAll等操作，这些操作都会从数据源load数据

> AbstractLoadingCache:

1. 抽象类，继承自AbstractCache，实现LoadingCache接口

> LocalCache:类

1. 整个guava cache 的**核心类**，包含了guava cache的数据结构以及基本的缓存的操作方法

> LocalManualCache: LocalCache内部静态类，实现Cache接口

1. 其内部的增删改缓存操作全部调用成员变量localCache (LocalCache类型）的相应方法

## 缓存的回收三种方式

> 基于容量回收

*maximumSize(long)*：当缓存中的元素超过指定值

> 定时回收

*expireAfterAccess(long, TimeUnit)*：缓存项在给定时间内没有被读或写，则回收。

*expireAfterWrite(long, TimeUnit)*：缓存项在给定的时间内没有被写访问，则回收。

## 缓存清除监听

*CacheBuilder.removalListener*： 

通过CacheBuilder.removalListener (Removal Listener）方法添加一个监听器，Removal Listener 会得到一个相关通知，通知中指定要清除的key和value



## api示例

```java
private static LoadingCache<String, String> loadingCache = CacheBuilder.newBuilder()
        //最大的条目数
        .maximumSize(20)
        //缓存过期时间
        .expireAfterAccess(20, TimeUnit.SECONDS)
        //缓存删除监听
        .removalListener(new RemovalListener<String, String>() {
            @Override
            public void onRemoval(RemovalNotification<String, String> removalNotification) {
                log.info("缓存被删除：{} ", removalNotification);
            }
        })
        //缓存key不存在加载方法
        .build(new CacheLoader<String, String>() {
            @Override
            public String load(String s) throws Exception {
                log.debug("缓存加载：{}", s);
                return "cache_"+s;
            }
        });


/**
 * 通过key 获取缓存数据，如果key不存在，调用 load 方法 加载缓存
  * @param key
 * @return
 * @throws Exception
 */
public static String get(String key) throws Exception {
    return loadingCache.get(key);
}

/**
 * 删除当前key的缓存
 * 此时会触发removalListener监听器
 * @param key
 */
public static void remove(String key) {
    loadingCache.invalidate(key);
}

/**
 * 删除所有缓存
 * 此时会触发removalListener监听器
 */
public static void removeAll() {
    loadingCache.invalidateAll();
}

/**
 *
 * 保存缓村数据， 如果缓存中有该数据，则会移除该key的缓存，
 * 此时会触发removalListener监听器
 */
public static void put() {
    loadingCache.put("laoxiao", "aaaa");
}
```

# Caffeine

## GitHub

[Home zh CN · ben-manes/caffeine Wiki (github.com)](https://github.com/ben-manes/caffeine/wiki/Home-zh-CN)

## Maven 

```java
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
    <version>2.9.2</version>
</dependency>

```