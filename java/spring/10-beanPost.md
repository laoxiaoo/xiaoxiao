
# Bean 初始化后置处理器

>  BeanPostProcessor

bean在初始化前后调用方法

# Bean实例化后置处理

>  InstantiationAwareBeanPostProcessor

```java
public interface InstantiationAwareBeanPostProcessor extends BeanPostProcessor {

   @Nullable
   default Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) throws BeansException {
      return null;
   }

   default boolean postProcessAfterInstantiation(Object bean, String beanName) throws BeansException {
      return true;
   }

   @Nullable
   default PropertyValues postProcessProperties(PropertyValues pvs, Object bean, String beanName)
         throws BeansException {

      return null;
   }
}
```

# Bean工厂后置处理

>  BeanFactoryPostProcessor

bean 定义已经加载，还没创建对象的时候调用

我们可以用beanfactory进行一些操作：获取bean的定义名称

# Bean定义后置处理

>  BeanDefinitionRegistryPostProcessor

可以注入额外的bean组件

# 容器单实例bean创建后

>  SmartInitializingSingleton

容器单实例bean初始化后，执行