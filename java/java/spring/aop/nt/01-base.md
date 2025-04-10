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

- Advice的容器（1:1）
- PointcutAdvisor
- IntroductionAdvisor

## Advisor适配器
- 和MethodInterceptor进行适配
- 核心API
  - AdvisorAdapter
    - 适配MethodInterceptor
- 注册中心
  - AdvisorAdapterRegistry

## AOP代理对象
- AOP代理对象工厂
  - AopProxyFactory
- AopProxy
  - JdkDynamicAopProxy
  - CglibAopProxy

## aop代理配置

- AdvisedSupport

## Aop代理对象创建
- 手动模式
  - ProxyCreatorSupport
    - ProxyFactory
    - ProxyFactoryBean
    - AspectJProxyFactory
- 自动模式
  - AbstractAutoProxyCreator
    - DefaultAdvisorAutoProxyCreator
    - BeanNameAutoProxyCreator
    - InfrastructureAdvisorAutoProxyCreator

## AbstractAutoProxyCreator

## IntroductionInfo

## TargetSource

## AdvisorChainFactory
- 存储MethodInterceptor
- 与AdvisedSupport关联
- 唯一的实现：DefaultAdvisorChainFactory

## AdvisedSupportListener
- 事件对象
  - AdvisedSupport
- 事件来源
  - ProxyCreatorSupport
- 激活事件触发
  - ProxyCreatorSupport#createAopProxy
- 变更事件触发
  - 代理接口变化时、Advisor变化时、配置复制

## ProxyCreatorSupport
- 基础的代理创建类
  - ProxyFactory
  - ProxyFactoryBean