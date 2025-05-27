#

这里，只将Spring 怎么讲事务的代理类创建起来的

# 后置处理器的注入

@EnableTransactionManagement注解中import了TransactionManagementConfigurationSelector选择器

它实现了ImportSelector， 导入了两个组件

 * AutoProxyRegistrar
   * 实现了ImportBeanDefinitionRegistrar，可以自由的注入新的Beandefinition
   * 注入了InfrastructureAdvisorAutoProxyCreator类，是一个后置处理器
 * ProxyTransactionManagementConfiguration
   * **他是一个config**，给容器注入了事务代理所需相关的Bean

# ProxyTransactionManagementConfiguration

- 给容器中注册事务增强器：BeanFactoryTransactionAttributeSourceAdvisor， 一个**Advisor**
  -  getPointcut方法返回了个：TransactionAttributeSourcePointcut，用于创建代理类的时候，对有@Transactional进行匹配，返回当前advisor
  - TransactionAttributeSourcePointcut#matches会返回，某一个类，是不是满足当前advisor(是否注解注解了@Transactional)
- 事务注解解析器：AnnotationTransactionAttributeSource
  - 应用于解析@Transactional的
- 事务拦截器：TransactionInterceptor（保存了事务的属性信息）
  - 一个advice,众所周知，advice才是Spring Aop 真正做事的类
  - 在TransactionInterceptor#invoke方法中进行拦截工作（如：获取事务属性，事务提交，回滚等）

# InfrastructureAdvisorAutoProxyCreator 

利用后置处理器机制在对象创建以后，包装对象，返回一个代理对象（增强器），代理对象执行方法利用拦截器链进行调用,在AbstractAutoProxyCreator#postProcessAfterInitialization方法中创建代理类。

其父类是Spring Aop创建的代理对象生成的后置处理器

在创建代理对象的时候，通过BeanFactoryTransactionAttributeSourceAdvisor来判断，是否进行代理对象的生成