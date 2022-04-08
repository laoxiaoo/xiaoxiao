# Spring AOP API

## JOIN POINT

- Invocation
  - MethodInvocation
    - ProxyMethodInvocation
      - CglibMethodInvocation
      - ReflectiveMethodInvocation

## PointCut

- StaticMethodMatcherPointcut

## Advice

- Interceptor
  - MethodInterceptor
- BeforeAdvice
  - MethodBeforeAdvice
- AfterAdvice
  - AfterReturningAdvice
  - ThrowsAdvice

## Advisor

- PointcutAdvisor
- IntroductionAdvisor

## AdvisorAdapter

## AOP代理对象
- AOP代理对象工厂
  - AopProxyFactory
- AopProxy
  - JdkDynamicAopProxy
  - CglibAopProxy

## aop代理配置

- AdvisedSupport

## AbstractAutoProxyCreator

## IntroductionInfo

## TargetSource
