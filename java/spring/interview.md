# 循环依赖

官网说明：https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-dependency-resolution

![image-20210629165813136](https://gitee.com/xiaojihao/pubImage/raw/master/image/spring/20210629165813.png)

## 解决方案

- 构造器的注入方式没办法解决循环依赖问题
- 将scope设置@Scope("prototype")原型没办法解决循环依赖

- 使用set方式注入，可以解决循环依赖的问题



循环依赖的异常：

```tex
Caused by: org.springframework.beans.factory.BeanCurrentlyInCreationException
```

## 解决原理

- 在org.springframework.beans.factory.support.DefaultSingletonBeanRegistry中，有三个map，分别是三个缓存

```java
//一级缓存:存放的是已经初始化好了的Bean
private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);

//三级缓存:
private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);

//二级缓存: 存放的是实例化了，但是未初始化的Bean
private final Map<String, Object> earlySingletonObjects = new HashMap<>(16);
```

- 步骤

1. A创建过程中需要B，于是A将自己放到三级缓里面，去实例化B
2. B实例化的时候发现需要A，于是B先查一级缓存，没有，再查二级缓存，还是没有，再查三级缓存，找到了A然后把三级缓存里面的这个A放到二级缓存里面，并删除三级缓存里面的A
3. B顺利初始化完毕，将自己放到一级缓存里面（此时B里面的A依然是创建中状态,然后回来接着创建A，此时B已经创建结束，直接从一级缓存里面拿到B，然后完成创建，并将A自己放到一级缓存里面。

> ObjectFactory使用来干嘛的

在AbstractBeanFactory#doGetBean方法中，

创建bean的代码，可以看大getSingleton(String beanName, ObjectFactory<?> singletonFactory)的ObjectFactory实际上就是一个创建bean的方法

如果A发现需要B，B还没创建，此时，A是先不实例化的，B创建的时候，将A调用objectFactory,然后A放入了二级缓存，这里相当于一个递归的调用

```java
if (mbd.isSingleton()) {
   sharedInstance = getSingleton(beanName, () -> {
      try {
         return createBean(beanName, mbd, args);
      }
      catch (BeansException ex) {
         destroySingleton(beanName);
         throw ex;
      }
   });
   bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
}
```

如果没有三级缓存可不可以？

不可以，实现下，如果A直接实例化，放入二级缓存后，B去取A，那么将A注入后，B怎么让A调用createBean的方法呢？

如果没有二级缓存可不可以？

不可以，因为循环依赖是单例的，如果我们再次调用create，就会产生新的bean

# Bean的实例化流程

1. 实例化DefaultListableBeanFactory#preInstantiateSingletons方法中，

```java
//将所有的bean定义进行实例化操作
for (String beanName : beanNames) {
}
```

2. 进入AbstractBeanFactory#doGetBean方法

```java
//首先去一级缓存获取bean，如果没有判断其是不是正在创建，如果没有，则返回null
Object sharedInstance = getSingleton(beanName);
```

3. 在AbstractAutowireCapableBeanFactory#doCreateBean方法中

```java
//如果支持三级缓存，则将当前的bean，和objectfactory函数存入三级缓存
if (earlySingletonExposure) {
    //如果bean不在一级缓存，则存入三级缓存
    //如果三级缓存存在，则调用getEarlyBeanReference方法，获取未赋值的bean，设置进入二级缓存
   addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));
}
```

4. 开始设置属性populateBean，如果我们通过**注解的方式**注入，则会调用**AutowiredAnnotationBeanPostProcessor**#postProcessProperties方式进行注入

然后再在DependencyDescriptor#resolveCandidate调用beanFactory.getBean(beanName)来获取依赖的bean

这个时候，调用getSingleton（）方法，去获取三级缓存的bean

**注意：此时，a的实例化方法还在调用中（如果是循环依赖），b的创建只是通过a的方法调用geBean的时候创建的**

# @Resource和@Autowire的区别

@Resource和@Autowired都可以用来装配bean，都可以用于字段或setter方法。
@Autowired默认按类型装配，默认情况下必须要求依赖对象必须存在，如果要允许null值，可以设置它的required属性为false。
@Resource默认按名称装配，当找不到与名称匹配的bean时才按照类型进行装配。名称可以通过name属性指定，如果没有指定name属性，当注解写在字段上时，默认取字段名，当注解写在setter方法上时，默认取属性名进行装配。