

# List对实体某个字段去重

例如，对Student类的id字段去重
```java

list.stream().
//去重操作
.collect(Collectors.collectingAndThen(
            Collectors.toMap(
                    Student::getId, // keyMapper
                    Student -> student, // valueMapper
                    (existing, replacement) -> existing // mergeFunction
            ),
            v -> new ArrayList<>(v.values())
    ))

```

# 排序

## Comparator.comparing的运用

```java 

//返回 对象集合以类属性一升序排序
list.stream().sorted(Comparator.comparing(类::属性一));

//返回 对象集合以类属性一降序排序 注意两种写法
//先以属性一升序,结果进行属性一降序
list.stream().sorted(Comparator.comparing(类::属性一).reversed());
//以属性一降序
list.stream().sorted(Comparator.comparing(类::属性一,Comparator.reverseOrder()));

//返回 对象集合以类属性一升序 属性二升序
list.stream().sorted(Comparator.comparing(类::属性一).thenComparing(类::属性二));

//返回 对象集合以类属性一降序 属性二升序 注意两种写法
//先以属性一升序,升序结果进行属性一降序,再进行属性二升序
list.stream().sorted(Comparator.comparing(类::属性一).reversed().thenComparing(类::属性二));
//先以属性一降序,再进行属性二升序
list.stream().sorted(Comparator.comparing(类::属性一,Comparator.reverseOrder()).thenComparing(类::属性二));

//返回 对象集合以类属性一降序 属性二降序 注意两种写法
//先以属性一升序,升序结果进行属性一降序,再进行属性二降序
list.stream().sorted(Comparator.comparing(类::属性一).reversed().thenComparing(类::属性二,Comparator.reverseOrder()));
//先以属性一降序,再进行属性二降序
list.stream().sorted(Comparator.comparing(类::属性一,Comparator.reverseOrder()).thenComparing(类::属性二,Comparator.reverseOrder()));

//返回 对象集合以类属性一升序 属性二降序 注意两种写法
//先以属性一升序,升序结果进行属性一降序,再进行属性二升序,结果进行属性一降序属性二降序
list.stream().sorted(Comparator.comparing(类::属性一).reversed().thenComparing(类::属性二).reversed());
//先以属性一升序,再进行属性二降序
list.stream().sorted(Comparator.comparing(类::属性一).thenComparing(类::属性二,Comparator.reverseOrder()));


```