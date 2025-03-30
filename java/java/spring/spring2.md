
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

## 功能使用

1. 导入依赖包

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aspects</artifactId>
    <version>4.3.12.RELEASE</version>
</dependency>
```

2. 启动注解

```java
@EnableAspectJAutoProxy
```

2. 建立一个aop需要拦截的类

```java
@Service
public class AopServiceImpl implements AopService {
    @Override
    public void sayHello() {
        System.out.println("hello");
    }
}
```

3. 定义切面方法

通知方法：
 * 前置通知(@Before)：logStart：在目标方法(div)运行之前运行
 * 后置通知(@After)：logEnd：在目标方法(div)运行结束之后运行（无论方法正常结束还是异常结束）
 * 返回通知(@AfterReturning)：logReturn：在目标方法(div)正常返回之后运行
 * 异常通知(@AfterThrowing)：logException：在目标方法(div)出现异常以后运行
 * 环绕通知(@Around)：可以在方法之前、之后、发生异常时执行，手动推进目标方法运行（joinPoint.procced()）

给切面类的目标方法标注何时何地运行（通知注解:@Aspect）

```java
@Aspect
public class LogAspects {
    // * 表示所有方法， .. 表示多个参数
    @Pointcut("execution(public String com.xiao.aop.AopClass.*(..)) ")
    public void pointCut(){
    }
    @Before("pointCut()")
    public void logStart(JoinPoint joinPoint){
        Object[] args = joinPoint.getArgs();
        System.out.println(joinPoint.getSignature().getName()+"方法开始切入之前：参数："+args);
    }
    @After("pointCut()")
    public void logEnd(JoinPoint joinPoint){
        System.out.println(""+joinPoint.getSignature().getName()+"结束。。。@After");
    }
    @AfterReturning(value = "pointCut()", returning ="result")
    public void logReturn(JoinPoint joinPoint, Object result){
        System.out.println(""+joinPoint.getSignature().getName()+"正常返回。。。@AfterReturning:运行结果：{"+result+"}");
    }
    @AfterThrowing(value = "pointCut()", throwing = "execution")
    public void logException(JoinPoint joinPoint, Exception execution){
        System.out.println(""+joinPoint.getSignature().getName()+"异常返回。。。@AfterThrowing:运行结果：{"+execution+"}");
    }
}
```

配置配置类

```java
@EnableAspectJAutoProxy
@Configuration
public class MainConfigAop {
    @Bean
    public LogAspects logAspects(){
        return new LogAspects();
    }
    @Bean
    public AopClass aopClass(){
        return new AopClass();
    }
}
```

调用：

```java
@Test
public void testBeanConfig3(){
    AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfigAop.class);
    //获取这个配置类中的容器中的所有bean
    AopClass aopClass = (AopClass)applicationContext.getBean("aopClass");
    aopClass.aopMethod("老小");
    applicationContext.close();
}
```

输出：

aopMethod方法开始切入之前：参数：[Ljava.lang.Object;@1465398
进入方法
aopMethod结束。。。@After
aopMethod正常返回。。。@AfterReturning:运行结果：{进过aop method 方法处理：老小}

### 环绕通知

```java
public class SurroundMethod implements MethodInterceptor{
    public Object invoke(MethodInvocation invocation) {
        Object result = null;
        try {
            System.out.println("环绕通知里面的【前置通知】。。。");
            result = invocation.proceed();  //这里相当于执行目标方法 如果不写目标方法就不会执行
            // result是目标方法的返回值
            System.out.println("环绕通知里面的【后置通知】...");
        } catch (Throwable e) {
            System.out.println("这里是执行环绕通知里面的【异常通知】。。。");
            e.printStackTrace();
        } finally{
　　　　　　　System.out.println("这里是执行环绕通知里面的【最终通知】");
　　　　　}
        return result;
        //也可以返回其他  return “123”;  那么目标方法的返回值就是 "123"
    } 
}
```



## 总结

1 @Aspect 标示切面类，在切面方法中标示对应的处理时机

2 将切面类和被切类注入容器中

3 在配置类启动切面注解@EnableAspectJAutoProxy



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

# BeanFactoryPostProcessor

 * BeanPostProcessor：bean后置处理器，bean创建对象初始化前后进行拦截工作的
 * BeanFactoryPostProcessor：beanFactory的后置处理器；
    * 在BeanFactory标准初始化之后调用，来定制和修改BeanFactory的内容；
    * 所有的bean定义已经保存加载到beanFactory，但是bean的实例还未创建

```java
@Component //要想生效，则加入ioc容器中
public class MyBeanFactoryProcessor implements BeanFactoryPostProcessor {
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        //获取所有的bean信息
        String[] beanDefinitionNames = beanFactory.getBeanDefinitionNames();
        System.out.println("MyBeanFactoryProcessor ....");
        for(String beanDefinitionName : beanDefinitionNames){
            System.out.println("MyBeanFactoryProcessor:"+beanDefinitionName);
        }
    }
}
```

```java
@ComponentScan("com.xiao.Ext")
@Configuration
public class ExtConfig {
    @Bean(initMethod = "init", destroyMethod = "destroy")
    public TestInit testInit(){
        return new TestInit();
    }
}
```

## 原理

进入refresh() 方法，可以看到invokeBeanFactoryPostProcessors(beanFactory);方法，这个方法会找到所有BeanFactoryPostProcessor并执行,在invokeBeanFactoryPostProcessors方法中，执行invokeBeanFactoryPostProcessors方法

```java
class PostProcessorRegistrationDelegate {
   public static void invokeBeanFactoryPostProcessors(
   invokeBeanFactoryPostProcessors(nonOrderedPostProcessors, beanFactory);
```

```java
private static void invokeBeanFactoryPostProcessors(
      Collection<? extends BeanFactoryPostProcessor> postProcessors, ConfigurableListableBeanFactory beanFactory) {
    //获取BeanFactoryPostProcessor的名
    String[] postProcessorNames =
				beanFactory.getBeanNamesForType(BeanFactoryPostProcessor.class, true, false);
    //获取所有未排序的BeanFactoryPostProcessor（源码上面还有其他排序的等，这里不贴出了）
    List<BeanFactoryPostProcessor> nonOrderedPostProcessors = new ArrayList<BeanFactoryPostProcessor>();
		for (String postProcessorName : nonOrderedPostProcessorNames) {
			nonOrderedPostProcessors.add(beanFactory.getBean(postProcessorName, BeanFactoryPostProcessor.class));
		}
   for (BeanFactoryPostProcessor postProcessor : postProcessors) {
      postProcessor.postProcessBeanFactory(beanFactory);
   }
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

# Spring 生命周期

## 上下文启动准备

- AbstractApplicationContext#prepareRefresh

```java
//记录启动时间，状态标识
this.startupDate = System.currentTimeMillis();
this.closed.set(false);
this.active.set(true);
//拓展属性，默认是没有，可以由子类拓展一些属性，如：web的一些属性
initPropertySources();
```

## Beanfactory创建阶段

- AbstractApplicationContext#obtainFreshBeanFactory
- 调用AbstractRefreshableApplicationContext#refreshBeanFactory

```java
protected final void refreshBeanFactory() throws BeansException {
    //如果有Beanfactory,则进行销毁
   if (hasBeanFactory()) {
      destroyBeans();
      closeBeanFactory();
   }
   try {
      //创建beanfactory
      DefaultListableBeanFactory beanFactory = createBeanFactory();
      beanFactory.setSerializationId(getId());
      //是否允许beandefinition重复定义和是否允许循环依赖的属性设置
      customizeBeanFactory(beanFactory);
      //从注解，或者xml中加载beandefinition的信息
      loadBeanDefinitions(beanFactory);
      synchronized (this.beanFactoryMonitor) {
         this.beanFactory = beanFactory;
      }
   }
}
```

## 准备阶段

- AbstractApplicationContext#prepareBeanFactory
- 添加aware（通过addBeanPostProcessor）
- 忽略aware的注入

```java
//添加aware
beanFactory.addBeanPostProcessor(new ApplicationContextAwareProcessor(this));
```

- 依赖注入BeanFactory等

## 后置处理阶段

- AbstractApplicationContext#postProcessBeanFactory 
  - 依赖子类来实现他的拓展
  - 子类可以通过这个方式来添加aware接口如：GenericWebApplicationContext#postProcessBeanFactory方法
- AbstractApplicationContext#invokeBeanFactoryPostProcessors
  - 执行BeanDefinitionRegistryPostProcessor#postProcessBeanDefinitionRegistry
  - 然后再执行BeanFactoryPostProcessor#postProcessBeanFactory

## 注册BeanpostProcessor

- AbstractApplicationContext#registerBeanPostProcessors

- 由源码可以看出，如果BeanPostProcessor标注了PriorityOrdered，那么他会提前依赖查找，但是这个初始化可能bean准备不是那么的充分

```java
if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
   BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
   priorityOrderedPostProcessors.add(pp);
   if (pp instanceof MergedBeanDefinitionPostProcessor) {
      internalPostProcessors.add(pp);
   }
}
```

## 初始化MessageSource

- 内建Bean(国际化文案)
- AbstractApplicationContext#initMessageSource

```java
//判断MessageSource是否已构建好，springboot中，会在外部创建这个bean
if (beanFactory.containsLocalBean(MESSAGE_SOURCE_BEAN_NAME)) {
   this.messageSource = beanFactory.getBean(MESSAGE_SOURCE_BEAN_NAME, MessageSource.class);
   }
}
```

## Spring 广播事件初始化

- 内建bean
- AbstractApplicationContext#initApplicationEventMulticaster
- 最终变为一个单例的bean

## 上下文刷新阶段

- AbstractApplicationContext#onRefresh
- 提供子类来扩展
- 应用于web项目

## 事件监听器注册

- AbstractApplicationContext#registerListeners

## 初始化完成阶段

- AbstractApplicationContext#finishBeanFactoryInitialization
- 当ConversionService存在时，关联ConversionService
- 添加StringValueResolver
  - 处理一系列字符串的逻辑比如：占位符解释、SpEL计算等等
- 初始化单例Beans



## 应用上下文关闭阶段

- AbstractApplicationContext#close 
- 状态表示关闭:active(fales), closed(true)
- 发布Spring应用上下文关闭时间
- 注销Shutdown Hook（优雅关闭线程能够触发close事件）

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

# Enable编程模型

## 简单模式

- ps:Configuration如果在componentscan里面，一样会生效，所以不建议这样写
- 定义一个config

```java
@Configuration
public class HelloWordConfig {

    @Bean
    public String helloWord() {
        return "helloWord";
    }
}
```

- 编写enbale注解

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(HelloWordConfig.class)
public @interface EnableHelloWord {

}
```

- 编写启动类，启动enable相关bean

```java
@EnableHelloWord
public class HelloWordBootStrap {

    public static void main(String[] args) {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext();
        applicationContext.register(HelloWordBootStrap.class);
        applicationContext.refresh();
        String bean = applicationContext.getBean("helloWord", String.class);
        System.out.println(bean);
        applicationContext.close();
    }
}
```

## ImportSelector模式

- 模拟启动服务

- 建立一个接口，下面实现两个实现类，分别是ftp服务，http服务

```java
public interface Server {
    /**
     * 启动
     */
    void start();
    /**
     * 停止
     */
    void stop();
    enum Type {
         FTP,
        HTTP,
        ;
    }
}
```

- 定义一个selector,如果启动ftp，则返回ftp的实现类

```java
public class ServerSelector implements ImportSelector {
    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        Map<String, Object> annotationAttributes = importingClassMetadata.getAnnotationAttributes(EnableServer.class.getName());
        Server.Type type = (Server.Type) annotationAttributes.get("type");
        if(Server.Type.FTP.equals(type)) {
            return new String[] {FtpServerImpl.class.getName()};
        } else {
            return new String[] {HttpServerImpl.class.getName()};
        }
    }
}
```

- 定义一个注解

```java
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Target(ElementType.TYPE)
@Import(ServerSelector.class)
public @interface EnableServer {

    Server.Type type();
}
```

## ImportBeanDefinition

- 使用beandefinition的方式

```java
public class ServerBeanDefinition implements ImportBeanDefinitionRegistrar {

    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
        BeanDefinitionBuilder beanDefinitionBuilder = BeanDefinitionBuilder.genericBeanDefinition(HttpServerImpl.class.getName());
        AbstractBeanDefinition beanDefinition = beanDefinitionBuilder.getBeanDefinition();
        BeanDefinitionReaderUtils.registerWithGeneratedName(beanDefinition, registry);
    }
}
```

- 引入

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(HelloWordConfig.class)
```

