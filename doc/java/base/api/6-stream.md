

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