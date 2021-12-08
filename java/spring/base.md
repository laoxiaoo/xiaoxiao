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

## Spring编程模型

- aware接口
  - aware回调接口，每当初始化这个接口的实现bean时，会回调设置一个值
  - 如：ApplicationContextAware.setApplicationContext
  - 如：
- 组合模式
  - Composite
- 模板模式

# spring核心模块

spring-core: spring基础api，如资源管理，泛型处理

spring-beans：依赖注入，依赖查找

spring-aop: 动态代理，字节码提升

spring-context:事件驱动，注解驱动，模块驱动

spring-expression:spring表达式语言



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

## 依赖注入

- 依赖注入来源与依赖查找的来源并不是同一个

## IOC依赖来源

- 自定义bean：我们自定义的bean
- 内建的bean
- 容器内建依赖：beanfactory
-  IoC中，依赖查找和依赖注入的数据来源并不一样。因为BeanFactory、ResourceLoader、ApplicationEventPublisher、ApplicationContext这四个并不是Bean，它们只是一种特殊的依赖项，无法通过依赖查找的方式来获取，只能通过依赖注入的方式来获取。

> ApplicationContext

- applicationContext是BeanFactory子接口
- 他提供了获取上下文，监听的方法

![](https://gitee.com/xiaojihao/xiaoxiao/raw/master/image/java/spring/20210128221447.png)

- 查看源码可以得知，application有个getBeanFactory的方法
- 他将BeanFactory组合进来了，所以，applicationContext虽然实现了BeanFactory,但他们是两个东西，一般我们需要beanfactory时，通常用ApplicationContext.getBeanFactory()

> BeanFactory与FactoryBean

-  BeanFactory是IOC最基本的容器，负责管理bean，它为其他具体的IOC容器提供了最基本的规范
- FactoryBean是创建bean的一种方式，帮助实现负责的初始化操作

## IOC生命周期

```java
public void refresh() throws BeansException, IllegalStateException {
    synchronized (this.startupShutdownMonitor) {
		//刷新前的预处理;
        prepareRefresh();
        //创建beanfactory
        ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
        //对beanfactory进行初步的初始化操作
        //加入一些bean依赖，和内建的非bean的依赖
        //比如context的类加载器，BeanPostProcessor和XXXAware自动装配等
        prepareBeanFactory(beanFactory);

        try {
            //BeanFactory准备工作完成后进行的后置处理工作
            postProcessBeanFactory(beanFactory);
			//执行BeanFactoryPostProcessor的方法；
            //主要作用是让你能接触到bean definitions
            invokeBeanFactoryPostProcessors(beanFactory);
            //注册BeanPostProcessor（Bean的后置处理器），在创建bean的前后等执行
            registerBeanPostProcessors(beanFactory);
            //初始化MessageSource组件（做国际化功能；消息绑定，消息解析）；
            initMessageSource();
			//初始化事件派发器
            initApplicationEventMulticaster();
			//子类重写这个方法，在容器刷新的时候可以自定义逻辑；如创建Tomcat，Jetty等WEB服务器
            onRefresh();
			//注册应用的监听器。就是注册实现了ApplicationListener接口的监听器bean，
            //这些监听器是注册到ApplicationEventMulticaster中的
            registerListeners();

			////初始化所有剩下的非懒加载的单例bean
            finishBeanFactoryInitialization(beanFactory);
            //完成context的刷新。主要是调用LifecycleProcessor的onRefresh()方法，
            //并且发布事件（ContextRefreshedEvent）
            finishRefresh();
        }
```