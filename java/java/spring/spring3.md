# Aop 原理

## 基本原理

总体概括：@EnableAspectJAutoProxy注解给容器创建和注册AnnotationAwareAspectJAutoProxyCreator的bean（后置处理器，意味着以后任何组件创建时，都要执行这个后置处理器方法）

在@EnableAspectJAutoProxy注解中，有一个@Import(AspectJAutoProxyRegistrar.class)注解

它导入了AspectJAutoProxyRegistrar组件

AspectJAutoProxyRegistrar注入了org.springframework.aop.config.internalAutoProxyCreator（AnnotationAwareAspectJAutoProxyCreator类） 的bean（自动代理处理器）

AnnotationAwareAspectJAutoProxyCreator：父类一层层的看的它实现了SmartInstantiationAwareBeanPostProcessor后置处理器，BeanFactoryAware自动装配BeanFactory

后置处理器创建过程：

1 传入配置类，创建ioc容器

2 注册配置类，调用refresh();刷新容器

3 进入refresh方法

```java
// Register bean processors that intercept bean creation.
registerBeanPostProcessors(beanFactory);
```

注册后置处理器方法

---

进入registerBeanPostProcessors方法，先获取ioc容器已经定义了的需要创建对象的所有BeanPostProcessor

```java
String[] postProcessorNames =
 beanFactory.getBeanNamesForType(BeanPostProcessor.class, true, false);
```

在注册processor里面循环方法中getBean这个方法进入可以看到，所以这个时候已经创建BeanPostProcessor的bean

```java
BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
```

```java
@Override
public Object getBean(String name) throws BeansException {
   return doGetBean(name, null, null, false);
}
```

doGetBean先尝试获取单实例bean

```java
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
    })
```

在getSingleton方法中，这个object就是new ObjectFactory中的方法，它去创建了一个bean

```java
singletonObject = singletonFactory.getObject();
```

**如何创建BeanPostProcessor**

进入createBean的方法中

```java
@Override
protected Object createBean(String beanName, RootBeanDefinition mbd, Object[] args) throws BeanCreationException {
   if (logger.isDebugEnabled()) {
      logger.debug("Creating instance of bean '" + beanName + "'");
   }
```

进入doCreateBean方法，看到instanceWrapper = createBeanInstance(beanName, mbd, args);

```java
protected Object doCreateBean(final String beanName, final RootBeanDefinition mbd, final Object[] args)
      throws BeanCreationException {

   // Instantiate the bean.
   BeanWrapper instanceWrapper = null;
   if (mbd.isSingleton()) {
      instanceWrapper = this.factoryBeanInstanceCache.remove(beanName);
   }
   if (instanceWrapper == null) {
      instanceWrapper = createBeanInstance(beanName, mbd, args);
   }
   populateBean(beanName, mbd, instanceWrapper);
```

**populateBean(beanName, mbd, instanceWrapper)**给bean初始化

初始化流程：

这在initializeBean方法中看到invokeAwareMethods方法，这个方法是用来awar接口的方法回调

```java
protected Object initializeBean(final String beanName, final Object bean, RootBeanDefinition mbd) {
   if (System.getSecurityManager() != null) {
      AccessController.doPrivileged(new PrivilegedAction<Object>() {
         @Override
         public Object run() {
            invokeAwareMethods(beanName, bean);
            return null;
         }
      }, getAccessControlContext());
   }
   else {
			invokeAwareMethods(beanName, bean);
		}

		Object wrappedBean = bean;
		if (mbd == null || !mbd.isSynthetic()) {
			wrappedBean = applyBeanPostProcessorsBeforeInitialization(wrappedBean, beanName);
		}
```

我们可以看到，applyBeanPostProcessorsBeforeInitialization方法，这个后置处理器处理方法，调用所有的后置处理器的postProcessBeforeInitialization方法

然后执行invokeInitMethods(beanName, wrappedBean, mbd);初始化方法

然后执行applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);方法，执行所有的后置处理器的postProcessAfterInitialization（）方法

**我们的BeanPostProcessor(AnnotationAwareAspectJAutoProxyCreator)创建成功；得到aspectJAdvisorsBuilder**

---

5) 把BeanPostProcessor注册到BeanFactory中

4 finishBeanFactoryInitialization(beanFactory);完成BeanFactory初始化工作；

创建剩下的单实例bean， **刚才上面创建的是后置处理器bean**

```java
// Instantiate all remaining (non-lazy-init) singletons.
finishBeanFactoryInitialization(beanFactory);
```

初始化过程：

---

在finishBeanFactoryInitialization方法中，调用beanFactory.preInstantiateSingletons();创建方法

进入preInstantiateSingletons方法

 new ArrayList<String>(this.beanDefinitionNames)获取所有bean定义的bean名

遍历获取容器中所有的Bean，依次创建对象getBean(beanName);

getBean->doGetBean()->getSingleton()->

创建bean

先从缓存中获取当前bean（只要创建好的Bean都会被缓存起来），如果能获取到，说明bean是之前被创建过的，直接使用，否则再创建

```java
@Override
public void preInstantiateSingletons() throws BeansException {
   if (this.logger.isDebugEnabled()) {
      this.logger.debug("Pre-instantiating singletons in " + this);
   }
   List<String> beanNames = new ArrayList<String>(this.beanDefinitionNames);

   // Trigger initialization of all non-lazy singleton beans...
   for (String beanName : beanNames) {
```

创建bean过程protected Object createBean(String beanName, RootBeanDefinition mbd, Object[] args)：

​	在createBean方法中

resolveBeforeInstantiation(beanName, mbdToUse);解析BeforeInstantiation

希望后置处理器在此能返回一个代理对象；如果能返回代理对象就返回

拿到所有后置处理器，如果是InstantiationAwareBeanPostProcessor;

就执行**postProcessBeforeInstantiation**

- 【BeanPostProcessor是在Bean对象创建完成初始化前后调用的】

- 【InstantiationAwareBeanPostProcessor是在创建Bean实例之前先尝试用后置处理器返回对象的】

  **AnnotationAwareAspectJAutoProxyCreator**实现的就是InstantiationAwareBeanPostProcessor后置处理器，所以，他会在任何bean创建之前，去尝试拦截

  在创建的时候它去调用

```java
Object bean = resolveBeforeInstantiation(beanName, mbdToUse);
```

如果不能就继续进入

doCreateBean(final String beanName, final RootBeanDefinition mbd, final Object[] args)

这个才是真正的去创建一个bean实例，和之前说创建后置处理器bean一样

**所以， AnnotationAwareAspectJAutoProxyCreator，在所有bean创建之前会有一个拦截，因为实现了InstantiationAwareBeanPostProcessor，所以会调用postProcessBeforeInstantiation()返回一个代理的bean

---

5 **AopClass(我们的被切面的类)和LogAspects我们的切面类创建bean过程**

这两个bean是通过postProcessBeforeInstantiation来创建的

1 判断当前bean是否在advisedBeans中（保存了所有需要增强bean）

2 isInfrastructureClass(beanClass) 判断是否时切面类（AopClass不是）（@Aspect）

3 shouldSkip(beanClass, beanName)判断是否需要跳过

​	1）获取候选的增强器（切面里面的通知方法）【List<Advisor> candidateAdvisors】



```java
@Override
	public Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) throws BeansException {
		Object cacheKey = getCacheKey(beanClass, beanName);

		if (beanName == null || !this.targetSourcedBeans.contains(beanName)) {
			if (this.advisedBeans.containsKey(cacheKey)) {
				return null;
			}
			if (isInfrastructureClass(beanClass) || shouldSkip(beanClass, beanName)) {
				this.advisedBeans.put(cacheKey, Boolean.FALSE);
				return null;
			}
		}
		if (beanName != null) {.
				Object proxy = createProxy(beanClass, beanName, specificInterceptors, targetSource);
				this.proxyTypes.put(cacheKey, proxy.getClass());
				return proxy;
			}
		}

		return null;
	}
```

判断是否切面的方法

```java
public class AnnotationAwareAspectJAutoProxyCreator extends AspectJAwareAdvisorAutoProxyCreator {
@Override
protected boolean isInfrastructureClass(Class<?> beanClass) {
   // Previously we setProxyTargetClass(true) in the constructor, but that has too
   // broad an impact. Instead we now override isInfrastructureClass to avoid proxying
   // aspects. I'm not entirely happy with that as there is no good reason not
   // to advise aspects, except that it causes advice invocation to go through a
   // proxy, and if the aspect implements e.g the Ordered interface it will be
   // proxied by that interface and fail at runtime as the advice method is not
   // defined on the interface. We could potentially relax the restriction about
   // not advising aspects in the future.
   return (super.isInfrastructureClass(beanClass) || this.aspectJAdvisorFactory.isAspect(beanClass));
}
```

创建完AopClass类之后，调用postProcessAfterInitialization方法

return wrapIfNecessary(bean, beanName, cacheKey);//包装如果需要的情况下

 * 1）、获取当前bean的所有增强器（通知方法）  Object[]  specificInterceptors
   * 1、找到候选的所有的增强器（找哪些通知方法是需要切入当前bean方法的）
     *2、获取到能在bean使用的增强器。
     *3、给增强器排序
 * 2）、保存当前bean在advisedBeans中；
 * 3）、如果当前bean需要增强，创建当前bean的代理对象；
   *1）、获取所有增强器（通知方法）
   * 2）、保存到proxyFactory
   * 3）、创建代理对象：Spring自动决定
     *JdkDynamicAopProxy(config);jdk动态代理；
     * ObjenesisCglibAopProxy(config);cglib的动态代理；
 * 4）、给容器中返回当前组件使用cglib增强了的代理对象；
 * 5）、以后容器中获取到的就是这个组件的代理对象，执行目标方法的时候，代理对象就会执行通知方法的流程；

```java
public abstract class AbstractAutoProxyCreator extends ProxyProcessorSupport
		implements SmartInstantiationAwareBeanPostProcessor, BeanFactoryAware {
@Override
public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
   if (bean != null) {
      Object cacheKey = getCacheKey(bean.getClass(), beanName);
      if (!this.earlyProxyReferences.contains(cacheKey)) {
         return wrapIfNecessary(bean, beanName, cacheKey);
      }
   }
   return bean;
}
```

目标方法执行:

容器中保存了组件的代理对象（cglib增强后的对象），这个对象里面保存了详细信息（比如增强器，目标对象，xxx）；

 * 1）、CglibAopProxy.intercept();拦截目标方法的执行
 * 2）、根据ProxyFactory对象获取将要执行的目标方法拦截器链；
   * List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);
   * 如何获取拦截器链
     * 1）、List<Object> interceptorList保存所有拦截器 5
       * 一个默认的ExposeInvocationInterceptor 和 4个增强器；
     * 2）、遍历所有的增强器，将其转为Interceptor；
       *registry.getInterceptors(advisor);
     * 3）、将增强器转为List<MethodInterceptor>；
       * 如果是MethodInterceptor，直接加入到集合中
       * 如果不是，使用AdvisorAdapter将增强器转为MethodInterceptor；
       * 转换完成返回MethodInterceptor数组；

* 3）、如果没有拦截器链，直接执行目标方法;
  * 拦截器链（每一个通知方法又被包装为方法拦截器，利用MethodInterceptor机制）
 * 4）、如果有拦截器链，把需要执行的目标对象，目标方法，
   * 拦截器链等信息传入创建一个 CglibMethodInvocation 对象，
   * 并调用 Object retVal =  mi.proceed();

*5）、拦截器链的触发过程（CglibMethodInvocation.proceed()方法过程 ）
     * 1)、如果没有拦截器执行执行目标方法，或者拦截器的索引和拦截器数组-1大小一样（指定到了最后一个拦截器）执行目标方法；
          *2)、链式获取每一个拦截器，拦截器执行invoke方法，每一个拦截器等待下一个拦截器执行完成返回以后再来执行；
          *拦截器链的机制，保证通知方法与目标方法的执行顺序；
拦截器链时拍好续的，递归调用invoke方法，最后一个调用invoke，执行方法前的拦截器链，执行后返回，执行方法执行后的拦截器链，如果没抛出异常，返回后执行returning拦截器链

## 总结

 *1）、  @EnableAspectJAutoProxy 开启AOP功能

 * 2）、 @EnableAspectJAutoProxy 会给容器中注册一个组件 AnnotationAwareAspectJAutoProxyCreator

 * 3）、AnnotationAwareAspectJAutoProxyCreator是一个后置处理器；

 * 4）、容器的创建流程：

   * 1）、registerBeanPostProcessors（）注册后置处理器；创建AnnotationAwareAspectJAutoProxyCreator对象

   * 2）、finishBeanFactoryInitialization（）初始化剩下的单实例bean

     * 1）、创建业务逻辑组件和切面组件

     * 2）、AnnotationAwareAspectJAutoProxyCreator拦截组件的创建过程

     * 3）、组件创建完之后，判断组件是否需要增强

       是：切面的通知方法，包装成增强器（Advisor）;给业务逻辑组件创建一个代理对象（cglib）；

 * 5）、执行目标方法：

   * 1）、代理对象执行目标方法
     *2）、CglibAopProxy.intercept()；
        * 	1）、得到目标方法的拦截器链（增强器包装成拦截器MethodInterceptor）
        * 	2）、利用拦截器的链式机制，依次进入每一个拦截器进行执行；
           *3）、效果：
             * 正常执行：前置通知-》目标方法-》后置通知-》返回通知
             * 出现异常：前置通知-》目标方法-》后置通知-》异常通知

## DefaultAopProxyFactory

- 通过这个facory创建代理类

# Bean配置元信息

## 基于XML 资源装载Spring Bean配置元信息

| xml元素 | 使用场景                                  |
| ------- | ----------------------------------------- |
| beans   | 单XML资源下的多个Spring Beans配置         |
| bean    | 单个 Spring Bean定义(BeanDefinition)配置  |
| alias   | 为Spring Bean定义(BeanDefinition)映射别名 |
| import  | 加载外部 Spring XML配置资源               |

> 底层主要是通过XmlBeanDefinitionReader来进行加载的

-  XmlBeanDefinitionReader有两种加载方式，一个是通过DTD,一个是通过XSD方式

```java
/**
 * Indicates that DTD validation should be used.
 */
public static final int VALIDATION_DTD = XmlValidationModeDetector.VALIDATION_DTD;

/**
 * Indicates that XSD validation should be used.
 */
public static final int VALIDATION_XSD = XmlValidationModeDetector.VALIDATION_XSD;
```

- beandfiniton是通过bean的定义来进行加载的，如：user 的bean先定义，则先解析到beandefinition（**但是我们bean的使用又不是有序的**）

> > 加载bean的流程

1. refresh()方法
2. 调用obtainFreshBeanFactory()刷新bean工厂

3. 在AbstractXmlApplicationContext#loadBeanDefinitions方法中获取对应的xml解析器

```java
protected void loadBeanDefinitions(DefaultListableBeanFactory beanFactory){
   XmlBeanDefinitionReader beanDefinitionReader = new XmlBeanDefinitionReader(beanFactory);
```

4. 调用AbstractBeanDefinitionReader#loadBeanDefinitions进行解析xml
5. 调用XmlBeanDefinitionReader#doLoadBeanDefinitions进行xml文件的解析和beandefintion的设置
6. 调用XmlBeanDefinitionReader#registerBeanDefinitions进行beandefintion的设置

```java
public int registerBeanDefinitions(Document doc, Resource resource){
    //创建一个beandefintion与xml的关系连接的解读器
   BeanDefinitionDocumentReader documentReader = createBeanDefinitionDocumentReader();
   int countBefore = getRegistry().getBeanDefinitionCount();
   documentReader.registerBeanDefinitions(doc, createReaderContext(resource));
   return getRegistry().getBeanDefinitionCount() - countBefore;
}
```

7. 最终调用DefaultBeanDefinitionDocumentReader#processBeanDefinition方法，将解析好的bean register到beandefintion中

```java
protected void processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate) {
   BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);
   if (bdHolder != null) {
       //获取到的bean的别名，id等一些信息
      bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder);
      try {
         BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());
      }
      getReaderContext().fireComponentRegistered(new BeanComponentDefinition(bdHolder));
   }
}
```

> 总结

通过xml的资源，封装成BeanDefinitionHolder然后解析成beandefinition

## 注解方式装载元信息

> 核心类AnnotatedBeanDefinitionReader

```java
private final BeanDefinitionRegistry registry;

private BeanNameGenerator beanNameGenerator = AnnotationBeanNameGenerator.INSTANCE;
//Bean 范围解析
private ScopeMetadataResolver scopeMetadataResolver = new AnnotationScopeMetadataResolver();
//条件评估，判断是否装载元信息
//如condition的条件是不是成立
private ConditionEvaluator conditionEvaluator;
```

> ConfigurationClassParser#doProcessConfigurationClass

当register之后，进入refresh阶段

在invokeBeanFactoryPostProcessors(beanFactory);，会将register注入的bean进行一个注解的包扫描

```java
// The config class is annotated with @ComponentScan -> perform the scan immediately
Set<BeanDefinitionHolder> scannedBeanDefinitions =
      this.componentScanParser.parse(componentScan, sourceClass.getMetadata().getClassName());
```

