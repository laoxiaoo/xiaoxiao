# SpringBoot的一些工具包使用

#  缓存

## JSR107

# Valid校验

使用JSR303的@Valid注解能够校验前端传过来的校验字段

## SpringBoot使用

> 引入jar包

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

> 使用方式
>
> **拦截信息返回有两种方式**

1. 使用 **BindingResult**来返回值:`会将错误信息合并到`BindingResult`返回`

```java
@PostMapping("/save")
private String save(@Valid @RequestBody User user, BindingResult result) {
    if(result.hasErrors()) {
        //将错误信息合并起来返回
        StringBuilder builder = new StringBuilder();
        result.getFieldErrors().forEach(item -> builder.append(item.getDefaultMessage()));
        return builder.toString();
    }
    return null;
}
```

2. 通过抛出MethodArgumentNotValidException异常返回
   1. 如果我们不显示的使用BindingResult,可以使用**ControllerAdvice**注解来进行统一的处理

```java
@ControllerAdvice
@RestController
public class ExceptionControllerAdvice {

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public String handleValidException(MethodArgumentNotValidException exception) {
        BindingResult result = exception.getBindingResult();
        StringBuilder builder = new StringBuilder();
        result.getFieldErrors()
            .forEach(item -> builder.append(item.getDefaultMessage()));
        return builder.toString();
    }

}
```

## 常用注解

| 限制                      | 说明                                                         |
| :------------------------ | :----------------------------------------------------------- |
| @Null                     | 限制只能为null                                               |
| @NotNull                  | 限制必须不为null                                             |
| @AssertFalse              | 限制必须为false                                              |
| @AssertTrue               | 限制必须为true                                               |
| @DecimalMax(value)        | 限制必须为一个不大于指定值的数字                             |
| @DecimalMin(value)        | 限制必须为一个不小于指定值的数字                             |
| @Digits(integer,fraction) | 限制必须为一个小数，且整数部分的位数不能超过integer，小数部分的位数不能超过fraction |
| @Future                   | 限制必须是一个将来的日期                                     |
| @Max(value)               | 限制必须为一个不大于指定值的数字                             |
| @Min(value)               | 限制必须为一个不小于指定值的数字                             |
| @Past                     | 限制必须是一个过去的日期                                     |
| @Pattern(value)           | 限制必须符合指定的正则表达式                                 |
| @Size(max,min)            | 限制字符长度必须在min到max之间                               |
| @Past                     | 验证注解的元素值（日期类型）比当前时间早                     |
| @NotEmpty                 | 验证注解的元素值不为null且不为空（字符串长度不为0、集合大小不为0） |
| @NotBlank                 | 验证注解的元素值不为空（不为null、去除首位空格后长度为0），不同于@NotEmpty，@NotBlank只应用于字符串且在比较时会去除字符串的空格 |
| @Email                    | 验证注解的元素值是Email，也可以通过正则表达式和flag指定自定义的email格式 |

## 分组校验

- 有的时候，同一个DTO会用于不同的接口，不同的接口对字段校验不同，这时候，则需要分组校验
- **一旦加上分组，则每个字段校验都需要加上分组的标识**
- 定义两个用于标识的接口

> 例如：
>
> 当save的时候，抛出`用户名不能为空`异常
>
> 当调用update时，抛出`修改不能传用户名`异常

1. 定义两个校验组接口

```java
public interface SaveUserValid {
}
```

```java
public interface UpdateUserValid {
}
```

2. 在实体类上标识分组标识

```java
public class User {
    @NotBlank(message = "用户名不能为空", groups = SaveUserValid.class)
    @Null(message = "修改不能传用户名", groups = UpdateUserValid.class)
    private String name;
}
```

3. 不同的方法处理不同的分组

```java
@PostMapping("/save")
public String save(@Validated(SaveUserValid.class) @RequestBody User user) {
    return null;
}

@PostMapping("/update")
public void update(@Validated(UpdateUserValid.class) @RequestBody User user) {
    System.out.println("update -> "+ user.toString());
}
```

## 自定义注解拦截

1. 定义注解

```java
@Constraint(validatedBy = {MyConstraintValidator.class})
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface MyConstraint {
    String message();
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

2. 定义实体类

```java
public class ConstraintBean {
    private String id;
    @MyConstraint(message = "这是一个测试")
    private String username;
}
```

3. 定义处理器

```java
public class MyConstraintValidator 
    implements ConstraintValidator<MyConstraint, Object> {
    //初始化方法
    @Override
    public void initialize(MyConstraint constraintAnnotation) {
        System.out.println(constraintAnnotation);
    }


    @Override
    public boolean isValid(Object object, ConstraintValidatorContext constraintValidatorContext) {
        System.out.println("valid"+object.getClass());
        return false;
    }

}
```

## 集合类校验

1. 定义一个包装类（可直接复制）

```java
/**
 * 可被校验的ArrayList
 *
 * @param <E> 元素类型
 * @author xiao jie
 */
 public class ValidableArrayList<E> implements List<E> {
 
    @Valid
    private List<E> list;
     
    public ValidableArrayList() {
        this.list = new ArrayList<>();
    }
    
    public ValidableArrayList(List<E> list) {
        this.list = list;
    }
    
    public List<E> getList() {
        return list;
    }

    public void setList(List<E> list) {
        this.list = list;
    }
    
    @Override
    public int size() {
        return list.size();
    }

    @Override
    public boolean isEmpty() {
        return list.isEmpty();
    }

    @Override
    public boolean contains(Object o) {
        return list.contains(o);
    }

    @Override
    public Iterator<E> iterator() {
        return list.iterator();
    }

    @Override
    public Object[] toArray() {
        return list.toArray();
    }

    @Override
    public <T> T[] toArray(T[] a) {
        return list.toArray(a);
    }

    @Override
    public boolean add(E e) {
        return list.add(e);
    }

    @Override
    public boolean remove(Object o) {
        return list.remove(o);
    }

    @Override
    public boolean containsAll(Collection<?> c) {
        return list.containsAll(c);
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        return list.addAll(c);
    }

    @Override
    public boolean addAll(int index, Collection<? extends E> c) {
        return list.addAll(index, c);
    }

    @Override
    public boolean removeAll(Collection<?> c) {
        return list.retainAll(c);
    }

    @Override
    public boolean retainAll(Collection<?> c) {
        return list.retainAll(c);
    }

    @Override
    public void clear() {
        list.clear();
    }

    @Override
    public E get(int index) {
        return list.get(index);
    }

    @Override
    public E set(int index, E element) {
        return list.set(index, element);
    }

    @Override
    public void add(int index, E element) {
        list.add(index, element);
    }

    @Override
    public E remove(int index) {
        return list.remove(index);
    }

    @Override
    public int indexOf(Object o) {
        return list.indexOf(o);
    }

    @Override
    public int lastIndexOf(Object o) {
        return list.lastIndexOf(o);
    }

    @Override
    public ListIterator<E> listIterator() {
        return list.listIterator();
    }

    @Override
    public ListIterator<E> listIterator(int index) {
        return list.listIterator(index);
    }

    @Override
    public List<E> subList(int fromIndex, int toIndex) {
        return list.subList(fromIndex, toIndex);
    }

 }
```

2. controller的方法使用

```java
@Valid @RequestBody ValidableArrayList<某个实体类> param
```

