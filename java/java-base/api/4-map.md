# Java8新特性

## getOrDefault

```java
default V getOrDefault(Object key, V defaultValue)
```

- 如果Map中这个 key 存在，则返回这个key对应的 value
- 如果Map中这个 key 不存在，则把传入的**defaultValue**作为返回值

## compute

```java
default V compute(K key, BiFunction<? super K, ? super V, ? extends V> remappingFunction)
```

- 如果Map中 key 对应的 value 不存在，则返回该 null
- 如果Map中 key 对应的 value 存在，则返回通过 remappingFunction 重新计算值，如果计算后的值newValue不为null ，则把计算后的值newValue返回，并且把计算后的值newValue更新到映射中；如果计算后的值newValue为null ，则返回null，并且把当前key 对应的映射从集合中删除。
- 无论value是否存在，都会进入方法已

## computeIfAbsent

```java
default V computeIfAbsent(K key, Function<? super K, ? extends V> mappingFunction)
```

- 如果Map中 key 对应的 value 存在，返回 value
- 如果Map中 key 对应的 value 不存在，则通过remappingFunction 重新计算值，如果新计算的值newValue不为null，并保存从key 到计算后的值newValue的一个映射；如果新计算的值newValue为null，则不会加入映射

## computeIfPresent

```java
default V computeIfPresent(K key, BiFunction<? super K, ? super V, ? extends V> remappingFunction)
```

- 如果Map中 key 对应的 value 不存在，则返回该 null
- 如果Map中 key 对应的 value 存在，则通过 remappingFunction 重新计算值，如果新计算的值不为null，则更新从key 到计算后的值newValue的一个映射；如果新计算的值为null，则删除key 到value的映射
- 只有value存在时，才会进入方法体

## putIfAbsent

```java
default V putIfAbsent(K key, V value)
```

- 如果Map中 key 对应的 value 存在，则返回value
- 如果Map中 key 对应的 value 为 null，返回null ，并且添加从key到传入的value的映射

## merge

```java
default V merge(K key, V value, BiFunction<? super V, ? super V, ? extends V> remappingFunction)
```

- 如果Map中不存在指定的key时，便将传入的value设置为key的值，
- 如果Map中key存在value时，执行一个方法该方法接收key的旧值oldValue和传入的value，执行自定义的方法


