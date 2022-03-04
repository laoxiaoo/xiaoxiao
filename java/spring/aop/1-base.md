# 实现Aop的方式

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

# Around和Before的执行顺序

如果是同一个bean里面，则先around再before

如果不同的bean，则先按照order的排序执行 



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

