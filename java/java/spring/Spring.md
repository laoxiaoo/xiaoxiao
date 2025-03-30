# Spring概述

## spring特性

### 核心特性（core）

- Ioc容器
- Spring 事件
- 资源管理
- 国际化
- 校验
- 数据绑定
- 类型转换
- spring 表达式
- 面向切面编程
  - aop

### web技术

- web servlet
- web reactive

### 测试

- 模拟对象
- TestContext框架
  - 加载spring的上下文

## spring 版本特性

- 1.x
- 2.x
- 3.x
  - 引入注解
  - 基本确定内核
- 4.x
  - 对spring boot 1.x的支持
- 5.x

## spring 模块设计

- spring-aop

- spring-core
  - 

- spring-jcl
  - 日志的支持

...

## spring 对jdk api支持

- java5

| XML处理(DOM,SAX...) | 1.0  | XmlBeanDefinitionReader |
| ------------------- | ---- | ----------------------- |
| Java管理扩展(JMX)   | 1.2  | @ManagedResource        |
| 并发框架(J.U.C)     | 3.0  | ThreadPoolTaskExecutor  |
| 格式化(Formatter)   | 3.0  | DateFormat              |

- java6

| JDBC4.0                      | 1.0  | JdbcTemplate                         |
| ---------------------------- | ---- | ------------------------------------ |
| Common Annotations(JSR 250)  | 2.5  |                                      |
| 可插拔注解处理api（JSR 269） | 5.0  | @Indexed(减少运行时的scanning的操作) |
|                              |      |                                      |






# Spring IOC

## IOC容器的职责

- 实现与应用解耦

- 依赖处理
  - 依赖查找：如通过名称去查找
  - 依赖注入

## Java Beans

```tex
JavaBean是一种特殊的类，主要用于传递数据信息，
这种类中的方法主要用于访问私有的字段，
且方法名符合某种命名规则。
如果在两个模块之间传递信息，
可以将信息封装进JavaBean中，
这种对象称为“值对象”(Value Object)，或“VO”。
方法比较少。
这些信息储存在类的私有变量中，通过set()、get()获得。
```

### 特性

- 依赖查找
- 生命周期管理
- 配置元信息
- 事件
- 资源管理
- 持久化

### JDK内省类库

- 定义一个pojo类

```java
@Getter
@Setter
@ToString
public class Person {
    private String name;
    private Integer age;
}
```

> Introspector类

- 编写BeanInfo的示例
  - 可以看到打印的，多出了一个
  - name=class; propertyType=class java.lang.Class readMethod=public
  - 那是因为顶层Object类有一个getClass方法，他会默认以为这个是一个**可读的方法**

```java
public static void main(String[] args) throws IntrospectionException {
        BeanInfo beanInfo = Introspector.getBeanInfo(Person.class);
    	//getPropertyDescriptors()，获得属性的描述，
    	//可以采用遍历BeanInfo的方法，来查找、设置类的属性
        Arrays.stream(beanInfo.getPropertyDescriptors()).forEach(propertyDescriptor -> {
           System.out.println(propertyDescriptor.toString());
        });
    }
```

- 打印出Person的属性信息,和**父类object信息**

![](https://gitee.com/xiaojihao/xiaoxiao/raw/master/image/java/spring/20210609175925.png)

- 我们可以加上stopClass的参数，避免他向上寻找父类

```java
BeanInfo beanInfo = Introspector.getBeanInfo(Person.class, Object.class);
```

## 依赖查找

### 延迟查找与及时查找

- 定义配置类

```java
@Configurable
public class DependencyLookUpConfig {
    @Bean
    public Person person() {
        return new Person();
    }

    @Bean
    public ObjectFactoryCreatingFactoryBean objectFactory() {
        ObjectFactoryCreatingFactoryBean objectFactory = new ObjectFactoryCreatingFactoryBean();
        //将bean的名称设置进去
        objectFactory.setTargetBeanName("person");
        return objectFactory;
    }
}
```

> 依赖查找

- 及时查找

```java
public static void main(String[] args) {
    BeanFactory beanFactory = new AnnotationConfigApplicationContext(DependencyLookUpConfig.class);
    lookUpLazyTime(beanFactory);
    lookUpRealTime(beanFactory);
}

/**
     * 及时查找
     * @param beanFactory
     */
static void lookUpRealTime(BeanFactory beanFactory) {
    Person bean = beanFactory.getBean(Person.class);
    System.out.println(bean);
}
```

- 延迟查找:并不是里面初始化,延迟查找需要通过中间类来获取bean

```java
/**
     * 延迟查找
     * @param beanFactory
     */
static void lookUpLazyTime(BeanFactory beanFactory) {
    ObjectFactory<Person> bean = beanFactory.getBean(ObjectFactory.class);
    System.out.println(bean.getObject());
}
```

### 通过注解来查找bean

- 定义一个AnUser额注解
- 将注解标注在SuperPerson类上

```java
@AnUser
public class SuperPerson extends Person {
}
```

- 通过注解获取对应的bean

```java
public static void main(String[] args) {
    BeanFactory beanFactory = new AnnotationConfigApplicationContext(DependencyLookUpConfig.class);
    lookUpByAnnotation(beanFactory);
}

/**
 * 通过注解来查找bean
 * @param beanFactory
 */
private static void lookUpByAnnotation(BeanFactory beanFactory) {
    if(beanFactory instanceof ListableBeanFactory) {
        Map<String, Object> beans = ((ListableBeanFactory) beanFactory).getBeansWithAnnotation(AnUser.class);
        System.out.println(beans.toString());
    }
}
```



# Spring Bean



## 注入容器的方式


## BeanDefinition 合并

- 当子类注入bean，父类也注入了bean，那么采用合并的方式，能够将父类的值合并到子类

- RootBeanDefinition表示顶层bean，这是不需要合并的

- 子类的有GenericBeanDefinition，这个是需要合并的

  

> 在ConfigurableBeanFactory#getMergedBeanDefinition会递归的向上合并

```java
//当前不包含这个beandefiniton，则去父类查找是否存在bean
if (!containsBeanDefinition(beanName) 
    && getParentBeanFactory() instanceof ConfigurableBeanFactory) {
   return ((ConfigurableBeanFactory) getParentBeanFactory()).getMergedBeanDefinition(beanName);
}
//如果存在这个bean的话，则继续寻找
return getMergedLocalBeanDefinition(beanName);
```

- 合并后会由GenericBeanDefinition --->RootBeanDefinition

## Bean 初始化

- 注解方式

```java
@PostConstruct
public void postInit() {
    System.out.println("==> PostConstruct init");
}
```

- bean方式

```java
@Bean(initMethod = "initMethod")
public Person person() {
    return new Person();
}
```

```java
public class Person{
    public void initMethod() {
        System.out.println("==> init method");
    }
}
```

- 实现InitializingBean方式

```java
public class Person implements InitializingBean {
    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("==> afterPropertiesSet init");
    }
}
```

> 打印顺序

PostConstruct---->afterPropertiesSet----->initMethod

## 层次性依赖查找

- HierarchicalBeanFactory可以类似双亲委派一样，当local beanFactory没有找到bean，则去parent寻找
- 层次性依赖查找接口：HierarchicalBeanFactory
> 根据bean名称查找

1. 基于containsLocalBean方式实现
2. spring api  没有实现，需要我们自己跟进localBean来实现

```java
public static void main(String[] args) {
    AnnotationConfigApplicationContext applicationContext
            = new AnnotationConfigApplicationContext(DependencyLookUpConfig.class);

    // 获取HierarchicalBeanFactory
    // HierarchicalBeanFactory <-- ConfigurableBeanFactory <-- ConfigurableListableBeanFactory
    //所以此处我们只需要获取ConfigurableListableBeanFactory即可
    ConfigurableListableBeanFactory beanFactory = applicationContext.getBeanFactory();
    System.out.println("parent bean factory: "+ beanFactory.getParentBeanFactory());
    //configurable代表可修改的，这里我们去修改parent BeanFactory
    beanFactory.setParentBeanFactory(getBeanFactory());
    System.out.println("parent bean factory: "+ beanFactory.getParentBeanFactory());
}

public static BeanFactory getBeanFactory() {
    AnnotationConfigApplicationContext applicationContext
            = new AnnotationConfigApplicationContext(DependencyLookUpConfig.class);
    ConfigurableListableBeanFactory beanFactory = applicationContext.getBeanFactory();
    return beanFactory;
}
```

## 延迟依赖查找

> ObjectFactory

```java
public interface ObjectFactory<T> {
	T getObject() throws BeansException;
}
```

只是一个普通的对象工厂接口。在Spring中主要两处用了它

1. Scope接口中的get方法，需要传入一个`ObjectFactory`

> ObjectProvider

- ObjectProvider  继承 ObjectFactory

- ObjectProvider在java8的拓展

```java
public static void main(String[] args) {
    AnnotationConfigApplicationContext applicationContext =
            new AnnotationConfigApplicationContext(ObjectProviderDemo.class);
    lookupIfAvailable(applicationContext);
    applicationContext.close();
}

/**
 * 如果bean不存在则创建（注意不会注入容器中）
 * @param applicationContext
 */
private static void lookupIfAvailable(AnnotationConfigApplicationContext applicationContext) {
    ObjectProvider<Person> beanProvider = applicationContext.getBeanProvider(Person.class);
    Person person = beanProvider.getIfAvailable(Person::new);
    System.out.println(person);
}
```

- ObjectProvider的集合操作
  - 定义两个String类型的bean
  - 用过provider循环输出

```java
public static void main(String[] args) {
    AnnotationConfigApplicationContext applicationContext =
            new AnnotationConfigApplicationContext(ObjectProviderDemo.class);
    lookupIterable(applicationContext);
    applicationContext.close();
}

private static void lookupIterable(AnnotationConfigApplicationContext applicationContext) {
    ObjectProvider<String> beanProvider = applicationContext.getBeanProvider(String.class);
    for(String bean : beanProvider) {
        System.out.println(bean);
    }
}
@Bean
public String getMessage() {
    return "message";
}

@Bean
public String getHello() {
    return "hello";
}
```

## 内建可查找的依赖

- AbstractApplicationContext 内建可查找的依赖

| Bean名称                    | Bean 实例                       | 使用场景             |
| --------------------------- | ------------------------------- | -------------------- |
| environment                 | Enviroment对象                  | 外部配置以及profiles |
| SystemProperties            | Properties对象                  | java系统属性         |
| systemEnvironment           | Map对象                         | 操作系统环境变量     |
| messageSource               | MessageSource对象               | 国际化文案           |
| applicationEventMulticaster | applicationEventMulticaster对象 | Spring 事件广播      |

- AutowiredAnnotationBeanPostProcessor
  - 通过源码可以看到：他处理Autowired，Value相关的注解

```java
public AutowiredAnnotationBeanPostProcessor() {
    this.autowiredAnnotationTypes.add(Autowired.class);
    this.autowiredAnnotationTypes.add(Value.class);
```

- AnnotationConfigUtils

  - 在给定的注册表中注册所有相关的注释后置处理器

## 常见异常

| 异常类型                      | 触发条件(举例)              | 场景举例                                      |
| ----------------------------- | --------------------------- | --------------------------------------------- |
| NoSuchBeanDefinitionException | 当查找Bean不存在于loC容器时 | BeanFactory#getBean、ObjectFactoryt#getObject |
|                               |                             |                                               |
|                               |                             |                                               |

## ObjectFactory BeanFactory区别

答:ObjectFactory 与 BeanFactory 均提供依赖查找的能力。

不过ObjectFactory仅关注一个或一种类型的 Bean依赖查找，开且自身不具备依赖查找的能力，能力则由BeanFactory 输出。

BeanFactory则提供了单一类型、集合类型以及层次性等多种依赖查找方式。

## beanFactory.getBean是否线程安全

是线程安全的

# IOC依赖注入



## 其他注入方式

定义一个实体类，供后面测试

```java
public class TestBean {

    private String username;
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "TestBean{" +
                "username='" + username + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
```



- 在test类中获取

```java

```

### 注解方式

定义一个配置类，这个方法中的bean的id默认是方法名

```java
@Configuration
public class MainConfig {
    @Bean
    public TestBean testBean(){
        TestBean testBean = new TestBean();
        testBean.setUsername("lisi");
        return testBean;
    }
}
```

test类获取bean

```java
@Test
public void testBeanConfig(){
    ApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig.class);
    TestBean testBean = (TestBean)applicationContext.getBean("testBean");
    System.out.println(testBean.toString());
}
```

如果想自定义bean的id

```java
@Bean("testBeanZdy")
public TestBean testBean(){
    TestBean testBean = new TestBean();
    testBean.setUsername("lisi");
    return testBean;
}
```



## 依赖处理过程

- 为什么字段注入是通过类查找依赖
  - 因为DependencyDescriptor继承了InjectionPoint
  - 在InjectionPoint中，getDeclaredType方法返回字段通过什么类型查找

### 注入普通了类分析

- 从DefaultListableBeanFactory#resolveDependency入手

- 定义一个启动类，注入一个Bean

```java
public class AnnotationDependencyResolveDemo {
    @Autowired
    private Person person;
}
```

- 看到对应的DependencyDescriptor，他描述了需要注入的对应的Bean信息
  - declaringClass:类信息，这里是demo类
  - superPerson：注入的字段名称
  - field：注入的字段信息

- 进入doResolveDependency方法

```java
//查看上级有没有被嵌套过
InjectionPoint previousInjectionPoint = ConstructorResolver.setCurrentInjectionPoint(descriptor);
try {
   //注入的字段类型，这里是superperson
   Class<?> type = descriptor.getDependencyType();
  //通过type(这里是Person)查到能够注入的bean
   Map<String, Object> matchingBeans = findAutowireCandidates(beanName, type, descriptor);
  

   String autowiredBeanName;
   Object instanceCandidate;
//判断是不是有多个bean
   if (matchingBeans.size() > 1) {
       //再次筛选符合条件的bean名称
      autowiredBeanName = determineAutowireCandidate(matchingBeans, descriptor);
      
      instanceCandidate = matchingBeans.get(autowiredBeanName);
   }
   else {
      //一个bean直接获取
      Map.Entry<String, Object> entry = matchingBeans.entrySet().iterator().next();
      autowiredBeanName = entry.getKey();
      instanceCandidate = entry.getValue();
   }

   if (autowiredBeanNames != null) {
      autowiredBeanNames.add(autowiredBeanName);
   }
   if (instanceCandidate instanceof Class) {
      //调用beanFactory.getBean(beanName)获取bean
      instanceCandidate = descriptor.resolveCandidate(autowiredBeanName, type, this);
   }
   return result;
}
```

## 使用注解进行包扫描

将指定包下的所有标注了@Controller、@Service、@Repository，@Component扫入容器

```java
@Configuration
@ComponentScan(value = "com.xiao")
public class MainConfig {
    @Bean("testBeanZdy")
    public TestBean testBean(){
        TestBean testBean = new TestBean();
        testBean.setUsername("lisi");
        return testBean;
    }
}
```

排除controller注解，将其不纳入扫描范围

```java
@Configuration
@ComponentScan(value = "com.xiao",excludeFilters = {
        @ComponentScan.Filter(type= FilterType.ANNOTATION, classes = {Controller.class}),
})
```

只扫描controller组件

```java
@Configuration
@ComponentScan(value = "com.xiao",includeFilters = {
        @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = {Controller.class})
}, useDefaultFilters = false)
```

## Autowire注入过程

注意AutowiredAnnotationBeanPostProcessor#postProcessProperties

和MergedBeanDefinitionPostProcessor#postProcessMergedBeanDefinition进行元信息操作

**注入在postProcessProperties 方法执行，早于setter注入， 也早于@PostConstruct**

 ## 自定义注入

- 定义一与Autowired注解类似的注解

```java
@Target({ElementType.CONSTRUCTOR, ElementType.METHOD, ElementType.PARAMETER, ElementType.FIELD, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface InjectPerson {
}
```

- 注入内容

```java
@InjectPerson
private Person injectPerson;
```

- 生成注解处理post
  - AUTOWIRED_ANNOTATION_PROCESSOR_BEAN_NAME：在AnnotationConfigUtils定义了这个名字，如果这个名称已经产生，则不再重新注入AutowiredAnnotationBeanPostProcessor
  - static：如果是非静态的一个方法，当前bean产生依赖当前所在的类，定义为static能让这个bean独立于所在类

```java
@Bean(name = AUTOWIRED_ANNOTATION_PROCESSOR_BEAN_NAME)
public static AutowiredAnnotationBeanPostProcessor beanPostProcessor() {
    AutowiredAnnotationBeanPostProcessor beanPostProcessor = new AutowiredAnnotationBeanPostProcessor();
    beanPostProcessor.setAutowiredAnnotationType(InjectPerson.class);
    return beanPostProcessor;
}
```

- 我们发现这样的注入方式，只能处理inject注解，不能处理autowired注解
- 因为AnnotationConfigUtils的缘故，所以我们重新生产bean，并且，加入order，让其晚于AUTOWIRED_ANNOTATION_PROCESSOR_BEAN_NAME生成

```java
@Bean
@Order(Ordered.LOWEST_PRECEDENCE - 3)
public static AutowiredAnnotationBeanPostProcessor beanPostProcessor() {
    AutowiredAnnotationBeanPostProcessor beanPostProcessor = new AutowiredAnnotationBeanPostProcessor();
    beanPostProcessor.setAutowiredAnnotationType(InjectPerson.class);
    return beanPostProcessor;
}
```

如此，InjectPerson就能注入进去对应的bean了

## 组件的过滤规则

FilterType.ANNOTATION：按照注解
FilterType.ASSIGNABLE_TYPE：按照给定的类型（如:指定某个接口的实现类，就只扫描这个接口的实现类）；
FilterType.ASPECTJ：使用ASPECTJ表达式
FilterType.REGEX：使用正则指定
FilterType.CUSTOM：使用自定义规则

自定义规则示例

```java
public class MyTestFilter implements TypeFilter {
    /**
     *
     * @param metadataReader 获取当前扫描类的信息
     * @param metadataReaderFactory 获取其他所有类的信息
     * @return
     * @throws IOException
     */
    public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory) throws IOException {
        //获取当前类注解信息
        AnnotationMetadata annotationMetadata = metadataReader.getAnnotationMetadata();
        //获取当前类信息
        metadataReader.getClassMetadata();
        //获取当前类资源， 如类路径等
        metadataReader.getResource();
        //如果返回true，则意味着将当前类加入容器中
        return false;
    }
}
```




# 依赖来源

依赖注入会比依赖来源多一项非spring容器管理对象

即：

```java
beanFactory.registerResolvableDependency(BeanFactory.class, beanFactory);
beanFactory.registerResolvableDependency(ResourceLoader.class, this);
beanFactory.registerResolvableDependency(ApplicationEventPublisher.class, this);
beanFactory.registerResolvableDependency(ApplicationContext.class, this);
```

这四个

BeanFactory不能通过autowire的方式注入，其他都可以

## 容器管理

元信息：是不是primary,lazy

| 来源                       | bean对象 | 生命周期管理 | 配置元信息 | 使用场景       |
| -------------------------- | -------- | ------------ | ---------- | -------------- |
| spring beanDefinition      | y        | Y            | Y          | 依赖注入，查找 |
| 单体对象(beanDefinition等) | y        | n            | n          | 依赖注入，查找 |
| Resolvable Dependency      | N        | N            | N          | 依赖注入       |

## BeanDefinition

- 注册中心接口：BeanDefinitionRegistry，它提供了一些正常的CURD的接口方法
- 它的实现：DefaultListableBeanFactory
- 通过DefaultListableBeanFactory#registerBeanDefinition(String beanName, BeanDefinition beanDefinition)方法注入
- 将其注入到对应的集合中

```java
//存储集合
this.beanDefinitionMap.put(beanName, beanDefinition);
//维护顺序
this.beanDefinitionNames.add(beanName);
```

- 最后通过BeanDefinition元信息创建bean

## 注入和查找来源是否相同

否，查找来源Spring BeanDefinition 以及单例对象，而注入来源还包括Resolvable Dependency 以及@Value 外部配置




# Bean 元信息配置

- BeanDefinition配置

## 面向资源

### xml配置方式

1. 在resources下建立bean.xml文件

```xml
<!--以配置文件的方式配置bean-->
<bean id="testBean" class="com.xiao.entry.TestBean" >
    <property name="username" value="xiao"></property>
    <property name="password" value="123456"></property>
</bean>
```

2. 注入bean和获取bean

```java
@Test
public void testBeanXml(){
    //直接从bean文件获取bean
    ApplicationContext applicationContext = new ClassPathXmlApplicationContext("bean.xml");
    TestBean testBean = (TestBean) applicationContext.getBean("testBean");
    System.out.println(testBean.toString());
}
```

### properties 

- 遵循的格式可以参考PropertiesBeanDefinitionReader
- 如employee.(class)=MyClass  表示指定Bean的class

- 在resource下定义数据

```properties
person.(class)=com.xiao.pojo.Person
person.age=1
person.name=老肖
```

- 定义加载类

```java
public static void main(String[] args) {
        DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
        PropertiesBeanDefinitionReader beanDefinitionReader = new PropertiesBeanDefinitionReader(beanFactory);
        String location = "application.properties";
        EncodedResource encodedResource = new EncodedResource(new ClassPathResource(location), "UTF-8");
        int i = beanDefinitionReader.loadBeanDefinitions(encodedResource);
        System.out.println("加载bean数量: " + i);

        Person bean = beanFactory.getBean(Person.class);
        System.out.println(bean);
    }
```

## Bean Class 加载

- AbstractBeanFactory#doGetBean 进入
- 在获取完beanDefinition后

```java
final RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
```

- 调用DefaultSingletonBeanRegistry#getSingleton方法

- 如果没有找到bean，则执行方法进行创建bean

```java
sharedInstance = getSingleton(beanName, () -> {
   try {
      return createBean(beanName, mbd, args);
   }
});
```

- 进入AbstractAutowireCapableBeanFactory#createBean方法创建bean

```java
//解析bean的class（利用java的classload）
Class<?> resolvedClass = resolveBeanClass(mbd, beanName);
```

## Bean实例化前

- 每实例化bean都会拿出所有的前置处理进行调用
- InstantiationAwareBeanPostProcessor#postProcessBeforeInstantiation  
- bean实例化前进行加载，如果返回对象不为空，则直接使用当前对象
- 用处：如需要实现自己的远程bean等一些

- 实例：

```java
public static void main(String[] args) {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext();
        applicationContext.register(InstantiationBeforeProcessor.class);
        applicationContext.addBeanFactoryPostProcessor(beanFactory -> {
            beanFactory.addBeanPostProcessor(new MyInstantiationBeanProcessor());
        });
        applicationContext.refresh();

        applicationContext.close();
    }

    static class MyInstantiationBeanProcessor implements InstantiationAwareBeanPostProcessor {
        @Override
        public Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) throws BeansException {
            System.out.println(beanClass);
            return null;
        }
    }
```

## 实例化

### 传统

- 从AbstractAutowireCapableBeanFactory#doCreateBean
- 进入AbstractAutowireCapableBeanFactory#createBeanInstance

```java
protected BeanWrapper createBeanInstance(String beanName, RootBeanDefinition mbd, @Nullable Object[] args) {


   Supplier<?> instanceSupplier = mbd.getInstanceSupplier();
   if (instanceSupplier != null) {
      return obtainFromSupplier(instanceSupplier, beanName);
   }

   if (mbd.getFactoryMethodName() != null) {
       //工厂方法进行实例化
      return instantiateUsingFactoryMethod(beanName, mbd, args);
   }


   // Candidate constructors for autowiring?
   Constructor<?>[] ctors = determineConstructorsFromBeanPostProcessors(beanClass, beanName);
   if (ctors != null || mbd.getResolvedAutowireMode() == AUTOWIRE_CONSTRUCTOR ||
         mbd.hasConstructorArgumentValues() || !ObjectUtils.isEmpty(args)) {
       //带参构造函数初始化
      return autowireConstructor(beanName, mbd, ctors, args);
   }

   ctors = mbd.getPreferredConstructors();
   if (ctors != null) {
      return autowireConstructor(beanName, mbd, ctors, null);
   }
	//默认实例化，无构造参数实例化
   return instantiateBean(beanName, mbd);
}
```

- AbstractAutowireCapableBeanFactory#instantiateBean

```java
//使用策略的方式进行调用创建方法
beanInstance = getInstantiationStrategy().instantiate(mbd, beanName, parent);
```

- SimpleInstantiationStrategy#instantiate
- 最后调用BeanUtils.instantiateClass(constructorToUse);生成bean

### 构造器注入

- 按照类型注入
- resolveDependency

## 实例化后

- InstantiationAwareBeanPostProcessor#postProcessAfterInstantiation
- 已经实例化bean了，但是没有注入属性
- 如果我们不想走传统复制方式，则可以采用这种方式赋值

- 在AbstractAutowireCapableBeanFactory#doCreateBean中

```java
Object exposedObject = bean;
try {
    //实例化以后注入属性
   populateBean(beanName, mbd, instanceWrapper);
   exposedObject = initializeBean(beanName, exposedObject, mbd);
}
```

- 使用方式

```java
static class MyInstantiationBeanProcessor implements InstantiationAwareBeanPostProcessor {

    @Override
    public boolean postProcessAfterInstantiation(Object bean, String beanName) throws BeansException {
        if(ObjectUtils.nullSafeEquals(beanName, "person")) {
            Person person = Person.class.cast(bean);
            person.setAge(2);
            return true;
        }
        return false;
    }
}
```

## 属性赋值前

- InstantiationAwareBeanPostProcessor#postProcessProperties

## Bean Aware

- BeanNameAware
- BeanClassLoaderAware
- BeanFactoryAware

## Bean 初始化前

- 这个时候已经完成了Bean实例化、Bean属性赋值、Aware接口回调

- BeanPostProcessor#postProcessBeforeInitialization
- 从源码可以看出，如果返回的不为空，则会直接当成bean（可以返回代理对象）使用

```java
for (BeanPostProcessor processor : getBeanPostProcessors()) {
   Object current = processor.postProcessBeforeInitialization(result, beanName);
   if (current == null) {
      return result;
   }
   result = current;
}
```

- 这个执行在bean初始化方法里

```java
Object exposedObject = bean;
try {
   populateBean(beanName, mbd, instanceWrapper);
   //执行初始化
   exposedObject = initializeBean(beanName, exposedObject, mbd);
}
```



## 初始化阶段

- 

## 初始化后

- BeanPostProcessor#postProcessAfterInitialization

## 初始化完成

- SmartInitializingSingleton#afterSingletonsInstantiated
- 通常在spring applicationcontext调用
- 当前容器所有的beandefinition已经完全初始化后调用

## Bean 销毁前阶段

- DestructionAwareBeanPostProcessor#postProcessBeforeDestruction

## Aware相关执行

- 通过org.springframework.context.support.ApplicationContextAwareProcessor#invokeAwareInterfaces方法的顺序进行执行

# Bean配置元信息

- 配置元信息   BeanDefinition
- 属性元信息 propertyValues
  - 他是个集合
- 外部化元信息  propertySource
- Profile元信息  @Profile
  - 如生产测试环境等的区分
  - 在Environment#getDefaultProfiles中体现

## XML配置元信息

- 具体可以参考BeanDefinitionParserDelegate
- 里面的默认值属性
- 实现类为：XmlBeanDefinitionReader
- 加载顺序XmlBeanDefinitionReader#loadBeanDefinitions->doLoadBeanDefinitions->registerBeanDefinitions->DefaultBeanDefinitionDocumentReader#doRegisterBeanDefinitions(解析)

### 生效配置

- 在META-INF/spring.handlers下，会有对应的命名空间对应的handler
- META-INF/spring.schemas下有对应的xsd映射关系

## properties配置元信息

- 实现类：PropertiesBeanDefinitionReader

## 注解的方式

- 在ClassPathScanningCandidateComponentProvider#registerDefaultFilters中
- 注册相关注解

```java
protected void registerDefaultFilters() {
   this.includeFilters.add(new AnnotationTypeFilter(Component.class));
```

- 基于AnnotatedBeanDefinitionReader实现

```java
public class AnnotatedBeanDefinitionReader {
	//bean名称的generator
   private BeanNameGenerator beanNameGenerator = AnnotationBeanNameGenerator.INSTANCE;
//解析元信息的相关信息，如代理类等信息
   private ScopeMetadataResolver scopeMetadataResolver = new AnnotationScopeMetadataResolver();
    //是否注册bean（条件）
    private ConditionEvaluator conditionEvaluator;
```

- 在AnnotatedBeanDefinitionReader#doRegisterBean进行注册

### 转配注解

- @ImportResource   替换xml的<import>， 可以直接导入xml 的配置文件
- @Import  导入 Configruation class
- @ ComponentScan  扫描指定包

### 配置属性

- @PropertySource   利用java8特性，可以导入多个property文件

```java
@PropertySource("某配置1.properties")
@PropertySource("某配置2.properties")
public class InstantiationBeforeProcessor {
```

- @PropertySources  PropertySource   的集合

## 扩展Spring XML文件

- 编写xml schema 文件（定义xml的结构）
  - 在resource下建立com/xiao/in/spring/xml/persons.xsd文件
  - 可以仿照spring-beans.xsd
  - id这个属性一定要配置

```scheme
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<xsd:schema xmlns="http://www.xiao.org/schema/persons"
            xmlns:xsd="http://www.w3.org/2001/XMLSchema"           targetNamespace="http://www.xiao.org/schema/persons">
    <xsd:import namespace="http://www.w3.org/XML/1998/namespace"/>
    <!--定义复杂类型（person）-->
    <xsd:complexType name="Person">
    	<xsd:attribute name="id" type="xsd:string" 			         use="required"></xsd:attribute>
        <!-- 必须填写-->
        <xsd:attribute name="name" type="xsd:string" use="required"></xsd:attribute>
        <xsd:attribute name="age" type="xsd:integer" ></xsd:attribute>
    </xsd:complexType>

    <!--定义person 元素-->
    <xsd:element name="person" type="Person"></xsd:element>
</xsd:schema>
```

- 定义xml引用
  - 类似spring-bean.xml的文件
  - 在META-INF下定义文件person-context.xml
  - xmlns:persons要和persons.xsd定义一致

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:persons="http://www.xiao.org/schema/persons"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.xiao.org/schema/persons
        http://www.xiao.org/schema/persons.xsd
">
   <persons:person id="person" name="老肖" age="1"></persons:person>
</beans>
```

- 自定义namespaceHandlers实现（命名空间绑定）
- 自定义BeanDefinition的解析

```java
public class PersonNamespaceHandler extends NamespaceHandlerSupport {
    @Override
    public void init() {
        registerBeanDefinitionParser("person", new PersonBeanDefinitionParser());
    }

    private class PersonBeanDefinitionParser extends AbstractSingleBeanDefinitionParser {
        @Override
        protected Class<?> getBeanClass(Element element) {
            return Person.class;
        }

        @Override
        protected void doParse(Element element, BeanDefinitionBuilder builder) {
            this.setAttribute("name", element.getAttribute("name"), builder);
            this.setAttribute("age", element.getAttribute("age"), builder);
        }

        private void setAttribute(String name, String value, BeanDefinitionBuilder builder){
            Optional.ofNullable(value).ifPresent(v -> builder.addPropertyValue(name, v));
        }
    }
}
```

- 定义handler映射
  - 配置spring.hanlders文件

```handlers
http\://www.xiao.org/schema/persons=com.xiao.in.spring.xml.PersonNamespaceHandler
```

- 注册XML扩展
- 命名空间映射
  - 定义spring.schemas文件

```java
http\://www.xiao.org/schema/persons.xsd=com/xiao/in/spring/xml/persons.xsd
```

- 解析测试

```java
public static void main(String[] args) {
    DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
    XmlBeanDefinitionReader xmlBeanDefinitionReader = new XmlBeanDefinitionReader(beanFactory);
    xmlBeanDefinitionReader.loadBeanDefinitions("META-INF/person-context.xml");
    Person bean = beanFactory.getBean(Person.class);
    System.out.println(bean);
}
```

## 扩展xml原理

AbstractApplicationContext#obtainFreshBeanFactory

->AbstractRefreshableApplicationContext#refreshBeanFactory

->AbstractXmlApplicationContext#loadBeanDefinitions

->XmlBeanDefinitionReader#doLoadBeanDefinitions

->DefaultBeanDefinitionDocumentReader#parseBeanDefinitions

## YAML资源装载



# Spring 资源管理

## Spring 内建Resource

| 类                 | 描述                |
| ------------------ | ------------------- |
| UrlResource        |                     |
| ClassPathResource  | 类路径  classpath:/ |
| FileSystemResource |                     |
| EncodedResource    | 带编码的resource    |

## 资源加载器

![](https://gitee.com/xiaojihao/xiaoxiao/raw/master/image/java/spring/20210218145156.png)

## 通配路径资源加载

- ResourcePatternResolver

```java
public static void main(String[] args) throws IOException {
    String currentPath = "/"+ System.getProperty("user.dir")+"/stu-spring/src/main/java/com/xiao/in/spring/resource/";
    String localPath = currentPath+"*.java";

    PathMatchingResourcePatternResolver patternResolver = new PathMatchingResourcePatternResolver(new FileSystemResourceLoader());
    Resource[] resources = patternResolver.getResources(localPath);
    Arrays.stream(resources).map(ResourcePatternResolverDemo::getContent).forEach(System.out::println);
}

public static String getContent(Resource resource) {
    EncodedResource encodedResource = new EncodedResource(resource, "UTF-8");
    try (Reader reader = encodedResource.getReader()){
        return IoUtil.read(reader);
    } catch (Exception e) {
    }
    return null;
}
```

## 注解的方式加载

```java
@Value("classpath:/application.properties")
private Resource resource;

@Value("classpath*:/META-INF/spring.*")
private Resource[] resources;

@PostConstruct
public void init() {
    System.out.println(resource.getFilename());
    System.out.println("=========");
    Arrays.stream(resources).map(Resource::getFilename).forEach(System.out::println);
 }

public static void main(String[] args) {
    AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext();
    applicationContext.register(InjectResourceDemo.class);
    applicationContext.refresh();
    applicationContext.close();
}
```

# 国际化

- 核心接口
  - MessageSource
- 国际化层次性接口HierarchicalMessageSource

## ResourceBundle核心特性

- Key value 设计
- 层次性设计
- 缓存设计
  - 一旦加载就缓存起来
  - ResourceBundle#getBundleImpl可以看出，他是先从缓存中取数据的
- 字符编码控制
  - java.util.ResourceBundle.Control#Control
  - 1.6开始支持

## 在ApplicationContext中初始化

- 通AbstractApplicationContext#initMessageSource方法初始化 

- refresh中调用

## Spring Boot使用

- MessageSourceAutoConfiguration#messageSource
- 注入messageSource的Bean


# 类型转换

## 实现

- 基于javaBeans接口实现
  - 基于java.beans.PropertyEditor拓展
- Spring 3.0+ 通用类型转换实现

## JavaBeans类型转换

- 职责
  - 将String 类型转为目标类型
- 扩展原理
  - Spring框架将文本内容传递到PropertyEditor 实现的setAsText(String)方法
  - PropertyEditort#setAsText(String)方法实现将String类型转化为目标类型的对象
  - 将目标类型的对象传入PropertyEditor#setValue(Object)方法暂存
  - Spring框架将通过PropertyEditortgetValue()获取类型转换后的对象
- 示例

```java
public static void main(String[] args) {
    StringToPropertyEditor editor = new StringToPropertyEditor();
    editor.setAsText("name=老肖");
    //最终会输出Property对象数据
    System.out.println(editor.getValue());
}

static class StringToPropertyEditor extends PropertyEditorSupport {
    @Override
    public void setAsText(String text) throws java.lang.IllegalArgumentException {
        //将String 类型转为properties
        Properties properties = new Properties();
        try {
            properties.load(new StringReader(text));
        } catch (IOException e) {
            e.printStackTrace();
        }
        //暂存
        setValue(properties);
    }
}
```

## 通用类型转换

- 类型转换接口：org.springframework.core.convert.converter.Converter
  - 这个接口通过泛型来进行约束
- 通用类型转换接口：org.springframework.core.convert.converter.GenericConverter
  - 这个接口应用范围更广，使用TypeDescriptor类进行描述目标类型等

## GenericConverter

- 适合复杂类型转换，如集合，数组
- 可以转换的类型：
  - Set<ConvertiblePair>getConvertibleTypes();
- 优化
  - 融合了条件的接口

```java
interface ConditionalGenericConverter extends GenericConverter, ConditionalConverter 
```

# 泛型处理

## 泛型辅助类

- 核心api GenericTypeResolver

```java
//类型相关方法
resolveReturnType(Method method, Class<?> clazz)
//泛型参数类型相关
resolveReturnTypeArgument(Method method, Class<?> genericIfc)
```

- 代码示例

```java
public class TypeResolverDemo {
    public static void main(String[] args) throws Exception {
        disableReturnGenericInfo(TypeResolverDemo.class, String.class, "getString");

        disableReturnGenericInfo(TypeResolverDemo.class, List.class, "getList");

        disableReturnGenericInfo(TypeResolverDemo.class, List.class, "getStringList");
    }

    public static void disableReturnGenericInfo(Class<?> containClass, Class typeClass,  String methodName, Class... argumentTypes) throws Exception {
        Method method = containClass.getMethod(methodName, argumentTypes);
        //获取常规方法返回的类型
        Class<?> returnType = GenericTypeResolver.resolveReturnType(method, containClass);
        System.out.println("方法返回["+methodName+"] 返回类型:"+returnType);

        //获取泛型方法返回(如果泛型未指定，则返回为空)
        Class<?> typeArgument = GenericTypeResolver.resolveReturnTypeArgument(method, typeClass);
        System.out.println("方法返回["+methodName+"] 返回类型:"+typeArgument);
    }

    public static String getString() {
        return null;
    }

    public static <E> List<E> getList() {
        return null;
    }

    public static List<String> getStringList() {
        return null;
    }
}
```

## 集合类型辅助

- 使用ResolvableType类
- 工厂方法： for*方法
- 转换方法： as*方法
- 处理方法: resolve*方法

## MethodParameter



# Spring 注解

## Spring模式注解

- @ComponentScan
  - ComponentScanAnnotationParser#parse(AnnotationAttributes componentScan, final String declaringClass)进行解析这个注解
  - 最后调用scanner.doScan(StringUtils.toStringArray(basePackages))来返回BeanDefinitionHolder集合
  - 在ClassPathBeanDefinitionScanner#doScan中，会去调用Set<BeanDefinition> candidates = findCandidateComponents(basePackage);方法，找出component注解标注，或者元标注的类的beandefinition

## Spring 注解别名

- 显性别名

如：ComponentScan的

```
@AliasFor("basePackages")
String[] value() default {};
```

在代码中既可以用basePackages，也可以同value

- 隐性别名

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@ComponentScan
public @interface MyComponentScan {

    //使用MyComponentScan就可以直接使用myScan替换basePackages了
    @AliasFor(annotation = ComponentScan.class, attribute = "basePackages")
    String[] myScan() default {} ;
}
```

- 隐性覆盖
  - 如果注解出现于元标注的注解同名的字段，则它的内容会覆盖它

# Spring 条件

- 主要ConditionEvaluator#shouldSkip方法进行判断
- 其中AnnotationAwareOrderComparator.sort(conditions);进行排序，将优先级高的取出来

# Spring AOP

## aop功能的测试






# 声明式事务

## 环境搭建

```java
@Configuration
@ComponentScan("com.xiao.tx")
//开始事务管理
@EnableTransactionManagement
public class TxConfig {

    //注入数据源
    @Bean
    public DataSource dataSource() throws Exception{
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setUsername("root");

        dataSource.setPassword("123456");
        dataSource.setDriverClassName("com.mysql.jdbc.Driver");
        String url = "jdbc:mysql://192.168.94.129:3306/mytest1" +
                "?serverTimezone=UTC&useUnicode=true&characterEncoding=utf-8";
        dataSource.setUrl(url);
        return dataSource;
    }
    @Bean
    public JdbcTemplate jdbcTemplate() throws Exception{
        //传人dataSource(),Spring对@Configuration类会特殊处理；
        // 给容器中加组件的方法，多次调用都只是从容器中找组件
        return new JdbcTemplate(dataSource());
    }
    @Bean
    public PlatformTransactionManager transactionManager() throws Exception {
        return new DataSourceTransactionManager(dataSource());
    }
}
```

```java
@Service
public class UserService {
    @Autowired
    public UserDao userDao;
    @Transactional
    public void insert(){
        userDao.insert(UUID.randomUUID().toString());
        int i = 1/0;
    }
}
```

## 原理

@EnableTransactionManagement注解中import了TransactionManagementConfigurationSelector选择器

它导入了两个组件

 * AutoProxyRegistrar

 * ProxyTransactionManagementConfiguration

### AutoProxyRegistrar

 * 给容器中注册一个 InfrastructureAdvisorAutoProxyCreator 组件；

 * InfrastructureAdvisorAutoProxyCreator：

   利用后置处理器机制在对象创建以后，包装对象，返回一个代理对象（增强器），代理对象执行方法利用拦截器链进行调用；

```java
public abstract class AbstractAutoProxyCreator extends ProxyProcessorSupport
      implements SmartInstantiationAwareBeanPostProcessor, BeanFactoryAware
```

### ProxyTransactionManagementConfiguration

它是一个config

* 给容器中注册事务增强器
  * 事务增强器要用事务注解的信息，在AnnotationTransactionAttributeSource解析事务注解
  * 事务拦截器，
    * TransactionInterceptor：保存了事务属性信息，事务管理器；

```java
@Configuration
public class ProxyTransactionManagementConfiguration extends AbstractTransactionManagementConfiguration {
    @Bean(name = TransactionManagementConfigUtils.TRANSACTION_ADVISOR_BEAN_NAME)
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	public BeanFactoryTransactionAttributeSourceAdvisor transactionAdvisor() 
        
        
        @Bean
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	public TransactionAttributeSource transactionAttributeSource() {
        //解析注解的信息
		return new AnnotationTransactionAttributeSource();
	}
    //事务拦截器
    @Bean
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	public TransactionInterceptor transactionInterceptor() {
		TransactionInterceptor interceptor = new TransactionInterceptor();
		interceptor.setTransactionAttributeSource(transactionAttributeSource());
		if (this.txManager != null) {
			interceptor.setTransactionManager(this.txManager);
		}
		return interceptor;
	}
```

* 从TransactionInterceptor可以看到，他是一个 MethodInterceptor（方法拦截器），在目标方法执行的时候，执行拦截器链；

```java
public class TransactionInterceptor extends TransactionAspectSupport implements MethodInterceptor, Serializable
```

* 从MethodInterceptor接口实现的invoke方法下的invokeWithinTransaction方法可以看到
  * 它先获取事务相关的属性
  * 再获取PlatformTransactionManager，如果事先没有添加指定任何transactionmange(@Transactional(transactionManager = ""))，最终会从容器中按照类型获取一个PlatformTransactionManager

```java
	protected Object invokeWithinTransaction(Method method, Class<?> targetClass, final InvocationCallback invocation)
			throws Throwable {

		// If the transaction attribute is null, the method is non-transactional.
		final TransactionAttribute txAttr = getTransactionAttributeSource().getTransactionAttribute(method, targetClass);
		final PlatformTransactionManager tm = determineTransactionManager(txAttr);
		final String joinpointIdentification = methodIdentification(method, targetClass, txAttr);
        //我们要执行的事务方法
        if (txAttr == null || !(tm instanceof CallbackPreferringPlatformTransactionManager)) {
// Standard transaction demarcation with getTransaction and commit/rollback calls.
            //开启事务
			TransactionInfo txInfo = createTransactionIfNecessary(tm, txAttr, joinpointIdentification);
			Object retVal = null;
			try {
				// This is an around advice: Invoke the next interceptor in the chain.
				// This will normally result in a target object being invoked.
				retVal = invocation.proceedWithInvocation();
			}
			catch (Throwable ex) {
				// target invocation exception
                //回滚事务
				completeTransactionAfterThrowing(txInfo, ex);
				throw ex;
			}
			finally {
				cleanupTransactionInfo(txInfo);
			}
            //提交事务
			commitTransactionAfterReturning(txInfo);
			return retVal;
		}
```



# BeanDefinitionRegistryPostProcessor

* postProcessBeanDefinitionRegistry();
   - 在所有bean定义信息将要被加载，bean实例还未创建的；
   -  优先于BeanFactoryPostProcessor执行，并且先触发postProcessBeanDefinitionRegistry方法；
   -  利用BeanDefinitionRegistryPostProcessor给容器中再额外添加一些组件；

实例：

```java
@Component
public class MyBeanDefinitionRegistryPostProcessor implements BeanDefinitionRegistryPostProcessor {
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) throws BeansException {
        System.out.println("postProcessBeanDefinitionRegistry...");
        AbstractBeanDefinition beanDefinition =
                BeanDefinitionBuilder.rootBeanDefinition(Cat.class).getBeanDefinition();
        registry.registerBeanDefinition("hello", beanDefinition);
    }

    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        System.out.println("MyBeanDefinitionRegistryPostProcessor count:"+beanFactory.getBeanDefinitionCount());
    }
}
```

# SmartInitializingSingleton

在初始化容器，创建完所有单实例非懒加载bean之后，会执行实现了SmartInitializingSingleton接口的bean的afterSingletonsInstantiated方法，具体可见refresh()方法里的finishBeanFactoryInitialization(beanFactory);方法

```
public interface SmartInitializingSingleton {
   void afterSingletonsInstantiated();
}
```

# Spring容器的refresh()

1 prepareRefresh()刷新前的预处理;

- initPropertySources()初始化一些属性设置;子类自定义个性化的属性设置方法；

- getEnvironment().validateRequiredProperties();检验属性的合法等

- earlyApplicationEvents= new LinkedHashSet<ApplicationEvent>();保存容器中的一些早期的事件

2 obtainFreshBeanFactory();获取BeanFactory；

- refreshBeanFactory();刷新【创建】BeanFactory；

  - 创建了一个this.beanFactory = new DefaultListableBeanFactory();

  - 设置一个序列化id；

- getBeanFactory();返回刚才GenericApplicationContext创建的BeanFactory对象；
- 将创建的BeanFactory【DefaultListableBeanFactory】返回；

3 prepareBeanFactory(beanFactory);BeanFactory的预准备工作（BeanFactory进行一些设置）；

- 设置BeanFactory的类加载器、支持表达式解析器...
- 添加部分BeanPostProcessor【ApplicationContextAwareProcessor】
- 设置忽略的自动装配的接口EnvironmentAware、EmbeddedValueResolverAware、xxx；
- 注册可以解析的自动装配；我们能直接在任何组件中自动注入：BeanFactory、ResourceLoader、ApplicationEventPublisher、ApplicationContext
- 添加BeanPostProcessor【ApplicationListenerDetector】
- 添加编译时的AspectJ；
- 给BeanFactory中注册一些能用的组件(我们要使用直接autowied就可以，因为在这里注入进来了)；environment【ConfigurableEnvironment】、systemProperties【Map<String, Object>】、systemEnvironment【Map<String, Object>】

4 invokeBeanFactoryPostProcessors(beanFactory);执行BeanFactoryPostProcessor的方法；

- BeanFactoryPostProcessor：BeanFactory的后置处理器。在BeanFactory标准初始化之后执行的
- 它有两个接口：BeanFactoryPostProcessor、BeanDefinitionRegistryPostProcessor
- 先执行BeanDefinitionRegistryPostProcessor的方法；
- 再执行BeanFactoryPostProcessor的方法

5 registerBeanPostProcessors(beanFactory);注册（仅仅只是将其注册进入beanfactory中）BeanPostProcessor（Bean的后置处理器）：拦截bean的创建过程

- 获取所有的 BeanPostProcessor;后置处理器都默认可以通过PriorityOrdered、Ordered接口来执行优先级
   - BeanPostProcessor有这些接口：每个接口执行时间不同
       - BeanPostProcessor、DestructionAwareBeanPostProcessor、InstantiationAwareBeanPostProcessor、SmartInstantiationAwareBeanPostProcessor、MergedBeanDefinitionPostProcessor
- 先注册PriorityOrdered优先级接口的BeanPostProcessor，把每一个BeanPostProcessor；添加到BeanFactory中
- 最后注册没有实现任何优先级接口的
- 注册MergedBeanDefinitionPostProcessor
- 最后注册一个ApplicationListenerDetector；来在Bean创建完成后检查是否是ApplicationListener，这个家伙是用来检测那个时监听器的，如果是，添加到容器中

6 initMessageSource();初始化MessageSource组件（做国际化功能；消息绑定，消息解析）；

- 把创建好的MessageSource注册在容器中，以后获取国际化配置文件的值的时候，可以自动注入MessageSource；
- MessageSource.getMessage(String code, Object[] args, String defaultMessage, Locale locale);

7 initApplicationEventMulticaster();初始化事件派发器

- 将创建的ApplicationEventMulticaster添加到BeanFactory中，以后其他组件直接自动注入

8 registerListeners();给容器中将所有项目里面的ApplicationListener注册进来

- 将每个监听器添加到事件派发器中
- 派发之前步骤产生的事件

9 finishBeanFactoryInitialization(beanFactory);初始化所有剩下的单实例bean

- beanFactory.preInstantiateSingletons();初始化后剩下的单实例bean
	-  获取容器中的所有Bean，依次进行初始化和创建对象
	-  获取Bean的定义信息；RootBeanDefinition
	- 判断 Bean不是抽象的，是单实例的，是懒加载
		- 判断是否是FactoryBean；是否是实现FactoryBean接口的Bean（工厂bean的话直接调用getobject来获取bean，之前笔记有）
		- getBean(beanName)；方法，其实就是 ioc.getBean();，之前我们用context.getBean()就是这个
		- 先获取缓存中保存的单实例Bean。如果能获取到说明这个Bean之前被创建过（所有创建过的单实例Bean都会被缓存起来），从private final Map<String, Object> singletonObjects = new ConcurrentHashMap<String, Object>(256);获取的
		- 缓存中获取不到，开始Bean的创建对象流程
		- 获取当前Bean依赖的其他Bean;如果有按照getBean()把依赖的Bean先创建出来；比如之前我们有在在配置文件中配置dependsOn
		<bean id="testBean" class="com.xiao.entry.TestBean" depends-on="book" >
		- String[] dependsOn = mbd.getDependsOn();
		- 启动单实例Bean的创建流程

```java
// Create bean instance.
if (mbd.isSingleton()) {
   sharedInstance = getSingleton(beanName, new ObjectFactory<Object>() {
      @Override
      public Object getObject() throws BeansException {
         try {
            return createBean(beanName, mbd, args);
         }
         catch (BeansException ex) {
            destroySingleton(beanName);
            throw ex;
         }
      }
   });
   bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
}
```

进入createBean(beanName, mbd, args)方法

进入resolveBeforeInstantiation方法，尝试获取BeanPostProcessors（InstantiationAwareBeanPostProcessor类型）的后置方法，方法代理对象

先触发：postProcessBeforeInstantiation()；

如果有返回值：触发postProcessAfterInitialization()；

```java
try {
			//试获取BeanPostProcessors的后置方法，方法代理对象
			Object bean = resolveBeforeInstantiation(beanName, mbdToUse);
			if (bean != null) {
				return bean;
			}
		}
		catch (Throwable ex) {
			throw new BeanCreationException(mbdToUse.getResourceDescription(), beanName,
					"BeanPostProcessor before instantiation of bean failed", ex);
		}
		//创建单实例bean
		Object beanInstance = doCreateBean(beanName, mbdToUse, args);
		if (logger.isDebugEnabled()) {
			logger.debug("Finished creating instance of bean '" + beanName + "'");
		}
```



---

进入Object beanInstance = doCreateBean(beanName, mbdToUse, args);创建Bean方法创建bean

【创建Bean实例】；createBeanInstance(beanName, mbd, args)

applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName)：调用MergedBeanDefinitionPostProcessor的postProcessMergedBeanDefinition(mbd, beanType, beanName);

```java
protected Object doCreateBean(final String beanName, final RootBeanDefinition mbd, final Object[] args)
      throws BeanCreationException {
   if (instanceWrapper == null) {
      instanceWrapper = createBeanInstance(beanName, mbd, args);
   }
   synchronized (mbd.postProcessingLock) {
	if (!mbd.postProcessed) {
		try {
            //创建了bean，未初始化之前
            //MergedBeanDefinitionPostProcessor.postProcessMergedBeanDefinition
		    applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);
		}
	Object exposedObject = bean;
	try {
        //进行属性赋值
		populateBean(beanName, mbd, instanceWrapper);
```

进入【Bean属性赋值】populateBean(beanName, mbd, instanceWrapper);方法

赋值之前：

拿到InstantiationAwareBeanPostProcessor后置处理器；执行postProcessAfterInstantiation()；

拿到InstantiationAwareBeanPostProcessor后置处理器；postProcessPropertyValues()；**我们可以利用这个来额外的设置一些属性**

```java
protected void populateBean(String beanName, RootBeanDefinition mbd, BeanWrapper bw) {
    if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
	for (BeanPostProcessor bp : getBeanPostProcessors()) {
	if (bp instanceof InstantiationAwareBeanPostProcessor) {
		InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;
                   //执行后置处理器方法
		if (!ibp.postProcessAfterInstantiation(bw.getWrappedInstance(), beanName)) {
           
```

赋值前工作完成

进入 applyPropertyValues(beanName, mbd, bw, pvs);方法，进行一些属性的赋值

**回到doCreateBean方法**

进行bean初始化工作

```java
try {
   populateBean(beanName, mbd, instanceWrapper);
   if (exposedObject != null) {
      //进行bean的初始化
      exposedObject = initializeBean(beanName, exposedObject, mbd);
   }
}
```

进入initializeBean方法

【执行Aware接口方法】invokeAwareMethods(beanName, bean);执行xxxAware接口的方法

​		BeanNameAware\BeanClassLoaderAware\BeanFactoryAware

在初始化之前，执行后置处理器beanProcessor.postProcessBeforeInitialization(result, beanName);



【执行初始化方法】invokeInitMethods(beanName, wrappedBean, mbd);

执行初始化之后方法

applyBeanPostProcessorsAfterInitialization

```java
protected Object initializeBean(final String beanName, final Object bean, RootBeanDefinition mbd) {
    else {
			invokeAwareMethods(beanName, bean);
	}
    wrappedBean = applyBeanPostProcessorsBeforeInitialization(wrappedBean, beanName);
    try {
		invokeInitMethods(beanName, wrappedBean, mbd);
	}
    if (mbd == null || !mbd.isSynthetic()) {
	wrappedBean = applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
	}
```

**回到doCreateBean方法**, 执行注册Bean的销毁方法



ioc容器就是这些Map；很多的Map里面保存了单实例Bean，环境信息。。。



所有Bean都利用getBean创建完成以后；
检查所有的Bean是否是SmartInitializingSingleton接口的；如果是；就执行afterSingletonsInstantiated()；

# spring初始化总结

1）、Spring容器在启动的时候，先会保存所有注册进来的Bean的定义信息；
		1）、xml注册bean；<bean>
		2）、注解注册Bean；@Service、@Component、@Bean、xxx
	2）、Spring容器会合适的时机创建这些Bean
		1）、用到这个bean的时候；利用getBean创建bean；创建好以后保存在容器中；
		2）、统一创建剩下所有的bean的时候；finishBeanFactoryInitialization()；
	3）、后置处理器；BeanPostProcessor
		1）、每一个bean创建完成，都会使用各种后置处理器进行处理；来增强bean的功能；
			AutowiredAnnotationBeanPostProcessor:处理自动注入
			AnnotationAwareAspectJAutoProxyCreator:来做AOP功能；
			xxx....
			增强的功能注解：
			AsyncAnnotationBeanPostProcessor
			....
	4）、事件驱动模型；
		ApplicationListener；事件监听；
		ApplicationEventMulticaster；事件派发：





# Servlet 异步请求

概念图：用户发起的请求首先交由Servlet容器主线程池中的线程处理，在该线程中，我们获取到AsyncContext，然后将其交给异步处理线程池，Servlet 3.0对请求的处理虽然是异步的，但是对InputStream和OutputStream的IO操作却依然是阻塞的，对于数据量大的请求体或者返回体，阻塞IO也将导致不必要的等待。因此在Servlet 3.1中引入了非阻塞IO![](./image/servlet3.0/341412-20170314155524776-1999546106.png)

```java
//设置支持异步请求的servlet
@WebServlet(value = "/synServlet", asyncSupported = true)
public class SynServlet extends HttpServlet {
    @Override
    protected void doGet(final HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        final AsyncContext startAsync = req.startAsync();
        System.out.println("主线程开始:"+Thread.currentThread().getName());
        startAsync.start(new Runnable() {
            public void run() {
                System.out.println("副线程开始:"+Thread.currentThread().getName());
                try {
                    Thread.sleep(3000l);

                    //获取异步上下文
                    //AsyncContext asyncContext = req.getAsyncContext();
                    ServletResponse response = startAsync.getResponse();
                    response.getWriter().write("hello asyn");
                    System.out.println("副线程结束:"+Thread.currentThread().getName());
                } catch (Exception e) {
                    e.printStackTrace();
                }finally {
                    startAsync.complete();
                }
            }
        });
        System.out.println("主线程结束:"+Thread.currentThread().getName());
    }
}
```

# Spring Mvc 异步请求

第一种方式：返回Callable方式

```java
@ResponseBody
@RequestMapping("/async01")
public Callable<String> async01(){
    System.out.println("主线程开始..."+Thread.currentThread()+"==>"+System.currentTimeMillis());

    Callable<String> callable = new Callable<String>() {
        public String call() throws Exception {
            System.out.println("副线程开始..."+Thread.currentThread()+"==>"+System.currentTimeMillis());
            Thread.sleep(2000);
            System.out.println("副线程结束..."+Thread.currentThread()+"==>"+System.currentTimeMillis());
            return "Callable<String> async01()";
        }
    };

    System.out.println("主线程结束..."+Thread.currentThread()+"==>"+System.currentTimeMillis());
    return callable;
}
```



第二种方式： 先将DeferredResult对象存入一个队列（消息中间件）中，然后另外一个线程取出对象，设置result，则createOrder将返回信息

![](https://gitee.com/xiaojihao/xiaoxiao/raw/master/image/servlet3.0/QQ20190728175259.png)

```java
@ResponseBody
@RequestMapping("/createOrder")
public DeferredResult<Object> createOrder(){
    DeferredResult<Object> deferredResult = new DeferredResult((long)100000, "create fail...");

    DeferredResultQueue.save(deferredResult);

    return deferredResult;
}


@ResponseBody
@RequestMapping("/create")
public String create(){
    String order = UUID.randomUUID().toString();
    DeferredResult<Object> deferredResult = DeferredResultQueue.get();
    deferredResult.setResult(order);
    return "success===>"+order;
}
```

