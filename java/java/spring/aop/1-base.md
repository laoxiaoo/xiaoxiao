# 什么是AOP

面向切面编程是在模块化编程中切入关注点的一种方式，就像面向对象编程是模块化编程中关注公共点的方式一样。
面向方面编程(AOP)是面向对象编程(OOP)的补充，它提供了考虑程序结构的另一种方式。在OOP中模块化的关键单元是类，而在AOP中模块化的单元是方面。方面支持对跨多种类型和对象的关注点(如事务管理)进行模块化。



# 代理模式

## 静态代理

![](../../image/java/spring/20210611234246.png)

- 代理类定义一个service属性，指向需要被代理的类
- main方法直接调用代理类方法

具体实现：

```java
public interface HelloService {
    void sayHello(String name);
}
```

被代理类

```java
public class DefaultHelloService implements HelloService{
    @Override
    public void sayHello(String name) {
        System.out.println(name+" say hello ");
    }
}
```

代理类，在调用被代理的方法，中间操作一系列操作

```java
public class ProxyHelloService implements HelloService{
    private HelloService helloService;
    public ProxyHelloService(HelloService helloService) {
        this.helloService = helloService;
    }
    @Override
    public void sayHello(String name) {
        System.out.println("xx 转发了 "+name+ "请求");
        helloService.sayHello(name);
    }
}
```

- 调用类

```java
ProxyHelloService proxy = new ProxyHelloService(new DefaultHelloService());
proxy.sayHello("老肖");
```

## JDK动态代理

1、为接口创建代理类的字节码文件

2、使用ClassLoader将字节码文件加载到JVM

3、创建代理类实例对象，执行对象的目标方法



JDK代理类是会调用invoke方法

```java
Object object = Proxy.newProxyInstance(ClassLoader.getSystemClassLoader(),
        new Class[]{HelloService.class}, new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                DefaultHelloService defaultHelloService = new DefaultHelloService();
                defaultHelloService.sayHello(args[0] + " 在代理层做了些不可描述的事情");
                return null;
            }
        });
HelloService helloService = (HelloService) object;
helloService.sayHello("某人");
```

## Cglib代理

- JDK的动态代理机制只能代理实现了接口的类，而不能实现接口的类就不能实现JDK的动态代理，cglib是针对类来实现代理的，他的原理是对指定的目标类生成一个子类，并覆盖其中方法实现增强，**但因为采用的是继承，所以不能对final修饰的类进行代理**

- cglib 不同于 基于接口的 动态代理， cglib是基于类的代理

```java
Enhancer enhancer = new Enhancer();
//设置需要增强的类
enhancer.setSuperclass(DefaultHelloService.class);
enhancer.setCallback(new MethodInterceptor() {
    @Override
    public Object intercept(Object source, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
        System.out.println("执行前");
        Object result = methodProxy.invokeSuper(source, args);
        System.out.println("执行后");
        return result;
    }
});
HelloService helloService = (HelloService) enhancer.create();
helloService.sayHello("老肖");
```

# Spring反射工具类

## 获取Method

```java
Class<?> loadClass = Thread.currentThread()
        .getContextClassLoader()
        .loadClass("com.xiao.cglib.HelloService");
Method method = ReflectionUtils.findMethod(loadClass, "sayHello", String.class);
System.out.println("method:"+method);
```

## 方法过滤

```java
Class<?> loadClass = Thread.currentThread()
        .getContextClassLoader()
        .loadClass("com.xiao.cglib.HelloService");
ReflectionUtils.doWithMethods(loadClass, new ReflectionUtils.MethodCallback() {
    @Override
    public void doWith(Method method) throws IllegalArgumentException, IllegalAccessException {
        //扫描到方法调用
        System.out.println("Method:"+method);
    }
}, new ReflectionUtils.MethodFilter() {
    @Override
    public boolean matches(Method method) {
        //如果返回false，则不调用方法
        if(method.getName().equals("test")) {
            return false;
        }
        return true;
    }
});
```

## 字节码提升

- 添加字段

```java
BeanGenerator generator = new BeanGenerator();
generator.setSuperclass(Person.class);
generator.addProperty("str", String.class);
Object o = generator.create();
Method setStr = ReflectionUtils.findMethod(o.getClass(), "setStr", String.class);
ReflectionUtils.invokeMethod(setStr, o, "laoxiao");
System.out.println(ReflectionUtils.invokeMethod(ReflectionUtils.findMethod(o.getClass(), "getStr"), o));
```

# ProxyFactory

> 自定义切面和代理类

1. 自定义一个目标执行一个对象

```java
@Slf4j
public class MyTarget {
    public void sayHello() {
        log.debug("==> hello");
    }
}
```

2. 实现拦截面

```java
public class AroundInterceptor implements MethodInterceptor {
    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        log.debug("==> 调用之前");
        invocation.proceed();
        log.debug("==> 调用之后");
        return null;
    }
}
```

3. 直接对类进行拦截，生成的代理对象事GCLIB的

```java
public static void classProxy() {
    ProxyFactory factory = new ProxyFactory();
    factory.setTarget(new MyTarget());
    factory.addAdvice(new AroundInterceptor());
    MyTarget targetProxy = (MyTarget) factory.getProxy();
    targetProxy.sayHello();
}
```

4.  对接口继续拦截，生成的代理对象为jdk代理对象

```java
ProxyFactory proxyFactory = new ProxyFactory();
proxyFactory.setInterfaces(new Class[] {TargetService.class});
proxyFactory.setTarget(new TargetServiceImpl());
proxyFactory.addAdvice(new AroundInterceptor());
TargetService targetService = (TargetService)proxyFactory.getProxy();
targetService.sayHello();
```



# Spring提升代理类方式

## 1-EnableAspectJAutoProxy注解的方式

- 被Aspect注解的类加载到spring会被字节码提升生代理类

```java
@Aspect//声明本类为Aspect切面
@Configuration
@EnableAspectJAutoProxy//激活 aspect 注解自动代理
public class AspectJDemo {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(AspectJDemo.class);
        context.refresh();
        AspectJDemo bean = context.getBean(AspectJDemo.class);
        //此时获取的Aspect的对象已经被cglib提升
        System.out.println(bean);
        context.close();
    }
}
```

## 2-xml的方式

1. 定义xml文件

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/aop
        https://www.springframework.org/schema/aop/spring-aop.xsd
">
    <aop:aspectj-autoproxy />
</beans>
```

2. 加载xml文件

```java
ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("/META-INF/aop-context.xml");
XmlDemo bean = context.getBean(XmlDemo.class);
System.out.println(bean);
context.close();
```

## 3-Api方式

 通过标准工厂的方式生产代理对象

 当执行对应的代理方法时，会进过before方法

```java
Map<String, String> map = new HashMap<>();
AspectJProxyFactory aspect = new AspectJProxyFactory(map);
aspect.addAdvice(new MethodBeforeAdvice() {
    @Override
    public void before(Method method, Object[] args, Object target) throws Throwable {
        System.out.println("执行方法前 " + method.getName());
    }
});
//获取代理对象
Map<String, String> proxy = aspect.getProxy();
proxy.put("laoxiao", "laoxiao");
```


# Spring 实现AOP
1 导入依赖包

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aspects</artifactId>
    <version>4.3.12.RELEASE</version>
</dependency>
```

2 建立一个aop需要拦截的类

```java
public class AopClass {
    public String aopMethod(String name){
        return "进过aop method 方法处理："+name;
    }
}
```

3 定义日期切面方法

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

## 环绕通知

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

## Around和Before的执行顺序

如果是同一个bean的around方法和before方法执行顺序，先around再before

如果不同的bean，则先按照order的排序执行，order靠前的，优先执行 

# 间接代理

- 使用 org.springframework.aop.framework.ProxyFactoryBean间接的代理相应的bean
- 在调用方法时，执行org.aopalliance.intercept.MethodInterceptor方法

> 步骤

1. 实现MethodInterceptor接口，编写拦截方法

```java
public class EchoServiceMethodInterceptor implements MethodInterceptor {

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        Method method = invocation.getMethod();
        System.out.println("拦截 EchoService 的方法：" + method);
        return invocation.proceed();
    }
}
```

2. 编写被代理的类

```java
public class DefaultEchoServiceImpl implements EchoService{
    @Override
    public void sayHello(String name) {
        System.out.println("say hello"+name);
    }
}
```

3. 编写xml

- targetName:代理的目标bean
- 拦截执行的bean

```xml
<bean id="echoService" class="com.xiao.service.DefaultEchoServiceImpl" />

<bean id="echoMethodServiceInterceptor" class="com.xiao.pointcut.matcher.EchoMethodServiceInterceptor" />

<bean id="echoServiceProxyFactoryBean" class="org.springframework.aop.framework.ProxyFactoryBean" >
    <property name="targetName" value="echoService" />
    <property name="interceptorNames" >
        <value>echoMethodServiceInterceptor</value>
    </property>
</bean>
```

4. 测试执行

- 当执行sayhello时，会执行EchoMethodServiceInterceptor类的invoke方法

```java
public static void main(String[] args) {
    ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("/META-INF/proxy-factory-aop-context.xml");
    EchoService bean = (EchoService)context.getBean("echoServiceProxyFactoryBean");
    bean.sayHello("laoxiao");
    context.close();
}
```

# 自动代理

