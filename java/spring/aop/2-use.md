# Aop Api整体设计

## Joinpoint

用于执行对应的方法

![image-20220226150100480](https://gitee.com/xiaojihao/pubImage/raw/master/image/java/message/20220226150109.png)

-  CglibMethodInvocation

基于cglib

-  ReflectiveMethodInvocation

基于反射

## Pointcut

- joinpoint 条件接口
- **所以它主要包含两个过滤**，一个是方法过滤，一个是类型过滤

两个

```java
public interface Pointcut {
   //判断类是不是符合
   ClassFilter getClassFilter();
   //判断方法是否符合
   MethodMatcher getMethodMatcher();
```

### 便利实现

> 静态：StaticMethodMatcherPointcut

实现他的matches方法，在这个方法里写条件，来判断是否拦截方法

如：

```java
public class EchoMatcherService extends StaticMethodMatcherPointcut {
    @Override
    public boolean matches(Method method, Class<?> targetClass) {
        return true;
    }
}
```

> 正则表达式：JdkRegexpMethodPointcut



> 控制流： ControlFlowPointcut

## AspectJ实现

> 实现类：org.springframework.aop.aspectj.AspectJExpressionPointcut

> 表达式：PointcutExpression

- 里面有两种匹配模式: 方法和构造器
- spring只实现了方法级别

`spring桥接了AspectJ的语法`

## Advice

- 执行动作接口

- spring对其做前置动作还是后置动作还是围绕动作的api

- 所有的advice的底层实现都是MethodInterceptor落地实现的

>  Interceptor

首先它本身就是Advice

其实他相当于around advice

> BeforeAdvice

- 具体实现：org.springframework.aop.framework.adapter.MethodBeforeAdviceInterceptor

- 所有的beforeadvice拦截都来自于MethodBeforeAdviceInterceptor
- 有多少个beforeadvice就会有多少个MethodBeforeAdviceInterceptor
- 执行beforeadvice就是下面方法的调用

```java
@Override
public Object invoke(MethodInvocation mi) throws Throwable {
   this.advice.before(mi.getMethod(), mi.getArguments(), mi.getThis());
   return mi.proceed();
}
```

> BeforeAdvice 的 AspectJ实现

- 目标实现：AspectJMethodBeforeAdvice

> AfterAdvice

- 具体实现：

org.springframework.aop.framework.adapter.ThrowsAdviceInterceptor

> 如何筛选执行的方法
>
> AspectJ根据表达式寻找对应的方法，在org.springframework.aop.aspectj.AbstractAspectJAdvice中



>  AfterReturning 是如何被调用的

 AspectJAfterReturningAdvice = AfterReturningAdvice

 AfterReturningAdviceInterceptor 关联了 AfterReturningAdvice,如下：

```java
public class AfterReturningAdviceInterceptor {

   private final AfterReturningAdvice advice;
```

AfterReturningAdviceInterceptor = MethodInterceptor

所有的MethodInterceptor都会被spring 调用

*最终调用逻辑*：

AfterReturningAdviceInterceptor 

->调用 AspectJAfterReturningAdvice#afterReturning 

->调用 AbstractAspectJAdvice#invokeAdviceMethodWithGivenArgs



## Advisor

- Advice 容器接口
- 包含了一个advice
- 可以结合pointcut来做一个接口上的约束

>  PointcutAdvisor

将pointCut和 advice关联起来 

spring的底层通过这个接口的实现来获取pointcut 和 advice



## Introduction

>  Introduction与 Advisor的连接器

接口：org.springframework.aop.IntroductionAdvisor

**IntroductionAdvisor只关心类的过滤，其他类下面的所有方法，默认都是true**

> 使用场景

当我们一个类	，实现了A B 两个接口，如果我们只需要代理A接口，此时，我们就可以使用Introduction

## AdvisorAdapter

```java
//是否支持这个advice
boolean supportsAdvice(Advice advice);

MethodInterceptor getInterceptor(Advisor advisor);
```

> 实现示例

- supportsAdvice提供所支持的advice
- getInterceptor提供MethodBeforeAdviceInterceptor

```java
class MethodBeforeAdviceAdapter implements AdvisorAdapter, Serializable {

   @Override
   public boolean supportsAdvice(Advice advice) {
      return (advice instanceof MethodBeforeAdvice);
   }

   @Override
   public MethodInterceptor getInterceptor(Advisor advisor) {
      MethodBeforeAdvice advice = (MethodBeforeAdvice) advisor.getAdvice();
      return new MethodBeforeAdviceInterceptor(advice);
   }

}
```

> AdvisorAdapter的注册

org.springframework.aop.framework.adapter.DefaultAdvisorAdapterRegistry

可以通过DefaultAdvisorAdapterRegistry#registerAdvisorAdapter注册新的AdvisorAdapter

## AopProxy

>  AopProxyFactory

默认实现：DefaultAopProxyFactory

我们也可以根据org.springframework.aop.framework.ProxyCreatorSupport#ProxyCreatorSupport(org.springframework.aop.framework.AopProxyFactory)来动态替换默认实现
