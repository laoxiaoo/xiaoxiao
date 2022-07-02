# BeanDefinition

1. 一个定义bean的元信息的接口
2. 用于保存 Bean 的相关信息，包括属性、构造方法参数、依赖的 Bean 名称及是否单例、延迟加载等
3. 它是实例化 Bean 的原材料，Spring 就是根据 BeanDefinition 中的信息实例化 Bean
4. 这个接口有setter，getter方式来进行操作

## 元信息的一些属性

| 属性(Property)           | 说明                                        |
| ------------------------ | ------------------------------------------- |
| Name                     | Bean的名称或者ID                            |
| Class                    | Bean全类名,必须是具体类，不能用抽象类或接口 |
| Scope                    | Bean的作用域(如: singleton、prototype 等)   |
| Constructor arguments    | Bean构造器参数（用于依赖注入)               |
| Properties               | Bean属性设置（用于依赖注入)                 |
| Autowiring mode          | Bean自动绑定模式(如:通过名称byName)         |
| Lazy initialization mode | Bean延迟初始化模式(延迟和非延迟)            |
| Initialization method    | Bean初始化回调方法名称                      |
| Destruction method       | Bean销毁回调方法名称                        |

## 定义元信息

```java
BeanDefinitionBuilder beanDefinitionBuilder = BeanDefinitionBuilder.genericBeanDefinition(Person.class);
//属性设置 第一种方式
beanDefinitionBuilder.addPropertyValue("name", "张三").addPropertyValue("age", 12);
//获取实例  beanDefinition不是bean的最终形态，不是生命周期，可以随时修改
AbstractBeanDefinition beanDefinition = beanDefinitionBuilder.getBeanDefinition();

//通过abstractBeanDefinition 获取beanDefinition
GenericBeanDefinition genericBeanDefinition = new GenericBeanDefinition();
genericBeanDefinition.setBeanClass(Person.class);
MutablePropertyValues propertyValues = new MutablePropertyValues();
propertyValues.add("name", "张三").add("age", 12);
genericBeanDefinition.setPropertyValues(propertyValues);
```

