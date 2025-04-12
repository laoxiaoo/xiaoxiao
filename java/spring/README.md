# 
# spring核心模块

spring-core: spring基础api，如资源管理，泛型处理

spring-beans：依赖注入，依赖查找

spring-aop: 动态代理，字节码提升

spring-context:事件驱动，注解驱动，模块驱动

spring-expression:spring表达式语言


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



*Bean的名称*
- bean名称在所在的beanFactory或者他的beanDefinition里是唯一的，而不是在应用里唯一

# 从Xml加载Bean信息

> FileSystemXmlApplicationContext和ClassPathXmlApplicationContext区别

<b id="gray">FileSystemXmlApplicationContext</b>：它是用来从文件系统中加载定义的XML配置文件。这意味着你需要提供文件的具体路径。例如，如果你有一个在"C:/xxx.xml"中定义的Spring配置文件，你可以使用以下代码来加载它：

```java
FileSystemXmlApplicationContext applicationContext = new FileSystemXmlApplicationContext();
applicationContext.setConfigLocations(new String[]{"C:\\myself\\gitee\\learning\\stu-spring\\src\\main\\resources\\META-INF\\my-bean.xml"});
applicationContext.addBeanFactoryPostProcessor(beanFactory -> {
    beanFactory.addBeanPostProcessor(new MyInstantiationBeanProcessor());
});
applicationContext.refresh();
System.out.println(applicationContext.getBean("person"));
applicationContext.close();
```

<b id="gray">ClassPathXmlApplicationContext</b>：它是用来从类路径中加载定义的XML配置文件。这意味着你需要提供文件的路径，它相对于类路径。例如，如果你有一个在"xxx.xml"中定义的Spring配置文件，你可以使用以下代码来加载它：

```java
ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext();
applicationContext.setConfigLocations(new String[]{"classpath:/META-INF/my-bean.xml"});
applicationContext.addBeanFactoryPostProcessor(beanFactory -> {
    beanFactory.addBeanPostProcessor(new MyInstantiationBeanProcessor());
});
applicationContext.refresh();
System.out.println(applicationContext.getBean("person"));
applicationContext.close();
```

> 两个类都继承自AbstractXmlApplicationContext

调用AbstractXmlApplicationContext#loadBeanDefinitions最终调用XmlBeanDefinitionReader#doLoadBeanDefinitions