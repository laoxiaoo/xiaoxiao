# BeanDefinition

1. 一个定义bean的元信息的接口
2. 用于保存 Bean 的相关信息，包括属性、构造方法参数、依赖的 Bean 名称及是否单例、延迟加载等
3. 它是实例化 Bean 的原材料，Spring 就是根据 BeanDefinition 中的信息实例化 Bean
4. 这个接口有setter，getter方式来进行操作

## 元信息的一些属性

| 属性(Property)           | 说明                                        |
| ------------------------ | ------------------------------------------- |
| Name                     | Bean的名称或者ID                            |
| Class                    | Bean全类名,必须是具体类，不能用抽象类或接口 |
| Scope                    | Bean的作用域(如: singleton、prototype 等)   |
| Constructor arguments    | Bean构造器参数（用于依赖注入)               |
| Properties               | Bean属性设置（用于依赖注入)                 |
| Autowiring mode          | Bean自动绑定模式(如:通过名称byName)         |
| Lazy initialization mode | Bean延迟初始化模式(延迟和非延迟)            |
| Initialization method    | Bean初始化回调方法名称                      |
| Destruction method       | Bean销毁回调方法名称                        |

## 定义元信息

```java
BeanDefinitionBuilder beanDefinitionBuilder = BeanDefinitionBuilder.genericBeanDefinition(Person.class);
//属性设置 第一种方式
beanDefinitionBuilder.addPropertyValue("name", "张三").addPropertyValue("age", 12);
//获取实例  beanDefinition不是bean的最终形态，不是生命周期，可以随时修改
AbstractBeanDefinition beanDefinition = beanDefinitionBuilder.getBeanDefinition();

//通过abstractBeanDefinition 获取beanDefinition
GenericBeanDefinition genericBeanDefinition = new GenericBeanDefinition();
genericBeanDefinition.setBeanClass(Person.class);
MutablePropertyValues propertyValues = new MutablePropertyValues();
propertyValues.add("name", "张三").add("age", 12);
genericBeanDefinition.setPropertyValues(propertyValues);
```

# Spring 的生命周期

## 初始化和销毁

在注入bean的时候，执行初始化方法，在销毁容器时，执行bean的销毁方法

如果是多实例的，只会执行初始化方法

> 第一种方式

```java
public class TestInit {
    public void init(){
        System.out.println("test init");
    }

    public void destroy(){
        System.out.println("test destroy");
    }
}
```

```java
@Bean(initMethod = "init", destroyMethod = "destroy")
public TestInit testInit(){
    return new TestInit();
}
```

> 第二种方式

实现InitializingBean，DisposableBean接口，实现对应方法，将类注入ioc容器中

```java
@Component
public class Cat implements InitializingBean,DisposableBean {
    //容器销毁时执行方法
    public void destroy() throws Exception {
        System.out.println("Cat.....destroy");
    }
    //加载完属性执行方法，也就是初始化
    public void afterPropertiesSet() throws Exception {
        System.out.println("Cat ... init ...");
    }
}
```

> 第三种方式 JSR250

利用jsr250注解

```java
@Component
public class TestJsr250 {
    //bean初始化完成，并且赋值完成调用
    @PostConstruct
    public void init(){
        System.out.println("TestJsr250 ... init");
    }
    //容器销毁bean时调用
    @PreDestroy
    public void destroy(){
        System.out.println("TestJsr250 ... destroy");
    }
}
```


## 初始化前后调用(后置处理器)

所有bean在调用初始化方法前后时都会调用下面的方法

这个在底层大量运用，如

bean赋值，注入其他组件，@Autowired，生命周期注解功能，@Async,xxx BeanPostProcessor;

```java
/**
 * 所有bean初始化前后调用
 * Created by Administrator on 2019/6/29.
 */
@Component
public class TestBeanPropersecor implements BeanPostProcessor {
    /**
     * bean调用初始化方法之前调用
     * @param o bean对象
     * @param s bean id名
     * @return
     * @throws BeansException
     */
    public Object postProcessBeforeInitialization(Object o, String s) throws BeansException {
        System.out.println("BeforeInitialization.. "+o.getClass() + " bean name："+s);
        //返回bean对象，这里可以根据一些操作，返回处理后的bean
        return o;
    }

    public Object postProcessAfterInitialization(Object o, String s) throws BeansException {
        System.out.println("AfterInitialization.. "+o.getClass() + " bean name："+s);
        return o;
    }
}
```

# 环境切换

建立一个config，用@profile标注个个环境产生的bean（如果不标示，则标示默认产生）

```java
@Configuration
public class TestProfile {

    @Profile(value = "test")
    @Bean("testTestBean")
    public TestBean testBeanTest(){
        return new TestBean();
    }

    @Profile(value = "prod")
    @Bean("prodTestBean")
    public TestBean testBeanPro(){
        return new TestBean();
    }

    @Profile(value = "dev")
    @Bean("devTestBean")
    public TestBean testBeanDev(){
        return new TestBean();
    }
}
```

1、使用命令行动态参数: 在虚拟机参数位置加载 -Dspring.profiles.active=test

2、代码的方式切换产生对应的bean 

```java
@Test
public void testBeanConfig2(){
    AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext();
    //设置激活的环境
    applicationContext.getEnvironment().setActiveProfiles("prod");
    //配置主配置类
    applicationContext.register(TestProfile.class);
    //启动刷新容器
    applicationContext.refresh();

    String[] beanNamesForType = applicationContext.getBeanNamesForType(TestBean.class);
    for(String beanName : beanNamesForType){
        System.out.println(beanName);
    }
    applicationContext.close();
}
```
