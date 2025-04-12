# Spring 校验
## 普通使用

*Error文案*

- FieldError是ObjectError子类，他多了关联的哪个字段
- reject:收集错误文案（如某个对象为空）
- rejectValue: 收集对象字段的错误（如某个字段 为空）

*Validate提升*

- 当想创建基于spring validated的bean时，使用**LocalValidatorFactoryBean**创建
- 还有一个基于方法的AOP拦截
- MethodValidationPostProcessor， 他是基于Validated注解来拦截的

> 示例
1. *引入jar包*

处理校验的包

```xml
<dependency>
  <groupId>org.hibernate.validator</groupId>
    <artifactId>hibernate-validator</artifactId>
</dependency>
```

引入ELManager处理Spring 的el表达是（解析el表达式）

```xml
<dependency>
    <groupId>org.mortbay.jasper</groupId>
    <artifactId>apache-el</artifactId>
</dependency>
```

2. *可以校验jar包是否正常*


```java
public static void main(String[] args) {
    AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext();
    applicationContext.register(BeanValidatedDemo.class);
    applicationContext.refresh();
    Validator bean = applicationContext.getBean(Validator.class);
    System.out.println(bean);
    applicationContext.close();
}

@Bean
static LocalValidatorFactoryBean validated() {
    return new LocalValidatorFactoryBean();
}
```
3. *直接使用校验*

`定义方法级别的处理`

*定义处理的processor*

```java
@Bean
static LocalValidatorFactoryBean validated() {
    LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
    return validator;
}

@Bean
static MethodValidationPostProcessor methodValidator(Validator validator) {
    MethodValidationPostProcessor methodValidation = new MethodValidationPostProcessor();
    methodValidation.setValidator(validator);
    return methodValidation;
}
```

*定义处理的pojo，NotNull标识不能为空*

```java
@Setter
@Getter
@ToString
static class User {
    @NotNull
    private String name;

    private Integer id;
}
```

*定义需要拦截的处理类，*<b id="blue">@Validated</b>*表示这个类会生成代理类*，当使用springbean调用方法时，会走Aop进行拦截

```
@Component
@Validated
static class  UserProcess {
    public void process(@Valid User user) {
        System.out.println(user);
    }
}
```

*调用测试*：抛出异常结果

```java
public static void main(String[] args) {
    AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext();
    applicationContext.register(BeanValidatedDemo.class);
    applicationContext.refresh();
    UserProcess bean = applicationContext.getBean(UserProcess.class);
    bean.process(new User());
    applicationContext.close();
}
```

## SpringBoot使用

*引入jar包*

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

*使用方式*：拦截信息返回有两种方式
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
如果我们不显示的使用BindingResult,可以使用**ControllerAdvice**注解来进行统一的处理

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

## Web常用校验注解


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

*例如：*

1. 当save的时候，抛出`用户名不能为空`异常
2. 当调用update时，抛出`修改不能传用户名`异常

*示例*：

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

利用@Valid的嵌套校验的规则，在校验list里面定义一个list成员，用于嵌套校验，然后重新实现list方法

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

## 数据绑定 DataBinder
*数据绑定*这个概念在任何一个成型的框架中都是特别重要的（尤其是web框架）。它提供的能力是：把字符串形式的参数转换成服务端真正需要的类型的转换（当然可能还包含校验）

- DataBinder 绑定方法
  - bind(PropertyValues pvs)
  - 通过PropertyValues的key-value与bean的属性映射

- 数据来源
  - BeanDefinition(xml格式的)
- 通过BeanDefinition#MutablePropertyValues.getPropertyValues();方法获取PropertyValues 值
- DataBinder 会默认忽略bean实体中不存在的属性
- 如果是嵌套属性，properties可以是user.name-value的方式，进行嵌套

> 绑定参数控制

```java
//是否忽略未知字段
private boolean ignoreUnknownFields = true;
//是否忽略非法字段
private boolean ignoreInvalidFields = false;
//是否增加前台路径，如user.name
private boolean autoGrowNestedPaths = true;

//绑定字段白名单
private String[] allowedFields;

//绑定字段黑名单
private String[] disallowedFields;

//必须绑定
private String[] requiredFields;
```

> 示例

```java
Person person = new Person();
DataBinder binder = new DataBinder(person);
MutablePropertyValues propertyValues = new MutablePropertyValues();
propertyValues.add("name", "laoxiao");
propertyValues.add("age","18");
binder.bind(propertyValues);
System.out.println(person);
```

*输出结果*：

Person(name=laoxiao, age=18)

# @Configuration

主要用于标识一个bean，用来标识这个bean是用于配置的


# 条件装配（condition）
## @condition

@condition注解，spring 4.0后产生，大量运用于spring boot中

比如，某两个bean，我们需要一个在Windows环境下注入，另一个需要在linux环境下注入

配置windows的condition，如果matches返回true，则注入bean

```java
public class WindowsCondition implements Condition {
    /**
     * 如果为false，被bean不生效
     * @param conditionContext
     * @param annotatedTypeMetadata
     * @return
     */
    public boolean matches(ConditionContext conditionContext, AnnotatedTypeMetadata annotatedTypeMetadata) {
        //获取bean上下文的工厂
        ConfigurableListableBeanFactory beanFactory = conditionContext.getBeanFactory();
        //获取当前环境信息
        Environment environment = conditionContext.getEnvironment();
        //判断是否时windows环境
        if(environment.getProperty("os.name").contains("Windows")){
            return true;
        }
        return false;
    }
}
```

linux的condition，这里直接写了false

```java
public class LinuxConfition implements Condition {
    public boolean matches(ConditionContext conditionContext, AnnotatedTypeMetadata annotatedTypeMetadata) {
        return false;
    }
}
```

config类的方法上加入对应的@Conditional， @Conditional可以加在类上，如果加在类上，则对整个congfig类中配置的bean都生效，Conditional配置时数组类型，可以配置多个

```java
@Bean
@Conditional({WindowsCondition.class})
public TestBean testBeanWindows(){
    TestBean testBean = new TestBean();
    testBean.setUsername("windows");
    return testBean;
}

@Bean
@Conditional({LinuxConfition.class})
public TestBean testBeanLinux(){
    TestBean testBean = new TestBean();
    testBean.setUsername("Linux");
    return testBean;
}
```

## @import导入组件

这里improt导入的组件，默认bean的id是全类名

如：com.xiao.entry.TestImport

```java
@Configuration
@ComponentScan(value = "com.xiao",includeFilters = {
        @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = {Controller.class})
}, useDefaultFilters = false)
@Import({TestImport.class})
public class MainConfig 
```

```java
public class TestImport {
}
```

## ImportSelector

自定义逻辑返回需要的组件

写一个自己的selector，将要导入的组件全类名写入返回的数组中

返回<b id="gray">类的全路径地址</b>来注入bean

```java
public class TestImportSelector implements ImportSelector {
    /**
     * AnnotationMetadata:当前标注@Import注解的类的所有注解信息
     * @param annotationMetadata
     * @return 导入到容器中的组件全类名
     */
    public String[] selectImports(AnnotationMetadata annotationMetadata) {
        //这里不能返回null，要么就返回空数组
        //return new String[0];
        return new String[]{"com.xiao.entry.MySelectorBean"};
    }
}
```

配置类中导入

```java
@Import({TestImport.class, TestImportSelector.class})
public class MainConfig
```

打印可以看到对应的组件

mainConfig
testController
com.xiao.entry.TestImport
com.xiao.entry.MySelectorBean
testBean
testBeanWindows

## ImportBeanDefinitionRegistrar

手动的根据容器中条件注入bean

利用<b id="blue">BeanDefinitionRegistry</b>来注入bean

```java
public class MyImprotBeanDef implements ImportBeanDefinitionRegistrar {
    /**
     * 手动的注入bean信息
     * @param annotationMetadata
     * @param beanDefinitionRegistry 所有注入容器的bean信息
     */
    public void registerBeanDefinitions(AnnotationMetadata annotationMetadata,
                                        BeanDefinitionRegistry beanDefinitionRegistry) {
        //判断是否存在testBean
        boolean testBean = beanDefinitionRegistry.containsBeanDefinition("testBean");
        if(testBean){
            //如果存在则注入myDefBean
            RootBeanDefinition rootBeanDefinition 
                = new RootBeanDefinition(TestImport.class);
            beanDefinitionRegistry
                .registerBeanDefinition("myDefBean", rootBeanDefinition);
        }
    }
}
```

```java
@Import({TestImport.class, TestImportSelector.class, MyImprotBeanDef.class})
public class MainConfig
```

打印结果：

```console
mainConfig
testController
com.xiao.entry.TestImport
com.xiao.entry.MySelectorBean
testBean
testBeanWindows
myDefBean
```

# @Resource和@Autowire的区别

1. @Resource和@Autowired都可以用来装配bean，都可以用于字段或setter方法。

`@Autowired`
1. @Autowired默认按类型装配，如果类型有多个，根据名称进行装配  
2. 默认情况下必须要求依赖对象必须存在，如果要允许null值，可以设置它的required属性为false。     
3. 他是spring层面定义的  

`@Resource`  
1. @Resource默认按名称装配，当找不到与名称匹配的bean时才按照类型进行装配。名称可以通过name属性指定，如果没有指定name属性，当注解写在字段上时，默认取字段名，当注解写在setter方法上时，默认取属性名进行装配。   
2. 他是jdk层面定义的注解   